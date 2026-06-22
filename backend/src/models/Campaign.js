import mongoose from "mongoose";

const campaignSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    message: { type: String, required: true },
    imageUrl: { type: String },
    audience: { type: String, default: "all" },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Customer" }],
    sentCount: { type: Number, default: 0 },
    failedCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Draft", "Scheduled", "In Progress", "Completed", "Failed"],
      default: "Draft",
    },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model("Campaign", campaignSchema);
