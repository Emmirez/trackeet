import mongoose from "mongoose";

const apiKeySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    key: { type: String, required: true, unique: true },
    prefix: { type: String }, // first 8 chars for display
    lastUsed: { type: Date },
    usageCount: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "revoked"], default: "active" },
    permissions: [
      { type: String, enum: ["invoices", "customers", "payments", "reports"] },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("ApiKey", apiKeySchema);
