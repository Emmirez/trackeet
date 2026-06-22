import Expense from "../models/Expense.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import dayjs from "dayjs";

export const getExpenses = asyncHandler(async (req, res) => {
  const { category, month, year, page = 1, limit = 50 } = req.query;
  const query = { user: req.user._id };

  // Filter by specific month/year
  if (month && year) {
    const start = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const end = dayjs(`${year}-${month}-01`).endOf("month").toDate();
    query.date = { $gte: start, $lte: end };
  }
  if (category) query.category = category;

  const expenses = await Expense.find(query)
    .sort({ date: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Expense.countDocuments(query);

  // Selected month stats
  const selectedMonthExpenses = await Expense.find({
    user: req.user._id,
    ...(query.date ? { date: query.date } : {}),
  });
  const selectedMonthAmount = selectedMonthExpenses.reduce(
    (s, e) => s + e.amount,
    0,
  );

  // Previous month for comparison
  const selectedDate = month && year ? dayjs(`${year}-${month}-01`) : dayjs();
  const prevMonthStart = selectedDate
    .subtract(1, "month")
    .startOf("month")
    .toDate();
  const prevMonthEnd = selectedDate
    .subtract(1, "month")
    .endOf("month")
    .toDate();
  const prevMonthExp = await Expense.find({
    user: req.user._id,
    date: { $gte: prevMonthStart, $lte: prevMonthEnd },
  });
  const prevMonthAmount = prevMonthExp.reduce((s, e) => s + e.amount, 0);

  // All time total
  const allExpenses = await Expense.find({ user: req.user._id });
  const totalAmount = allExpenses.reduce((s, e) => s + e.amount, 0);

  // By category for selected period
  const byCategory = {};
  selectedMonthExpenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  // Monthly history — last 12 months
  const monthlyHistory = [];
  for (let i = 11; i >= 0; i--) {
    const m = dayjs().subtract(i, "month");
    const mStart = m.startOf("month").toDate();
    const mEnd = m.endOf("month").toDate();
    const mExp = allExpenses.filter(
      (e) => new Date(e.date) >= mStart && new Date(e.date) <= mEnd,
    );
    monthlyHistory.push({
      month: m.format("MMM YY"),
      year: m.year(),
      monthNum: m.month() + 1,
      amount: mExp.reduce((s, e) => s + e.amount, 0),
    });
  }

  // Insight
  let insight = null;
  if (prevMonthAmount > 0) {
    const diff = selectedMonthAmount - prevMonthAmount;
    const percent = Math.abs(Math.round((diff / prevMonthAmount) * 100));
    const prevLabel = selectedDate.subtract(1, "month").format("MMMM");
    const curLabel = selectedDate.format("MMMM");
    if (diff > 0) {
      insight = {
        type: "warning",
        message: `Expenses in ${curLabel} were ${percent}% higher than ${prevLabel}. Review your spending.`,
      };
    } else if (diff < 0) {
      insight = {
        type: "positive",
        message: `Great! Expenses in ${curLabel} were ${percent}% lower than ${prevLabel}. Good cost control!`,
      };
    } else {
      insight = {
        type: "neutral",
        message: `Expenses in ${curLabel} are the same as ${prevLabel}.`,
      };
    }
  } else if (selectedMonthAmount > 0 && prevMonthAmount === 0) {
    insight = {
      type: "neutral",
      message: `First time recording expenses this month. Keep tracking to see trends over time.`,
    };
  }

  // Top category this month
  const topCat = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];

  res.json({
    success: true,
    expenses,
    total,
    totalAmount,
    selectedMonthAmount,
    prevMonthAmount,
    byCategory,
    monthlyHistory,
    insight,
    topCategory: topCat ? topCat[0] : null,
  });
});

export const createExpense = asyncHandler(async (req, res) => {
  const { title, amount, category, date, notes } = req.body;
  if (!title?.trim()) throw new AppError("Title is required", 400);
  if (!amount || amount <= 0)
    throw new AppError("Amount must be greater than 0", 400);

  const expense = await Expense.create({
    user: req.user._id,
    title,
    amount: parseFloat(amount),
    category: category || "other",
    date: date ? new Date(date) : new Date(),
    notes,
  });

  res.status(201).json({ success: true, expense });
});

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true },
  );
  if (!expense) throw new AppError("Expense not found", 404);
  res.json({ success: true, expense });
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!expense) throw new AppError("Expense not found", 404);
  res.json({ success: true, message: "Expense deleted" });
});

export const getExpenseSummary = asyncHandler(async (req, res) => {
  const { period = "month" } = req.query;
  const now = dayjs();
  const start =
    period === "week"
      ? now.subtract(7, "day").toDate()
      : period === "month"
        ? now.startOf("month").toDate()
        : now.subtract(12, "month").toDate();

  const expenses = await Expense.find({
    user: req.user._id,
    date: { $gte: start },
  });
  const total = expenses.reduce((s, e) => s + e.amount, 0);

  const byCategory = {};
  expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });

  res.json({ success: true, total, byCategory, count: expenses.length });
});
