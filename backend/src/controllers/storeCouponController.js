import StoreCoupon from "../models/StoreCoupon.js";
import User from "../models/User.js";
import { asyncHandler, AppError } from "../utils/appError.js";

// Owner — get all coupons
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await StoreCoupon.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, coupons });
});

// Owner — create coupon
export const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxUses,
    expiresAt,
  } = req.body;

  if (!code?.trim()) throw new AppError("Coupon code is required", 400);
  if (!discountValue || discountValue <= 0)
    throw new AppError("Discount value must be greater than 0", 400);
  if (discountType === "percent" && discountValue > 100)
    throw new AppError("Percentage discount cannot exceed 100%", 400);

  const existing = await StoreCoupon.findOne({
    user: req.user._id,
    code: code.toUpperCase().trim(),
  });
  if (existing) throw new AppError("Coupon code already exists", 400);

  const coupon = await StoreCoupon.create({
    user: req.user._id,
    code: code.toUpperCase().trim(),
    description,
    discountType,
    discountValue,
    minOrderAmount: minOrderAmount || 0,
    maxUses: maxUses || null,
    expiresAt: expiresAt || null,
  });

  res.status(201).json({ success: true, coupon });
});

// Owner — update coupon
export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await StoreCoupon.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!coupon) throw new AppError("Coupon not found", 404);

  const {
    description,
    discountType,
    discountValue,
    minOrderAmount,
    maxUses,
    expiresAt,
    isActive,
  } = req.body;

  if (description !== undefined) coupon.description = description;
  if (discountType !== undefined) coupon.discountType = discountType;
  if (discountValue !== undefined) coupon.discountValue = discountValue;
  if (minOrderAmount !== undefined) coupon.minOrderAmount = minOrderAmount;
  if (maxUses !== undefined) coupon.maxUses = maxUses;
  if (expiresAt !== undefined) coupon.expiresAt = expiresAt;
  if (isActive !== undefined) coupon.isActive = isActive;

  await coupon.save();
  res.json({ success: true, coupon });
});

// Owner — delete coupon
export const deleteCoupon = asyncHandler(async (req, res) => {
  await StoreCoupon.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  res.json({ success: true, message: "Coupon deleted" });
});

// Public — validate coupon at checkout
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, storeName, orderAmount } = req.body;

  if (!code?.trim()) throw new AppError("Coupon code is required", 400);

  const store = await User.findOne({ storeName });
  if (!store) throw new AppError("Store not found", 404);

  const coupon = await StoreCoupon.findOne({
    user: store._id,
    code: code.toUpperCase().trim(),
    isActive: true,
  });

  if (!coupon) throw new AppError("Invalid coupon code", 404);

  // Check expiry
  if (coupon.expiresAt && new Date() > coupon.expiresAt) {
    throw new AppError("This coupon has expired", 400);
  }

  // Check max uses
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    throw new AppError("This coupon has reached its usage limit", 400);
  }

  // Check minimum order amount
  if (orderAmount < coupon.minOrderAmount) {
    throw new AppError(
      `Minimum order amount for this coupon is ₦${coupon.minOrderAmount.toLocaleString("en-NG")}`,
      400,
    );
  }

  // Calculate discount
  let discountAmount = 0;
  if (coupon.discountType === "percent") {
    discountAmount = Math.round((orderAmount * coupon.discountValue) / 100);
  } else {
    discountAmount = Math.min(coupon.discountValue, orderAmount);
  }

  const finalAmount = orderAmount - discountAmount;

  res.json({
    success: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalAmount,
      description: coupon.description,
    },
  });
});

// Public — mark coupon as used (called after order is placed)
export const useCoupon = asyncHandler(async (req, res) => {
  const { code, storeName } = req.body;

  const store = await User.findOne({ storeName });
  if (!store) throw new AppError("Store not found", 404);

  await StoreCoupon.findOneAndUpdate(
    { user: store._id, code: code.toUpperCase().trim() },
    { $inc: { usedCount: 1 } },
  );

  res.json({ success: true });
});
