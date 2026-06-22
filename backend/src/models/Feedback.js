import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    category: {
      type: String,
      enum: ["general", "invoicing", "whatsapp", "store", "support", "pricing"],
      default: "general",
    },
    message: { type: String },
    isPublic: { type: Boolean, default: false },
    adminReply: { type: String, default: null },
    repliedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Feedback", feedbackSchema);
