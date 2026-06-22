import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Plus,
  Bell,
  MessageCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Send,
  Zap,
  TrendingDown,
  ShoppingBag,
} from "lucide-react";
import { useState } from "react";
import { reportAPI, expenseAPI } from "../../services/api.js";
import useAuthStore from "../../store/authStore.js";
import dayjs from "dayjs";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const fmt = (n) => "₦" + (n || 0).toLocaleString("en-NG");

const TX_BADGE = {
  failed: { label: "❌ Failed", cls: "bg-danger-light text-danger" },
  reversed: { label: "↩️ Reversed", cls: "bg-purple-100 text-purple-600" },
  pending: { label: "⏳ Pending", cls: "bg-warning-light text-warning" },
  successful: { label: "✅ Paid", cls: "bg-success-light text-success" },
};

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
  const [isLoading, setIsLoading] = useState(false);

  const { data, isLoading: dashLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () =>
      reportAPI.getSummary({ period: "month" }).then((r) => r.data),
  });

  const { data: insightsData } = useQuery({
    queryKey: ["insights"],
    queryFn: () => reportAPI.getInsights().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const { data: expenseData } = useQuery({
    queryKey: ["expense-summary"],
    queryFn: () =>
      expenseAPI.getSummary({ period: "month" }).then((r) => r.data),
  });

  const d = data?.stats || {};
  const recent = data?.recentInvoices || [];
  const trend =
    data?.revenueTrend ||
    Array.from({ length: 7 }, (_, i) => ({ day: i, amount: 0 }));

  const thisMonthRevenue  = (d.paidAmount || 0) + (d.salesThisMonth || 0)
  const thisMonthExpenses = expenseData?.total || 0;
  const estimatedProfit = thisMonthRevenue - thisMonthExpenses;

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
      label: "Partial",
      value: fmt(d.partialAmount),
      sub: `${d.partial || 0} invoices · ${fmt(d.partialBalance || 0)} balance`,
      icon: CreditCard,
      color: "bg-orange-100",
      iconColor: "text-orange-500",
    },
    {
      label: "Pending",
      value: fmt(d.pendingAmount),
      sub: `${d.pending || 0} invoices`,
      icon: Send,
      color: "bg-warning-light",
      iconColor: "text-warning",
    },
    {
      label: "Failed/Reversed",
      value: fmt(d.failedAmount),
      sub: `${d.failed || 0} transactions`,
      icon: AlertCircle,
      color: "bg-danger-light",
      iconColor: "text-danger",
    },
    {
      label: "Overdue",
      value: fmt(d.overdueAmount),
      sub: `${d.overdue || 0} invoices`,
      icon: AlertCircle,
      color: "bg-danger-light",
      iconColor: "text-danger",
    },
    {
      label: "Quick Sales",
      value: fmt(d.salesRevenue || 0),
      sub: `${d.salesCount || 0} sales · ${fmt(d.salesThisMonth || 0)} this month`,
      icon: ShoppingBag,
      color: "bg-primary-light",
      iconColor: "text-primary",
      onClick: () => navigate("/dashboard/sales"),
    },
    {
      label: "Expenses",
      value: fmt(thisMonthExpenses),
      sub: "This month",
      icon: TrendingDown,
      color: "bg-danger-light",
      iconColor: "text-danger",
      onClick: () => navigate("/dashboard/expenses"),
    },
    {
      label: "Est. Profit",
      value: fmt(estimatedProfit),
      sub: "Revenue − Expenses",
      icon: estimatedProfit >= 0 ? TrendingUp : TrendingDown,
      color: estimatedProfit >= 0 ? "bg-success-light" : "bg-danger-light",
      iconColor: estimatedProfit >= 0 ? "text-success" : "text-danger",
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
              {user?.businessName ? (
                <span className="font-semibold">{user.businessName} 👋</span>
              ) : (
                <>
                  Good morning,{" "}
                  <span className="font-semibold">{user?.firstName} 👋</span>
                </>
              )}
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

      {/* Profit Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Revenue",
            value: fmt(thisMonthRevenue),
            color: "text-success",
            bg: "bg-success-light",
          },
          {
            label: "Expenses",
            value: fmt(thisMonthExpenses),
            color: "text-danger",
            bg: "bg-danger-light",
          },
          {
            label: "Est. Profit",
            value: fmt(estimatedProfit),
            color: estimatedProfit >= 0 ? "text-primary" : "text-danger",
            bg: estimatedProfit >= 0 ? "bg-primary-light" : "bg-danger-light",
          },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-2xl p-3 text-center`}>
            <p
              className={`font-black ${s.color} truncate text-sm w-full`}
              style={{ fontSize: "clamp(10px, 3vw, 16px)" }}
            >
              {s.value}
            </p>
            <p className="text-xs text-dark-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AI Insights */}
      {(insightsData?.insights || []).length > 0 && (
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-dark dark:text-white">
                Business Insights
              </h2>
              <p className="text-xs text-dark-400">
                Rule-based analysis of your business
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {(insightsData?.insights || []).map((insight, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 p-3 rounded-xl ${
                  insight.type === "positive"
                    ? "bg-success-light"
                    : insight.type === "warning"
                      ? "bg-warning-light"
                      : insight.type === "danger"
                        ? "bg-danger-light"
                        : "bg-gray-50 dark:bg-dark"
                }`}
              >
                <span className="text-xl flex-shrink-0">{insight.icon}</span>
                <div className="min-w-0">
                  <p
                    className={`text-sm font-semibold ${
                      insight.type === "positive"
                        ? "text-success"
                        : insight.type === "warning"
                          ? "text-warning"
                          : insight.type === "danger"
                            ? "text-danger"
                            : "text-dark dark:text-white"
                    }`}
                  >
                    {insight.title}
                  </p>
                  <p className="text-xs text-dark-500 dark:text-gray-400 mt-0.5">
                    {insight.message}
                  </p>
                </div>
                {insight.score && (
                  <div className="flex-shrink-0 text-right">
                    <p
                      className={`text-2xl font-black ${
                        insight.score >= 70
                          ? "text-success"
                          : insight.score >= 50
                            ? "text-warning"
                            : "text-danger"
                      }`}
                    >
                      {insight.score}
                    </p>
                    <p className="text-xs text-dark-400">/ 100</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            onClick={s.onClick}
            className={`card rounded-3xl flex flex-col items-center text-center py-6 ${s.onClick ? "cursor-pointer hover:shadow-lg transition-shadow" : ""}`}
          >
            <div
              className={`w-14 h-14 ${s.color} rounded-2xl flex items-center justify-center mb-4`}
            >
              <s.icon size={24} className={s.iconColor} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">
              {s.label}
            </p>
            <p className="text-base font-bold text-dark dark:text-white">
              {dashLoading ? "—" : s.value}
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
          {dashLoading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))
          ) : recent.length === 0 ? (
            <div className="empty-state py-8">
              <FileText size={36} className="text-gray-300" />
              <p className="text-sm text-gray-400">No invoices yet</p>
            </div>
          ) : (
            recent.map((inv) => {
              const txBadge = inv.txStatus ? TX_BADGE[inv.txStatus] : null;
              return (
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
                    {txBadge ? (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${txBadge.cls}`}
                      >
                        {txBadge.label}
                      </span>
                    ) : (
                      <span
                        className={STATUS_BADGE[inv.status] || "badge-draft"}
                      >
                        {inv.status}
                      </span>
                    )}
                  </div>
                  <ArrowRight
                    size={14}
                    className="text-gray-300 group-hover:text-primary transition-colors ml-1 flex-shrink-0"
                  />
                </div>
              );
            })
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
              ₦2,000/month
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard/subscription")}
            className="btn btn-primary text-xs px-4 py-2 flex-shrink-0"
          >
            Upgrade
          </button>
        </div>
      )}
    </div>
  );
}
