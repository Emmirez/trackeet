import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    total: { type: Number, required: true },
    image: { type: String },
    attributes: { type: mongoose.Schema.Types.Mixed }, // selected size, color etc
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    orderNumber: { type: String, unique: true },

    // Customer info (public — may not be a registered customer)
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: { type: String },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    items: [orderItemSchema],
    subtotal: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, default: 0 },
    amountPaid: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },

    paymentStatus: {
      type: String,
      enum: ["unpaid", "partial", "paid"],
      default: "unpaid",
    },

    paymentMethod: { type: String },
    paymentDate: { type: Date },

    // Delivery
    deliveryAddress: { type: String },
    deliveryNote: { type: String },
    deliveryFee: { type: Number, default: 0 },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    deliveryPhoto: { type: String },

    // Source
    source: {
      type: String,
      enum: ["storefront", "whatsapp", "dashboard", "qr"],
      default: "storefront",
    },

    notes: { type: String },
    whatsappSent: { type: Boolean, default: false },
    cancelReason: { type: String },
  },
  { timestamps: true },
);

orderSchema.pre("save", function (next) {
  this.subtotal = this.items.reduce((s, i) => s + i.total, 0);
  this.totalAmount =
    this.subtotal + (this.deliveryFee || 0) - (this.discount || 0);
  this.balance = this.totalAmount - (this.amountPaid || 0);
  if (this.balance <= 0) this.paymentStatus = "paid";
  else if (this.amountPaid > 0) this.paymentStatus = "partial";
  next();
});

orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ customerPhone: 1 });

export default mongoose.model("Order", orderSchema);
