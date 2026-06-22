import express from "express";
import { protect } from "../middleware/auth.js";
import {
  submitReview,
  getProductReviews,
  getMyReviews,
  approveReview,
  deleteReview,
  replyReview,
} from "../controllers/reviewController.js";

const r = express.Router();

// Public
r.post("/store/:storeName/:productId", submitReview);
r.get("/store/:storeName/:productId", getProductReviews);

// Owner (protected)
r.use(protect);
r.get("/", getMyReviews);
r.patch("/:id/approve", approveReview);
r.delete("/:id", deleteReview);
r.patch("/:id/reply", replyReview);

export default r;
