import Sale from "../models/Sale.js";
import Customer from "../models/Customer.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import WhatsAppSettings from "../models/WhatsAppSettings.js";
import User from "../models/User.js";
import dayjs from "dayjs";
import { logActivity } from "../utils/activityLogger.js";

const PLAN_LIMITS = {
  free: { sales: 10 },
  starter: { sales: 100 },
  business: { sales: 1000 },
  enterprise: { sales: Infinity },
};

const generateSaleNumber = async (userId) => {
  const year = new Date().getFullYear();
  const count = await Sale.countDocuments({ user: userId });
  return `SLS-${year}-${String(count + 1).padStart(4, "0")}`;
};

export const getSales = asyncHandler(async (req, res) => {
  const { status, search, month, year, page = 1, limit = 50 } = req.query;
  const query = { user: req.user._id };

  if (status) query.status = status;
  if (search)
    query.$or = [
      { saleNumber: { $regex: search, $options: "i" } },
      { customerName: { $regex: search, $options: "i" } },
    ];

  // Filter by month/year
  if (month && year) {
    const start = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const end = dayjs(`${year}-${month}-01`).endOf("month").toDate();
    query.createdAt = { $gte: start, $lte: end };
  }

  const sales = await Sale.find(query)
    .populate("customer", "name phone")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Sale.countDocuments(query);

  // All sales for stats
  const allSales = await Sale.find({ user: req.user._id });
  const totalRevenue = allSales
    .filter((s) => s.status !== "refunded")
    .reduce((s, sale) => s + (sale.amountPaid || 0), 0);

  // Selected month stats
  const selectedDate = month && year ? dayjs(`${year}-${month}-01`) : dayjs();
  const selStart = selectedDate.startOf("month").toDate();
  const selEnd = selectedDate.endOf("month").toDate();
  const selectedSales = allSales.filter(
    (s) =>
      new Date(s.createdAt) >= selStart &&
      new Date(s.createdAt) <= selEnd &&
      s.status !== "refunded",
  );
  const monthRevenue = selectedSales.reduce(
    (s, sale) => s + (sale.amountPaid || 0),
    0,
  );

  // Previous month
  const prevStart = selectedDate.subtract(1, "month").startOf("month").toDate();
  const prevEnd = selectedDate.subtract(1, "month").endOf("month").toDate();
  const prevSales = allSales.filter(
    (s) =>
      new Date(s.createdAt) >= prevStart &&
      new Date(s.createdAt) <= prevEnd &&
      s.status !== "refunded",
  );
  const prevRevenue = prevSales.reduce(
    (s, sale) => s + (sale.amountPaid || 0),
    0,
  );

  // Monthly history — last 12 months
  const monthlyHistory = [];
  for (let i = 11; i >= 0; i--) {
    const m = dayjs().subtract(i, "month");
    const mStart = m.startOf("month").toDate();
    const mEnd = m.endOf("month").toDate();
    const mSales = allSales.filter(
      (s) =>
        new Date(s.createdAt) >= mStart &&
        new Date(s.createdAt) <= mEnd &&
        s.status !== "refunded",
    );
    monthlyHistory.push({
      month: m.format("MMM YY"),
      year: m.year(),
      monthNum: m.month() + 1,
      amount: mSales.reduce((s, sale) => s + (sale.amountPaid || 0), 0),
      count: mSales.length,
    });
  }

  // Insight
  let insight = null;
  if (prevRevenue > 0) {
    const diff = monthRevenue - prevRevenue;
    const percent = Math.abs(Math.round((diff / prevRevenue) * 100));
    const prevLabel = selectedDate.subtract(1, "month").format("MMMM");
    const curLabel = selectedDate.format("MMMM");
    if (diff > 0) {
      insight = {
        type: "positive",
        message: `Sales in ${curLabel} were ${percent}% higher than ${prevLabel}. Great job!`,
      };
    } else if (diff < 0) {
      insight = {
        type: "warning",
        message: `Sales in ${curLabel} were ${percent}% lower than ${prevLabel}. Keep pushing!`,
      };
    } else {
      insight = {
        type: "neutral",
        message: `Sales in ${curLabel} are the same as ${prevLabel}.`,
      };
    }
  }

  res.json({
    success: true,
    sales,
    total,
    totalRevenue,
    monthRevenue,
    prevRevenue,
    monthlyHistory,
    insight,
  });
});

export const getSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("customer", "name phone email");
  if (!sale) throw new AppError("Sale not found", 404);
  res.json({ success: true, sale });
});

export const createSale = asyncHandler(async (req, res) => {
  const {
    customerName,
    customer,
    items,
    discountPercent,
    notes,
    amountPaid,
    paymentMethod,
    paymentDate,
    status,
  } = req.body;

  if (!items?.length) throw new AppError("Add at least one item", 400);
  if (items.some((i) => !i.name?.trim()))
    throw new AppError("Fill in all item names", 400);

  // Plan limit check
  const plan = req.user.plan || "free";
  const limit = PLAN_LIMITS[plan]?.sales ?? 10;
  if (limit !== Infinity) {
    const saleCount = await Sale.countDocuments({ user: req.user._id });
    if (saleCount >= limit) {
      throw new AppError(
        `You've reached the ${limit} sales limit on the ${plan} plan. Upgrade to create more sales.`,
        403,
      );
    }
  }

  if (customer) {
    const cust = await Customer.findOne({ _id: customer, user: req.user._id });
    if (!cust) throw new AppError("Customer not found", 404);
  }

  const saleNumber = await generateSaleNumber(req.user._id);

  const sale = await Sale.create({
    user: req.user._id,
    saleNumber,
    customerName: customerName || "Walk-in Customer",
    customer: customer || null,
    items,
    discountPercent: discountPercent || 0,
    notes,
    amountPaid: amountPaid || 0,
    paymentMethod: paymentMethod || null,
    paymentDate: paymentDate || null,
    status: status || "pending",
  });

  await logActivity({
    userId: req.user._id,
    action: "Created sale",
    entity: "sale",
    entityId: sale._id,
    details: `${sale.saleNumber} — ${sale.customerName} · ₦${sale.totalAmount?.toLocaleString()}`,
    ip: req.ip,
    userName: `${req.user.firstName} ${req.user.lastName}`,
  }).catch(() => {});

  await sale.populate("customer", "name phone email");

  // WhatsApp auto-send
  try {
    const waSettings = await WhatsAppSettings.findOne({ user: req.user._id });
    if (waSettings?.connected && waSettings?.invoiceAuto) {
      const phone = sale.customer?.phone;
      if (phone) {
        const owner = await User.findById(req.user._id).select("businessName");
        const bizName = owner?.businessName || "Trackeet";
        const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");
        const itemsList = sale.items
          .map((i) => `  • ${i.name} x${i.quantity} — ${fmtN(i.total)}`)
          .join("\n");
        const msg =
          `Hello ${sale.customerName} 👋\n\n` +
          `Here is your receipt from *${bizName}*:\n\n` +
          `🧾 *Sale:* ${sale.saleNumber}\n` +
          `📅 *Date:* ${dayjs(sale.createdAt).format("D MMM YYYY")}\n` +
          `\n*Items:*\n${itemsList}\n\n` +
          `🧾 *Subtotal:* ${fmtN(sale.subtotal)}\n` +
          (sale.discountPercent > 0
            ? `🏷️ *Discount (${sale.discountPercent}%):* -${fmtN(sale.discountAmount)}\n`
            : "") +
          `💰 *Total:* ${fmtN(sale.totalAmount)}\n` +
          (sale.amountPaid > 0 ? `✅ *Paid:* ${fmtN(sale.amountPaid)}\n` : "") +
          (sale.balance > 0
            ? `⚠️ *Balance Due:* ${fmtN(sale.balance)}\n`
            : `✅ *Fully Paid*\n`) +
          (sale.notes ? `\n📋 *Notes:* ${sale.notes}\n` : "") +
          `\nThank you! 🙏\n_${bizName} · gettrackeet.com_`;
        const { sendRawWhatsAppMessage } =
          await import("../services/whatsappService.js");
        await sendRawWhatsAppMessage(req.user._id.toString(), phone, msg);
      }
    }
  } catch (err) {
    console.error("Sale WhatsApp failed:", err.message);
  }

  res.status(201).json({ success: true, sale });
});

export const updateSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({ _id: req.params.id, user: req.user._id });
  if (!sale) throw new AppError("Sale not found", 404);

  const { amountPaid, paymentMethod, notes, refundReason } = req.body;

  if (refundReason !== undefined) {
    const updated = await Sale.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        $set: {
          status: "refunded",
          refundedAt: new Date(),
          refundReason: refundReason,
          amountPaid: 0,
          balance: sale.totalAmount,
        },
      },
      { new: true, runValidators: false },
    ).populate("customer", "name phone email");

    await logActivity({
      userId: req.user._id,
      action: "Refunded sale",
      entity: "sale",
      entityId: sale._id,
      details: `${sale.saleNumber} — ${refundReason}`,
      ip: req.ip,
      userName: `${req.user.firstName} ${req.user.lastName}`,
    }).catch(() => {});

    // Send WhatsApp refund notification
    try {
      const waSettings = await WhatsAppSettings.findOne({ user: req.user._id });
      if (waSettings?.connected && updated.customer?.phone) {
        const owner = await User.findById(req.user._id).select("businessName");
        const bizName = owner?.businessName || "Trackeet";
        const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");
        const msg =
          `Hello ${updated.customerName} 👋\n\n` +
          `↩️ *Refund Notification*\n\n` +
          `Sale *${updated.saleNumber}* has been *REFUNDED*.\n\n` +
          `💰 *Refund Amount:* ${fmtN(updated.totalAmount)}\n` +
          `📅 *Date:* ${dayjs().format("D MMM YYYY")}\n` +
          (refundReason ? `📋 *Reason:* ${refundReason}\n` : "") +
          `\nYour refund will be processed shortly. Please contact us if you have any questions.\n\n` +
          `_${bizName} · gettrackeet.com_`;
        const { sendRawWhatsAppMessage } =
          await import("../services/whatsappService.js");
        await sendRawWhatsAppMessage(
          req.user._id.toString(),
          updated.customer.phone,
          msg,
        );
      }
    } catch (err) {
      console.error("Sale refund WhatsApp failed:", err.message);
    }

    return res.json({ success: true, sale: updated });
  }

  if (amountPaid !== undefined) {
    sale.amountPaid = parseFloat(amountPaid);
    sale.paymentMethod = paymentMethod || sale.paymentMethod;
    sale.paymentDate = new Date();
  }

  if (notes !== undefined) sale.notes = notes;

  await sale.save();
  await sale.populate("customer", "name phone email");
  await logActivity({
    userId: req.user._id,
    action: "Recorded sale payment",
    entity: "sale",
    entityId: sale._id,
    details: `${sale.saleNumber} — ₦${(parseFloat(amountPaid) || sale.amountPaid)?.toLocaleString()} via ${paymentMethod || sale.paymentMethod}`,
    ip: req.ip,
    userName: `${req.user.firstName} ${req.user.lastName}`,
  }).catch(() => {});

  // Send WhatsApp receipt on payment update
  try {
    const phone = sale.customer?.phone;
    if (phone) {
      const waSettings = await WhatsAppSettings.findOne({ user: req.user._id });
      if (waSettings?.connected) {
        const owner = await User.findById(req.user._id).select("businessName");
        const bizName = owner?.businessName || "Trackeet";
        const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");
        const msg =
          `Hello ${sale.customerName} 👋\n\n` +
          `Payment received! ✅\n\n` +
          `🧾 *Sale:* ${sale.saleNumber}\n` +
          `💰 *Amount Paid:* ${fmtN(sale.amountPaid)}\n` +
          (sale.balance > 0
            ? `⚠️ *Balance Due:* ${fmtN(sale.balance)}\n`
            : `✅ *Fully Paid*\n`) +
          `\nThank you! 🙏\n_${bizName} · gettrackeet.com_`;
        const { sendRawWhatsAppMessage } =
          await import("../services/whatsappService.js");
        await sendRawWhatsAppMessage(req.user._id.toString(), phone, msg);
      }
    }
  } catch (err) {
    console.error("Sale payment WhatsApp failed:", err.message);
  }

  res.json({ success: true, sale });
});

export const deleteSale = asyncHandler(async (req, res) => {
  const sale = await Sale.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!sale) throw new AppError("Sale not found", 404);
  res.json({ success: true, message: "Sale deleted" });
});

export const sendSaleWhatsApp = asyncHandler(async (req, res) => {
  const sale = await Sale.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("customer", "name phone email");
  if (!sale) throw new AppError("Sale not found", 404);

  const phone = sale.customer?.phone || req.body.phone;
  if (!phone) throw new AppError("No phone number available", 400);

  const owner = await User.findById(req.user._id).select("businessName");
  const bizName = owner?.businessName || "Trackeet";
  const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");
  const itemsList = sale.items
    .map((i) => `  • ${i.name} x${i.quantity} — ${fmtN(i.total)}`)
    .join("\n");

  const msg =
    `Hello ${sale.customerName} 👋\n\n` +
    `Here is your receipt from *${bizName}*:\n\n` +
    `🧾 *Sale:* ${sale.saleNumber}\n` +
    `📅 *Date:* ${dayjs(sale.createdAt).format("D MMM YYYY")}\n` +
    `\n*Items:*\n${itemsList}\n\n` +
    `🧾 *Subtotal:* ${fmtN(sale.subtotal)}\n` +
    (sale.discountPercent > 0
      ? `🏷️ *Discount (${sale.discountPercent}%):* -${fmtN(sale.discountAmount)}\n`
      : "") +
    `💰 *Total:* ${fmtN(sale.totalAmount)}\n` +
    (sale.amountPaid > 0 ? `✅ *Paid:* ${fmtN(sale.amountPaid)}\n` : "") +
    (sale.balance > 0
      ? `⚠️ *Balance Due:* ${fmtN(sale.balance)}\n`
      : `✅ *Fully Paid*\n`) +
    (sale.notes ? `\n📋 *Notes:* ${sale.notes}\n` : "") +
    `\nThank you! 🙏\n_${bizName} · gettrackeet.com_`;

  const { sendRawWhatsAppMessage } =
    await import("../services/whatsappService.js");
  await sendRawWhatsAppMessage(req.user._id.toString(), phone, msg);

  sale.whatsappSent = true;
  await sale.save();

  res.json({ success: true, message: "Receipt sent via WhatsApp" });
});
