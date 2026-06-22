import Review from "../models/Review.js";
import Product from "../models/Product.js";
import User from "../models/User.js";
import { asyncHandler, AppError } from "../utils/appError.js";

// PUBLIC — submit review
export const submitReview = asyncHandler(async (req, res) => {
  const { storeName, productId } = req.params;
  const { name, phone, rating, comment } = req.body;

  if (!name?.trim()) throw new AppError("Name is required", 400);
  if (!rating || rating < 1 || rating > 5)
    throw new AppError("Rating must be 1-5", 400);
  if (!comment?.trim()) throw new AppError("Comment is required", 400);

  const owner = await User.findOne({ storeName, storeActive: true });
  if (!owner) throw new AppError("Store not found", 404);

  const product = await Product.findOne({
    _id: productId,
    user: owner._id,
    isActive: true,
  });
  if (!product) throw new AppError("Product not found", 404);

  // Prevent duplicate review from same phone
  if (phone) {
    const existing = await Review.findOne({ product: productId, phone });
    if (existing)
      throw new AppError("You have already reviewed this product", 400);
  }

  const review = await Review.create({
    store: storeName,
    user: owner._id,
    product: productId,
    name: name.trim(),
    phone: phone?.trim(),
    rating: parseInt(rating),
    comment: comment.trim(),
    approved: false,
  });

  res
    .status(201)
    .json({
      success: true,
      message: "Review submitted! It will appear after approval.",
      review,
    });
});

// PUBLIC — get approved reviews for a product
export const getProductReviews = asyncHandler(async (req, res) => {
  const { storeName, productId } = req.params;

  const reviews = await Review.find({
    store: storeName,
    product: productId,
    approved: true,
  }).sort({ createdAt: -1 });

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  res.json({
    success: true,
    reviews,
    avgRating: parseFloat(avgRating),
    total: reviews.length,
  });
});

// OWNER — get all reviews (approved + pending)
export const getMyReviews = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { user: req.user._id };
  if (status === "pending") query.approved = false;
  if (status === "approved") query.approved = true;

  const reviews = await Review.find(query)
    .populate("product", "name images")
    .sort({ createdAt: -1 });

  res.json({ success: true, reviews });
});

// OWNER — approve review
export const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!review) throw new AppError("Review not found", 404);
  review.approved = true;
  await review.save();
  res.json({ success: true, review });
});

// OWNER — reject/delete review
export const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!review) throw new AppError("Review not found", 404);
  res.json({ success: true, message: "Review deleted" });
});

// OWNER — reply to review
export const replyReview = asyncHandler(async (req, res) => {
  const { reply } = req.body;
  const review = await Review.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!review) throw new AppError("Review not found", 404);
  review.reply = reply?.trim();
  await review.save();
  res.json({ success: true, review });
});
