import { useQuery } from "@tanstack/react-query";
import {
  Server,
  Database,
  MessageSquare,
  Mail,
  Cloud,
  CreditCard,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Cpu,
  MemoryStick,
} from "lucide-react";
import { adminAPI } from "../../services/api.js";
import dayjs from "dayjs";

const STATUS_CONFIG = {
  ok: {
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success-light",
    badge: "bg-success-light text-success",
    label: "Operational",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning-light",
    badge: "bg-warning-light text-warning",
    label: "Warning",
  },
  error: {
    icon: XCircle,
    color: "text-danger",
    bg: "bg-danger-light",
    badge: "bg-danger-light text-danger",
    label: "Down",
  },
};

const SERVICES = [
  {
    key: "server",
    label: "Server",
    icon: Server,
    description: "Node.js backend server",
  },
  {
    key: "mongodb",
    label: "MongoDB",
    icon: Database,
    description: "Database connection",
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: MessageSquare,
    description: "Active user sessions",
  },
  {
    key: "email",
    label: "Email (SMTP)",
    icon: Mail,
    description: "Transactional email",
  },
  {
    key: "cloudinary",
    label: "Cloudinary",
    icon: Cloud,
    description: "Image storage",
  },
  {
    key: "paystack",
    label: "Paystack",
    icon: CreditCard,
    description: "Payment gateway",
  },
];

export default function AdminSystemHealthPage() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["system-health"],
    queryFn: () => adminAPI.getSystemHealth().then((r) => r.data),
    refetchInterval: 30000,
  });

  const checks = data?.checks || {};
  const overall = data?.overall || "ok";
  const overallConfig = STATUS_CONFIG[overall];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title"></h1>
          <p className="text-sm text-dark-600">
            Real-time status of all platform services
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* Overall status banner */}
      <div
        className={`card flex items-center gap-4 border-2 ${
          overall === "ok"
            ? "border-success/20 bg-success-light"
            : overall === "warning"
              ? "border-warning/20 bg-warning-light"
              : "border-danger/20 bg-danger-light"
        }`}
      >
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${overallConfig.bg}`}
        >
          <overallConfig.icon size={24} className={overallConfig.color} />
        </div>
        <div className="flex-1">
          <p className={`font-black text-lg ${overallConfig.color}`}>
            {overall === "ok"
              ? "✅ All Systems Operational"
              : overall === "warning"
                ? "⚠️ Some Services Need Attention"
                : "🚨 System Issues Detected"}
          </p>
          <p className="text-xs text-dark-400">
            Last checked:{" "}
            {data?.timestamp
              ? dayjs(data.timestamp).format("D MMM YYYY h:mm:ss A")
              : "—"}
            {" · "}Auto-refreshes every 30 seconds
          </p>
        </div>
      </div>

      {/* Server stats */}
      {checks.server && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Uptime",
              value: checks.server.uptime,
              icon: Clock,
              color: "text-success",
              bg: "bg-success-light",
            },
            {
              label: "Node.js",
              value: checks.server.nodeVersion,
              icon: Server,
              color: "text-primary",
              bg: "bg-primary-light",
            },
            {
              label: "Memory Used",
              value: `${checks.server.memoryUsage} MB`,
              icon: Cpu,
              color: "text-warning",
              bg: "bg-warning-light",
            },
            {
              label: "Memory Total",
              value: `${checks.server.memoryTotal} MB`,
              icon: Cpu,
              color: "text-dark-400",
              bg: "bg-gray-100",
            },
          ].map((s, i) => (
            <div key={i} className="card text-center py-4">
              <div
                className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}
              >
                <s.icon size={16} className={s.color} />
              </div>
              <p className={`text-sm font-black ${s.color}`}>{s.value}</p>
              <p className="text-xs text-dark-400">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Services */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-dark-100 dark:border-gray-700">
          <h3 className="font-bold text-dark dark:text-white">Services</h3>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {SERVICES.map((service) => {
              const check = checks[service.key];
              if (!check) return null;
              const config = STATUS_CONFIG[check.status] || STATUS_CONFIG.ok;
              const StatusIcon = config.icon;

              return (
                <div
                  key={service.key}
                  className="flex items-center gap-4 px-4 py-4"
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}
                  >
                    <service.icon size={18} className={config.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-dark dark:text-white">
                        {service.label}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badge}`}
                      >
                        {config.label}
                      </span>
                      {check.responseTime && (
                        <span className="text-[10px] text-dark-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                          {check.responseTime}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-dark-400 mt-0.5">
                      {check.message}
                    </p>
                    {service.key === "whatsapp" &&
                      check.connected !== undefined && (
                        <div className="mt-1.5 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 w-32">
                          <div
                            className="bg-success rounded-full h-1.5 transition-all"
                            style={{
                              width:
                                check.total > 0
                                  ? `${(check.connected / check.total) * 100}%`
                                  : "0%",
                            }}
                          />
                        </div>
                      )}
                    {service.key === "server" && (
                      <div className="mt-1.5 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 w-32">
                        <div
                          className={`rounded-full h-1.5 transition-all ${
                            checks.server.memoryUsage /
                              checks.server.memoryTotal >
                            0.8
                              ? "bg-danger"
                              : checks.server.memoryUsage /
                                    checks.server.memoryTotal >
                                  0.6
                                ? "bg-warning"
                                : "bg-success"
                          }`}
                          style={{
                            width: `${(checks.server.memoryUsage / checks.server.memoryTotal) * 100}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <StatusIcon
                    size={20}
                    className={`${config.color} flex-shrink-0`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Environment info */}
      <div className="card space-y-2">
        <h3 className="font-bold text-dark dark:text-white mb-3">
          Environment
        </h3>
        {[
          {
            label: "Environment",
            value: process.env.NODE_ENV || "development",
          },
          { label: "Platform", value: checks.server?.platform || "—" },
          { label: "Node Version", value: checks.server?.nodeVersion || "—" },
          {
            label: "MongoDB",
            value:
              checks.mongodb?.status === "ok"
                ? "✅ Connected"
                : "❌ Disconnected",
          },
          {
            label: "Cloudinary",
            value:
              checks.cloudinary?.status === "ok"
                ? "✅ Configured"
                : "⚠️ Not configured",
          },
          {
            label: "Paystack",
            value:
              checks.paystack?.status === "ok"
                ? "✅ Configured"
                : "⚠️ Not configured",
          },
        ].map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark rounded-xl"
          >
            <span className="text-sm text-dark-400">{r.label}</span>
            <span className="text-sm font-semibold text-dark dark:text-white">
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
