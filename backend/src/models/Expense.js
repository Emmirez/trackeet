import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    category: {
      type: String,
      enum: [
        "goods",
        "transport",
        "rent",
        "salary",
        "packaging",
        "utilities",
        "marketing",
        "equipment",
        "maintenance",
        "other",
      ],
      default: "other",
    },
    date: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model("Expense", expenseSchema);
