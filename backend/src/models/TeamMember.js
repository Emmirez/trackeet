import mongoose from "mongoose";

const teamMemberSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // set when they accept invite
    email: { type: String, required: true, lowercase: true },
    name: { type: String, required: true },
    role: { type: String, enum: ["manager", "staff"], default: "staff" },
    status: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
    inviteToken: { type: String },
    inviteExpires: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model("TeamMember", teamMemberSchema);
