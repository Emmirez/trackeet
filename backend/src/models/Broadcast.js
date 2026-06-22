import mongoose from "mongoose";

const broadcastSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["email", "notification"],
      default: "notification",
    },
    targetPlan: {
      type: String,
      enum: ["all", "free", "starter", "business", "enterprise"],
      default: "all",
    },
    sentBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    recipientCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
    failCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["sending", "sent", "failed"],
      default: "sending",
    },
    sentAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model("Broadcast", broadcastSchema);
