import Banner from "../models/Banner.js";
import { asyncHandler, AppError } from "../utils/appError.js";

// OWNER — create banner
export const createBanner = asyncHandler(async (req, res) => {
  const { title, message, type, color, emoji, startDate, endDate } = req.body;
  if (!title?.trim()) throw new AppError("Title is required", 400);
  if (!message?.trim()) throw new AppError("Message is required", 400);

  const banner = await Banner.create({
    user: req.user._id,
    title: title.trim(),
    message: message.trim(),
    type: type || "announcement",
    color: color || "#7C3AED",
    emoji: emoji || "📢",
    startDate: startDate || new Date(),
    endDate: endDate || null,
  });
  res.status(201).json({ success: true, banner });
});

// OWNER — get all banners
export const getMyBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ user: req.user._id }).sort({
    createdAt: -1,
  });
  res.json({ success: true, banners });
});

// OWNER — update banner
export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!banner) throw new AppError("Banner not found", 404);
  const fields = [
    "title",
    "message",
    "type",
    "color",
    "emoji",
    "isActive",
    "startDate",
    "endDate",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) banner[f] = req.body[f];
  });
  await banner.save();
  res.json({ success: true, banner });
});

// OWNER — delete banner
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!banner) throw new AppError("Banner not found", 404);
  res.json({ success: true, message: "Banner deleted" });
});

// PUBLIC — get active banners for storefront
export const getStoreBanners = asyncHandler(async (req, res) => {
  const User = (await import("../models/User.js")).default;
  const owner = await User.findOne({
    storeName: req.params.storeName,
    storeActive: true,
  });
  if (!owner) throw new AppError("Store not found", 404);

  const now = new Date();
  const banners = await Banner.find({
    user: owner._id,
    isActive: true,
    startDate: { $lte: now },
    $or: [{ endDate: null }, { endDate: { $gte: now } }],
  }).sort({ createdAt: -1 });

  res.json({ success: true, banners });
});
