import Invoice from "../models/Invoice.js";
import Payment from "../models/Payment.js";
import Customer from "../models/Customer.js";
import { asyncHandler } from "../utils/appError.js";
import PDFDocument from "pdfkit";
import dayjs from "dayjs";

export const getSummary = asyncHandler(async (req, res) => {
  const uid = req.user._id;
  const Sale = (await import("../models/Sale.js")).default;
  const invoices = await Invoice.find({ user: uid }).populate(
    "customer",
    "name",
  );

  const paid = invoices.filter((i) => i.status === "paid");
  const partial = invoices.filter((i) => i.status === "partial");
  const pending = invoices.filter(
    (i) =>
      i.status === "pending" && !["failed", "reversed"].includes(i.txStatus),
  );
  const overdue = invoices.filter((i) => i.status === "overdue");
  const failed = invoices.filter((i) =>
    ["failed", "reversed"].includes(i.txStatus),
  );

  const sum = (arr) => arr.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const sumPaid = (arr) => arr.reduce((s, i) => s + (i.amountPaid || 0), 0);

  // Sales
  const sales = await Sale.find({ user: uid, status: { $ne: "refunded" } });
  const salesThisMonth = sales.filter((s) =>
    dayjs(s.createdAt).isSame(dayjs(), "month"),
  );
  const salesTotalPaid = sales.reduce(
    (s, sale) => s + (sale.amountPaid || 0),
    0,
  );
  const salesMonthPaid = salesThisMonth.reduce(
    (s, sale) => s + (sale.amountPaid || 0),
    0,
  );

  const lastMonth = invoices.filter((i) =>
    dayjs(i.createdAt).isSame(dayjs().subtract(1, "month"), "month"),
  );
  const thisMonth = invoices.filter((i) =>
    dayjs(i.createdAt).isSame(dayjs(), "month"),
  );
  const growth = lastMonth.length
    ? Math.round(
        ((thisMonth.length - lastMonth.length) / lastMonth.length) * 100,
      )
    : 0;

  const recent = [...invoices]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const waSettings = await import("../models/WhatsAppSettings.js").then((m) =>
    m.default.findOne({ user: uid }),
  );

  const revenueTrend = [];
  for (let i = 6; i >= 0; i--) {
    const d = dayjs().subtract(i, "day");
    const dayInvs = invoices.filter((inv) =>
      dayjs(inv.createdAt).isSame(d, "day"),
    );
    const daySales = sales.filter((s) => dayjs(s.createdAt).isSame(d, "day"));
    revenueTrend.push({
      day: d.format("D MMM"),
      amount:
        sumPaid(dayInvs) +
        daySales.reduce((s, sale) => s + (sale.amountPaid || 0), 0),
    });
  }

  res.json({
    success: true,
    stats: {
      totalInvoices: invoices.length,
      totalAmount: sum(invoices),
      paid: paid.length,
      paidAmount: sum(paid),
      partial: partial.length,
      partialAmount: partial.reduce((s, i) => s + (i.amountPaid || 0), 0),
      partialBalance: partial.reduce((s, i) => s + (i.balance || 0), 0),
      pending: pending.length,
      pendingAmount: sum(pending),
      overdue: overdue.length,
      overdueAmount: sum(overdue),
      failed: failed.length,
      failedAmount: sum(failed),
      totalBalance: sumPaid([...paid, ...partial]) + salesTotalPaid,
      growth,
      salesCount: sales.length,
      salesRevenue: salesTotalPaid,
      salesThisMonth: salesMonthPaid,
    },
    recentInvoices: recent,
    revenueTrend,
    whatsappConnected: waSettings?.connected || false,
  });
});

export const getRevenue = asyncHandler(async (req, res) => {
  const uid = req.user._id;
  const { period = "month" } = req.query;

  let startDate;
  if (period === "week") startDate = dayjs().subtract(7, "day").toDate();
  if (period === "month") startDate = dayjs().subtract(30, "day").toDate();
  if (period === "year") startDate = dayjs().subtract(1, "year").toDate();

  const invoices = await Invoice.find({
    user: uid,
    createdAt: { $gte: startDate },
  });

  const paid = invoices.filter((i) => i.status === "paid");
  const partial = invoices.filter((i) => i.status === "partial");
  const failed = invoices.filter((i) =>
    ["failed", "reversed"].includes(i.txStatus),
  );
  const pending = invoices.filter(
    (i) =>
      i.status === "pending" && !["failed", "reversed"].includes(i.txStatus),
  );
  const overdue = invoices.filter((i) => i.status === "overdue");
  const draft = invoices.filter((i) => i.status === "draft");
  const refunded = invoices.filter((i) => i.status === "refunded");

  const sum = (arr) => arr.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const sumPaid = (arr) => arr.reduce((s, i) => s + (i.amountPaid || 0), 0);

  const days = period === "week" ? 7 : period === "month" ? 30 : 12;
  const unit = period === "year" ? "month" : "day";
  const chartData = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = dayjs().subtract(i, unit);
    const dayInvs = invoices.filter((inv) =>
      dayjs(inv.createdAt).isSame(d, unit),
    );
    chartData.push({
      date: d.format(unit === "month" ? "MMM" : "D MMM"),
      revenue: sumPaid(dayInvs),
    });
  }

  res.json({
    success: true,
    totalRevenue: sumPaid([...paid, ...partial]),
    paidAmount: sum(paid),
    partialAmount: sumPaid(partial),
    partialBalance: partial.reduce((s, i) => s + (i.balance || 0), 0),
    pendingAmount: sum(pending),
    overdueAmount: sum(overdue),
    paid: paid.length,
    partial: partial.length,
    failed: failed.length,
    failedAmount: sum(failed),
    pending: pending.length,
    overdue: overdue.length,
    draft: draft.length,
    refunded: refunded.length,
    refundedAmount: refunded.reduce((s, i) => s + (i.totalAmount || 0), 0),
    chartData,
  });
});

export const getInsights = asyncHandler(async (req, res) => {
  const uid = req.user._id;

  const now = dayjs();
  const thisMonthStart = now.startOf("month").toDate();
  const lastMonthStart = now.subtract(1, "month").startOf("month").toDate();
  const lastMonthEnd = now.subtract(1, "month").endOf("month").toDate();
  const thirtyDaysAgo = now.subtract(30, "day").toDate();
  const sevenDaysAgo = now.subtract(7, "day").toDate();

  const allInvoices = await Invoice.find({ user: uid }).populate(
    "customer",
    "name",
  );
  const thisMonth = allInvoices.filter(
    (i) => new Date(i.createdAt) >= thisMonthStart,
  );
  const lastMonth = allInvoices.filter(
    (i) =>
      new Date(i.createdAt) >= lastMonthStart &&
      new Date(i.createdAt) <= lastMonthEnd,
  );
  const paid = allInvoices.filter((i) => i.status === "paid");
  const pending = allInvoices.filter((i) => i.status === "pending");
  const overdue = allInvoices.filter((i) => i.status === "overdue");
  const partial = allInvoices.filter((i) => i.status === "partial");
  const dueSoon = allInvoices.filter(
    (i) =>
      ["pending", "partial"].includes(i.status) &&
      i.dueDate &&
      dayjs(i.dueDate).diff(now, "day") <= 3 &&
      dayjs(i.dueDate).diff(now, "day") >= 0,
  );
  const recentPaid = paid.filter(
    (i) => new Date(i.paymentDate) >= thirtyDaysAgo,
  );

  const sum = (arr) => arr.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

  const insights = [];

  // Revenue growth
  const thisMonthRevenue = sum(thisMonth.filter((i) => i.status === "paid"));
  const lastMonthRevenue = sum(lastMonth.filter((i) => i.status === "paid"));
  if (lastMonthRevenue > 0) {
    const growth = Math.round(
      ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100,
    );
    if (growth > 0) {
      insights.push({
        type: "positive",
        icon: "📈",
        title: "Revenue Growing",
        message: `Your revenue grew by ${growth}% this month compared to last month. Keep it up!`,
      });
    } else if (growth < 0) {
      insights.push({
        type: "warning",
        icon: "📉",
        title: "Revenue Declined",
        message: `Your revenue dropped by ${Math.abs(growth)}% compared to last month. Consider following up on pending invoices.`,
      });
    } else {
      insights.push({
        type: "neutral",
        icon: "📊",
        title: "Stable Revenue",
        message: `Your revenue is consistent with last month. Look for opportunities to grow.`,
      });
    }
  }

  // Collection rate
  const totalInvoiced = sum(allInvoices);
  const totalCollected = sum(paid);
  if (totalInvoiced > 0) {
    const collectionRate = Math.round((totalCollected / totalInvoiced) * 100);
    if (collectionRate >= 80) {
      insights.push({
        type: "positive",
        icon: "💰",
        title: "Excellent Collection Rate",
        message: `You've collected ${collectionRate}% of all invoiced amounts. That's above the average of 65% — great job!`,
      });
    } else if (collectionRate >= 60) {
      insights.push({
        type: "neutral",
        icon: "💰",
        title: "Good Collection Rate",
        message: `Your collection rate is ${collectionRate}%. Sending WhatsApp reminders could help push this higher.`,
      });
    } else {
      insights.push({
        type: "warning",
        icon: "💰",
        title: "Low Collection Rate",
        message: `Only ${collectionRate}% of your invoiced amount has been collected. Focus on following up overdue invoices.`,
      });
    }
  }

  // Outstanding balance
  const totalOutstanding = allInvoices
    .filter((i) => ["pending", "partial", "overdue"].includes(i.status))
    .reduce((s, i) => s + (i.balance || i.totalAmount), 0);
  if (totalOutstanding > 0) {
    insights.push({
      type: "warning",
      icon: "⏳",
      title: "Outstanding Balance",
      message: `You have ${fmtN(totalOutstanding)} outstanding across ${pending.length + partial.length + overdue.length} invoices. Follow up to collect faster.`,
    });
  }

  // Best paying customer
  const customerTotals = {};
  paid.forEach((inv) => {
    const name = inv.customer?.name || "Unknown";
    customerTotals[name] =
      (customerTotals[name] || 0) + (inv.amountPaid || inv.totalAmount);
  });
  const bestCustomer = Object.entries(customerTotals).sort(
    (a, b) => b[1] - a[1],
  )[0];
  if (bestCustomer) {
    insights.push({
      type: "positive",
      icon: "⭐",
      title: "Top Customer",
      message: `${bestCustomer[0]} is your best paying customer with ${fmtN(bestCustomer[1])} paid. Consider offering them loyalty discounts.`,
    });
  }

  // Repeat late payers
  const lateCustomers = {};
  overdue.forEach((inv) => {
    const name = inv.customer?.name || "Unknown";
    lateCustomers[name] = (lateCustomers[name] || 0) + 1;
  });
  const repeatLate = Object.entries(lateCustomers).filter(
    ([_, count]) => count >= 2,
  );
  if (repeatLate.length > 0) {
    insights.push({
      type: "warning",
      icon: "⚠️",
      title: "Repeat Late Payers",
      message: `${repeatLate.map(([name]) => name).join(", ")} ${repeatLate.length === 1 ? "has" : "have"} multiple overdue invoices. Consider stricter payment terms for ${repeatLate.length === 1 ? "this customer" : "these customers"}.`,
    });
  }

  // Due soon
  if (dueSoon.length > 0) {
    insights.push({
      type: "warning",
      icon: "🔔",
      title: "Invoices Due Soon",
      message: `${dueSoon.length} invoice${dueSoon.length > 1 ? "s are" : " is"} due within 3 days totalling ${fmtN(dueSoon.reduce((s, i) => s + (i.balance || i.totalAmount), 0))}. Send reminders now.`,
    });
  }

  // Overdue action
  if (overdue.length > 0) {
    insights.push({
      type: "danger",
      icon: "🚨",
      title: "Overdue Invoices Need Attention",
      message: `You have ${overdue.length} overdue invoice${overdue.length > 1 ? "s" : ""} worth ${fmtN(sum(overdue))}. Send WhatsApp reminders to recover these payments.`,
    });
  }

  // Partial payments
  if (partial.length > 0) {
    const partialBalance = partial.reduce((s, i) => s + (i.balance || 0), 0);
    insights.push({
      type: "neutral",
      icon: "💳",
      title: "Partial Payments Pending",
      message: `${partial.length} customer${partial.length > 1 ? "s have" : " has"} made partial payments. ${fmtN(partialBalance)} is still outstanding — follow up for the balance.`,
    });
  }

  // No invoices this week
  const invoicesThisWeek = allInvoices.filter(
    (i) => new Date(i.createdAt) >= sevenDaysAgo,
  );
  if (invoicesThisWeek.length === 0 && allInvoices.length > 0) {
    insights.push({
      type: "neutral",
      icon: "📝",
      title: "No Invoices This Week",
      message: `You haven't created any invoices this week. Stay consistent to keep your cash flow healthy.`,
    });
  }

  // Average payment time
  const paidWithDates = paid.filter((i) => i.invoiceDate && i.paymentDate);
  if (paidWithDates.length >= 3) {
    const avgDays = Math.round(
      paidWithDates.reduce(
        (s, i) => s + dayjs(i.paymentDate).diff(dayjs(i.invoiceDate), "day"),
        0,
      ) / paidWithDates.length,
    );
    if (avgDays <= 7) {
      insights.push({
        type: "positive",
        icon: "⚡",
        title: "Fast Payment Collection",
        message: `Customers pay you in an average of ${avgDays} days. That's excellent cash flow management!`,
      });
    } else if (avgDays <= 14) {
      insights.push({
        type: "neutral",
        icon: "⏱️",
        title: "Average Payment Time",
        message: `Your average payment collection time is ${avgDays} days. Industry average is 14 days — you're on track.`,
      });
    } else {
      insights.push({
        type: "warning",
        icon: "⏱️",
        title: "Slow Payment Collection",
        message: `It takes an average of ${avgDays} days to collect payment. Use WhatsApp reminders to speed this up.`,
      });
    }
  }

  // Business momentum
  if (thisMonth.length > lastMonth.length && lastMonth.length > 0) {
    insights.push({
      type: "positive",
      icon: "🚀",
      title: "Business is Growing",
      message: `You've created ${thisMonth.length} invoices this month vs ${lastMonth.length} last month. Your business is gaining momentum!`,
    });
  }

  // Expenses & health score
  const Expense = (await import("../models/Expense.js")).default;
  const thisMonthExpenses = await Expense.find({
    user: uid,
    date: { $gte: thisMonthStart },
  });
  const totalExpenses = thisMonthExpenses.reduce((s, e) => s + e.amount, 0);
  const profitMargin =
    thisMonthRevenue > 0
      ? Math.round(
          ((thisMonthRevenue - totalExpenses) / thisMonthRevenue) * 100,
        )
      : 0;

  const score = Math.round(
    (paid.length / Math.max(allInvoices.length, 1)) * 30 +
      (overdue.length === 0 ? 25 : Math.max(0, 25 - overdue.length * 5)) +
      (thisMonthRevenue >= lastMonthRevenue ? 25 : 12) +
      (profitMargin > 0 ? Math.min(20, profitMargin / 2) : 0),
  );

  insights.push({
    type: score >= 70 ? "positive" : score >= 50 ? "neutral" : "warning",
    icon: score >= 70 ? "🏆" : score >= 50 ? "📊" : "💡",
    title: "Business Health Score",
    message: `Your business health score is ${score}/100. ${
      score >= 70
        ? `Excellent! Revenue is ${profitMargin > 0 ? `${profitMargin}% above expenses` : "healthy"}.`
        : score >= 50
          ? `Good, but there's room to improve. ${profitMargin < 0 ? "Expenses exceed revenue this month." : "Focus on reducing overdue invoices."}`
          : `Needs attention. ${profitMargin < 0 ? `Expenses exceed revenue by ${Math.abs(profitMargin)}%.` : "Prioritize collecting outstanding payments."}`
    }`,
    score,
  });

  // Inactive customers
  const allCustomers = await Customer.find({ user: uid });
  const inactiveCustomers = [];
  for (const customer of allCustomers) {
    const lastInvoice = await Invoice.findOne({
      user: uid,
      customer: customer._id,
    }).sort({ createdAt: -1 });
    if (!lastInvoice) continue;
    const daysSince = dayjs().diff(dayjs(lastInvoice.createdAt), "day");
    if (daysSince >= 30) inactiveCustomers.push(customer);
  }
  if (inactiveCustomers.length > 0) {
    const names = inactiveCustomers
      .slice(0, 3)
      .map((c) => c.name)
      .join(", ");
    insights.push({
      type: "neutral",
      icon: "😴",
      title: "Inactive Customers",
      message: `${inactiveCustomers.length} customer${inactiveCustomers.length > 1 ? "s have" : " has"} not been invoiced in 30+ days — ${names}${inactiveCustomers.length > 3 ? ` and ${inactiveCustomers.length - 3} more` : ""}. Time to follow up!`,
    });
  }

  res.json({ success: true, insights });
});

export const exportPDF = asyncHandler(async (req, res) => {
  const uid = req.user._id;
  const { period = "month" } = req.query;

  let startDate;
  if (period === "week") startDate = dayjs().subtract(7, "day").toDate();
  if (period === "month") startDate = dayjs().subtract(30, "day").toDate();
  if (period === "year") startDate = dayjs().subtract(1, "year").toDate();

  const User = (await import("../models/User.js")).default;
  const Sale = (await import("../models/Sale.js")).default;
  const user = await User.findById(uid);
  const invoices = await Invoice.find({
    user: uid,
    createdAt: { $gte: startDate },
  })
    .populate("customer", "name phone")
    .sort({ createdAt: -1 });

  const paid = invoices.filter((i) => i.status === "paid");
  const pending = invoices.filter((i) => i.status === "pending");
  const overdue = invoices.filter((i) => i.status === "overdue");
  const partial = invoices.filter((i) => i.status === "partial");

  const sales = await Sale.find({
    user: uid,
    createdAt: { $gte: startDate },
  }).sort({ createdAt: -1 });

  const paidSales = sales.filter((s) => s.status === "paid");
  const pendingSales = sales.filter((s) => s.status === "pending");
  const partialSales = sales.filter((s) => s.status === "partial");
  const refundedSales = sales.filter((s) => s.status === "refunded");
  const totalSalesRevenue = sales.reduce(
    (s, sale) => s + (sale.amountPaid || 0),
    0,
  );
  const sumSales = (arr) => arr.reduce((s, i) => s + (i.totalAmount || 0), 0);

  const sum = (arr) => arr.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const fmtN = (n) => "N" + (n || 0).toLocaleString("en-NG");
  const periodLabel =
    period === "week"
      ? "Last 7 Days"
      : period === "month"
        ? "Last 30 Days"
        : "Last 12 Months";

  const doc = new PDFDocument({ margin: 0, size: "A4", autoFirstPage: true });
  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=trackeet-report-${period}.pdf`,
  );
  doc.pipe(res);

  const PW = doc.page.width;
  const PH = doc.page.height;
  const M = 40;

  doc.rect(0, 0, PW, 65).fill("#7C3AED");
  doc.fillColor("white").fontSize(22).font("Helvetica-Bold");
  doc.text((user?.businessName || "TRACKEET").toUpperCase(), M, 15);
  doc.fillColor("white").fontSize(9).font("Helvetica");
  doc.text(`Business Report · ${user?.businessName || "Trackeet"}`, M, 40);
  doc.fillColor("white").fontSize(13).font("Helvetica-Bold");
  doc.text(periodLabel, M, 15, { align: "right", width: PW - M * 2 });
  doc.fillColor("white").fontSize(8).font("Helvetica");
  doc.text(`Generated: ${dayjs().format("D MMM YYYY h:mm A")}`, M, 33, {
    align: "right",
    width: PW - M * 2,
  });
  doc.text(user?.name || "", M, 43, { align: "right", width: PW - M * 2 });

  let y = 80;
  const stats = [
    {
      label: "Total Invoices",
      count: invoices.length,
      amount: fmtN(sum(invoices)),
      color: "#7C3AED",
    },
    {
      label: "Paid",
      count: paid.length,
      amount: fmtN(sum(paid)),
      color: "#10B981",
    },
    {
      label: "Pending",
      count: pending.length,
      amount: fmtN(sum(pending)),
      color: "#F59E0B",
    },
    {
      label: "Overdue",
      count: overdue.length,
      amount: fmtN(sum(overdue)),
      color: "#EF4444",
    },
  ];

  const cardW = (PW - M * 2 - 18) / 4;
  stats.forEach((s, i) => {
    const x = M + i * (cardW + 6);
    doc.rect(x, y, cardW, 52).fill("#F8FAFC");
    doc.rect(x, y, 3, 52).fill(s.color);
    doc.fillColor(s.color).fontSize(20).font("Helvetica-Bold");
    doc.text(String(s.count), x + 10, y + 7, {
      width: cardW - 15,
      lineBreak: false,
    });
    doc.fillColor("#64748B").fontSize(7).font("Helvetica");
    doc.text(s.label, x + 10, y + 31, { width: cardW - 15, lineBreak: false });
    doc.fillColor("#0F172A").fontSize(8).font("Helvetica-Bold");
    doc.text(s.amount, x + 10, y + 40, { width: cardW - 15, lineBreak: false });
  });

  y += 62;
  doc.rect(M, y, PW - M * 2, 34).fill("#7C3AED");
  doc.fillColor("white").fontSize(8).font("Helvetica");
  doc.text("Total Revenue Collected", M + 12, y + 7, { lineBreak: false });
  doc.fillColor("white").fontSize(15).font("Helvetica-Bold");
  doc.text(fmtN(sum(paid)), M + 12, y + 17, { lineBreak: false });
  doc.fillColor("white").fontSize(8).font("Helvetica");
  doc.text(
    `Outstanding: ${fmtN(sum(pending) + sum(overdue) + sum(partial))}`,
    M,
    y + 7,
    { align: "right", width: PW - M * 2, lineBreak: false },
  );
  doc.text(`Partial: ${partial.length} invoices`, M, y + 19, {
    align: "right",
    width: PW - M * 2,
    lineBreak: false,
  });

  y += 44;
  doc.fillColor("#0F172A").fontSize(11).font("Helvetica-Bold");
  doc.text("Invoice Details", M, y);
  y += 14;

  const cols = {
    inv: M,
    cust: M + 85,
    date: M + 230,
    amount: M + 320,
    status: M + 415,
  };

  doc.rect(M, y, PW - M * 2, 20).fill("#7C3AED");
  doc.fillColor("white").fontSize(8).font("Helvetica-Bold");
  doc.text("INVOICE #", cols.inv + 5, y + 6, { lineBreak: false });
  doc.text("CUSTOMER", cols.cust + 5, y + 6, { lineBreak: false });
  doc.text("DATE", cols.date + 5, y + 6, { lineBreak: false });
  doc.text("AMOUNT", cols.amount + 5, y + 6, { lineBreak: false });
  doc.text("STATUS", cols.status + 5, y + 6, { lineBreak: false });
  y += 20;

  invoices.forEach((inv, idx) => {
    if (y > PH - 60) {
      doc.rect(0, PH - 28, PW, 28).fill("#0F172A");
      doc.fillColor("white").fontSize(7).font("Helvetica");
      doc.text(
        `Generated by ${user?.businessName || "Trackeet"}  •  trackeet.ng  •  Confidential Business Report`,
        0,
        PH - 16,
        { align: "center", width: PW, lineBreak: false },
      );
      doc.addPage({ margin: 0 });
      y = M;
    }

    const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
    doc.rect(M, y, PW - M * 2, 18).fill(rowBg);

    const statusColor =
      inv.status === "paid"
        ? "#10B981"
        : inv.status === "overdue"
          ? "#EF4444"
          : inv.status === "pending"
            ? "#F59E0B"
            : inv.status === "partial"
              ? "#3B82F6"
              : "#64748B";

    doc.fillColor("#0F172A").fontSize(8).font("Helvetica");
    doc.text(inv.invoiceNumber || "—", cols.inv + 5, y + 5, {
      width: 80,
      lineBreak: false,
    });
    doc.text((inv.customer?.name || "—").slice(0, 22), cols.cust + 5, y + 5, {
      width: 130,
      lineBreak: false,
    });
    doc.text(dayjs(inv.createdAt).format("D MMM YYYY"), cols.date + 5, y + 5, {
      width: 85,
      lineBreak: false,
    });
    doc.text(fmtN(inv.totalAmount), cols.amount + 5, y + 5, {
      width: 85,
      lineBreak: false,
    });
    doc.fillColor(statusColor).fontSize(7).font("Helvetica-Bold");
    doc.text((inv.status || "").toUpperCase(), cols.status + 5, y + 6, {
      width: 60,
      lineBreak: false,
    });

    doc
      .moveTo(M, y + 18)
      .lineTo(PW - M, y + 18)
      .strokeColor("#E2E8F0")
      .lineWidth(0.3)
      .stroke();
    y += 18;
  });

  if (invoices.length === 0) {
    doc.fillColor("#64748B").fontSize(10).font("Helvetica");
    doc.text("No invoices found for this period.", M, y + 15, {
      align: "center",
      width: PW - M * 2,
    });
    y += 40;
  }

  // Sales Section
  if (y > PH - 200) {
    doc.rect(0, PH - 28, PW, 28).fill("#0F172A");
    doc.fillColor("white").fontSize(7).font("Helvetica");
    doc.text(
      `Generated by ${user?.businessName || "Trackeet"}  •  trackeet.ng  •  Confidential Business Report`,
      0,
      PH - 16,
      { align: "center", width: PW, lineBreak: false },
    );
    doc.addPage({ margin: 0 });
    y = M;
  } else {
    y += 20;
  }

  // Sales header
  doc.fillColor("#0F172A").fontSize(11).font("Helvetica-Bold");
  doc.text("Sales Details", M, y);
  y += 10;

  // Sales stats cards
  const salesStats = [
    {
      label: "Total Sales",
      count: sales.length,
      amount: fmtN(sumSales(sales)),
      color: "#7C3AED",
    },
    {
      label: "Paid",
      count: paidSales.length,
      amount: fmtN(sumSales(paidSales)),
      color: "#10B981",
    },
    {
      label: "Pending",
      count: pendingSales.length,
      amount: fmtN(sumSales(pendingSales)),
      color: "#F59E0B",
    },
    {
      label: "Refunded",
      count: refundedSales.length,
      amount: fmtN(sumSales(refundedSales)),
      color: "#EF4444",
    },
  ];

  y += 4;
  salesStats.forEach((s, i) => {
    const x = M + i * (cardW + 6);
    doc.rect(x, y, cardW, 52).fill("#F8FAFC");
    doc.rect(x, y, 3, 52).fill(s.color);
    doc.fillColor(s.color).fontSize(20).font("Helvetica-Bold");
    doc.text(String(s.count), x + 10, y + 7, {
      width: cardW - 15,
      lineBreak: false,
    });
    doc.fillColor("#64748B").fontSize(7).font("Helvetica");
    doc.text(s.label, x + 10, y + 31, { width: cardW - 15, lineBreak: false });
    doc.fillColor("#0F172A").fontSize(8).font("Helvetica-Bold");
    doc.text(s.amount, x + 10, y + 40, { width: cardW - 15, lineBreak: false });
  });

  y += 62;

  // Sales revenue banner
  doc.rect(M, y, PW - M * 2, 34).fill("#10B981");
  doc.fillColor("white").fontSize(8).font("Helvetica");
  doc.text("Total Sales Revenue Collected", M + 12, y + 7, {
    lineBreak: false,
  });
  doc.fillColor("white").fontSize(15).font("Helvetica-Bold");
  doc.text(fmtN(totalSalesRevenue), M + 12, y + 17, { lineBreak: false });
  doc.fillColor("white").fontSize(8).font("Helvetica");
  doc.text(`Partial: ${partialSales.length} sales`, M, y + 7, {
    align: "right",
    width: PW - M * 2,
    lineBreak: false,
  });
  doc.text(`Refunded: ${refundedSales.length} sales`, M, y + 19, {
    align: "right",
    width: PW - M * 2,
    lineBreak: false,
  });

  y += 44;

  if (sales.length > 0) {
    // Sales table header
    doc.rect(M, y, PW - M * 2, 20).fill("#10B981");
    doc.fillColor("white").fontSize(8).font("Helvetica-Bold");
    doc.text("SALE #", cols.inv + 5, y + 6, { lineBreak: false });
    doc.text("CUSTOMER", cols.cust + 5, y + 6, { lineBreak: false });
    doc.text("DATE", cols.date + 5, y + 6, { lineBreak: false });
    doc.text("AMOUNT", cols.amount + 5, y + 6, { lineBreak: false });
    doc.text("STATUS", cols.status + 5, y + 6, { lineBreak: false });
    y += 20;

    sales.forEach((sale, idx) => {
      if (y > PH - 60) {
        doc.rect(0, PH - 28, PW, 28).fill("#0F172A");
        doc.fillColor("white").fontSize(7).font("Helvetica");
        doc.text(
          `Generated by ${user?.businessName || "Trackeet"}  •  trackeet.ng  •  Confidential Business Report`,
          0,
          PH - 16,
          { align: "center", width: PW, lineBreak: false },
        );
        doc.addPage({ margin: 0 });
        y = M;
      }

      const rowBg = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
      doc.rect(M, y, PW - M * 2, 18).fill(rowBg);

      const statusColor =
        sale.status === "paid"
          ? "#10B981"
          : sale.status === "refunded"
            ? "#EF4444"
            : sale.status === "partial"
              ? "#3B82F6"
              : "#F59E0B";

      doc.fillColor("#0F172A").fontSize(8).font("Helvetica");
      doc.text(sale.saleNumber || "—", cols.inv + 5, y + 5, {
        width: 80,
        lineBreak: false,
      });
      doc.text((sale.customerName || "—").slice(0, 22), cols.cust + 5, y + 5, {
        width: 130,
        lineBreak: false,
      });
      doc.text(
        dayjs(sale.createdAt).format("D MMM YYYY"),
        cols.date + 5,
        y + 5,
        { width: 85, lineBreak: false },
      );
      doc.text(fmtN(sale.totalAmount), cols.amount + 5, y + 5, {
        width: 85,
        lineBreak: false,
      });
      doc.fillColor(statusColor).fontSize(7).font("Helvetica-Bold");
      doc.text((sale.status || "").toUpperCase(), cols.status + 5, y + 6, {
        width: 60,
        lineBreak: false,
      });

      doc
        .moveTo(M, y + 18)
        .lineTo(PW - M, y + 18)
        .strokeColor("#E2E8F0")
        .lineWidth(0.3)
        .stroke();
      y += 18;
    });
  } else {
    doc.fillColor("#64748B").fontSize(10).font("Helvetica");
    doc.text("No sales found for this period.", M, y + 15, {
      align: "center",
      width: PW - M * 2,
    });
    y += 40;
  }

  doc.rect(0, PH - 28, PW, 28).fill("#0F172A");
  doc.fillColor("white").fontSize(7).font("Helvetica");
  doc.text(
    `Generated by ${user?.businessName || "Trackeet"}  •  trackeet.ng  •  Confidential Business Report`,
    0,
    PH - 16,
    { align: "center", width: PW, lineBreak: false },
  );

  doc.end();
});
