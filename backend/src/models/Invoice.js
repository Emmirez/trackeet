import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    total: { type: Number, default: 0 },
  },
  { _id: false },
);

const deliverySchema = new mongoose.Schema(
  {
    enabled: { type: Boolean, default: false },
    address: { type: String },
    estimatedDate: { type: Date },
    notes: { type: String },
    feeType: {
      type: String,
      enum: ["none", "fixed", "free", "pay_on_delivery"],
      default: "none",
    },
    fee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered"],
      default: "pending",
    },
    shippedAt: { type: Date },
    shippedPhoto: { type: String },
    shippedNote: { type: String },
    deliveredAt: { type: Date },
    deliveredPhoto: { type: String },
    deliveredNote: { type: String },
  },
  { _id: false },
);

const invoiceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    invoiceNumber: { type: String, unique: true },
    type: { type: String, enum: ["standard", "quick"], default: "standard" },
    txStatus: { type: String, default: null },
    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "paid",
        "overdue",
        "partial",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    invoiceDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    items: [itemSchema],
    subtotal: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    paymentDate: { type: Date },
    paymentMethod: { type: String },
    refundReason: { type: String },
    refundedAt: { type: Date },
    notes: { type: String },
    pdfUrl: { type: String },
    whatsappSent: { type: Boolean, default: false },
    whatsappSentAt: { type: Date },
    productPhotos: [{ type: String }],
    delivery: {
      type: deliverySchema,
      default: () => ({ enabled: false, status: "pending" }),
    },
  },
  { timestamps: true },
);

invoiceSchema.pre("save", function (next) {
  this.items.forEach((item) => {
    item.total = item.quantity * item.unitPrice;
  });
  this.subtotal = this.items.reduce((s, i) => s + i.total, 0);
  this.discountAmount = (this.subtotal * (this.discountPercent || 0)) / 100;
  const deliveryFee =
    this.delivery?.enabled && this.delivery?.feeType === "fixed"
      ? this.delivery?.fee || 0
      : 0;
  this.totalAmount = this.subtotal - this.discountAmount + deliveryFee;
  this.balance = this.totalAmount - (this.amountPaid || 0);

  if (this.txStatus === "failed" || this.txStatus === "reversed") {
    this.status = "pending";
    this.amountPaid = 0;
    this.balance = this.totalAmount;
    return next();
  }

  if (this.txStatus === "successful") {
    this.status = "paid";
    return next();
  }

  if (this.balance <= 0 && this.totalAmount > 0) this.status = "paid";
  else if (this.amountPaid > 0 && this.balance > 0) this.status = "partial";

  next();
});

invoiceSchema.index({ user: 1, status: 1 });
invoiceSchema.index({ dueDate: 1, status: 1 });

export default mongoose.model("Invoice", invoiceSchema);
