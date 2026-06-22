import WhatsAppSettings from "../models/WhatsAppSettings.js";
import WhatsAppLog from "../models/WhatsAppLog.js";
import Campaign from "../models/Campaign.js";
import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import {
  getWhatsAppStatus,
  getWhatsAppQR,
  disconnectWhatsApp,
  sendRawWhatsAppMessage,
} from "../services/whatsappService.js";
import User from "../models/User.js";
import { uploadImage } from "../config/cloudinary.js";

const PLAN_LIMITS = {
  free: { campaigns: 3 },
  starter: { campaigns: 15 },
  business: { campaigns: 50 },
  enterprise: { campaigns: Infinity },
};

export const getStatus = asyncHandler(async (req, res) => {
  const status = await getWhatsAppStatus(req.user._id.toString());
  res.json({ success: true, ...status });
});

export const uploadCampaignImage = asyncHandler(async (req, res) => {
  console.log("Upload request received:", req.file);
  if (!req.file) throw new AppError("No image uploaded", 400);
  try {
    const imageUrl = await uploadImage(req.file.path, "trackeet/campaigns");
    console.log("Uploaded to Cloudinary:", imageUrl);
    res.json({ success: true, imageUrl });
  } catch (err) {
    console.error("Cloudinary upload error:", err.message);
    throw new AppError("Failed to upload image", 500);
  }
});

export const getQR = asyncHandler(async (req, res) => {
  const qr = await getWhatsAppQR(req.user._id.toString());
  res.json({ success: true, qr });
});

export const disconnect = asyncHandler(async (req, res) => {
  await disconnectWhatsApp(req.user._id.toString());
  await WhatsAppSettings.findOneAndUpdate(
    { user: req.user._id },
    { connected: false },
  );
  res.json({ success: true, message: "Disconnected" });
});

export const getSettings = asyncHandler(async (req, res) => {
  let settings = await WhatsAppSettings.findOne({ user: req.user._id });
  if (!settings)
    settings = await WhatsAppSettings.create({ user: req.user._id });
  res.json({ success: true, settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await WhatsAppSettings.findOneAndUpdate(
    { user: req.user._id },
    req.body,
    { new: true, upsert: true },
  );
  res.json({ success: true, settings });
});

export const getCampaigns = asyncHandler(async (req, res) => {
  const campaigns = await Campaign.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, campaigns });
});

export const deleteCampaign = asyncHandler(async (req, res) => {
  await Campaign.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ success: true, message: "Campaign deleted" });
});

export const createCampaign = asyncHandler(async (req, res) => {
  const { name, message, audience, campaignId, specificIds, imageUrl } =
    req.body;
  const uid = req.user._id;

  // Plan limit check
  const plan = req.user.plan || "free";
  const limit = PLAN_LIMITS[plan]?.campaigns ?? 3;
  if (limit !== Infinity) {
    const campaignCount = await Campaign.countDocuments({ user: uid });
    if (campaignCount >= limit) {
      throw new AppError(
        `You've reached the ${limit} campaign limit on the ${plan} plan. Upgrade to send more campaigns.`,
        403,
      );
    }
  }

  // Get customers based on audience
  let customers = [];
  if (audience === "all") {
    customers = await Customer.find({ user: uid });
  } else if (audience === "specific") {
    customers = await Customer.find({ user: uid, _id: { $in: specificIds } });
  } else if (audience === "recent") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    customers = await Customer.find({
      user: uid,
      createdAt: { $gte: thirtyDaysAgo },
    });
  } else if (audience === "paid") {
    // Only customers who paid AFTER last paid campaign
    const lastPaidCampaign = await Campaign.findOne({
      user: uid,
      audience: "paid",
      status: "Completed",
    }).sort({ sentAt: -1 });

    const lastSentAt = lastPaidCampaign?.sentAt || new Date(0);

    const invoices = await Invoice.find({
      user: uid,
      status: "paid",
      paymentDate: { $gt: lastSentAt },
    }).populate("customer");

    customers = [
      ...new Map(
        invoices
          .filter((i) => i.customer)
          .map((i) => [i.customer._id.toString(), i.customer]),
      ).values(),
    ];

    if (customers.length === 0) {
      return res.json({
        success: false,
        message: "No new paid customers since your last campaign",
      });
    }
  } else {
    // pending, overdue — always send to ALL matching every time
    const invoices = await Invoice.find({
      user: uid,
      status: audience,
    }).populate("customer");
    customers = [
      ...new Map(
        invoices
          .filter((i) => i.customer)
          .map((i) => [i.customer._id.toString(), i.customer]),
      ).values(),
    ];
  }

  console.log(`Found ${customers.length} customers for audience: ${audience}`);

  // Resend — only new customers
  if (campaignId) {
    const existing = await Campaign.findById(campaignId);
    const alreadySentIds = (existing?.recipients || []).map((id) =>
      id.toString(),
    );
    customers = customers.filter(
      (c) => !alreadySentIds.includes(c._id.toString()),
    );
    if (customers.length === 0) {
      return res.json({
        success: false,
        message: "No new customers to send to",
      });
    }
  }

  const campaign = await Campaign.create({
    user: uid,
    name,
    message,
    audience,
    status: "In Progress",
    sentCount: 0,
    failedCount: 0,
    recipients: [],
  });

  const sentIds = [];
  let failedCount = 0;

  const owner = await User.findById(uid).select("businessName");
  const bizName = owner?.businessName || "Trackeet";

  const { sendRawWhatsAppMessage, sendWhatsAppImage } =
    await import("../services/whatsappService.js");

  for (const customer of customers) {
    try {
      const personalised = message
        .replace(/{name}/g, customer.name)
        .replace(/{business}/g, bizName)
        .replace(/{phone}/g, customer.phone || "");

      if (imageUrl) {
        // Send image with message as caption
        await sendWhatsAppImage(
          uid.toString(),
          customer.phone,
          imageUrl,
          personalised,
        );
      } else {
        await sendRawWhatsAppMessage(
          uid.toString(),
          customer.phone,
          personalised,
        );
      }

      sentIds.push(customer._id);
    } catch (err) {
      console.error(`❌ Failed for ${customer.name}:`, err.message);
      failedCount++;
    }
  }

  const updated = await Campaign.findByIdAndUpdate(
    campaign._id,
    {
      status:
        failedCount === customers.length && customers.length > 0
          ? "Failed"
          : "Completed",
      sentCount: sentIds.length,
      failedCount,
      recipients: sentIds,
      sentAt: new Date(),
    },
    { new: true },
  );

  console.log(`Campaign done: ${sentIds.length} sent, ${failedCount} failed`);
  res.status(201).json({ success: true, campaign: updated });
});

export const getLogs = asyncHandler(async (req, res) => {
  const logs = await WhatsAppLog.find({ user: req.user._id })
    .populate("customer", "name")
    .sort({ sentAt: -1 })
    .limit(50);
  res.json({ success: true, logs });
});

export const takeOver = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) throw new AppError("Phone required", 400);
  const { takeOverConversation } =
    await import("../services/whatsappService.js");
  takeOverConversation(req.user._id.toString(), phone);
  res.json({ success: true, message: `Took over conversation with ${phone}` });
});

export const releaseChat = asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) throw new AppError("Phone required", 400);
  const { releaseConversation } =
    await import("../services/whatsappService.js");
  releaseConversation(req.user._id.toString(), phone);
  res.json({ success: true, message: `Bot restored for ${phone}` });
});
