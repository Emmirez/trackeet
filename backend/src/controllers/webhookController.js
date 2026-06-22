import crypto from "crypto";
import Webhook from "../models/Webhook.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import { triggerWebhook } from "../services/webhookService.js";

const PLAN_LIMITS = {
  free: { webhooks: 0 },
  starter: { webhooks: 1 },
  business: { webhooks: 5 },
  enterprise: { webhooks: 10 },
};

export const getWebhooks = asyncHandler(async (req, res) => {
  const webhooks = await Webhook.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, webhooks });
});

export const createWebhook = asyncHandler(async (req, res) => {
  const { name, url, events, secret } = req.body;

  if (!name?.trim()) throw new AppError("Webhook name is required", 400);
  if (!url?.trim()) throw new AppError("Webhook URL is required", 400);
  if (!events?.length) throw new AppError("Select at least one event", 400);

  // Validate URL
  try {
    new URL(url);
  } catch {
    throw new AppError("Invalid URL", 400);
  }

  const plan = req.user.plan || "free";
  const limit = PLAN_LIMITS[plan]?.webhooks ?? 0;
  if (limit === 0) {
    throw new AppError(
      "Webhooks are not available on the free plan. Upgrade to Starter or higher.",
      403,
    );
  }

  const currentCount = await Webhook.countDocuments({ user: req.user._id });
  if (currentCount >= limit) {
    throw new AppError(
      `Your ${plan} plan allows up to ${limit} webhook${limit === 1 ? "" : "s"}. Upgrade for more.`,
      403,
    );
  }

  const webhook = await Webhook.create({
    user: req.user._id,
    name,
    url,
    events,
    secret: secret || crypto.randomBytes(16).toString("hex"),
    status: "active",
  });

  res.status(201).json({ success: true, webhook });
});

export const updateWebhook = asyncHandler(async (req, res) => {
  const webhook = await Webhook.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!webhook) throw new AppError("Webhook not found", 404);

  const { name, url, events, status } = req.body;
  if (name) webhook.name = name;
  if (url) webhook.url = url;
  if (events) webhook.events = events;
  if (status) webhook.status = status;

  await webhook.save();
  res.json({ success: true, webhook });
});

export const deleteWebhook = asyncHandler(async (req, res) => {
  await Webhook.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ success: true, message: "Webhook deleted" });
});

export const testWebhook = asyncHandler(async (req, res) => {
  const webhook = await Webhook.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!webhook) throw new AppError("Webhook not found", 404);

  await triggerWebhook({
    userId: req.user._id,
    event: "invoice.created",
    data: {
      invoiceNumber: "INV-TEST-0001",
      customer: { name: "Test Customer", phone: "+2348000000000" },
      totalAmount: 10000,
      status: "pending",
      test: true,
    },
  });

  res.json({ success: true, message: "Test webhook sent" });
});
