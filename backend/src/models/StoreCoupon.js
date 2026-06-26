import mongoose from "mongoose";

const storeCouponSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    description: { type: String },
    discountType: {
      type: String,
      enum: ["percent", "fixed"],
      default: "percent",
    },
    discountValue: { type: Number, required: true },
    minOrderAmount: { type: Number, default: 0 },
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

// Unique per store owner
storeCouponSchema.index({ user: 1, code: 1 }, { unique: true });

export default mongoose.model("StoreCoupon", storeCouponSchema);
