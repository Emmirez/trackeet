import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useAuthStore from "./store/authStore.js";
import useThemeStore from "./store/themeStore.js";
import api from "./services/api.js";

import DashboardLayout from "./layouts/DashboardLayout.jsx";
import AdminLayout from "./layouts/AdminLayout.jsx";

import LandingPage from "./pages/landing/LandingPage.jsx";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.jsx";

import DashboardHome from "./pages/dashboard/DashboardHome.jsx";
import InvoicesPage from "./pages/invoices/InvoicesPage.jsx";
import CreateInvoicePage from "./pages/invoices/CreateInvoicePage.jsx";
import InvoiceDetailPage from "./pages/invoices/InvoiceDetailPage.jsx";
import PaymentsPage from "./pages/payments/PaymentsPage.jsx";
import CustomersPage from "./pages/customers/CustomersPage.jsx";
import CustomerDetailPage from "./pages/customers/CustomerDetailPage.jsx";
import WhatsAppPage from "./pages/whatsapp/WhatsAppPage.jsx";
import ReportsPage from "./pages/reports/ReportsPage.jsx";
import SettingsPage from "./pages/settings/SettingsPage.jsx";
import SubscriptionPage from "./pages/settings/SubscriptionPage.jsx";
import NotificationsPage from "./pages/notifications/NotificationsPage.jsx";
import TicketsPage from "./pages/tickets/TicketsPage.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions.jsx";
import AdminTickets from "./pages/admin/AdminTickets.jsx";
import AdminSettingsPage from "./pages/admin/AdminSettingsPage.jsx";
import AdminNotificationsPage from "./pages/admin/AdminNotificationsPage.jsx";
import AdminUserDetail from "./pages/admin/AdminUserDetailPage.jsx";

import FeaturesPage from "./pages/landing/FeaturesPage.jsx";
import PricingPage from "./pages/landing/PricingPage.jsx";
import HowItWorksPage from "./pages/landing/HowItWorksPage.jsx";
import FAQPage from "./pages/landing/FAQPage.jsx";

import AboutPage from "./pages/landing/AboutPage.jsx";
import ContactPage from "./pages/landing/Contact.jsx";
import HelpCenterPage from "./pages/landing/HelpCenterPage.jsx";
import PrivacyPolicyPage from "./pages/landing/PrivacyPolicyPage.jsx";
import TermsOfServicePage from "./pages/landing/TermsOfServicePage.jsx";
import CareersPage from "./pages/landing/CareersPage.jsx";

import BlogPage from "./pages/landing/BlogPage.jsx";
import ChangelogPage from "./pages/landing/ChangelogPage.jsx";
import RoadmapPage from "./pages/landing/RoadmapPage.jsx";

import TeamPage from "./pages/settings/TeamPage.jsx";
import AcceptInvitePage from "./pages/auth/AcceptInvitePage.jsx";
import ActivityPage from "./pages/activity/ActivityPage.jsx";

import ApiKeysPage from "./pages/settings/ApiKeysPage.jsx";
import WebhooksPage from "./pages/settings/WebhooksPage.jsx";
import SLAPage from "./pages/landing/SLAPage.jsx";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage.jsx";
import InvoiceTemplatesPage from "./pages/settings/InvoiceTemplatesPage.jsx";
import RecurringPage from "./pages/recurring/RecurringPage.jsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.jsx";

import ExpensesPage from "./pages/expenses/ExpensesPage.jsx";
import SalesPage from "./pages/sales/SalesPage.jsx";
import ProductsPage from "./pages/products/ProductsPage.jsx";
import StorefrontPage from "./pages/store/StorefrontPage.jsx";
import { initSocket } from "./services/socket.js";
import ReviewsPage from "./pages/reviews/ReviewsPage.jsx";
import ProductStorePage from "./pages/store/ProductStorePage.jsx";
import BannersPage from "./pages/banners/BannersPage.jsx";
import MaintenancePage from "./components/MaintenancePage.jsx";
import AdminBroadcastPage from "./pages/admin/AdminBroadcastPage.jsx";
import AdminBannersPage from "./pages/admin/AdminBannersPage.jsx";
import AdminAuditLogsPage from "./pages/admin/AdminAuditLogsPage.jsx";
import AdminPaymentsPage from "./pages/admin/AdminPaymentsPage.jsx";
import AdminRevenueAnalyticsPage from "./pages/admin/AdminRevenueAnalyticsPage.jsx";
import AdminPromoCodesPage from "./pages/admin/AdminPromoCodesPage.jsx";
import AdminFeedbackPage from "./pages/admin/AdminFeedbackPage.jsx";
import AdminSystemHealthPage from "./pages/admin/AdminSystemHealthPage.jsx";
import AdminChangelogPage from "./pages/admin/AdminChangelogPage.jsx";
import DeliveriesPage from "./pages/deliveries/DeliveriesPage.jsx";
import NewsletterPage from "./pages/newsletter/NewsletterPage.jsx";
import UnsubscribePage from "./pages/newsletter/UnsubscribePage.jsx";
import ReferralPage from "./pages/referral/ReferralPage.jsx";
import InstallAppBanner from "./components/InstallAppBanner.jsx";
import CookieConsent from "./components/CookieConsent.jsx";
import StoreCouponsPage from "./pages/coupons/StoreCouponsPage.jsx";

import ErrorPage from "./pages/ErrorPage.jsx";

const Guard = ({ children, roles }) => {
  const { user, token } = useAuthStore();
  if (!token || !user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role))
    return <Navigate to="/dashboard" replace />;
  return children;
};

const Public = ({ children }) => {
  const { token, user } = useAuthStore();
  if (token && user) {
    if (user.role === "admin" || user.role === "superadmin") {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return children;
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
  return null;
}

export default function App() {
  const { isDark, init } = useThemeStore();
  const { initAuth, user } = useAuthStore();
  const [maintenance, setMaintenance] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    init(isDark);
  }, []);

  useEffect(() => {
    if (user?._id) initSocket();
  }, [user?._id]);

  useEffect(() => {
    api
      .get("/admin/platform-settings/public")
      .then((res) => setMaintenance(res.data.maintenance || false))
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  // Show nothing while checking maintenance status
  if (checking) return null;

  // Show maintenance page for non-admins
  if (maintenance && !isAdmin) return <MaintenancePage />;

  return (
    <div className="overflow-x-hidden max-w-full">
      <ScrollToTop />
      <InstallAppBanner />
      <CookieConsent />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/faq" element={<FAQPage />} />

        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/help" element={<HelpCenterPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/careers" element={<CareersPage />} />
        <Route path="/unsubscribe/:token" element={<UnsubscribePage />} />
        <Route
          path="/login"
          element={
            <Public>
              <LoginPage />
            </Public>
          }
        />
        <Route
          path="/register"
          element={
            <Public>
              <RegisterPage />
            </Public>
          }
        />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/changelog" element={<ChangelogPage />} />
        <Route path="/roadmap" element={<RoadmapPage />} />
        <Route path="/team/accept" element={<AcceptInvitePage />} />
        <Route path="/sla" element={<SLAPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/store/:storeName" element={<StorefrontPage />} />
        <Route
          path="/store/:storeName/product/:productId"
          element={<ProductStorePage />}
        />

        {/* Protected Routes */}

        <Route
          path="/dashboard"
          element={
            <Guard>
              <DashboardLayout />
            </Guard>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="invoices/new" element={<CreateInvoicePage />} />
          <Route path="invoices/:id" element={<InvoiceDetailPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="whatsapp" element={<WhatsAppPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="subscription" element={<SubscriptionPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="tickets" element={<TicketsPage />} />
          <Route path="team" element={<TeamPage />} />
          <Route path="activity" element={<ActivityPage />} />
          <Route path="api-keys" element={<ApiKeysPage />} />
          <Route path="webhooks" element={<WebhooksPage />} />
          <Route path="invoice-templates" element={<InvoiceTemplatesPage />} />
          <Route path="recurring" element={<RecurringPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="banners" element={<BannersPage />} />

          <Route path="newsletter" element={<NewsletterPage />} />
          <Route path="deliveries" element={<DeliveriesPage />} />
          <Route path="referral" element={<ReferralPage />} />
          <Route path="coupons" element={<StoreCouponsPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <Guard roles={["admin", "superadmin"]}>
              <AdminLayout />
            </Guard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="subscriptions" element={<AdminSubscriptions />} />
          <Route path="tickets" element={<AdminTickets />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="notifications" element={<AdminNotificationsPage />} />
          <Route path="broadcast" element={<AdminBroadcastPage />} />
          <Route path="/admin/users/:id" element={<AdminUserDetail />} />

          <Route path="banners" element={<AdminBannersPage />} />

          <Route path="promo-codes" element={<AdminPromoCodesPage />} />
          <Route path="revenue" element={<AdminRevenueAnalyticsPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          <Route path="feedback" element={<AdminFeedbackPage />} />
          <Route path="system-health" element={<AdminSystemHealthPage />} />
          <Route path="changelog" element={<AdminChangelogPage />} />
        </Route>

        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </div>
  );
}
