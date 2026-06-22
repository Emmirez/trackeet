import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["promo", "new_arrival", "announcement", "discount"],
      default: "announcement",
    },
    color: { type: String, default: "#7C3AED" },
    emoji: { type: String, default: "📢" },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, default: null },
  },
  { timestamps: true },
);

export default mongoose.model("Banner", bannerSchema);
