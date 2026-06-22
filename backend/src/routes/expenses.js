import express from "express";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getExpenseSummary,
} from "../controllers/expenseController.js";
import { protect } from "../middleware/auth.js";

const r = express.Router();
r.use(protect);

r.get("/", getExpenses);
r.post("/", createExpense);
r.get("/summary", getExpenseSummary);
r.put("/:id", updateExpense);
r.delete("/:id", deleteExpense);

export default r;
