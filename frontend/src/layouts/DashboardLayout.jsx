import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  Users,
  MessageSquare,
  BarChart3,
  Settings,
  Bell,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Crown,
  ChevronDown,
  User,
  Receipt,
  HelpCircle,
  Ticket,
  UserCog,
  Activity,
  Key,
  Webhook,
  Code,
  RefreshCw,
  ShoppingBag,
  Store,
  Star,
  Megaphone,
  Truck,
  Mail,
  Gift,
  Tag,
} from "lucide-react";
import useAuthStore from "../store/authStore.js";
import useThemeStore from "../store/themeStore.js";
import { getInitials, avatarColor } from "../utils/helpers.js";
import { useQuery } from "@tanstack/react-query";
import { notificationAPI } from "../services/api.js";
import { dashboardBannerAPI } from "../services/api.js";
import { useQueryClient } from "@tanstack/react-query";
import FeedbackWidget from "../components/FeedbackWidget.jsx";

const NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },

  { type: "group", label: "Finance" },
  { to: "/dashboard/invoices", icon: FileText, label: "Invoices" },
  { to: "/dashboard/payments", icon: CreditCard, label: "Payments" },
  { to: "/dashboard/expenses", icon: Receipt, label: "Expenses" },
  { to: "/dashboard/sales", icon: ShoppingBag, label: "Quick Sales" },
  { to: "/dashboard/recurring", icon: RefreshCw, label: "Recurring" },

  { type: "group", label: "Customers" },
  { to: "/dashboard/customers", icon: Users, label: "Customers" },
  { to: "/dashboard/whatsapp", icon: MessageSquare, label: "WhatsApp" },
  { to: "/dashboard/deliveries", icon: Truck, label: "Deliveries" },

  { type: "group", label: "Store" },
  { to: "/dashboard/products", icon: Store, label: "Products" },
  { to: "/dashboard/reviews", icon: Star, label: "Reviews" },
  { to: "/dashboard/banners", icon: Megaphone, label: "Banners" },
  { to: "/dashboard/newsletter", icon: Mail, label: "Newsletter" },
  { to: "/dashboard/coupons", icon: Tag, label: "Coupons" },

  { type: "group", label: "Business" },
  { to: "/dashboard/reports", icon: BarChart3, label: "Reports" },
  { to: "/dashboard/activity", icon: Activity, label: "Activity" },
  { to: "/dashboard/referral", icon: Gift, label: "Referral" },

  { type: "group", label: "Settings" },
  { to: "/dashboard/settings", icon: Settings, label: "Settings" },
  { to: "/dashboard/team", icon: UserCog, label: "Team" },
  { to: "/dashboard/invoice-templates", icon: FileText, label: "Templates" },
  {
    to: "/dashboard/api-keys",
    icon: Code,
    label: "Integrations",
    children: [
      { to: "/dashboard/api-keys", icon: Key, label: "API Keys" },
      { to: "/dashboard/webhooks", icon: Webhook, label: "Webhooks" },
    ],
  },

  { type: "group", label: "Support" },
  { to: "/dashboard/tickets", icon: Ticket, label: "Support" },
];

const BOTTOM_NAV = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { to: "/dashboard/invoices", icon: FileText, label: "Invoices" },
  { to: "/dashboard/payments", icon: CreditCard, label: "Payments" },
  { to: "/dashboard/customers", icon: Users, label: "Customers" },
  { to: "/dashboard/products", icon: Store, label: "Products" },
];

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);
  const [openDropdown, setOpenDropdown] = useState(null);

  const { data: notifs, refetch: refetchNotifs } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationAPI.getAll().then((r) => r.data),
    refetchInterval: 30000,
  });
  const unreadCount = notifs?.unread || 0;

  // Real-time notification updates via socket
  useEffect(() => {
    const handleNotification = () => refetchNotifs();
    window.addEventListener("trackeet:notification", handleNotification);
    return () =>
      window.removeEventListener("trackeet:notification", handleNotification);
  }, [refetchNotifs]);

  // Listen for plan upgrade event
  useEffect(() => {
    const handlePlanUpgrade = () => {
      refreshUser();
    };
    window.addEventListener("trackeet:plan_upgraded", handlePlanUpgrade);
    return () =>
      window.removeEventListener("trackeet:plan_upgraded", handlePlanUpgrade);
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const { data: bannersData, refetch: refetchBanners } = useQuery({
    queryKey: ["active-dashboard-banners"],
    queryFn: () => dashboardBannerAPI.getActive().then((r) => r.data),
    refetchInterval: 60000,
  });

  const [dismissedBanners, setDismissedBanners] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("dismissed-banners") || "[]");
    } catch {
      return [];
    }
  });

  const activeBanners = (bannersData?.banners || []).filter(
    (b) => !dismissedBanners.includes(b._id),
  );

  const dismissBanner = (id) => {
    const updated = [...dismissedBanners, id];
    setDismissedBanners(updated);
    localStorage.setItem("dismissed-banners", JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark font-poppins">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-dark-200 dark:border-gray-700/40">
          <img
            src="/Trackeet-logo.png"
            alt="Trackeet"
            className="w-9 h-9 flex-shrink-0"
          />
          <span className="text-lg font-bold text-dark dark:text-white">
            Trackeet
          </span>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} className="text-dark-400" />
          </button>
        </div>

        {/* Plan badge */}
        <div className="mx-4 mt-4 mb-2 px-3 py-2 bg-primary-light dark:bg-primary/10 rounded-xl flex items-center gap-2">
          <Crown size={14} className="text-primary" />
          <span className="text-xs font-semibold text-primary capitalize">
            {user?.plan || "Free"} Plan
          </span>
          <button
            onClick={() => navigate("/dashboard/subscription")}
            className="ml-auto text-xs text-primary font-medium hover:underline"
          >
            Upgrade
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {NAV.map((item) =>
            item.type === "group" ? (
              <p
                key={item.label}
                className="text-[10px] font-bold text-dark-300 uppercase tracking-widest px-3 pt-4 pb-1"
              >
                {item.label}
              </p>
            ) : item.children ? (
              <div key={item.label}>
                <button
                  onClick={() =>
                    setOpenDropdown(
                      openDropdown === item.label ? null : item.label,
                    )
                  }
                  className="sidebar-link w-full"
                >
                  <item.icon size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 ${openDropdown === item.label ? "rotate-180" : ""}`}
                  />
                </button>
                {openDropdown === item.label && (
                  <div className="ml-4 mt-0.5 space-y-0.5">
                    {item.children.map(
                      ({ to: childTo, icon: ChildIcon, label: childLabel }) => (
                        <NavLink
                          key={childTo}
                          to={childTo}
                          className={({ isActive }) =>
                            `sidebar-link ${isActive ? "active" : ""}`
                          }
                        >
                          <ChildIcon size={16} />
                          <span>{childLabel}</span>
                        </NavLink>
                      ),
                    )}
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <item.icon size={18} />
                <span>{item.label}</span>
                {item.label === "WhatsApp" && (
                  <span
                    className="ml-auto w-2 h-2 bg-success rounded-full"
                    title="Automation active"
                  />
                )}
              </NavLink>
            ),
          )}
        </nav>

        {/* Bottom user area */}
        <div className="border-t border-dark-200 dark:border-gray-700/40 p-4 space-y-1 pb-28 lg:pb-4">
          <button onClick={toggle} className="sidebar-link w-full">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <NavLink
            to="/dashboard/notifications"
            className="sidebar-link relative"
          >
            <Bell size={18} />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-auto bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </NavLink>

          {/* Logout directly under notifications */}
          <button
            onClick={logout}
            className="sidebar-link w-full hover:bg-danger-light hover:text-danger"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>

          {/* User info */}
          <div className="flex items-center gap-3 px-4 py-3 mt-1 bg-gray-50 dark:bg-dark rounded-xl">
            {user?.businessLogo ? (
              <img
                src={user.businessLogo}
                alt={user.firstName}
                className="w-8 h-8 rounded-full object-cover border border-dark-200 dark:border-gray-600"
              />
            ) : (
              <div
                className={`avatar w-8 h-8 text-sm ${avatarColor(user?.firstName || "")}`}
              >
                {getInitials(`${user?.firstName} ${user?.lastName}`)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-dark-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="content-area">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white dark:bg-surface border-b border-dark-200 dark:border-gray-700/40 px-4 py-3 flex items-center gap-3">
          {/* Hamburger — mobile */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <Menu size={22} className="text-dark dark:text-white" />
          </button>

          {/* Logo — mobile */}
          <div className="flex items-center gap-2 lg:hidden">
            <img src="/Trackeet-logo.png" alt="Trackeet" className="w-7 h-7" />
            <span className="font-bold text-dark dark:text-white">
              Trackeet
            </span>
          </div>

          <div className="flex-1" />

          {/* Dark/Light toggle */}
          <button
            onClick={toggle}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {isDark ? (
              <Sun size={18} className="text-dark-400" />
            ) : (
              <Moon size={18} className="text-dark-400" />
            )}
          </button>

          {/* Notifications bell */}
          <NavLink
            to="/dashboard/notifications"
            className="relative p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Bell size={20} className="text-dark dark:text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </NavLink>

          {/* User avatar dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {user?.businessLogo ? (
                <img
                  src={user.businessLogo}
                  alt={user.firstName}
                  className="w-8 h-8 rounded-full object-cover border border-dark-200 dark:border-gray-600"
                />
              ) : (
                <div
                  className={`avatar w-8 h-8 text-sm ${avatarColor(user?.firstName || "")}`}
                >
                  {getInitials(`${user?.firstName} ${user?.lastName}`)}
                </div>
              )}
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-dark dark:text-white leading-tight">
                  {user?.firstName}
                </p>
                <p className="text-xs text-dark-400 capitalize leading-tight">
                  {user?.plan} plan
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-dark-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-surface rounded-2xl shadow-xl border border-dark-200 dark:border-gray-700 overflow-hidden z-50 animate-slide-up">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-dark-200 dark:border-gray-700 bg-gray-50 dark:bg-dark">
                  <p className="text-sm font-bold text-dark dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-dark-400">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-primary-light text-primary text-[10px] font-bold rounded-full capitalize">
                    {user?.plan} plan
                  </span>
                </div>

                <div className="p-1.5 space-y-0.5">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/dashboard");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-500 dark:text-gray-400 hover:bg-primary-light hover:text-primary transition-all"
                  >
                    <LayoutDashboard size={16} />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/dashboard/invoices");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-500 dark:text-gray-400 hover:bg-primary-light hover:text-primary transition-all"
                  >
                    <Receipt size={16} />
                    <span>My Invoices</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/dashboard/settings");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-500 dark:text-gray-400 hover:bg-primary-light hover:text-primary transition-all"
                  >
                    <User size={16} />
                    <span>Profile Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/dashboard/subscription");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-500 dark:text-gray-400 hover:bg-primary-light hover:text-primary transition-all"
                  >
                    <Crown size={16} />
                    <span>Upgrade Plan</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/help");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-500 dark:text-gray-400 hover:bg-primary-light hover:text-primary transition-all"
                  >
                    <HelpCircle size={16} />
                    <span>Help Center</span>
                  </button>

                  <div className="border-t border-dark-200 dark:border-gray-700 my-1" />

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-danger hover:bg-danger-light transition-all"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Dashboard banners */}
        {activeBanners.length > 0 && (
          <div className="px-4 pt-3 space-y-2">
            {activeBanners.map((b) => (
              <div
                key={b._id}
                className={`px-4 py-3 rounded-2xl border flex items-start gap-3 ${
                  b.type === "info"
                    ? "bg-primary-light border-primary/20"
                    : b.type === "success"
                      ? "bg-success-light border-success/20"
                      : b.type === "warning"
                        ? "bg-warning-light border-warning/20"
                        : "bg-danger-light border-danger/20"
                }`}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-bold ${
                      b.type === "info"
                        ? "text-primary"
                        : b.type === "success"
                          ? "text-success"
                          : b.type === "warning"
                            ? "text-warning"
                            : "text-danger"
                    }`}
                  >
                    {b.title}
                  </p>
                  <p className="text-xs text-dark-500 dark:text-gray-400 mt-0.5">
                    {b.message}
                  </p>
                  {b.ctaLabel && b.ctaLink && (
                    <button
                      onClick={() => navigate(b.ctaLink)}
                      className={`mt-1.5 text-xs font-bold underline ${
                        b.type === "info"
                          ? "text-primary"
                          : b.type === "success"
                            ? "text-success"
                            : b.type === "warning"
                              ? "text-warning"
                              : "text-danger"
                      }`}
                    >
                      {b.ctaLabel} →
                    </button>
                  )}
                </div>
                {b.dismissible && (
                  <button
                    onClick={() => dismissBanner(b._id)}
                    className="p-1 rounded-lg opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
                  >
                    <X
                      size={14}
                      className={
                        b.type === "info"
                          ? "text-primary"
                          : b.type === "success"
                            ? "text-success"
                            : b.type === "warning"
                              ? "text-warning"
                              : "text-danger"
                      }
                    />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Page content */}
        <main className="px-4 py-4 pb-24 lg:px-8 lg:py-6 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav */}
      <nav className="bottom-nav lg:hidden">
        {BOTTOM_NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/dashboard"}
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? "active" : ""}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <FeedbackWidget />
    </div>
  );
}
