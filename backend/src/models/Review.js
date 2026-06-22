import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    store: { type: String, required: true }, // storeName
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    approved: { type: Boolean, default: false },
    reply: { type: String }, // owner reply
  },
  { timestamps: true },
);

reviewSchema.index({ product: 1, approved: 1 });
reviewSchema.index({ user: 1, approved: 1 });

export default mongoose.model("Review", reviewSchema);
