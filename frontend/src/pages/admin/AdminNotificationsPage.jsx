import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Users,
  CreditCard,
  Ticket,
  AlertCircle,
  CheckCheck,
  Trash2,
  CheckCircle,
} from "lucide-react";
import api from "../../services/api.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(relativeTime);

const TABS = [
  { id: "all", label: "All" },
  { id: "registration", label: "Registrations" },
  { id: "subscription", label: "Payments" },
  { id: "ticket", label: "Tickets" },
  { id: "system", label: "System" },
];

const TYPE_CONFIG = {
  registration: {
    icon: Users,
    bg: "bg-primary-light",
    text: "text-primary",
    label: "New User",
  },
  subscription: {
    icon: CreditCard,
    bg: "bg-success-light",
    text: "text-success",
    label: "Payment",
  },
  ticket: {
    icon: Ticket,
    bg: "bg-warning-light",
    text: "text-warning",
    label: "Ticket",
  },
  system: {
    icon: AlertCircle,
    bg: "bg-danger-light",
    text: "text-danger",
    label: "System",
  },
};

export default function AdminNotificationsPage() {
  const [tab, setTab] = useState("all");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => api.get("/admin/notifications").then((r) => r.data),
    refetchInterval: 30000,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const { mutate: markRead } = useMutation({
    mutationFn: (id) => api.patch(`/admin/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries(["admin-notifications"]),
  });

  const { mutate: markAllRead } = useMutation({
    mutationFn: () => api.patch("/admin/notifications/read-all"),
    onSuccess: () => qc.invalidateQueries(["admin-notifications"]),
  });

  const { mutate: deleteNotif } = useMutation({
    mutationFn: (id) => api.delete(`/admin/notifications/${id}`),
    onSuccess: () => qc.invalidateQueries(["admin-notifications"]),
  });

  const { mutate: deleteAllRead } = useMutation({
    mutationFn: () => api.delete("/admin/notifications/read"),
    onSuccess: () => qc.invalidateQueries(["admin-notifications"]),
  });

  const filtered =
    tab === "all" ? notifications : notifications.filter((n) => n.type === tab);

  const grouped = {
    today: filtered.filter((n) => dayjs(n.createdAt).isSame(dayjs(), "day")),
    yesterday: filtered.filter((n) =>
      dayjs(n.createdAt).isSame(dayjs().subtract(1, "day"), "day"),
    ),
    older: filtered.filter((n) =>
      dayjs(n.createdAt).isBefore(dayjs().subtract(1, "day"), "day"),
    ),
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="page-title"></h1>
          <p className="text-sm text-dark-400">
            {unreadCount > 0
              ? `${unreadCount} unread notifications`
              : "All caught up!"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllRead()}
              className="btn btn-ghost border border-dark-200 dark:border-gray-700 btn-sm"
            >
              <CheckCheck size={16} /> Mark all read
            </button>
          )}
          {notifications.some((n) => n.read) && (
            <button
              onClick={() => deleteAllRead()}
              className="btn btn-ghost border border-danger/30 text-danger btn-sm"
            >
              <Trash2 size={16} /> Clear read
            </button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {["registration", "subscription", "ticket", "system"].map((type, i) => {
          const config = TYPE_CONFIG[type];
          const Icon = config.icon;
          const total = notifications.filter((n) => n.type === type).length;
          const unread = notifications.filter(
            (n) => n.type === type && !n.read,
          ).length;
          return (
            <button
              key={i}
              onClick={() => setTab(type)}
              className={`card flex items-center gap-3 text-left hover:shadow-glow-sm transition-all hover:-translate-y-0.5
                ${tab === type ? "border-2 border-primary" : ""}`}
            >
              <div
                className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                <Icon size={18} className={config.text} />
              </div>
              <div>
                <p className="text-lg font-black text-dark dark:text-white">
                  {total}
                </p>
                <p className="text-xs text-dark-400 capitalize">{type}s</p>
                {unread > 0 && (
                  <span className="text-[10px] font-bold text-danger">
                    {unread} unread
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2
              ${
                tab === t.id
                  ? "bg-white dark:bg-surface text-dark dark:text-white shadow-sm"
                  : "text-dark-400 hover:text-dark dark:hover:text-gray-300"
              }`}
          >
            {t.label}
            {t.id === "all" && unreadCount > 0 && (
              <span className="bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state py-16">
            <Bell size={48} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No notifications
            </p>
            <p className="text-dark-400 text-sm">Nothing here yet</p>
          </div>
        ) : (
          <div>
            {grouped.today.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 dark:bg-dark border-b border-dark-200 dark:border-gray-700">
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">
                    Today
                  </p>
                </div>
                {grouped.today.map((n) => (
                  <NotifItem
                    key={n._id}
                    n={n}
                    onRead={markRead}
                    onDelete={deleteNotif}
                  />
                ))}
              </div>
            )}
            {grouped.yesterday.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 dark:bg-dark border-b border-dark-200 dark:border-gray-700">
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">
                    Yesterday
                  </p>
                </div>
                {grouped.yesterday.map((n) => (
                  <NotifItem
                    key={n._id}
                    n={n}
                    onRead={markRead}
                    onDelete={deleteNotif}
                  />
                ))}
              </div>
            )}
            {grouped.older.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-gray-50 dark:bg-dark border-b border-dark-200 dark:border-gray-700">
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">
                    Older
                  </p>
                </div>
                {grouped.older.map((n) => (
                  <NotifItem
                    key={n._id}
                    n={n}
                    onRead={markRead}
                    onDelete={deleteNotif}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function NotifItem({ n, onRead, onDelete }) {
  const config = TYPE_CONFIG[n.type] || TYPE_CONFIG.system;
  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-4 border-b border-dark-100 dark:border-gray-700/30 last:border-0
      hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group
      ${!n.read ? "bg-primary-50 dark:bg-primary/5" : ""}`}
    >
      <div
        className={`w-10 h-10 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}
      >
        <Icon size={18} className={config.text} />
      </div>

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => !n.read && onRead(n._id)}
      >
        <div className="flex items-center gap-2 mb-0.5">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}
          >
            {config.label}
          </span>
          {!n.read && (
            <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
          )}
        </div>
        <p
          className={`text-sm mb-0.5 ${!n.read ? "font-semibold text-dark dark:text-white" : "font-medium text-dark-500 dark:text-gray-400"}`}
        >
          {n.title}
        </p>
        <p className="text-xs text-dark-400 leading-relaxed">{n.message}</p>
        <p className="text-xs text-dark-300 mt-1">
          {dayjs(n.createdAt).fromNow()}
        </p>
      </div>

      <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!n.read && (
          <button
            onClick={() => onRead(n._id)}
            title="Mark as read"
            className="p-1.5 rounded-lg hover:bg-success-light text-dark-400 hover:text-success transition-colors"
          >
            <CheckCircle size={14} />
          </button>
        )}
        <button
          onClick={() => onDelete(n._id)}
          title="Delete"
          className="p-1.5 rounded-lg hover:bg-danger-light text-dark-400 hover:text-danger transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
