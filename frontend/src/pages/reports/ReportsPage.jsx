import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, ShoppingBag, FileText, TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { reportAPI, saleAPI } from "../../services/api.js";
import { fmt } from "../../utils/helpers.js";
import dayjs from "dayjs";

const COLORS = [
  "#10B981",
  "#F59E0B",
  "#6C38FF",
  "#EF4444",
  "#94A3B8",
  "#9333EA",
];

export default function ReportsPage() {
  const [period, setPeriod] = useState("month");
  const [activeTab, setActiveTab] = useState("invoices");

  const { data, isLoading } = useQuery({
    queryKey: ["reports", period],
    queryFn: () => reportAPI.getRevenue({ period }).then((r) => r.data),
  });

  // Sales data for the period
  const now = dayjs();
  const month = now.month() + 1;
  const year = now.year();
  const { data: salesData } = useQuery({
    queryKey: ["sales-report", period],
    queryFn: () => saleAPI.getAll({ month, year }).then((r) => r.data),
  });

  const sales = salesData?.sales || [];
  const monthlyHistory = salesData?.monthlyHistory || [];
  const totalSalesRev = salesData?.totalRevenue || 0;
  const monthSalesRev = salesData?.monthRevenue || 0;

  // Sales by status
  const paidSales = sales.filter((s) => s.status === "paid").length;
  const partialSales = sales.filter((s) => s.status === "partial").length;
  const pendingSales = sales.filter((s) => s.status === "pending").length;
  const refundedSales = sales.filter((s) => s.status === "refunded").length;

  const pieData = [
    { name: "Paid", value: data?.paid || 0 },
    { name: "Partial", value: data?.partial || 0 },
    { name: "Pending", value: data?.pending || 0 },
    { name: "Overdue", value: data?.overdue || 0 },
    { name: "Failed", value: data?.failed || 0 },
    { name: "Draft", value: data?.draft || 0 },
    { name: "Refunded", value: data?.refunded || 0 },
  ].filter((d) => d.value > 0);

  const salesPieData = [
    { name: "Paid", value: paidSales },
    { name: "Partial", value: partialSales },
    { name: "Pending", value: pendingSales },
    { name: "Refunded", value: refundedSales },
  ].filter((d) => d.value > 0);

  const INVOICE_STATS = [
    {
      label: "Total Received",
      value: fmt.naira(data?.totalRevenue || 0),
      color: "text-primary",
    },
    {
      label: "Fully Paid",
      value: fmt.naira(data?.paidAmount || 0),
      color: "text-success",
    },
    {
      label: "Partial Paid",
      value: fmt.naira(data?.partialAmount || 0),
      color: "text-warning",
    },
    {
      label: "Pending",
      value: fmt.naira(data?.pendingAmount || 0),
      color: "text-dark-400",
    },
    {
      label: "Overdue",
      value: fmt.naira(data?.overdueAmount || 0),
      color: "text-danger",
    },
    {
      label: "Refunded",
      value: fmt.naira(data?.refundedAmount || 0),
      color: "text-danger",
    },
    {
      label: "Failed/Reversed",
      value: fmt.naira(data?.failedAmount || 0),
      color: "text-purple-600",
    },
  ];

  const SALES_STATS = [
    {
      label: "Total Sales Revenue",
      value: fmt.naira(totalSalesRev),
      color: "text-primary",
    },
    {
      label: "This Month",
      value: fmt.naira(monthSalesRev),
      color: "text-success",
    },
    { label: "Total Sales", value: String(sales.length), color: "text-dark" },
    { label: "Paid Sales", value: String(paidSales), color: "text-success" },
    {
      label: "Pending Sales",
      value: String(pendingSales),
      color: "text-warning",
    },
    { label: "Refunded", value: String(refundedSales), color: "text-danger" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h1 className="page-title whitespace-nowrap">Reports</h1>
        <div className="flex gap-2 flex-shrink-0">
          {["week", "month", "year"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`btn btn-sm capitalize flex-1 sm:flex-none
                ${period === p ? "btn-primary" : "btn-ghost border border-dark-200 dark:border-gray-700"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Combined revenue summary */}
      <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
            <TrendingUp size={18} className="text-primary" />
          </div>
          <div>
            <p className="font-bold text-dark dark:text-white">Total Revenue</p>
            <p className="text-xs text-dark-400">Invoices + Quick Sales</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white dark:bg-surface rounded-xl p-3 text-center">
            <p
              className="text-lg font-black text-success truncate"
              style={{ fontSize: "clamp(11px,3.5vw,18px)" }}
            >
              {fmt.naira((data?.totalRevenue || 0) + totalSalesRev)}
            </p>
            <p className="text-xs text-dark-400">Combined</p>
          </div>
          <div className="bg-white dark:bg-surface rounded-xl p-3 text-center">
            <p
              className="text-lg font-black text-primary truncate"
              style={{ fontSize: "clamp(11px,3.5vw,18px)" }}
            >
              {fmt.naira(data?.totalRevenue || 0)}
            </p>
            <p className="text-xs text-dark-400">Invoices</p>
          </div>
          <div className="bg-white dark:bg-surface rounded-xl p-3 text-center">
            <p
              className="text-lg font-black text-warning truncate"
              style={{ fontSize: "clamp(11px,3.5vw,18px)" }}
            >
              {fmt.naira(totalSalesRev)}
            </p>
            <p className="text-xs text-dark-400">Sales</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { key: "invoices", label: "📄 Invoices", icon: FileText },
          { key: "sales", label: "🛍️ Sales", icon: ShoppingBag },
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

      {/* INVOICES TAB  */}
      {activeTab === "invoices" && (
        <div className="space-y-5">
          {/* Invoice Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {INVOICE_STATS.map((s, i) => (
              <div key={i} className="card text-center rounded-3xl py-4">
                <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-dark-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Revenue trend */}
          <div className="card">
            <h2 className="font-semibold text-dark dark:text-white mb-4">
              Revenue Trend
            </h2>
            {isLoading ? (
              <div className="skeleton h-48 rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    stroke="#94A3B8"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
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
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6C38FF"
                    strokeWidth={2.5}
                    dot={{ fill: "#6C38FF", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Invoice overview pie */}
          <div className="card">
            <h2 className="font-semibold text-dark dark:text-white mb-4">
              Invoice Overview
            </h2>
            {pieData.length === 0 ? (
              <p className="text-center text-dark-400 text-sm py-8">
                No invoice data yet
              </p>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v} invoices`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 w-full sm:w-auto flex-shrink-0">
                  {pieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[i] }}
                      />
                      <span className="text-dark dark:text-white font-medium">
                        {d.name}
                      </span>
                      <span className="text-dark-400 ml-auto pl-4">
                        {d.value} invoice{d.value !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SALES TAB*/}
      {activeTab === "sales" && (
        <div className="space-y-5">
          {/* Sales stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {SALES_STATS.map((s, i) => (
              <div key={i} className="card text-center rounded-3xl py-4">
                <p className={`text-lg font-black ${s.color} dark:text-white`}>
                  {s.value}
                </p>
                <p className="text-xs text-dark-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Sales monthly bar chart */}
          <div className="card">
            <h2 className="font-semibold text-dark dark:text-white mb-4">
              Sales Revenue — Last 12 Months
            </h2>
            {monthlyHistory.some((m) => m.amount > 0) ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
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
                  <Bar dataKey="amount" fill="#6C38FF" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-dark-400 text-sm py-8">
                No sales data yet
              </p>
            )}
          </div>

          {/* Sales pie */}
          {salesPieData.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-dark dark:text-white mb-4">
                Sales Overview
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={salesPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {salesPieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => `${v} sales`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2 w-full sm:w-auto flex-shrink-0">
                  {salesPieData.map((d, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: COLORS[i] }}
                      />
                      <span className="text-dark dark:text-white font-medium">
                        {d.name}
                      </span>
                      <span className="text-dark-400 ml-auto pl-4">
                        {d.value} sale{d.value !== 1 ? "s" : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Recent sales list */}
          {sales.length > 0 && (
            <div className="card p-0 overflow-hidden">
              <div className="p-4 border-b border-dark-100 dark:border-gray-700">
                <h2 className="font-semibold text-dark dark:text-white">
                  Recent Sales
                </h2>
              </div>
              <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
                {sales.slice(0, 10).map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-dark dark:text-white">
                        {s.saleNumber}
                      </p>
                      <p className="text-xs text-dark-400">
                        {s.customerName} ·{" "}
                        {dayjs(s.createdAt).format("D MMM YYYY")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-dark dark:text-white">
                        {fmt.naira(s.totalAmount)}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          s.status === "paid"
                            ? "bg-success-light text-success"
                            : s.status === "partial"
                              ? "bg-warning-light text-warning"
                              : s.status === "refunded"
                                ? "bg-gray-100 text-dark-400"
                                : "bg-primary-light text-primary"
                        }`}
                      >
                        {s.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Export */}
      <button
        onClick={() =>
          reportAPI
            .export({ period })
            .then((r) => {
              const url = URL.createObjectURL(r.data);
              const a = document.createElement("a");
              a.href = url;
              a.download = `trackeet-report-${period}.pdf`;
              a.click();
            })
            .catch(() => {})
        }
        className="btn btn-secondary w-full pb-6"
      >
        <Download size={16} /> Export Report PDF
      </button>
    </div>
  );
}
