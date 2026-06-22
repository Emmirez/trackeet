import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  FileText,
  Users,
  CreditCard,
  Settings,
  UserCog,
  Trash2,
  Filter,
  ShoppingBag,
} from "lucide-react";
import { activityAPI } from "../../services/api.js";
import { getInitials, avatarColor } from "../../utils/helpers.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

const ENTITY_ICONS = {
  invoice: { icon: FileText, color: "text-primary", bg: "bg-primary-light" },
  customer: { icon: Users, color: "text-success", bg: "bg-success-light" },
  payment: { icon: CreditCard, color: "text-warning", bg: "bg-warning-light" },
  team: { icon: UserCog, color: "text-purple-500", bg: "bg-purple-100" },
  settings: { icon: Settings, color: "text-dark-400", bg: "bg-gray-100" },
  sale: { icon: ShoppingBag, color: "text-primary", bg: "bg-primary-light" },
};

const ACTION_COLORS = {
  "Created invoice": "text-primary",
  "Marked invoice paid": "text-success",
  "Deleted invoice": "text-danger",
  "Added customer": "text-success",
  "Deleted customer": "text-danger",
  "Invited team member": "text-primary",
  "Removed team member": "text-danger",
  "Updated settings": "text-warning",
  "Created sale": "text-primary",
  "Recorded sale payment": "text-success",
  "Refunded sale": "text-danger",
};

const FILTERS = [
  "All",
  "invoice",
  "sale",
  "customer",
  "payment",
  "team",
  "settings",
];

export default function ActivityPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState("All");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["activity", filter, page],
    queryFn: () =>
      activityAPI
        .getLogs({
          entity: filter === "All" ? undefined : filter,
          page,
          limit: 30,
        })
        .then((r) => r.data),
  });

  const { mutate: clearLogs } = useMutation({
    mutationFn: activityAPI.clearLogs,
    onSuccess: () => {
      toast.success("Activity logs cleared");
      qc.invalidateQueries(["activity"]);
    },
  });

  const handleClear = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Clear all activity logs?</p>
          <p className="text-xs text-dark-400">This cannot be undone.</p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                clearLogs();
                toast.dismiss(t.id);
              }}
              className="px-3 py-1 bg-danger text-white text-xs font-bold rounded-lg"
            >
              Clear All
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
      { duration: 6000 },
    );
  };

  const logs = data?.logs || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title"></h1>
          <p className="text-dark-700 text-sm">
            Track every action in your account
          </p>
        </div>
        {logs.length > 0 && (
          <button
            onClick={handleClear}
            className="btn btn-ghost flex-shrink-0 btn-sm text-danger border border-danger/20"
          >
            <Trash2 size={14} /> Clear Logs
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setPage(1);
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize
              ${filter === f ? "bg-white dark:bg-surface text-dark dark:text-white shadow-sm" : "text-dark-400"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Actions", value: total, color: "text-primary" },
          {
            label: "Invoices",
            value: logs.filter((l) => l.entity === "invoice").length,
            color: "text-primary",
          },
          {
            label: "Customers",
            value: logs.filter((l) => l.entity === "customer").length,
            color: "text-success",
          },
          {
            label: "Sales",
            value: logs.filter((l) => l.entity === "sale").length,
            color: "text-primary",
          },
          {
            label: "Team Actions",
            value: logs.filter((l) => l.entity === "team").length,
            color: "text-purple-500",
          },
        ].map((s, i) => (
          <div key={i} className="card py-3">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-dark-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Logs */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="empty-state p-10">
            <Activity size={48} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No activity yet
            </p>
            <p className="text-dark-400 text-sm">
              Actions will appear here as you use Trackeet
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {logs.map((log, i) => {
              const entityConfig =
                ENTITY_ICONS[log.entity] || ENTITY_ICONS.settings;
              const EntityIcon = entityConfig.icon;
              const actionColor =
                ACTION_COLORS[log.action] || "text-dark dark:text-white";
              const userName = log.user
                ? `${log.user.firstName} ${log.user.lastName}`
                : log.userName || "Unknown";

              return (
                <div
                  key={i}
                  className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
                >
                  {/* Entity icon */}
                  <div
                    className={`w-9 h-9 ${entityConfig.bg} rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5`}
                  >
                    <EntityIcon size={15} className={entityConfig.color} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className={`text-sm font-semibold ${actionColor}`}>
                        {log.action}
                      </p>
                      {log.role && log.role !== "owner" && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-light text-primary capitalize">
                          {log.role}
                        </span>
                      )}
                    </div>
                    {log.details && (
                      <p className="text-xs text-dark-400 mt-0.5 truncate">
                        {log.details}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className={`avatar w-5 h-5 text-[8px] ${avatarColor(userName)}`}
                      >
                        {getInitials(userName)}
                      </div>
                      <p className="text-xs text-dark-400">{userName}</p>
                      <span className="text-dark-200">·</span>
                      <p className="text-xs text-dark-400">
                        {dayjs(log.createdAt).fromNow()}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <p className="text-xs text-dark-300 flex-shrink-0">
                    {dayjs(log.createdAt).format("D MMM, h:mm A")}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {total > 30 && (
          <div className="flex items-center justify-between p-4 border-t border-dark-100 dark:border-gray-700">
            <p className="text-xs text-dark-400">
              Showing {Math.min(page * 30, total)} of {total}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-ghost btn-sm"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 30 >= total}
                className="btn btn-ghost btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
