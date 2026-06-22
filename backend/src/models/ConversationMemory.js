import mongoose from "mongoose";

const conversationMemorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customerPhone: { type: String, required: true },
    customerName: { type: String },

    // Last intent / context
    lastIntent: { type: String }, // e.g. 'product_search', 'order_tracking', 'balance'
    lastKeyword: { type: String }, // e.g. 'sneakers', 'red gown'
    lastProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    lastOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },

    // Cart (pending order before checkout)
    cart: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String },
        price: { type: Number },
        quantity: { type: Number, default: 1 },
        attributes: { type: mongoose.Schema.Types.Mixed },
      },
    ],

    // Conversation state
    state: {
      type: String,
      enum: ["idle", "browsing", "ordering", "checkout", "support"],
      default: "idle",
    },

    // Human handoff
    handedOff: { type: Boolean, default: false },
    handedOffAt: { type: Date },

    lastMessageAt: { type: Date, default: Date.now },
    messageCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// TTL — auto clear memory after 24 hours of inactivity
conversationMemorySchema.index(
  { lastMessageAt: 1 },
  { expireAfterSeconds: 86400 },
);
conversationMemorySchema.index({ user: 1, customerPhone: 1 }, { unique: true });

export default mongoose.model("ConversationMemory", conversationMemorySchema);
