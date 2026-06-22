import User from "../models/User.js";
import Invoice from "../models/Invoice.js";
import Subscription from "../models/Subscription.js";
import Ticket from "../models/Ticket.js";
import AuditLog from "../models/AuditLog.js";
import Notification from "../models/Notification.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import dayjs from "dayjs";
import PlatformSettings from "../models/PlatformSettings.js";
import WhatsAppSettings from "../models/WhatsAppSettings.js";

export const getStats = asyncHandler(async (req, res) => {
  const [totalUsers, activeSubs, totalInvoices, openTickets] =
    await Promise.all([
      User.countDocuments({ role: "user" }),
      Subscription.countDocuments({ status: "active" }),
      Invoice.countDocuments(),
      Ticket.countDocuments({ status: { $ne: "resolved" } }),
    ]);

  const revenueAll = await Subscription.aggregate([
    { $match: { status: "active", paymentVerified: true } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const revenueMTD = await Subscription.aggregate([
    {
      $match: {
        status: "active",
        paymentVerified: true,
        startDate: { $gte: dayjs().startOf("month").toDate() },
      },
    },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  const recentUsers = await User.find({ role: "user" })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("firstName lastName email plan createdAt");

  const waConnected = await WhatsAppSettings.countDocuments({
    connected: true,
  });

  // Revenue calculations
  const allSubs = await Subscription.find({
    status: "active",
    paymentVerified: true,
  });

  const todayStart = dayjs().startOf("day").toDate();
  const weekStart = dayjs().subtract(7, "day").toDate();
  const monthStart = dayjs().startOf("month").toDate();

  const revenueToday = allSubs
    .filter((s) => new Date(s.createdAt) >= todayStart)
    .reduce((sum, s) => sum + s.amount, 0);

  const revenueWeek = allSubs
    .filter((s) => new Date(s.createdAt) >= weekStart)
    .reduce((sum, s) => sum + s.amount, 0);

  const revenueMTDCalc = allSubs
    .filter((s) => new Date(s.createdAt) >= monthStart)
    .reduce((sum, s) => sum + s.amount, 0);

  const revenueTotalCalc = allSubs.reduce((sum, s) => sum + s.amount, 0);

  res.json({
    success: true,
    stats: {
      totalUsers,
      activeSubs,
      totalInvoices,
      openTickets,
      mrr: revenueMTD[0]?.total || 0,
      revenueTotal: revenueTotalCalc,
      revenueMTD: revenueMTDCalc,
      revenueToday,
      revenueWeek,
      waConnected,
    },
    recentUsers,
  });
});

export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) throw new AppError("User not found", 404);

  const Invoice = (await import("../models/Invoice.js")).default;
  const Sale = (await import("../models/Sale.js")).default;
  const WhatsAppSettings = (await import("../models/WhatsAppSettings.js"))
    .default;
  const Customer = (await import("../models/Customer.js")).default;
  const Product = (await import("../models/Product.js")).default;

  const [invoices, sales, waSettings, customerCount, productCount] =
    await Promise.all([
      Invoice.find({ user: req.params.id })
        .sort({ createdAt: -1 })
        .limit(20)
        .select("invoiceNumber totalAmount amountPaid status createdAt"),
      Sale.find({ user: req.params.id })
        .sort({ createdAt: -1 })
        .limit(20)
        .select("saleNumber totalAmount amountPaid status createdAt"),
      WhatsAppSettings.findOne({ user: req.params.id }),
      Customer.countDocuments({ user: req.params.id }),
      Product.countDocuments({ user: req.params.id }),
    ]);

  // Total revenue from invoices + sales
  const allInvoices = await Invoice.find({ user: req.params.id });
  const allSales = await Sale.find({ user: req.params.id });

  const totalInvoiceRevenue = allInvoices
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + (i.amountPaid || 0), 0);

  const totalSalesRevenue = allSales
    .filter((s) => s.status === "paid")
    .reduce((s, sale) => s + (sale.amountPaid || 0), 0);

  const totalRevenue = totalInvoiceRevenue + totalSalesRevenue;

  res.json({
    success: true,
    user,
    invoices,
    sales,
    waConnected: waSettings?.connected || false,
    customerCount,
    productCount,
    totalRevenue,
    totalInvoiceRevenue,
    totalSalesRevenue,
  });
});

export const getUsers = asyncHandler(async (req, res) => {
  const { search, role, page = 1, limit = 20 } = req.query;
  const query = { role: { $nin: ["superadmin"] } };
  if (search)
    query.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  if (role) query.role = role;
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  const total = await User.countDocuments(query);
  res.json({ success: true, users, total });
});

export const updateUser = asyncHandler(async (req, res) => {
  const target = await User.findById(req.params.id);
  if (!target) throw new AppError("User not found", 404);
  if (target.role === "superadmin")
    throw new AppError("Cannot modify superadmin", 403);
  const allowed = ["status", "role", "plan"];
  const updates = {};
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });
  const user = await User.findByIdAndUpdate(req.params.id, updates, {
    new: true,
  });
  res.json({ success: true, user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError("User not found", 404);
  if (user.role === "superadmin")
    throw new AppError("Cannot delete superadmin", 403);
  await user.deleteOne();
  res.json({ success: true, message: "User deleted" });
});

export const getSubscriptions = asyncHandler(async (req, res) => {
  const users = await User.find({ role: { $nin: ["superadmin"] } })
    .sort({ createdAt: -1 })
    .select(
      "firstName lastName email plan status createdAt invoiceCount businessName businessCategory",
    );

  const subscriptions = await Subscription.find()
    .populate("user", "firstName lastName email plan")
    .sort({ createdAt: -1 });

  const active = subscriptions.filter((s) => s.status === "active").length;
  const churned = subscriptions.filter((s) => s.status === "cancelled").length;
  const mrr = subscriptions
    .filter((s) => s.status === "active" && !s.annual)
    .reduce((s, sub) => s + sub.amount, 0);

  res.json({ success: true, users, subscriptions, active, churned, mrr });
});

export const getTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find()
    .populate("user", "firstName lastName email")
    .sort({ updatedAt: -1 });
  res.json({ success: true, tickets });
});

export const replyTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new AppError("Ticket not found", 404);
  ticket.messages.push({ sender: "admin", message: req.body.message });
  ticket.status = "in_progress";
  await ticket.save();
  res.json({ success: true, ticket });
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const { type = "admin", page = 1, limit = 50, search, entity } = req.query;

  if (type === "activity") {
    const ActivityLog = (await import("../models/ActivityLog.js")).default;
    const query = {};
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
      ];
    }
    if (entity) query.entity = entity;

    const logs = await ActivityLog.find(query)
      .populate("user", "firstName lastName email")
      .populate("owner", "firstName lastName businessName")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await ActivityLog.countDocuments(query);
    return res.json({ success: true, logs, total });
  }

  // Admin audit logs
  const logs = await AuditLog.find()
    .populate("user", "firstName lastName email")
    .sort({ createdAt: -1 })
    .limit(100);
  res.json({ success: true, logs, total: logs.length });
});

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    user: req.user._id,
    read: false,
  });

  res.json({ success: true, notifications, unreadCount });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  if (req.params.id === "all") {
    await Notification.updateMany({ user: req.user._id }, { read: true });
  } else {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
  }
  res.json({ success: true });
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { user: req.user._id, read: false },
    { read: true },
  );
  res.json({ success: true });
});

export const deleteReadNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user._id, read: true });
  res.json({ success: true });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

export const resolveTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) throw new AppError("Ticket not found", 404);
  ticket.status = "resolved";
  await ticket.save();
  res.json({ success: true, ticket });
});

export const getPlatformSettings = asyncHandler(async (req, res) => {
  let settings = await PlatformSettings.findOne();
  if (!settings) settings = await PlatformSettings.create({});
  res.json({ success: true, settings });
});

export const updatePlatformSettings = asyncHandler(async (req, res) => {
  if (req.user.role !== "superadmin")
    throw new AppError("Only superadmin can update platform settings", 403);

  let settings = await PlatformSettings.findOne();
  if (!settings) settings = await PlatformSettings.create({});

  const allowed = [
    "maintenanceMode",
    "allowRegistrations",
    "emailNotifications",
    "freeInvoiceLimit",
    "freeCustomerLimit",
    "gateways",
    "supportEmail",
    "smtpHost",
    "smtpPort",
    "smtpUser",
  ];

  allowed.forEach((f) => {
    if (req.body[f] !== undefined) settings[f] = req.body[f];
  });

  await settings.save();
  res.json({ success: true, settings });
});

export const getBroadcasts = asyncHandler(async (req, res) => {
  const Broadcast = (await import("../models/Broadcast.js")).default;
  const broadcasts = await Broadcast.find()
    .populate("sentBy", "firstName lastName")
    .sort({ createdAt: -1 })
    .limit(20);
  res.json({ success: true, broadcasts });
});

export const sendBroadcast = asyncHandler(async (req, res) => {
  const { title, message, type, targetPlan } = req.body;
  if (!title?.trim()) throw new AppError("Title is required", 400);
  if (!message?.trim()) throw new AppError("Message is required", 400);

  const Broadcast = (await import("../models/Broadcast.js")).default;

  // Get target users
  const query = { role: "user" };
  if (targetPlan && targetPlan !== "all") query.plan = targetPlan;

  const users = await User.find(query).select(
    "_id firstName lastName email plan",
  );

  const broadcast = await Broadcast.create({
    title,
    message,
    type: type || "notification",
    targetPlan: targetPlan || "all",
    sentBy: req.user._id,
    recipientCount: users.length,
    status: "sending",
  });

  let successCount = 0;
  let failCount = 0;

  if (type === "email") {
    // Send emails
    const { sendEmail } = await import("../services/emailService.js");
    for (const user of users) {
      try {
        await sendEmail({
          to: user.email,
          subject: title,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
              <div style="background:linear-gradient(135deg,#7C3AED,#6366F1);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
                <h1 style="color:#fff;margin:0;font-size:24px;">TRACKEET</h1>
              </div>
              <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <h2 style="color:#0f172a;margin:0 0 16px;">${title}</h2>
                <p style="color:#64748b;line-height:1.7;white-space:pre-wrap;">${message}</p>
              </div>
              <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px;">
                © 2026 Trackeet · trackeet.ng
              </p>
            </div>
          `,
        });
        successCount++;
      } catch {
        failCount++;
      }
    }
  } else {
    // Send in-app notifications
    for (const user of users) {
      try {
        const notif = await Notification.create({
          user: user._id,
          type: "system",
          title,
          message,
          link: "/dashboard",
        });
        // Emit socket if online
        try {
          const { emitToUser } = await import("../config/socket.js");
          emitToUser(user._id.toString(), "notification", notif);
        } catch {}
        successCount++;
      } catch {
        failCount++;
      }
    }
  }

  await Broadcast.findByIdAndUpdate(broadcast._id, {
    status: "sent",
    successCount,
    failCount,
    sentAt: new Date(),
  });

  res.json({
    success: true,
    message: `Broadcast sent to ${successCount} users`,
    successCount,
    failCount,
  });
});

export const deleteBroadcast = asyncHandler(async (req, res) => {
  const Broadcast = (await import("../models/Broadcast.js")).default;
  await Broadcast.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Broadcast deleted" });
});

export const getDashboardBanners = asyncHandler(async (req, res) => {
  const DashboardBanner = (await import("../models/DashboardBanner.js"))
    .default;
  const banners = await DashboardBanner.find()
    .populate("createdBy", "firstName lastName")
    .sort({ createdAt: -1 });
  res.json({ success: true, banners });
});

export const createDashboardBanner = asyncHandler(async (req, res) => {
  const DashboardBanner = (await import("../models/DashboardBanner.js"))
    .default;
  const {
    title,
    message,
    type,
    targetPlan,
    ctaLabel,
    ctaLink,
    dismissible,
    startDate,
    endDate,
  } = req.body;
  if (!title?.trim()) throw new AppError("Title is required", 400);
  if (!message?.trim()) throw new AppError("Message is required", 400);

  const banner = await DashboardBanner.create({
    title,
    message,
    type: type || "info",
    targetPlan: targetPlan || "all",
    ctaLabel: ctaLabel || null,
    ctaLink: ctaLink || null,
    dismissible: dismissible !== false,
    isActive: true,
    startDate: startDate || new Date(),
    endDate: endDate || null,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, banner });
});

export const updateDashboardBanner = asyncHandler(async (req, res) => {
  const DashboardBanner = (await import("../models/DashboardBanner.js"))
    .default;
  const banner = await DashboardBanner.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true },
  );
  if (!banner) throw new AppError("Banner not found", 404);
  res.json({ success: true, banner });
});

export const deleteDashboardBanner = asyncHandler(async (req, res) => {
  const DashboardBanner = (await import("../models/DashboardBanner.js"))
    .default;
  await DashboardBanner.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Banner deleted" });
});

export const getPayments = asyncHandler(async (req, res) => {
  const { status, plan, page = 1, limit = 20 } = req.query;

  const query = {};
  if (status) query.status = status;
  if (plan) query.plan = plan;

  const payments = await Subscription.find(query)
    .populate("user", "firstName lastName email phone businessName plan")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await Subscription.countDocuments(query);

  const allSubs = await Subscription.find();
  const totalRevenue = allSubs
    .filter((s) => s.paymentVerified)
    .reduce((sum, s) => sum + s.amount, 0);

  const thisMonth = allSubs
    .filter(
      (s) => dayjs(s.createdAt).isSame(dayjs(), "month") && s.paymentVerified,
    )
    .reduce((sum, s) => sum + s.amount, 0);

  const pendingVerification = await Subscription.countDocuments({
    paymentMethod: "bank_transfer",
    paymentVerified: false,
    status: "pending",
  });

  res.json({
    success: true,
    payments,
    total,
    totalRevenue,
    thisMonth,
    pendingVerification,
  });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const sub = await Subscription.findById(req.params.id).populate(
    "user",
    "firstName lastName email plan",
  );
  if (!sub) throw new AppError("Subscription not found", 404);

  const months = sub.annual ? 12 : 1;
  sub.status = "active";
  sub.paymentVerified = true;
  sub.startDate = new Date();
  sub.endDate = new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000);
  await sub.save();

  await User.findByIdAndUpdate(sub.user._id, { plan: sub.plan });

  // Notify user
  const notif = await Notification.create({
    user: sub.user._id,
    type: "subscription",
    title: "🎉 Payment Verified!",
    message: `Your ${sub.plan} plan is now active. Enjoy your upgraded features!`,
    link: "/dashboard/subscription",
  });

  try {
    const { emitToUser } = await import("../config/socket.js");
    emitToUser(sub.user._id.toString(), "notification", notif);
  } catch {}

  res.json({ success: true, subscription: sub });
});

export const rejectPayment = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const sub = await Subscription.findById(req.params.id).populate(
    "user",
    "firstName lastName email",
  );
  if (!sub) throw new AppError("Subscription not found", 404);

  sub.status = "cancelled";
  await sub.save();

  // Notify user
  const notif = await Notification.create({
    user: sub.user._id,
    type: "subscription",
    title: "❌ Payment Not Verified",
    message: `Your ${sub.plan} plan payment could not be verified. ${reason ? `Reason: ${reason}` : "Please contact support."}`,
    link: "/dashboard/subscription",
  });

  try {
    const { emitToUser } = await import("../config/socket.js");
    emitToUser(sub.user._id.toString(), "notification", notif);
  } catch {}

  res.json({ success: true, subscription: sub });
});

export const clearAuditLogs = asyncHandler(async (req, res) => {
  const AuditLog = (await import("../models/AuditLog.js")).default;
  const ActivityLog = (await import("../models/ActivityLog.js")).default;
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const auditResult = await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });
  const activityResult = await ActivityLog.deleteMany({
    createdAt: { $lt: cutoff },
  });
  const deleted = auditResult.deletedCount + activityResult.deletedCount;
  res.json({
    success: true,
    deleted,
    message: `Deleted ${deleted} logs older than 90 days`,
  });
});

export const resetWhatsAppSessions = asyncHandler(async (req, res) => {
  const WhatsAppSettings = (await import("../models/WhatsAppSettings.js"))
    .default;
  await WhatsAppSettings.updateMany({}, { connected: false });
  res.json({
    success: true,
    message: "All WhatsApp sessions reset successfully",
  });
});

export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const allSubs = await Subscription.find({ paymentVerified: true });
  const allUsers = await User.find({ role: "user" });

  // MRR — last 12 months
  const mrrHistory = [];
  for (let i = 11; i >= 0; i--) {
    const m = dayjs().subtract(i, "month");
    const mStart = m.startOf("month").toDate();
    const mEnd = m.endOf("month").toDate();
    const mSubs = allSubs.filter(
      (s) => new Date(s.createdAt) >= mStart && new Date(s.createdAt) <= mEnd,
    );
    mrrHistory.push({
      month: m.format("MMM YY"),
      revenue: mSubs.reduce((sum, s) => sum + s.amount, 0),
      count: mSubs.length,
    });
  }

  // Plan breakdown
  const planBreakdown = {
    free: allUsers.filter((u) => u.plan === "free" || !u.plan).length,
    starter: allUsers.filter((u) => u.plan === "starter").length,
    business: allUsers.filter((u) => u.plan === "business").length,
    enterprise: allUsers.filter((u) => u.plan === "enterprise").length,
  };

  // Monthly user growth — last 12 months
  const userGrowth = [];
  for (let i = 11; i >= 0; i--) {
    const m = dayjs().subtract(i, "month");
    const mStart = m.startOf("month").toDate();
    const mEnd = m.endOf("month").toDate();
    const newUsers = allUsers.filter(
      (u) => new Date(u.createdAt) >= mStart && new Date(u.createdAt) <= mEnd,
    ).length;
    userGrowth.push({
      month: m.format("MMM YY"),
      users: newUsers,
    });
  }

  // Revenue by plan
  const revenueByPlan = {
    starter: allSubs
      .filter((s) => s.plan === "starter")
      .reduce((sum, s) => sum + s.amount, 0),
    business: allSubs
      .filter((s) => s.plan === "business")
      .reduce((sum, s) => sum + s.amount, 0),
    enterprise: allSubs
      .filter((s) => s.plan === "enterprise")
      .reduce((sum, s) => sum + s.amount, 0),
  };

  // Growth rate — this month vs last month
  const thisMonthRev = mrrHistory[11]?.revenue || 0;
  const lastMonthRev = mrrHistory[10]?.revenue || 0;
  const growthRate =
    lastMonthRev > 0
      ? Math.round(((thisMonthRev - lastMonthRev) / lastMonthRev) * 100)
      : 0;

  // Conversion rate — paid vs total users
  const paidUsers = allUsers.filter((u) => u.plan && u.plan !== "free").length;
  const conversionRate =
    allUsers.length > 0 ? Math.round((paidUsers / allUsers.length) * 100) : 0;

  // ARPU — Average Revenue Per User
  const totalRevenue = allSubs.reduce((sum, s) => sum + s.amount, 0);
  const arpu = paidUsers > 0 ? Math.round(totalRevenue / paidUsers) : 0;

  res.json({
    success: true,
    mrrHistory,
    planBreakdown,
    userGrowth,
    revenueByPlan,
    growthRate,
    conversionRate,
    arpu,
    totalRevenue,
    paidUsers,
  });
});

export const getPromoCodes = asyncHandler(async (req, res) => {
  const PromoCode = (await import("../models/PromoCode.js")).default;
  const codes = await PromoCode.find()
    .populate("createdBy", "firstName lastName")
    .sort({ createdAt: -1 });
  res.json({ success: true, codes });
});

export const createPromoCode = asyncHandler(async (req, res) => {
  const PromoCode = (await import("../models/PromoCode.js")).default;
  const {
    code,
    description,
    discountType,
    discountValue,
    maxUses,
    minAmount,
    applicablePlans,
    expiresAt,
  } = req.body;

  if (!code?.trim()) throw new AppError("Code is required", 400);
  if (!discountValue || discountValue <= 0)
    throw new AppError("Valid discount value is required", 400);
  if (discountType === "percent" && discountValue > 100)
    throw new AppError("Percent discount cannot exceed 100%", 400);

  const existing = await PromoCode.findOne({ code: code.toUpperCase() });
  if (existing) throw new AppError("Promo code already exists", 400);

  const promo = await PromoCode.create({
    code: code.toUpperCase().trim(),
    description,
    discountType: discountType || "percent",
    discountValue,
    maxUses: maxUses || null,
    minAmount: minAmount || 0,
    applicablePlans: applicablePlans || ["all"],
    expiresAt: expiresAt || null,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, promo });
});

export const updatePromoCode = asyncHandler(async (req, res) => {
  const PromoCode = (await import("../models/PromoCode.js")).default;
  const promo = await PromoCode.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true },
  );
  if (!promo) throw new AppError("Promo code not found", 404);
  res.json({ success: true, promo });
});

export const deletePromoCode = asyncHandler(async (req, res) => {
  const PromoCode = (await import("../models/PromoCode.js")).default;
  await PromoCode.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Promo code deleted" });
});

export const validatePromoCode = asyncHandler(async (req, res) => {
  const PromoCode = (await import("../models/PromoCode.js")).default;
  const { code, plan, amount } = req.body;

  const promo = await PromoCode.findOne({ code: code?.toUpperCase() });
  if (!promo) throw new AppError("Invalid promo code", 404);
  if (!promo.isActive)
    throw new AppError("This promo code is no longer active", 400);
  if (promo.expiresAt && new Date(promo.expiresAt) < new Date())
    throw new AppError("This promo code has expired", 400);
  if (promo.maxUses && promo.usedCount >= promo.maxUses)
    throw new AppError("This promo code has reached its usage limit", 400);
  if (promo.usedBy.includes(req.user._id))
    throw new AppError("You have already used this promo code", 400);
  if (promo.minAmount && amount < promo.minAmount)
    throw new AppError(
      `Minimum amount for this code is ₦${promo.minAmount.toLocaleString()}`,
      400,
    );
  if (
    !promo.applicablePlans.includes("all") &&
    plan &&
    !promo.applicablePlans.includes(plan)
  )
    throw new AppError(`This code is not valid for the ${plan} plan`, 400);

  const discountAmount =
    promo.discountType === "percent"
      ? Math.round((amount * promo.discountValue) / 100)
      : Math.min(promo.discountValue, amount);

  const finalAmount = Math.max(0, amount - discountAmount);

  res.json({
    success: true,
    promo: {
      _id: promo._id,
      code: promo.code,
      description: promo.description,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
      finalAmount,
    },
  });
});

export const exportUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" })
    .select(
      "firstName lastName email phone businessName businessCategory plan status invoiceCount createdAt storeName storeActive",
    )
    .sort({ createdAt: -1 });

  const headers = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Business Name",
    "Category",
    "Plan",
    "Status",
    "Invoice Count",
    "Store Name",
    "Store Active",
    "Joined Date",
  ];

  const rows = users.map((u) => [
    u.firstName || "",
    u.lastName || "",
    u.email || "",
    u.phone || "",
    u.businessName || "",
    u.businessCategory || "",
    u.plan || "free",
    u.status || "active",
    u.invoiceCount || 0,
    u.storeName || "",
    u.storeActive ? "Yes" : "No",
    dayjs(u.createdAt).format("D MMM YYYY"),
  ]);

  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="trackeet-users-${dayjs().format("YYYY-MM-DD")}.csv"`,
  );
  res.send(csv);
});

export const getSystemHealth = asyncHandler(async (req, res) => {
  const checks = {};

  // Server uptime
  const uptimeSeconds = process.uptime();
  const days = Math.floor(uptimeSeconds / 86400);
  const hours = Math.floor((uptimeSeconds % 86400) / 3600);
  const minutes = Math.floor((uptimeSeconds % 3600) / 60);
  checks.server = {
    status: "ok",
    uptime: `${days}d ${hours}h ${minutes}m`,
    uptimeSeconds,
    nodeVersion: process.version,
    platform: process.platform,
    memoryUsage: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    memoryTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
  };

  // MongoDB
  try {
    const start = Date.now();
    await User.findOne().select("_id").lean();
    const responseTime = Date.now() - start;
    checks.mongodb = {
      status: "ok",
      responseTime: `${responseTime}ms`,
      message: "Connected and responding",
    };
  } catch (err) {
    checks.mongodb = {
      status: "error",
      message: err.message,
    };
  }

  // WhatsApp sessions
  try {
    const WhatsAppSettings = (await import("../models/WhatsAppSettings.js"))
      .default;
    const total = await WhatsAppSettings.countDocuments();
    const connected = await WhatsAppSettings.countDocuments({
      connected: true,
    });
    checks.whatsapp = {
      status: connected > 0 ? "ok" : "warning",
      connected,
      total,
      message: `${connected} of ${total} users connected`,
    };
  } catch {
    checks.whatsapp = { status: "error", message: "Failed to check" };
  }

  // Email/SMTP — check .env directly
  checks.email = {
    status: process.env.SMTP_HOST && process.env.SMTP_USER ? "ok" : "warning",
    message: process.env.SMTP_HOST
      ? `Configured — ${process.env.SMTP_HOST}:${process.env.SMTP_PORT || 587}`
      : "SMTP not configured in .env",
  };

  // Cloudinary
  checks.cloudinary = {
    status: process.env.CLOUDINARY_CLOUD_NAME ? "ok" : "warning",
    message: process.env.CLOUDINARY_CLOUD_NAME
      ? `Connected — ${process.env.CLOUDINARY_CLOUD_NAME}`
      : "Cloudinary not configured",
  };

  // Paystack
  checks.paystack = {
    status: process.env.PAYSTACK_SECRET_KEY ? "ok" : "warning",
    message: process.env.PAYSTACK_SECRET_KEY
      ? "API key configured"
      : "Paystack key not configured",
  };

  // Overall status
  const hasError = Object.values(checks).some((c) => c.status === "error");
  const hasWarning = Object.values(checks).some((c) => c.status === "warning");
  const overall = hasError ? "error" : hasWarning ? "warning" : "ok";

  res.json({ success: true, checks, overall, timestamp: new Date() });
});

export const getChangelogs = asyncHandler(async (req, res) => {
  const Changelog = (await import("../models/Changelog.js")).default;
  const changelogs = await Changelog.find()
    .populate("createdBy", "firstName lastName")
    .sort({ createdAt: -1 });
  res.json({ success: true, changelogs });
});

export const createChangelog = asyncHandler(async (req, res) => {
  const Changelog = (await import("../models/Changelog.js")).default;
  const { version, title, description, type, items, isPublished } = req.body;
  if (!version?.trim()) throw new AppError("Version is required", 400);
  if (!title?.trim()) throw new AppError("Title is required", 400);

  const changelog = await Changelog.create({
    version: version.trim(),
    title: title.trim(),
    description,
    type: type || "feature",
    items: items || [],
    isPublished: isPublished || false,
    publishedAt: isPublished ? new Date() : null,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, changelog });
});

export const updateChangelog = asyncHandler(async (req, res) => {
  const Changelog = (await import("../models/Changelog.js")).default;
  const changelog = await Changelog.findById(req.params.id);
  if (!changelog) throw new AppError("Changelog not found", 404);

  const { isPublished } = req.body;
  if (isPublished && !changelog.isPublished) {
    req.body.publishedAt = new Date();
  }

  const updated = await Changelog.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true },
  );
  res.json({ success: true, changelog: updated });
});

export const deleteChangelog = asyncHandler(async (req, res) => {
  const Changelog = (await import("../models/Changelog.js")).default;
  await Changelog.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Changelog deleted" });
});

export const getPublicChangelogs = asyncHandler(async (req, res) => {
  const Changelog = (await import("../models/Changelog.js")).default;
  const changelogs = await Changelog.find({ isPublished: true })
    .sort({ publishedAt: -1 })
    .limit(50);
  res.json({ success: true, changelogs });
});
