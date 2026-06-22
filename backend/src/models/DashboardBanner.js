import mongoose from "mongoose";

const dashboardBannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["info", "warning", "success", "danger"],
      default: "info",
    },
    targetPlan: {
      type: String,
      enum: ["all", "free", "starter", "business", "enterprise"],
      default: "all",
    },
    ctaLabel: { type: String, default: null },
    ctaLink: { type: String, default: null },
    dismissible: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("DashboardBanner", dashboardBannerSchema);
