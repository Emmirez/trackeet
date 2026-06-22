import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String },
    role: { type: String, default: "owner" },
    action: { type: String, required: true },
    entity: { type: String }, // invoice, customer, payment, team, settings
    entityId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: String },
    ip: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("ActivityLog", activityLogSchema);
