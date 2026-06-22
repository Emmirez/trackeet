import mongoose from "mongoose";

const referralSchema = new mongoose.Schema(
  {
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    referred: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "converted", "flagged"],
      default: "pending",
    },
    convertedAt: { type: Date, default: null },
    freeMonthsAwarded: { type: Number, default: 0 },
    referredPlan: { type: String, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Referral", referralSchema);
