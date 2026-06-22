import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false },
);

const saleSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    saleNumber: { type: String, unique: true },
    customerName: { type: String, default: "Walk-in Customer" },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    items: [saleItemSchema],
    subtotal: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "partial", "paid", "refunded"],
      default: "pending",
    },
    paymentMethod: { type: String, default: null },
    paymentDate: { type: Date, default: null },
    notes: { type: String },
    whatsappSent: { type: Boolean, default: false },
    refundedAt: { type: Date },
    refundReason: { type: String },
  },
  { timestamps: true },
);

saleSchema.pre("save", function (next) {
  this.items.forEach((item) => {
    item.total = item.quantity * item.unitPrice;
  });
  this.subtotal = this.items.reduce((s, i) => s + i.total, 0);
  this.discountAmount = (this.subtotal * (this.discountPercent || 0)) / 100;
  this.totalAmount = this.subtotal - this.discountAmount;
  this.balance = this.totalAmount - (this.amountPaid || 0);
  if (this.balance <= 0 && this.totalAmount > 0) this.status = "paid";
  else if (this.amountPaid > 0 && this.balance > 0) this.status = "partial";
  next();
});

saleSchema.index({ user: 1, status: 1 });
saleSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Sale", saleSchema);
