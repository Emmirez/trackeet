import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import Sale from "../models/Sale.js";
import { asyncHandler } from "../utils/appError.js";
import dayjs from "dayjs";

export const getPayments = asyncHandler(async (req, res) => {
  const uid = req.user._id;

  // Regular payments from Payment collection
  const payments = await Payment.find({ user: uid })
    .populate("customer", "name phone")
    .populate("invoice", "invoiceNumber type")
    .sort({ createdAt: -1 });

  const markedPayments = payments.map((p) => ({
    ...p.toObject(),
    type: "invoice",
    isQuick: p.invoice?.type === "quick",
  }));

  // Invoice IDs already in Payment collection
  const invoiceIdsInPayments = new Set(
    payments.map((p) => p.invoice?._id?.toString()).filter(Boolean),
  );

  // Quick record invoices NOT already in Payment collection
  const quickInvoices = await Invoice.find({ user: uid, type: "quick" })
    .populate("customer", "name phone")
    .sort({ createdAt: -1 });

  const quickPayments = quickInvoices
    .filter((inv) => !invoiceIdsInPayments.has(inv._id.toString()))
    .map((inv) => ({
      _id: inv._id,
      type: "invoice",
      isQuick: true,
      customer: inv.customer,
      amount: inv.amountPaid || inv.totalAmount,
      method: inv.paymentMethod || "other",
      createdAt: inv.paymentDate || inv.createdAt,
      paidAt: inv.paymentDate || inv.createdAt,
      note: inv.notes,
      txStatus: inv.txStatus,
      invoice: { invoiceNumber: inv.invoiceNumber, type: "quick" },
    }));

  // Standard invoices with txStatus
  const standardTxInvoices = await Invoice.find({
    user: uid,
    type: { $ne: "quick" },
    txStatus: { $in: ["pending", "failed", "reversed"] },
  })
    .populate("customer", "name phone")
    .sort({ createdAt: -1 });

  const standardTxPayments = standardTxInvoices
    .filter((inv) => !invoiceIdsInPayments.has(inv._id.toString()))
    .map((inv) => ({
      _id: inv._id,
      type: "invoice",
      isQuick: false,
      customer: inv.customer,
      amount: inv.totalAmount,
      method: inv.paymentMethod || "bank_transfer",
      createdAt: inv.createdAt,
      paidAt: inv.createdAt,
      note: inv.notes,
      txStatus: inv.txStatus,
      invoice: { invoiceNumber: inv.invoiceNumber, type: "standard" },
    }));

  // Sales as payment entries
  const sales = await Sale.find({
    user: uid,
    status: { $ne: "refunded" },
    amountPaid: { $gt: 0 },
  })
    .populate("customer", "name phone")
    .sort({ createdAt: -1 });

  const salePayments = sales.map((s) => ({
    _id: s._id,
    type: "sale",
    saleNumber: s.saleNumber,
    customer: s.customer || { name: s.customerName },
    amount: s.amountPaid,
    method: s.paymentMethod,
    note: s.notes,
    status: s.status,
    createdAt: s.paymentDate || s.createdAt,
    paidAt: s.paymentDate || s.createdAt,
  }));

  // Merge and sort by date
  const allPayments = [
    ...markedPayments,
    ...quickPayments,
    ...standardTxPayments,
    ...salePayments,
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Total received — exclude failed/reversed/pending txStatus
  const thisMonth = allPayments
    .filter(
      (p) =>
        dayjs(p.createdAt).isSame(dayjs(), "month") &&
        !["failed", "reversed", "pending"].includes(p.txStatus),
    )
    .reduce((s, p) => s + (p.amount || 0), 0);

  res.json({ success: true, payments: allPayments, thisMonth });
});

export const recordPayment = asyncHandler(async (req, res) => {
  const payment = await Payment.create({ ...req.body, user: req.user._id });
  res.status(201).json({ success: true, payment });
});

export const deletePayment = asyncHandler(async (req, res) => {
  await Payment.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  res.json({ success: true, message: "Payment deleted" });
});
