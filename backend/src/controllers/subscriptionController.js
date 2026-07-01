import Subscription from "../models/Subscription.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import { emitToUser } from "../config/socket.js";
import axios from "axios";
import Referral from "../models/Referral.js";
import crypto from "crypto";

const PLANS = {
  starter: { monthly: 100, annual: 19200 },
  business: { monthly: 100, annual: 48000 },
  enterprise: { monthly: 15000, annual: 144000 },
};

const notifyAdmins = async (title, message, meta = {}) => {
  try {
    const admins = await User.find({
      role: { $in: ["admin", "superadmin"] },
    }).select("_id");
    for (const admin of admins) {
      const notif = await Notification.create({
        user: admin._id,
        type: "subscription",
        title,
        message,
        link: "/admin/subscriptions",
        meta,
      });
      emitToUser(admin._id.toString(), "notification", notif);
    }
  } catch (e) {
    /* non-blocking */
  }
};

export const getPlans = asyncHandler(async (req, res) => {
  res.json({ success: true, plans: PLANS });
});

export const getCurrentSubscription = asyncHandler(async (req, res) => {
  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: "active",
  }).sort({ createdAt: -1 });
  res.json({ success: true, subscription });
});

export const initiateSubscription = asyncHandler(async (req, res) => {
  const { planId, annual, paymentMethod = "paystack", promoCodeId } = req.body;
  if (!PLANS[planId]) throw new AppError("Invalid plan", 400);
  let amount = annual ? PLANS[planId].annual : PLANS[planId].monthly;

  // Apply free months balance
  const userData = await User.findById(req.user._id).select(
    "freeMonthsBalance plan",
  );
  let freeMonthsUsed = 0;

  if (userData.freeMonthsBalance > 0 && !annual) {
    freeMonthsUsed = Math.min(userData.freeMonthsBalance, 1);
    amount = Math.max(0, amount - PLANS[planId].monthly * freeMonthsUsed);
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { freeMonthsBalance: -freeMonthsUsed },
    });
  }

  // Apply promo code if provided
  if (promoCodeId) {
    const PromoCode = (await import("../models/PromoCode.js")).default;
    const promo = await PromoCode.findById(promoCodeId);
    if (promo && promo.isActive && !promo.usedBy.includes(req.user._id)) {
      const discount =
        promo.discountType === "percent"
          ? Math.round((amount * promo.discountValue) / 100)
          : Math.min(promo.discountValue, amount);
      amount = Math.max(0, amount - discount);

      // Mark as used
      await PromoCode.findByIdAndUpdate(promoCodeId, {
        $inc: { usedCount: 1 },
        $push: { usedBy: req.user._id },
      });
    }
  }

  if (paymentMethod === "bank_transfer") {
    const sub = await Subscription.create({
      user: req.user._id,
      plan: planId,
      amount,
      annual,
      paymentMethod: "bank_transfer",
      status: "pending",
    });
    return res.json({
      success: true,
      paymentMethod: "bank_transfer",
      instructions: {
        bankName: process.env.BANK_NAME,
        accountNumber: process.env.BANK_ACCOUNT_NUMBER,
        accountName: process.env.BANK_ACCOUNT_NAME,
        amount,
        reference: sub._id.toString(),
        note: `Send proof to billing@gettrackeet.com with reference: ${sub._id}`,
      },
    });
  }

  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email: req.user.email,
      amount: amount * 100,
      metadata: { userId: req.user._id, planId, annual: annual || false },
      callback_url: `${process.env.FRONTEND_URL.split(",")[0].trim()}/dashboard/subscription?verify=1`,
    },
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } },
  );

  await Subscription.create({
    user: req.user._id,
    plan: planId,
    amount,
    annual,
    paymentMethod: "paystack",
    paystackRef: response.data.data.reference,
    status: "pending",
  });

  res.json({
    success: true,
    paymentUrl: response.data.data.authorization_url,
    reference: response.data.data.reference,
  });
});

export const verifySubscription = asyncHandler(async (req, res) => {
  const { reference } = req.body;
  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } },
  );

  if (response.data.data.status !== "success") {
    throw new AppError("Payment verification failed", 400);
  }

  const sub = await Subscription.findOne({ paystackRef: reference });
  if (!sub) throw new AppError("Subscription not found", 404);

  const months = sub.annual ? 12 : 1;
  sub.status = "active";
  sub.paymentVerified = true;
  sub.startDate = new Date();
  sub.endDate = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);
  await sub.save();

  await User.findByIdAndUpdate(sub.user, { plan: sub.plan });

  // Referral bonus
  const upgradedUser = await User.findById(sub.user);
  if (upgradedUser?.referredBy) {
    const referral = await Referral.findOne({
      referrer: upgradedUser.referredBy,
      referred: sub.user,
      status: "pending",
    });
    if (referral) {
      // Check monthly cap — max 20 converted referrals per calendar month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const thisMonthConversions = await Referral.countDocuments({
        referrer: upgradedUser.referredBy,
        status: "converted",
        convertedAt: { $gte: startOfMonth },
      });

      const referrerBonus = thisMonthConversions < 20 ? 1 : 0;

      if (referrerBonus > 0) {
        // Award 1 free month to referrer (User A)
        await User.findByIdAndUpdate(upgradedUser.referredBy, {
          $inc: { freeMonthsBalance: 1 },
        });
      }

      // Award 1 free month to referred user (User B) — no cap on this
      await User.findByIdAndUpdate(sub.user, {
        $inc: { freeMonthsBalance: 1 },
      });

      referral.status = "converted";
      referral.convertedAt = new Date();
      referral.freeMonthsAwarded = 1 + referrerBonus;
      referral.referredPlan = sub.plan;
      await referral.save();
    }
  }

  const user = await User.findById(sub.user);
  await notifyAdmins(
    "New Subscription Payment",
    `${user?.firstName} ${user?.lastName} upgraded to ${sub.plan} plan — ₦${sub.amount.toLocaleString()} received.`,
    { userId: sub.user, plan: sub.plan, amount: sub.amount },
  );

  res.json({ success: true, subscription: sub });
});

export const paystackWebhook = asyncHandler(async (req, res) => {
  // Verify the webhook is actually from Paystack
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(req.body)
    .digest("hex");

  if (hash !== req.headers["x-paystack-signature"]) {
    return res.status(401).send("Invalid signature");
  }

  const event = JSON.parse(req.body);

  if (event.event === "charge.success") {
    const reference = event.data.reference;

    const sub = await Subscription.findOne({ paystackRef: reference });
    if (sub && sub.status !== "active") {
      const months = sub.annual ? 12 : 1;
      sub.status = "active";
      sub.paymentVerified = true;
      sub.startDate = new Date();
      sub.endDate = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);
      await sub.save();

      await User.findByIdAndUpdate(sub.user, { plan: sub.plan });

      // Referral bonus logic (same as verifySubscription)
      const upgradedUser = await User.findById(sub.user);
      if (upgradedUser?.referredBy) {
        const referral = await Referral.findOne({
          referrer: upgradedUser.referredBy,
          referred: sub.user,
          status: "pending",
        });
        if (referral) {
          const startOfMonth = new Date();
          startOfMonth.setDate(1);
          startOfMonth.setHours(0, 0, 0, 0);

          const thisMonthConversions = await Referral.countDocuments({
            referrer: upgradedUser.referredBy,
            status: "converted",
            convertedAt: { $gte: startOfMonth },
          });

          const referrerBonus = thisMonthConversions < 20 ? 1 : 0;

          if (referrerBonus > 0) {
            await User.findByIdAndUpdate(upgradedUser.referredBy, {
              $inc: { freeMonthsBalance: 1 },
            });
          }

          await User.findByIdAndUpdate(sub.user, {
            $inc: { freeMonthsBalance: 1 },
          });

          referral.status = "converted";
          referral.convertedAt = new Date();
          referral.freeMonthsAwarded = 1 + referrerBonus;
          referral.referredPlan = sub.plan;
          await referral.save();
        }
      }

      const user = await User.findById(sub.user);
      await notifyAdmins(
        "New Subscription Payment",
        `${user?.firstName} ${user?.lastName} upgraded to ${sub.plan} plan — ₦${sub.amount.toLocaleString()} received.`,
        { userId: sub.user, plan: sub.plan, amount: sub.amount },
      );
    }
  }

  res.sendStatus(200);
});
