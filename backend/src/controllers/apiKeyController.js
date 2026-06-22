import crypto from "crypto";
import ApiKey from "../models/ApiKey.js";
import { asyncHandler, AppError } from "../utils/appError.js";

const PLAN_LIMITS = {
  free: { apiKeys: 0 },
  starter: { apiKeys: 1 },
  business: { apiKeys: 3 },
  enterprise: { apiKeys: 5 },
};

export const getApiKeys = asyncHandler(async (req, res) => {
  // checkPlan(req.user) // disabled for testing
  const keys = await ApiKey.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, keys });
});

export const generateApiKey = asyncHandler(async (req, res) => {
  // checkPlan(req.user) // disabled for testing
  const {
    name,
    permissions = ["invoices", "customers", "payments", "reports"],
  } = req.body;
  if (!name?.trim()) throw new AppError("Key name is required", 400);

  const plan = req.user.plan || "free";
  const limit = PLAN_LIMITS[plan]?.apiKeys ?? 0;
  if (limit === 0) {
    throw new AppError(
      "API keys are not available on the free plan. Upgrade to Starter or higher.",
      403,
    );
  }

  const currentCount = await ApiKey.countDocuments({
    user: req.user._id,
    status: "active",
  });
  if (currentCount >= limit) {
    throw new AppError(
      `Your ${plan} plan allows up to ${limit} API key${limit === 1 ? "" : "s"}. Upgrade for more.`,
      403,
    );
  }

  // Generate secure key
  const rawKey = `tsk_${crypto.randomBytes(32).toString("hex")}`;
  const prefix = rawKey.substring(0, 12);

  const apiKey = await ApiKey.create({
    user: req.user._id,
    name,
    key: rawKey,
    prefix,
    permissions,
    status: "active",
  });

  // Return full key ONCE — never shown again
  res.status(201).json({ success: true, apiKey, fullKey: rawKey });
});

export const revokeApiKey = asyncHandler(async (req, res) => {
  const key = await ApiKey.findOne({ _id: req.params.id, user: req.user._id });
  if (!key) throw new AppError("API key not found", 404);
  key.status = "revoked";
  await key.save();
  res.json({ success: true, message: "API key revoked" });
});

export const deleteApiKey = asyncHandler(async (req, res) => {
  await ApiKey.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ success: true, message: "API key deleted" });
});
