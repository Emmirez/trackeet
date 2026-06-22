import express from "express";
import {
  submitFeedback,
  getMyFeedback,
  getAllFeedback,
  replyFeedback,
  deleteFeedback,
} from "../controllers/feedbackController.js";
import { protect, authorize } from "../middleware/auth.js";

const r = express.Router();

// Public route — no auth needed
r.get('/public', async (req, res) => {
  try {
    const feedback = await Feedback.find({ isPublic: true, rating: { $gte: 4 } })
      .populate('user', 'firstName lastName businessName businessCategory')
      .sort({ rating: -1, createdAt: -1 })
      .limit(12)
    res.json({ success: true, feedback })
  } catch {
    res.json({ success: true, feedback: [] })
  }
})

r.use(protect);

r.post("/", submitFeedback);
r.get("/my", getMyFeedback);

// Admin only
r.get("/admin", authorize("admin", "superadmin"), getAllFeedback);
r.post("/:id/reply", authorize("admin", "superadmin"), replyFeedback);
r.delete("/:id", authorize("admin", "superadmin"), deleteFeedback);

export default r;
