import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Shield,
  Activity,
  Search,
  Filter,
  FileText,
  Users,
  CreditCard,
  Settings,
  ShoppingBag,
  MessageSquare,
  Package,
} from "lucide-react";
import { adminAPI } from "../../services/api.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(relativeTime);

const ENTITY_CONFIG = {
  invoice: { icon: FileText, color: "text-primary", bg: "bg-primary-light" },
  customer: { icon: Users, color: "text-success", bg: "bg-success-light" },
  payment: { icon: CreditCard, color: "text-warning", bg: "bg-warning-light" },
  sale: { icon: ShoppingBag, color: "text-purple-600", bg: "bg-purple-100" },
  product: { icon: Package, color: "text-orange-600", bg: "bg-orange-100" },
  team: { icon: Users, color: "text-info", bg: "bg-info-light" },
  settings: { icon: Settings, color: "text-dark-400", bg: "bg-gray-100" },
  whatsapp: {
    icon: MessageSquare,
    color: "text-success",
    bg: "bg-success-light",
  },
};

const ENTITIES = [
  { value: "", label: "All" },
  { value: "invoice", label: "Invoices" },
  { value: "customer", label: "Customers" },
  { value: "payment", label: "Payments" },
  { value: "sale", label: "Sales" },
  { value: "product", label: "Products" },
  { value: "team", label: "Team" },
  { value: "settings", label: "Settings" },
];

export default function AdminAuditLogsPage() {
  const [tab, setTab] = useState("activity");
  const [search, setSearch] = useState("");
  const [entity, setEntity] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-audit-logs", tab, search, entity, page],
    queryFn: () =>
      adminAPI
        .getLogs({
          type: tab,
          search,
          entity,
          page,
          limit: 50,
        })
        .then((r) => r.data),
  });

  const logs = data?.logs || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 50);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Audit Logs</h1>
        <p className="text-sm text-dark-400">
          Track all actions across the platform
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { key: "activity", label: "🔄 User Activity", icon: Activity },
          { key: "admin", label: "🛡️ Admin Actions", icon: Shield },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setPage(1);
            }}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key
                ? "bg-white dark:bg-surface text-dark dark:text-white shadow-sm"
                : "text-dark-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search actions, users..."
            className="input pl-10"
          />
        </div>
        {tab === "activity" && (
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {ENTITIES.map((e) => (
              <button
                key={e.value}
                onClick={() => {
                  setEntity(e.value);
                  setPage(1);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all ${
                  entity === e.value
                    ? "bg-primary text-white border-primary"
                    : "bg-white dark:bg-surface text-dark-400 border-dark-200 dark:border-gray-700"
                }`}
              >
                {e.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Logs", value: total },
          { label: "This Page", value: logs.length },
          { label: "Page", value: `${page} of ${totalPages || 1}` },
        ].map((s, i) => (
          <div key={i} className="card text-center py-3">
            <p className="text-lg font-black text-primary">{s.value}</p>
            <p className="text-xs text-dark-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Logs list */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state py-16">
            <Activity size={40} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No logs found
            </p>
            <p className="text-dark-400 text-sm">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {logs.map((log, i) => {
              const config = ENTITY_CONFIG[log.entity] || {
                icon: Activity,
                color: "text-dark-400",
                bg: "bg-gray-100",
              };
              const Icon = config.icon;

              return (
                <div
                  key={log._id || i}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
                >
                  <div
                    className={`w-8 h-8 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}
                  >
                    <Icon size={14} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-dark dark:text-white">
                        {tab === "activity"
                          ? log.userName ||
                            `${log.user?.firstName} ${log.user?.lastName}`
                          : `${log.user?.firstName} ${log.user?.lastName}`}
                      </p>
                      {tab === "activity" &&
                        log.role &&
                        log.role !== "owner" && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-warning-light text-warning capitalize">
                            {log.role}
                          </span>
                        )}
                      {log.entity && (
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full capitalize ${config.bg} ${config.color}`}
                        >
                          {log.entity}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-dark-500 dark:text-gray-400 mt-0.5">
                      {log.action}
                      {log.details ? ` — ${log.details}` : ""}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-[10px] text-dark-300">
                        {dayjs(log.createdAt).format("D MMM YYYY h:mm A")}
                      </p>
                      <p className="text-[10px] text-dark-300">
                        {dayjs(log.createdAt).fromNow()}
                      </p>
                      {log.ip && (
                        <p className="text-[10px] text-dark-300">
                          IP: {log.ip}
                        </p>
                      )}
                      {tab === "activity" && log.owner?.businessName && (
                        <p className="text-[10px] text-dark-300">
                          {log.owner.businessName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary btn-sm"
          >
            Previous
          </button>
          <span className="text-sm text-dark-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-secondary btn-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
