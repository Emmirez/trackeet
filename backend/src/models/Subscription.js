import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: {
      type: String,
      enum: ["starter", "business", "enterprise"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled", "pending"],
      default: "pending",
    },
    amount: { type: Number, required: true },
    annual: { type: Boolean, default: false },
    startDate: { type: Date },
    endDate: { type: Date },
    paystackRef: { type: String },
    flutterwaveRef: { type: String },
    paymentMethod: {
      type: String,
      enum: ["paystack", "flutterwave", "bank_transfer", "stripe"],
    },
    paymentVerified: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model("Subscription", subscriptionSchema);
