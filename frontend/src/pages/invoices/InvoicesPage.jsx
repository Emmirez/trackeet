import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Filter,
  FileText,
  ArrowRight,
  Trash2,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { invoiceAPI } from "../../services/api.js";
import {
  fmt,
  statusBadge,
  getInitials,
  avatarColor,
} from "../../utils/helpers.js";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

dayjs.extend(relativeTime);

const TABS = ["All", "Paid", "Partial", "Pending", "Overdue", "Draft"];

const TX_BADGE = {
  failed: { label: "❌ Failed", cls: "bg-danger-light text-danger" },
  reversed: { label: "↩️ Reversed", cls: "bg-purple-100 text-purple-600" },
  pending: { label: "⏳ Pending", cls: "bg-warning-light text-warning" },
  successful: { label: "✅ Successful", cls: "bg-success-light text-success" },
};

export default function InvoicesPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const now = dayjs();

  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("list");
  const [selectedDate, setSelectedDate] = useState(now);

  const isCurrentMonth = selectedDate.isSame(now, "month");

  const params = {
    status: tab === "All" ? "" : tab.toLowerCase(),
    search: search || undefined,
    month: selectedDate.month() + 1,
    year: selectedDate.year(),
  };

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", params],
    queryFn: () => invoiceAPI.getAll(params).then((r) => r.data),
  });

  const { mutate: del } = useMutation({
    mutationFn: invoiceAPI.delete,
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries(["invoices"]);
    },
  });

  const invoices = data?.invoices || [];
  const monthRevenue = data?.monthRevenue || 0;
  const prevRevenue = data?.prevRevenue || 0;
  const monthlyHistory = data?.monthlyHistory || [];
  const insight = data?.insight;

  const monthDiff =
    prevRevenue > 0
      ? Math.round(((monthRevenue - prevRevenue) / prevRevenue) * 100)
      : null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <h1 className="page-title">Invoices</h1>
        <Link to="/dashboard/invoices/new" className="btn btn-primary btn-sm">
          <Plus size={16} /> New Invoice
        </Link>
      </div>

      {/* Month Navigator */}
      <div className="card py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedDate((d) => d.subtract(1, "month"))}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft size={18} className="text-dark-400" />
          </button>
          <div className="text-center">
            <p className="font-bold text-dark dark:text-white text-lg">
              {selectedDate.format("MMMM YYYY")}
            </p>
            <p className="text-xs text-dark-400">
              {isCurrentMonth ? "Current month" : selectedDate.fromNow()}
            </p>
          </div>
          <button
            onClick={() => {
              if (!isCurrentMonth) setSelectedDate((d) => d.add(1, "month"));
            }}
            disabled={isCurrentMonth}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
          >
            <ChevronRight size={18} className="text-dark-400" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card py-3 text-center">
          <p
            className="font-black text-success truncate"
            style={{ fontSize: "clamp(11px,3.5vw,18px)" }}
          >
            {fmt.naira(monthRevenue)}
          </p>
          <p className="text-xs text-dark-400 mt-0.5">Revenue</p>
        </div>
        <div className="card py-3 text-center">
          <p
            className="font-black text-dark-400 truncate"
            style={{ fontSize: "clamp(11px,3.5vw,18px)" }}
          >
            {fmt.naira(prevRevenue)}
          </p>
          <p className="text-xs text-dark-400 mt-0.5">Last Month</p>
        </div>
        <div className="card py-3 text-center">
          {monthDiff !== null ? (
            <>
              <p
                className={`font-black ${monthDiff >= 0 ? "text-success" : "text-danger"}`}
                style={{ fontSize: "clamp(11px,3.5vw,18px)" }}
              >
                {monthDiff >= 0 ? "+" : ""}
                {monthDiff}%
              </p>
              <p className="text-xs text-dark-400 mt-0.5">vs Last Month</p>
            </>
          ) : (
            <>
              <p
                className="font-black text-dark dark:text-white"
                style={{ fontSize: "clamp(11px,3.5vw,18px)" }}
              >
                {invoices.length}
              </p>
              <p className="text-xs text-dark-400 mt-0.5">This Month</p>
            </>
          )}
        </div>
      </div>

      {/* Insight */}
      {insight && (
        <div
          className={`card flex items-start gap-3 ${
            insight.type === "positive"
              ? "bg-success-light border border-success/20"
              : insight.type === "warning"
                ? "bg-warning-light border border-warning/20"
                : "bg-gray-50 dark:bg-dark border border-dark-100 dark:border-gray-700"
          }`}
        >
          <span className="text-xl flex-shrink-0">
            {insight.type === "positive"
              ? "📈"
              : insight.type === "warning"
                ? "📉"
                : "📊"}
          </span>
          <p
            className={`text-sm font-semibold ${
              insight.type === "positive"
                ? "text-success"
                : insight.type === "warning"
                  ? "text-warning"
                  : "text-dark dark:text-white"
            }`}
          >
            {insight.message}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { key: "list", label: "📄 Invoices" },
          { key: "history", label: "📊 History" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
              ${activeTab === t.key ? "bg-white dark:bg-surface text-dark dark:text-white shadow-sm" : "text-dark-400"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── HISTORY TAB ── */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-dark dark:text-white mb-4">
              Last 12 Months — Revenue
            </h2>
            {monthlyHistory.some((m) => m.revenue > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyHistory}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10 }}
                    stroke="#94A3B8"
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    stroke="#94A3B8"
                    tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => fmt.naira(v)}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="revenue" radius={[6, 6, 0, 0]}>
                    {monthlyHistory.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.year === selectedDate.year() &&
                          entry.monthNum === selectedDate.month() + 1
                            ? "#7C3AED"
                            : "#E2E8F0"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-dark-400 text-sm py-8">
                No invoice history yet
              </p>
            )}
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b border-dark-100 dark:border-gray-700">
              <h2 className="font-semibold text-dark dark:text-white">
                Monthly Breakdown
              </h2>
            </div>
            <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
              {monthlyHistory
                .filter((m) => m.count > 0)
                .reverse()
                .map((m, i, arr) => {
                  const prevM = arr[i + 1];
                  const change =
                    prevM?.revenue > 0
                      ? Math.round(
                          ((m.revenue - prevM.revenue) / prevM.revenue) * 100,
                        )
                      : null;
                  const isSel =
                    m.year === selectedDate.year() &&
                    m.monthNum === selectedDate.month() + 1;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedDate(dayjs(`${m.year}-${m.monthNum}-01`));
                        setActiveTab("list");
                      }}
                      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors ${isSel ? "bg-primary-light dark:bg-primary/10" : ""}`}
                    >
                      <div>
                        <p
                          className={`text-sm font-semibold ${isSel ? "text-primary" : "text-dark dark:text-white"}`}
                        >
                          {m.month}
                        </p>
                        <p className="text-xs text-dark-400">
                          {m.count} invoice{m.count !== 1 ? "s" : ""} ·{" "}
                          {fmt.naira(m.amount)} invoiced
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {change !== null && (
                          <span
                            className={`text-xs font-semibold ${change >= 0 ? "text-success" : "text-danger"}`}
                          >
                            {change >= 0 ? "↑" : "↓"} {Math.abs(change)}%
                          </span>
                        )}
                        <div className="text-right">
                          <p
                            className={`text-sm font-black ${isSel ? "text-primary" : "text-dark dark:text-white"}`}
                          >
                            {fmt.naira(m.revenue)}
                          </p>
                          <p className="text-xs text-dark-400">collected</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              {monthlyHistory.filter((m) => m.count > 0).length === 0 && (
                <p className="text-center text-dark-400 text-sm p-8">
                  No invoice history yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── LIST TAB ── */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoices..."
                className="input pl-10"
              />
            </div>
          </div>

          {/* Status tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto no-scrollbar">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all
                  ${tab === t ? "bg-white dark:bg-surface text-dark dark:text-white shadow-sm" : "text-dark-400"}`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Invoice list */}
          <div className="card p-0 overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16" />
                ))}
              </div>
            ) : invoices.length === 0 ? (
              <div className="empty-state p-10">
                <FileText size={48} className="text-dark-200" />
                <p className="font-semibold text-dark dark:text-white">
                  No invoices in {selectedDate.format("MMMM YYYY")}
                </p>
                <Link
                  to="/dashboard/invoices/new"
                  className="btn btn-primary btn-sm mt-2"
                >
                  <Plus size={16} /> Create Invoice
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
                {invoices.map((inv) => {
                  const txBadge = inv.txStatus ? TX_BADGE[inv.txStatus] : null;
                  return (
                    <div
                      key={inv._id}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group"
                    >
                      <div
                        className={`avatar w-10 h-10 text-sm flex-shrink-0 ${avatarColor(inv.customer?.name || "")}`}
                      >
                        {getInitials(inv.customer?.name || "?")}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-dark dark:text-white">
                            {inv.invoiceNumber}
                          </p>
                          {inv.type === "quick" && (
                            <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-warning-light text-warning">
                              <Zap size={8} /> Quick
                            </span>
                          )}
                          {txBadge ? (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${txBadge.cls}`}
                            >
                              {txBadge.label}
                            </span>
                          ) : (
                            <span className={statusBadge(inv.status)}>
                              {inv.status}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-dark-400 truncate">
                          {inv.customer?.name} · {fmt.date(inv.createdAt)}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-dark dark:text-white">
                          {fmt.naira(inv.totalAmount)}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/dashboard/invoices/${inv._id}`}
                          className="btn btn-ghost p-2 btn-sm"
                        >
                          <ArrowRight size={16} />
                        </Link>
                        <button
                          onClick={() =>
                            invoiceAPI
                              .sendWhatsApp(inv._id)
                              .then(() => toast.success("Sent!"))
                              .catch((err) => {
                                const msg = err.response?.data?.message || "";
                                toast.error(
                                  msg.includes("not connected")
                                    ? "Connect WhatsApp first"
                                    : "Failed to send",
                                );
                              })
                          }
                          className="btn btn-ghost p-2 btn-sm"
                          title="WhatsApp"
                        >
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                            className="w-4 h-4"
                            alt="WA"
                          />
                        </button>
                        <button
                          onClick={() => {
                            toast(
                              (t) => (
                                <div className="flex items-center gap-3">
                                  <p className="text-sm font-semibold">
                                    Delete {inv.invoiceNumber}?
                                  </p>
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        del(inv._id);
                                        toast.dismiss(t.id);
                                      }}
                                      className="px-3 py-1 bg-danger text-white text-xs font-bold rounded-lg"
                                    >
                                      Delete
                                    </button>
                                    <button
                                      onClick={() => toast.dismiss(t.id)}
                                      className="px-3 py-1 bg-gray-100 text-dark text-xs font-bold rounded-lg"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              ),
                              { duration: 5000 },
                            );
                          }}
                          className="btn btn-ghost p-2 btn-sm hover:text-danger"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
