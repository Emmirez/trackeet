import Subscriber from "../models/Subscriber.js";
import User from "../models/User.js";
import crypto from "crypto";
import { asyncHandler, AppError } from "../utils/appError.js";

// Public — customer subscribes from storefront
export const subscribe = asyncHandler(async (req, res) => {
  const { storeName } = req.params;
  const { email, name } = req.body;

  if (!email?.trim()) throw new AppError("Email is required", 400);

  const store = await User.findOne({ storeName });
  if (!store) throw new AppError("Store not found", 404);

  const existing = await Subscriber.findOne({
    store: store._id,
    email: email.toLowerCase(),
  });
  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      await existing.save();
      return res.json({
        success: true,
        message: "You're back! Subscribed successfully.",
      });
    }
    return res.json({ success: true, message: "You're already subscribed!" });
  }

  const unsubscribeToken = crypto.randomBytes(32).toString("hex");

  await Subscriber.create({
    store: store._id,
    storeName,
    email: email.toLowerCase().trim(),
    name: name?.trim() || null,
    unsubscribeToken,
  });

  res
    .status(201)
    .json({ success: true, message: "Subscribed successfully! 🎉" });
});

// Public — unsubscribe via token in email
export const unsubscribe = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const subscriber = await Subscriber.findOne({ unsubscribeToken: token });
  if (!subscriber) throw new AppError("Invalid unsubscribe link", 404);

  subscriber.isActive = false;
  await subscriber.save();

  res.json({ success: true, message: "Unsubscribed successfully." });
});

// Owner — get all subscribers
export const getSubscribers = asyncHandler(async (req, res) => {
  const subscribers = await Subscriber.find({
    store: req.user._id,
    isActive: true,
  }).sort({ createdAt: -1 });

  res.json({ success: true, subscribers, total: subscribers.length });
});

// Owner — send newsletter
export const sendNewsletter = asyncHandler(async (req, res) => {
  const { subject, message } = req.body;
  if (!subject?.trim()) throw new AppError("Subject is required", 400);
  if (!message?.trim()) throw new AppError("Message is required", 400);

  const subscribers = await Subscriber.find({
    store: req.user._id,
    isActive: true,
  });

  if (subscribers.length === 0)
    throw new AppError("No active subscribers", 400);

  const { sendEmail } = await import("../services/emailService.js");
  const bizName = req.user.businessName || "Our Store";
  const storeUrl = `${process.env.FRONTEND_URL}/store/${req.user.storeName}`;

  let successCount = 0;
  let failCount = 0;

  for (const sub of subscribers) {
    try {
      const unsubscribeUrl = `${process.env.FRONTEND_URL}/unsubscribe/${sub.unsubscribeToken}`;
      await sendEmail({
        to: sub.email,
        subject,
        html: `
          <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
            <div style="background:#7C3AED;padding:24px;border-radius:16px 16px 0 0;text-align:center;">
              <h1 style="color:#fff;margin:0;font-size:20px;">${bizName}</h1>
            </div>
            <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <h2 style="color:#0f172a;margin:0 0 16px;">${subject}</h2>
              <p style="color:#64748b;line-height:1.7;white-space:pre-wrap;">${message}</p>
              <div style="text-align:center;margin:28px 0;">
                <a href="${storeUrl}" style="background:#7C3AED;color:#fff;text-decoration:none;padding:12px 28px;border-radius:12px;font-size:14px;font-weight:700;display:inline-block;">
                  Visit Our Store →
                </a>
              </div>
            </div>
            <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px;">
              You received this because you subscribed to ${bizName}.
              <a href="${unsubscribeUrl}" style="color:#94a3b8;">Unsubscribe</a>
            </p>
          </div>
        `,
      });
      successCount++;
    } catch {
      failCount++;
    }
  }

  res.json({
    success: true,
    message: `Newsletter sent to ${successCount} subscribers`,
    successCount,
    failCount,
  });
});

// Owner — delete subscriber
export const deleteSubscriber = asyncHandler(async (req, res) => {
  await Subscriber.findOneAndDelete({
    _id: req.params.id,
    store: req.user._id,
  });
  res.json({ success: true, message: "Subscriber removed" });
});
