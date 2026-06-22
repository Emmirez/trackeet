import mongoose from "mongoose";

const subscriberSchema = new mongoose.Schema(
  {
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    storeName: { type: String, required: true },
    email: { type: String, required: true },
    name: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    unsubscribeToken: { type: String },
  },
  { timestamps: true },
);

subscriberSchema.index({ store: 1, email: 1 }, { unique: true });

export default mongoose.model("Subscriber", subscriberSchema);
