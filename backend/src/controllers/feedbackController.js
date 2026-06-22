import Feedback from "../models/Feedback.js";
import { asyncHandler, AppError } from "../utils/appError.js";

export const submitFeedback = asyncHandler(async (req, res) => {
  const { rating, category, message, isPublic } = req.body;
  if (!rating || rating < 1 || rating > 5)
    throw new AppError("Rating must be between 1 and 5", 400);

  // Check if user already submitted feedback today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const existing = await Feedback.findOne({
    user: req.user._id,
    createdAt: { $gte: today },
  });
  if (existing) throw new AppError("You already submitted feedback today", 400);

  const feedback = await Feedback.create({
    user: req.user._id,
    rating,
    category: category || "general",
    message,
    isPublic: isPublic || false,
  });

  res.status(201).json({ success: true, feedback });
});

export const getMyFeedback = asyncHandler(async (req, res) => {
  const feedback = await Feedback.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(10);
  res.json({ success: true, feedback });
});

// Admin
export const getAllFeedback = asyncHandler(async (req, res) => {
  const { rating, category, page = 1, limit = 20 } = req.query;
  const query = {};
  if (rating) query.rating = parseInt(rating);
  if (category) query.category = category;

  const feedback = await Feedback.find(query)
    .populate("user", "firstName lastName email plan businessName")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Feedback.countDocuments(query);
  const all = await Feedback.find();

  const avgRating = all.length
    ? (all.reduce((s, f) => s + f.rating, 0) / all.length).toFixed(1)
    : 0;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: all.filter((f) => f.rating === r).length,
    percent: all.length
      ? Math.round(
          (all.filter((f) => f.rating === r).length / all.length) * 100,
        )
      : 0,
  }));

  res.json({
    success: true,
    feedback,
    total,
    avgRating,
    ratingBreakdown,
  });
});

export const replyFeedback = asyncHandler(async (req, res) => {
  const { reply } = req.body;
  const feedback = await Feedback.findByIdAndUpdate(
    req.params.id,
    { adminReply: reply, repliedAt: new Date() },
    { new: true },
  ).populate("user", "firstName lastName email");
  if (!feedback) throw new AppError("Feedback not found", 404);
  res.json({ success: true, feedback });
});

export const deleteFeedback = asyncHandler(async (req, res) => {
  await Feedback.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Feedback deleted" });
});
