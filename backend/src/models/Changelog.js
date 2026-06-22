import mongoose from "mongoose";

const changelogSchema = new mongoose.Schema(
  {
    version: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ["feature", "improvement", "bugfix", "security"],
      default: "feature",
    },
    items: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

export default mongoose.model("Changelog", changelogSchema);
