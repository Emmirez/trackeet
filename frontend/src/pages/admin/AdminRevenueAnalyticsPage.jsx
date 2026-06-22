import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  TrendingDown,
  Users,
  CreditCard,
  BarChart3,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { adminAPI } from "../../services/api.js";

const fmt = (n) => "₦" + (n || 0).toLocaleString("en-NG");

const PLAN_COLORS = {
  free: "#94A3B8",
  starter: "#6C38FF",
  business: "#10B981",
  enterprise: "#9333EA",
};

const CHART_COLORS = ["#6C38FF", "#10B981", "#F59E0B", "#EF4444", "#9333EA"];

export default function AdminRevenueAnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-revenue-analytics"],
    queryFn: () => adminAPI.getRevenueAnalytics().then((r) => r.data),
  });

  const planPieData = data
    ? [
        {
          name: "Free",
          value: data.planBreakdown?.free || 0,
          color: PLAN_COLORS.free,
        },
        {
          name: "Starter",
          value: data.planBreakdown?.starter || 0,
          color: PLAN_COLORS.starter,
        },
        {
          name: "Business",
          value: data.planBreakdown?.business || 0,
          color: PLAN_COLORS.business,
        },
        {
          name: "Enterprise",
          value: data.planBreakdown?.enterprise || 0,
          color: PLAN_COLORS.enterprise,
        },
      ].filter((d) => d.value > 0)
    : [];

  const revenuePieData = data
    ? [
        {
          name: "Starter",
          value: data.revenueByPlan?.starter || 0,
          color: PLAN_COLORS.starter,
        },
        {
          name: "Business",
          value: data.revenueByPlan?.business || 0,
          color: PLAN_COLORS.business,
        },
        {
          name: "Enterprise",
          value: data.revenueByPlan?.enterprise || 0,
          color: PLAN_COLORS.enterprise,
        },
      ].filter((d) => d.value > 0)
    : [];

  if (isLoading)
    return (
      <div className="space-y-5 animate-fade-in">
        <div className="skeleton h-10 w-48 rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
        <div className="skeleton h-64 rounded-2xl" />
        <div className="skeleton h-64 rounded-2xl" />
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Revenue Analytics</h1>
        <p className="text-sm text-dark-400">
          MRR, plan breakdown and growth metrics
        </p>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Revenue",
            value: fmt(data?.totalRevenue || 0),
            icon: CreditCard,
            color: "text-success",
            bg: "bg-success-light",
            sub: "All time",
          },
          {
            label: "Monthly Growth",
            value: `${data?.growthRate > 0 ? "+" : ""}${data?.growthRate || 0}%`,
            icon: data?.growthRate >= 0 ? TrendingUp : TrendingDown,
            color: data?.growthRate >= 0 ? "text-success" : "text-danger",
            bg: data?.growthRate >= 0 ? "bg-success-light" : "bg-danger-light",
            sub: "vs last month",
          },
          {
            label: "Paid Users",
            value: data?.paidUsers || 0,
            icon: Users,
            color: "text-primary",
            bg: "bg-primary-light",
            sub: `${data?.conversionRate || 0}% conversion`,
          },
          {
            label: "ARPU",
            value: fmt(data?.arpu || 0),
            icon: BarChart3,
            color: "text-warning",
            bg: "bg-warning-light",
            sub: "Avg revenue per user",
          },
        ].map((s, i) => (
          <div key={i} className="card py-4">
            <div className="flex items-center gap-3 mb-2">
              <div
                className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
              >
                <s.icon size={16} className={s.color} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-dark-400">{s.label}</p>
                <p className={`text-lg font-black ${s.color} truncate`}>
                  {s.value}
                </p>
              </div>
            </div>
            <p className="text-[10px] text-dark-300 pl-12">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* MRR Chart */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center">
            <TrendingUp size={16} className="text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-dark dark:text-white">
              Monthly Revenue
            </h2>
            <p className="text-xs text-dark-400">
              Last 12 months subscription revenue
            </p>
          </div>
        </div>
        {(data?.mrrHistory || []).some((m) => m.revenue > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data?.mrrHistory || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94A3B8" />
              <YAxis
                tick={{ fontSize: 10 }}
                stroke="#94A3B8"
                tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                formatter={(v) => fmt(v)}
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
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center">
            <p className="text-dark-400 text-sm">No revenue data yet</p>
          </div>
        )}
      </div>

      {/* User Growth Chart */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-success-light rounded-xl flex items-center justify-center">
            <Users size={16} className="text-success" />
          </div>
          <div>
            <h2 className="font-bold text-dark dark:text-white">User Growth</h2>
            <p className="text-xs text-dark-400">
              New signups per month — last 12 months
            </p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={data?.userGrowth || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} stroke="#94A3B8" />
            <YAxis tick={{ fontSize: 10 }} stroke="#94A3B8" />
            <Tooltip
              contentStyle={{
                borderRadius: "12px",
                border: "none",
                boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
              }}
            />
            <Bar
              dataKey="users"
              fill="#10B981"
              radius={[6, 6, 0, 0]}
              name="New Users"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Plan breakdown + Revenue by plan */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Plan breakdown pie */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center">
              <PieIcon size={16} className="text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-dark dark:text-white">
                Users by Plan
              </h2>
              <p className="text-xs text-dark-400">
                Distribution across all plans
              </p>
            </div>
          </div>
          {planPieData.length > 0 ? (
            <div className="flex flex-col items-center gap-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={planPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {planPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => `${v} users`} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-2">
                {planPieData.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-dark dark:text-white font-medium capitalize">
                        {d.name}
                      </span>
                    </div>
                    <span className="text-dark-400">{d.value} users</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-dark-400 text-sm">No user data yet</p>
            </div>
          )}
        </div>

        {/* Revenue by plan pie */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-warning-light rounded-xl flex items-center justify-center">
              <CreditCard size={16} className="text-warning" />
            </div>
            <div>
              <h2 className="font-bold text-dark dark:text-white">
                Revenue by Plan
              </h2>
              <p className="text-xs text-dark-400">
                Which plans generate most revenue
              </p>
            </div>
          </div>
          {revenuePieData.length > 0 ? (
            <div className="flex flex-col items-center gap-4">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={revenuePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {revenuePieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-2">
                {revenuePieData.map((d, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-dark dark:text-white font-medium capitalize">
                        {d.name}
                      </span>
                    </div>
                    <span className="text-dark-400">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-48 flex items-center justify-center">
              <p className="text-dark-400 text-sm">No revenue data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* MRR table */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-dark-100 dark:border-gray-700">
          <h3 className="font-bold text-dark dark:text-white">
            Monthly Breakdown
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-white/5 border-b border-dark-200 dark:border-gray-700">
              <tr>
                <th className="th">Month</th>
                <th className="th">Revenue</th>
                <th className="th">Subscriptions</th>
                <th className="th">Growth</th>
              </tr>
            </thead>
            <tbody>
              {(data?.mrrHistory || []).reverse().map((m, i, arr) => {
                const prev = arr[i + 1]?.revenue || 0;
                const growth =
                  prev > 0
                    ? Math.round(((m.revenue - prev) / prev) * 100)
                    : null;
                return (
                  <tr key={i} className="tr">
                    <td className="td font-semibold text-dark dark:text-white">
                      {m.month}
                    </td>
                    <td className="td font-bold text-primary">
                      {fmt(m.revenue)}
                    </td>
                    <td className="td text-dark-400">{m.count}</td>
                    <td className="td">
                      {growth !== null ? (
                        <span
                          className={`flex items-center gap-1 text-xs font-bold ${growth >= 0 ? "text-success" : "text-danger"}`}
                        >
                          {growth >= 0 ? (
                            <ArrowUpRight size={12} />
                          ) : (
                            <ArrowDownRight size={12} />
                          )}
                          {Math.abs(growth)}%
                        </span>
                      ) : (
                        <span className="text-xs text-dark-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
