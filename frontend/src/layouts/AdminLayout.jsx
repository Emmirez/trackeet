import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Ticket,
  Settings,
  LogOut,
  Shield,
  Bell,
  Menu,
  X,
  Sun,
  Moon,
  Home,
  ChevronDown,
  UserCheck,
  Send,
  Megaphone,
  Activity,
  Receipt,
  BarChart3,
  Tag,
  Star,
  BookOpen,
} from "lucide-react";
import useAuthStore from "../store/authStore.js";
import useThemeStore from "../store/themeStore.js";
import { getInitials, avatarColor } from "../utils/helpers.js";
import api from "../services/api.js";

const NAV = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/payments", icon: Receipt, label: "Payments" },
  { to: "/admin/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { to: "/admin/tickets", icon: Ticket, label: "Support Tickets" },
  { to: "/admin/broadcast", icon: Send, label: "Broadcast" },
  { to: "/admin/banners", icon: Megaphone, label: "Banners" },
  { to: "/admin/revenue", icon: BarChart3, label: "Revenue" },
  { to: "/admin/promo-codes", icon: Tag, label: "Promo Codes" },
  { to: "/admin/system-health", icon: Activity, label: "System Health" },
  { to: "/admin/changelog", icon: BookOpen, label: "Changelog" },
  { to: "/admin/audit-logs", icon: Activity, label: "Audit Logs" },
  { to: "/admin/feedback", icon: Star, label: "Feedback" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

const BOTTOM_NAV = [
  { to: "/admin", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/admin/users", icon: Users, label: "Users" },
  { to: "/admin/subscriptions", icon: CreditCard, label: "Subs" },
  { to: "/admin/tickets", icon: Ticket, label: "Tickets" },
  { to: "/admin/settings", icon: Settings, label: "Settings" },
];

export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Fetch real unread notification count
  const { data: notifData } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => api.get("/admin/notifications").then((r) => r.data),
    refetchInterval: 30000,
  });
  const unreadCount = notifData?.unreadCount || 0;

  useEffect(() => {
    setOpen(false);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark font-poppins">
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`sidebar ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center gap-3 px-5 py-5 border-b border-dark-200 dark:border-gray-700/40">
          <div className="w-9 h-9 bg-danger rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-dark dark:text-white">
              Admin Panel
            </p>
            <p className="text-xs text-dark-400 capitalize">{user?.role}</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setOpen(false)}>
            <X size={20} className="text-dark-400" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-dark-200 dark:border-gray-700/40 p-4 space-y-1 pb-28 lg:pb-4">
          <button onClick={toggle} className="sidebar-link w-full">
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
            <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
          </button>
          <button onClick={() => navigate("/")} className="sidebar-link w-full">
            <Home size={18} />
            <span>Back to App</span>
          </button>
          <button
            onClick={logout}
            className="sidebar-link w-full hover:bg-danger-light hover:text-danger"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
          <div className="flex items-center gap-3 px-4 py-3 mt-2 bg-gray-50 dark:bg-dark rounded-xl">
            <div
              className={`avatar w-8 h-8 text-sm flex-shrink-0 ${avatarColor(user?.firstName || "")}`}
            >
              {getInitials(`${user?.firstName} ${user?.lastName}`)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-dark-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="content-area">
        <header className="sticky top-0 z-10 bg-white dark:bg-surface border-b border-dark-200 dark:border-gray-700/40 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <Menu size={22} className="text-dark dark:text-white" />
          </button>

          <span className="font-bold text-dark dark:text-white lg:hidden">
            Admin Panel
          </span>

          <div className="flex-1" />

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isDark ? (
              <Sun size={18} className="text-dark-400" />
            ) : (
              <Moon size={18} className="text-dark-400" />
            )}
          </button>

          {/* Notifications bell — real count, goes to /admin/notifications */}
          <button
            onClick={() => navigate("/admin/notifications")}
            className="relative p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Bell size={20} className="text-dark dark:text-white" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-danger text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {/* User avatar + dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-10 dark:hover:bg-gray-800 transition-colors"
            >
              <div
                className={`avatar w-8 h-8 text-sm flex-shrink-0 ${avatarColor(user?.firstName || "")}`}
              >
                {getInitials(`${user?.firstName} ${user?.lastName}`)}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-dark dark:text-white leading-tight">
                  {user?.firstName}
                </p>
                <p className="text-xs text-dark-400 capitalize leading-tight">
                  {user?.role}
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-dark-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-surface rounded-2xl shadow-xl border border-dark-200 dark:border-gray-700 overflow-hidden z-50 animate-slide-up">
                <div className="px-4 py-3 border-b border-dark-200 dark:border-gray-700 bg-gray-50 dark:bg-dark">
                  <p className="text-sm font-bold text-dark dark:text-white">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-dark-400">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-danger-light text-danger text-[10px] font-bold rounded-full capitalize">
                    {user?.role}
                  </span>
                </div>

                <div className="p-1.5 space-y-0.5">
                  {/* Notifications — real count */}
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/admin/notifications");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-500 dark:text-gray-400 hover:bg-primary-light hover:text-primary transition-all"
                  >
                    <Bell size={16} />
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                      <span className="ml-auto bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/admin/users");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-500 dark:text-gray-400 hover:bg-primary-light hover:text-primary transition-all"
                  >
                    <UserCheck size={16} />
                    <span>Manage Users</span>
                  </button>

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      navigate("/");
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-dark-500 dark:text-gray-400 hover:bg-primary-light hover:text-primary transition-all"
                  >
                    <Home size={16} />
                    <span>Back to App</span>
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

        <main className="px-4 py-4 pb-24 lg:px-8 lg:py-6 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav */}
      <nav className="bottom-nav lg:hidden">
        {BOTTOM_NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
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
    </div>
  );
}
