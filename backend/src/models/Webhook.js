import mongoose from "mongoose";

const webhookSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    secret: { type: String }, // for signature verification
    events: [
      {
        type: String,
        enum: [
          "invoice.created",
          "invoice.paid",
          "invoice.overdue",
          "invoice.deleted",
          "customer.created",
          "customer.deleted",
          "payment.received",
        ],
      },
    ],
    status: { type: String, enum: ["active", "disabled"], default: "active" },
    lastTriggered: { type: Date },
    failCount: { type: Number, default: 0 },
    successCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export default mongoose.model("Webhook", webhookSchema);
