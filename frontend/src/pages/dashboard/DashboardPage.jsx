import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Plus,
  Send,
  Bell,
  MessageCircle,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import { reportAPI } from "../../services/api.js";
import useAuthStore from "../../store/authStore.js";
import dayjs from "dayjs";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

const fmt = (n) => "₦" + (n || 0).toLocaleString("en-NG");
const STATUS_BADGE = {
  paid: "badge-paid",
  pending: "badge-pending",
  overdue: "badge-overdue",
  draft: "badge-draft",
  partial: "badge-partial",
};

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [hideBalance, setHideBalance] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () =>
      reportAPI.getSummary({ period: "month" }).then((r) => r.data),
  });

  const d = data || {};
  const trend =
    d.revenueTrend ||
    Array.from({ length: 7 }, (_, i) => ({
      day: i,
      amount: Math.random() * 100000,
    }));

  const STATS = [
    {
      label: "Total Invoices",
      value: fmt(d.totalAmount),
      sub: `${d.totalInvoices || 0} invoices`,
      icon: FileText,
      color: "bg-primary-light",
      iconColor: "text-primary",
    },
    {
      label: "Paid",
      value: fmt(d.paidAmount),
      sub: `${d.paid || 0} invoices`,
      icon: TrendingUp,
      color: "bg-success-light",
      iconColor: "text-success",
    },
    {
      label: "Pending",
      value: fmt(d.pendingAmount),
      sub: `${d.pending || 0} invoices`,
      icon: CreditCard,
      color: "bg-warning-light",
      iconColor: "text-warning",
    },
    {
      label: "Overdue",
      value: fmt(d.overdueAmount),
      sub: `${d.overdue || 0} invoices`,
      icon: AlertCircle,
      color: "bg-danger-light",
      iconColor: "text-danger",
    },
  ];

  const QUICK = [
    {
      label: "New Invoice",
      icon: Plus,
      color: "bg-primary text-white",
      action: () => navigate("/dashboard/invoices/new"),
    },
    {
      label: "Record Payment",
      icon: CreditCard,
      color: "bg-success text-white",
      action: () => navigate("/dashboard/payments"),
    },
    {
      label: "Send Reminder",
      icon: Bell,
      color: "bg-warning text-white",
      action: () => navigate("/dashboard/whatsapp"),
    },
    {
      label: "WhatsApp",
      icon: MessageCircle,
      color: "bg-[#25D366] text-white",
      action: () => navigate("/dashboard/whatsapp"),
    },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Balance Card */}
      <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-5 text-white shadow-glow">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-sm opacity-80">
              Good morning,{" "}
              <span className="font-semibold">{user?.firstName} 👋</span>
            </p>
            <p className="text-xs opacity-60 mt-0.5">
              Here's what's happening with your business today.
            </p>
          </div>
          <button
            onClick={() => setHideBalance(!hideBalance)}
            className="opacity-70 hover:opacity-100 mt-0.5"
          >
            {hideBalance ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <p className="text-xs opacity-70 mb-1">Total Balance</p>
        <p className="text-3xl font-bold mb-1">
          {hideBalance ? "₦••••••" : fmt(d.totalBalance)}
        </p>
        <div className="flex items-center gap-1 mb-4">
          <TrendingUp size={13} />
          <span className="text-xs opacity-80">
            +{d.growth?.toFixed(1) || 0}% from last month
          </span>
        </div>

        {/* Mini chart */}
        <div className="h-12 opacity-60 mb-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#fff"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-4 gap-2">
          {QUICK.map(({ label, icon: Icon, color, action }) => (
            <button
              key={label}
              onClick={action}
              className="flex flex-col items-center gap-1.5 group"
            >
              <div
                className={`w-11 h-11 rounded-2xl ${color} bg-opacity-90 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
              >
                <Icon size={18} />
              </div>
              <span className="text-[10px] opacity-80 leading-tight text-center">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {STATS.map((s) => (
          <div key={s.label} className="card">
            <div className={`stat-icon ${s.color} mb-3 w-10 h-10`}>
              <s.icon size={18} className={s.iconColor} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {s.label}
            </p>
            <p className="text-base font-bold text-dark dark:text-white mt-0.5">
              {isLoading ? "—" : s.value}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent Invoices */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Recent Invoices</h3>
          <button
            onClick={() => navigate("/dashboard/invoices")}
            className="text-xs text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all"
          >
            See all <ArrowRight size={12} />
          </button>
        </div>
        <div className="space-y-2">
          {isLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))
          ) : (d.recentInvoices || []).length === 0 ? (
            <div className="empty-state py-8">
              <FileText size={36} className="text-gray-300" />
              <p className="text-sm text-gray-400">No invoices yet</p>
            </div>
          ) : (
            (d.recentInvoices || []).map((inv) => (
              <div
                key={inv._id}
                onClick={() => navigate(`/dashboard/invoices/${inv._id}`)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer transition-colors group"
              >
                <div className="avatar bg-primary-light text-primary text-xs">
                  {inv.customer?.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark dark:text-white truncate">
                    {inv.invoiceNumber}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {inv.customer?.name} ·{" "}
                    {dayjs(inv.createdAt).format("D MMM")}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-dark dark:text-white">
                    {fmt(inv.totalAmount)}
                  </p>
                  <span className={STATUS_BADGE[inv.status] || "badge-draft"}>
                    {inv.status}
                  </span>
                </div>
                <ArrowRight
                  size={14}
                  className="text-gray-300 group-hover:text-primary transition-colors ml-1 flex-shrink-0"
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Plan Banner */}
      {user?.plan === "free" && (
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/5 border border-primary/20 p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
            <TrendingUp size={18} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-dark dark:text-white">
              Upgrade to Business Plan
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Get unlimited invoices, WhatsApp automation, and more for
              ₦2,500/month
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/subscription")}
            className="btn-primary text-xs px-4 py-2 flex-shrink-0"
          >
            Upgrade
          </button>
        </div>
      )}
    </div>
  );
}
