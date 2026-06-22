import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    amount: { type: Number, required: true },
    method: {
      type: String,
      enum: [
        "bank_transfer",
        "paystack",
        "flutterwave",
        "stripe",
        "cash",
        "pos",
        "crypto",
        "other",
      ],
      default: "bank_transfer",
    },
    reference: { type: String },
    paidAt: { type: Date, default: Date.now },
    note: { type: String },
  },
  { timestamps: true },
);

paymentSchema.index({ user: 1, paidAt: -1 });

export default mongoose.model("Payment", paymentSchema);
