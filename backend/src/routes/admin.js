import express from "express";
import {
  getStats,
  getUser,
  getUsers,
  updateUser,
  deleteUser,
  getSubscriptions,
  getTickets,
  replyTicket,
  resolveTicket,
  getAuditLogs,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteReadNotifications,
  deleteNotification,
  getPlatformSettings,
  updatePlatformSettings,
  getBroadcasts,
  sendBroadcast,
  deleteBroadcast,
  getDashboardBanners,
  createDashboardBanner,
  updateDashboardBanner,
  deleteDashboardBanner,
  getPayments,
  verifyPayment,
  rejectPayment,
  clearAuditLogs,
  resetWhatsAppSessions,
  getRevenueAnalytics,
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode,
  exportUsers,
  getSystemHealth,
  getChangelogs,
  createChangelog,
  updateChangelog,
  deleteChangelog,
  getPublicChangelogs,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";
const r = express.Router();
r.get("/dashboard-banners/active", protect, async (req, res) => {
  try {
    const DashboardBanner = (await import("../models/DashboardBanner.js"))
      .default;
    const now = new Date();
    const plan = req.user?.plan || "free";

    const banners = await DashboardBanner.find({
      isActive: true,
      startDate: { $lte: now },
      $and: [
        { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
        { $or: [{ targetPlan: "all" }, { targetPlan: plan }] },
      ],
    }).sort({ createdAt: -1 });

    res.json({ success: true, banners });
  } catch (err) {
    res.json({ success: true, banners: [] });
  }
});

r.get("/platform-settings/public", async (req, res) => {
  try {
    const PlatformSettings = (await import("../models/PlatformSettings.js"))
      .default;
    const settings = await PlatformSettings.findOne();
    res.json({
      maintenance: settings?.maintenanceMode || false,
      allowRegistrations: settings?.allowRegistrations ?? true,
    });
  } catch {
    res.json({ maintenance: false, allowRegistrations: true });
  }
});

r.post("/promo-codes/validate", validatePromoCode);
r.get('/changelog/public', getPublicChangelogs)

r.use(protect, authorize("admin", "superadmin"));
r.get("/platform-settings", getPlatformSettings);
r.put("/platform-settings", authorize("superadmin"), updatePlatformSettings);
r.get("/stats", getStats);
r.get("/users/export", authorize("superadmin"), exportUsers);
r.get("/users/:id", getUser);
r.get("/users", getUsers);
r.put("/users/:id", updateUser);
r.delete("/users/:id", authorize("superadmin"), deleteUser);
r.get("/subscriptions", getSubscriptions);
r.get("/tickets", getTickets);
r.put("/tickets/:id/resolve", resolveTicket);
r.post("/tickets/:id/reply", replyTicket);
r.get("/audit-logs", authorize("superadmin"), getAuditLogs);
r.get("/notifications", getNotifications);
r.put("/notifications/:id/read", markNotificationRead);
r.patch("/notifications/:id/read", markNotificationRead);
r.patch("/notifications/read-all", markAllNotificationsRead);
r.delete("/notifications/read", deleteReadNotifications);
r.delete("/notifications/:id", deleteNotification);
r.get("/broadcasts", getBroadcasts);
r.post("/broadcasts", authorize("superadmin"), sendBroadcast);
r.delete("/broadcasts/:id", authorize("superadmin"), deleteBroadcast);
r.get("/dashboard-banners", getDashboardBanners);
r.post("/dashboard-banners", authorize("superadmin"), createDashboardBanner);
r.put("/dashboard-banners/:id", authorize("superadmin"), updateDashboardBanner);
r.delete(
  "/dashboard-banners/:id",
  authorize("superadmin"),
  deleteDashboardBanner,
);
r.get("/payments", getPayments);
r.put("/payments/:id/verify", authorize("superadmin"), verifyPayment);
r.put("/payments/:id/reject", authorize("superadmin"), rejectPayment);
r.delete("/danger/audit-logs", authorize("superadmin"), clearAuditLogs);
r.post(
  "/danger/reset-whatsapp",
  authorize("superadmin"),
  resetWhatsAppSessions,
);
r.get("/revenue-analytics", getRevenueAnalytics);
r.get("/promo-codes", getPromoCodes);
r.post("/promo-codes", authorize("superadmin"), createPromoCode);
r.put("/promo-codes/:id", authorize("superadmin"), updatePromoCode);
r.delete("/promo-codes/:id", authorize("superadmin"), deletePromoCode);
r.get("/system-health", getSystemHealth);
r.get('/changelog', getChangelogs)
r.post('/changelog', authorize('superadmin'), createChangelog)
r.put('/changelog/:id', authorize('superadmin'), updateChangelog)
r.delete('/changelog/:id', authorize('superadmin'), deleteChangelog)

export default r;
