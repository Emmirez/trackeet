import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthRoute = err.config?.url?.includes("/auth/");
    if (err.response?.status === 401 && !isAuthRoute) {
      localStorage.removeItem("trackeet-auth");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;

export const authAPI = {
  login: (d) => api.post("/auth/login", d),
  register: (d) => api.post("/auth/register", d),
  me: () => api.get("/auth/me"),
  forgotPassword: (d) => api.post("/auth/forgot-password", d),
  resetPassword: (d) => api.post("/auth/reset-password", d),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  resendVerification: (email) =>
    api.post("/auth/resend-verification", { email }),
  setup2FA: () => api.post("/auth/2fa/setup"),
  verify2FA: (d) => api.post("/auth/2fa/verify", d),
  disable2FA: (d) => api.post("/auth/2fa/disable", d),
  validate2FA: (d) => api.post("/auth/2fa/validate", d),
};

export const invoiceAPI = {
  getAll: (p) => api.get("/invoices", { params: p }),
  getOne: (id) => api.get(`/invoices/${id}`),
  create: (d) => api.post("/invoices", d),
  update: (id, d) => api.put(`/invoices/${id}`, d),
  delete: (id) => api.delete(`/invoices/${id}`),
  markPaid: (id, d) => api.patch(`/invoices/${id}/mark-paid`, d),
  sendWhatsApp: (id) => api.post(`/invoices/${id}/whatsapp`),
  getPDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: "blob" }),

  uploadPhotos: (id, d) =>
    api.post(`/invoices/${id}/photos`, d, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000, // 60 seconds for photo uploads
    }),
  updateDelivery: (id, d) =>
    api.put(`/invoices/${id}/delivery`, d, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 60000,
    }),
  getDeliveries: (p) => api.get("/invoices/deliveries", { params: p }),
};

export const paymentAPI = {
  getAll: (p) => api.get("/payments", { params: p }),
  record: (d) => api.post("/payments", d),
  delete: (id) => api.delete(`/payments/${id}`),
};

export const saleAPI = {
  getAll: (p) => api.get("/sales", { params: p }),
  getOne: (id) => api.get(`/sales/${id}`),
  create: (d) => api.post("/sales", d),
  update: (id, d) => api.put(`/sales/${id}`, d),
  delete: (id) => api.delete(`/sales/${id}`),
  sendWhatsApp: (id, d) => api.post(`/sales/${id}/whatsapp`, d),
};

export const customerAPI = {
  getAll: (p) => api.get("/customers", { params: p }),
  getOne: (id) => api.get(`/customers/${id}`),
  create: (d) => api.post("/customers", d),
  update: (id, d) => api.put(`/customers/${id}`, d),
  delete: (id) => api.delete(`/customers/${id}`),
  import: (d) => api.post("/customers/import", d),
};

export const whatsappAPI = {
  getStatus: () => api.get("/whatsapp/status"),
  getQR: () => api.get("/whatsapp/qr"),
  disconnect: () => api.post("/whatsapp/disconnect"),
  getSettings: () => api.get("/whatsapp/settings"),
  updateSettings: (d) => api.put("/whatsapp/settings", d),
  getCampaigns: () => api.get("/whatsapp/campaigns"),
  createCampaign: (d) => api.post("/whatsapp/campaigns", d),
  deleteCampaign: (id) => api.delete(`/whatsapp/campaigns/${id}`),
  getLogs: () => api.get("/whatsapp/logs"),
  uploadCampaignImage: (d) =>
    api.post("/whatsapp/campaign-image", d, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  releaseChat: (data) => api.post("/whatsapp/release", data),
};

export const productAPI = {
  getAll: (p) => api.get("/products", { params: p }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (d) => api.post("/products", d),
  update: (id, d) => api.put(`/products/${id}`, d),
  delete: (id) => api.delete(`/products/${id}`),
  uploadImages: (id, d) =>
    api.post(`/products/${id}/images`, d, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  removeImage: (id, d) => api.delete(`/products/${id}/images`, { data: d }),
  toggle: (id) => api.patch(`/products/${id}/toggle`),
  getStorefront: (storeName) => api.get(`/products/store/${storeName}`),
  getStoreProduct: (storeName, productId) =>
    api.get(`/products/store/${storeName}/${productId}`),
  trackOrder: (productId) => api.post(`/products/store/track/${productId}`),
  trackView: (productId) => api.post(`/products/store/view/${productId}`),
};

export const reviewAPI = {
  submit: (storeName, productId, data) =>
    api.post(`/reviews/store/${storeName}/${productId}`, data),
  getForProduct: (storeName, productId) =>
    api.get(`/reviews/store/${storeName}/${productId}`),
  getMyReviews: (params) => api.get("/reviews", { params }),
  approve: (id) => api.patch(`/reviews/${id}/approve`),
  delete: (id) => api.delete(`/reviews/${id}`),
  reply: (id, data) => api.patch(`/reviews/${id}/reply`, data),
};

export const reportAPI = {
  getSummary: (p) => api.get("/reports/summary", { params: p }),
  getRevenue: (p) => api.get("/reports/revenue", { params: p }),
  export: (p) =>
    api.get("/reports/export", { params: p, responseType: "blob" }),
  getInsights: () => api.get("/reports/insights"),
};

export const expenseAPI = {
  getAll: (p) => api.get("/expenses", { params: p }),
  getSummary: (p) => api.get("/expenses/summary", { params: p }),
  create: (d) => api.post("/expenses", d),
  update: (id, d) => api.put(`/expenses/${id}`, d),
  delete: (id) => api.delete(`/expenses/${id}`),
};

export const profileAPI = {
  get: () => api.get("/profile"),
  update: (d) => api.put("/profile", d),
  uploadLogo: (f) =>
    api.post("/profile/logo", f, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  changePassword: (d) => api.put("/profile/password", d),
  deleteAccount: (d) => api.delete("/profile/delete-account", { data: d }),
  updateNotifications: (d) => api.put("/profile/notifications", d),
  uploadBanner: (d) =>
    api.post("/profile/upload-banner", d, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const recurringAPI = {
  getAll: () => api.get("/recurring"),
  create: (d) => api.post("/recurring", d),
  update: (id, d) => api.put(`/recurring/${id}`, d),
  delete: (id) => api.delete(`/recurring/${id}`),
};

export const bannerAPI = {
  getMyBanners: () => api.get("/banners"),
  create: (data) => api.post("/banners", data),
  update: (id, data) => api.patch(`/banners/${id}`, data),
  delete: (id) => api.delete(`/banners/${id}`),
  getStoreBanners: (storeName) => api.get(`/banners/store/${storeName}`),
};

export const subscriptionAPI = {
  getPlans: () => api.get("/subscriptions/plans"),
  getCurrent: () => api.get("/subscriptions/current"),
  initiate: (d) => api.post("/subscriptions/initiate", d),
  verify: (d) => api.post("/subscriptions/verify", d),
};

export const notificationAPI = {
  getAll: () => api.get("/notifications"),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch("/notifications/read-all"),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAllRead: () => api.delete("/notifications/read"),
};

export const teamAPI = {
  getTeam: () => api.get("/team"),
  inviteMember: (d) => api.post("/team/invite", d),
  acceptInvite: (d) => api.post("/team/accept", d),
  updateMember: (id, d) => api.put(`/team/${id}`, d),
  removeMember: (id) => api.delete(`/team/${id}`),
  getContext: () => api.get("/team/context"),
};

export const activityAPI = {
  getLogs: (p) => api.get("/activity", { params: p }),
  clearLogs: () => api.delete("/activity"),
};

export const apiKeyAPI = {
  getKeys: () => api.get("/keys"),
  generate: (d) => api.post("/keys", d),
  revoke: (id) => api.put(`/keys/${id}/revoke`),
  delete: (id) => api.delete(`/keys/${id}`),
};

export const webhookAPI = {
  getWebhooks: () => api.get("/webhooks"),
  createWebhook: (d) => api.post("/webhooks", d),
  updateWebhook: (id, d) => api.put(`/webhooks/${id}`, d),
  deleteWebhook: (id) => api.delete(`/webhooks/${id}`),
  testWebhook: (id) => api.post(`/webhooks/${id}/test`),
};

export const adminAPI = {
  getStats: () => api.get("/admin/stats"),
  getUsers: (p) => api.get("/admin/users", { params: p }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, d) => api.put(`/admin/users/${id}`, d),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getSubs: (p) => api.get("/admin/subscriptions", { params: p }),
  getTickets: () => api.get("/admin/tickets"),
  replyTicket: (id, d) => api.post(`/admin/tickets/${id}/reply`, d),
  getLogs: (p) => api.get("/admin/audit-logs", { params: p }),
  resolveTicket: (id) => api.put(`/admin/tickets/${id}/resolve`),
  getPlatformSettings: () => api.get("/admin/platform-settings"),
  updatePlatformSettings: (d) => api.put("/admin/platform-settings", d),
  getBroadcasts: () => api.get("/admin/broadcasts"),
  sendBroadcast: (d) => api.post("/admin/broadcasts", d),
  deleteBroadcast: (id) => api.delete(`/admin/broadcasts/${id}`),
  getDashboardBanners: () => api.get("/admin/dashboard-banners"),
  createDashboardBanner: (d) => api.post("/admin/dashboard-banners", d),
  updateDashboardBanner: (id, d) =>
    api.put(`/admin/dashboard-banners/${id}`, d),
  deleteDashboardBanner: (id) => api.delete(`/admin/dashboard-banners/${id}`),
  getPayments: (p) => api.get("/admin/payments", { params: p }),
  verifyPayment: (id) => api.put(`/admin/payments/${id}/verify`),
  rejectPayment: (id, d) => api.put(`/admin/payments/${id}/reject`, d),
  clearAuditLogs: () => api.delete("/admin/danger/audit-logs"),
  resetWhatsAppSessions: () => api.post("/admin/danger/reset-whatsapp"),
  getRevenueAnalytics: () => api.get("/admin/revenue-analytics"),
  getPromoCodes: () => api.get("/admin/promo-codes"),
  createPromoCode: (d) => api.post("/admin/promo-codes", d),
  updatePromoCode: (id, d) => api.put(`/admin/promo-codes/${id}`, d),
  deletePromoCode: (id) => api.delete(`/admin/promo-codes/${id}`),
  exportUsers: () => api.get("/admin/users/export", { responseType: "blob" }),
  getSystemHealth: () => api.get("/admin/system-health"),
  getChangelogs: () => api.get("/admin/changelog"),
  createChangelog: (d) => api.post("/admin/changelog", d),
  updateChangelog: (id, d) => api.put(`/admin/changelog/${id}`, d),
  deleteChangelog: (id) => api.delete(`/admin/changelog/${id}`),
};

export const dashboardBannerAPI = {
  getActive: () => api.get("/admin/dashboard-banners/active"),
};

// general API for users
export const promoAPI = {
  validate: (d) => api.post("/admin/promo-codes/validate", d),
};

export const feedbackAPI = {
  submit: (d) => api.post("/feedback", d),
  getMy: () => api.get("/feedback/my"),
  getAll: (p) => api.get("/feedback/admin", { params: p }),
  reply: (id, d) => api.post(`/feedback/${id}/reply`, d),
  delete: (id) => api.delete(`/feedback/${id}`),
};

export const publicFeedbackAPI = {
  getPublic: () => api.get("/feedback/public"),
};

// public API
export const changelogAPI = {
  getPublic: () => api.get("/admin/changelog/public"),
};

export const trackingAPI = {
  track: (invoiceNumber) => api.get(`/track/${invoiceNumber}`),
};

export const subscriberAPI = {
  subscribe: (storeName, d) =>
    api.post(`/subscribers/subscribe/${storeName}`, d),
  getAll: () => api.get("/subscribers"),
  sendNewsletter: (d) => api.post("/subscribers/newsletter", d),
  delete: (id) => api.delete(`/subscribers/${id}`),
};

export const referralAPI = {
  getStats: () => api.get("/referral"),
};
