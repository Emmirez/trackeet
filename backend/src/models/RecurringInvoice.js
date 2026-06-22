import mongoose from "mongoose";

const recurringInvoiceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [
      {
        name: String,
        description: String,
        quantity: Number,
        unitPrice: Number,
        total: Number,
      },
    ],
    discountPercent: { type: Number, default: 0 },
    notes: { type: String },
    frequency: {
      type: String,
      enum: ["weekly", "monthly", "quarterly", "yearly"],
      default: "monthly",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    nextDueDate: { type: Date, required: true },
    lastGenerated: { type: Date },
    totalGenerated: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["active", "paused", "completed"],
      default: "active",
    },
    daysDueAfter: { type: Number, default: 7 }, // due date = generated date + this many days
  },
  { timestamps: true },
);

export default mongoose.model("RecurringInvoice", recurringInvoiceSchema);
