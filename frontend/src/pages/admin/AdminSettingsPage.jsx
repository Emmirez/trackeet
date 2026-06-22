import { useState, useEffect } from "react";
import {
  Shield,
  Settings,
  AlertTriangle,
  Users,
  Database,
  Mail,
  Trash2,
  RefreshCw,
  CreditCard,
  BarChart3,
  ExternalLink,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthStore from "../../store/authStore.js";
import { adminAPI } from "../../services/api.js";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const { user } = useAuthStore();
  const isSuperAdmin = user?.role === "superadmin";
  const qc = useQueryClient();

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [newRegistrations, setNewRegistrations] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [freeInvoiceLimit, setFreeInvoiceLimit] = useState(5);
  const [freeCustomerLimit, setFreeCustomerLimit] = useState(10);
  const [gateways, setGateways] = useState({
    paystack: true,
    flutterwave: true,
    bankTransfer: true,
  });
  const [supportEmail, setSupportEmail] = useState("support@trackeet.ng");
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("587");
  const [smtpUser, setSmtpUser] = useState("");

  const [confirmAction, setConfirmAction] = useState(null);

  const { data: settingsData } = useQuery({
    queryKey: ["platform-settings"],
    queryFn: () => adminAPI.getPlatformSettings().then((r) => r.data),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminAPI.getStats().then((r) => r.data),
  });

  useEffect(() => {
    if (settingsData?.settings) {
      const s = settingsData.settings;
      setMaintenanceMode(s.maintenanceMode);
      setNewRegistrations(s.allowRegistrations);
      setEmailNotifs(s.emailNotifications);
      setFreeInvoiceLimit(s.freeInvoiceLimit);
      setFreeCustomerLimit(s.freeCustomerLimit);
      setGateways(
        s.gateways || { paystack: true, flutterwave: true, bankTransfer: true },
      );
      setSupportEmail(s.supportEmail || "support@trackeet.ng");
      setSmtpHost(s.smtpHost || "");
      setSmtpPort(s.smtpPort || "587");
      setSmtpUser(s.smtpUser || "");
    }
  }, [settingsData]);

  const { mutate: saveSettings, isPending } = useMutation({
    mutationFn: (data) => adminAPI.updatePlatformSettings(data),
    onSuccess: () => {
      toast.success("Settings saved!");
      qc.invalidateQueries(["platform-settings"]);
    },
    onError: () => toast.error("Failed to save settings"),
  });

  const handleSaveControls = () => {
    saveSettings({
      maintenanceMode,
      allowRegistrations: newRegistrations,
      emailNotifications: emailNotifs,
    });
  };

  const handleSaveLimits = () => {
    saveSettings({
      freeInvoiceLimit: Number(freeInvoiceLimit),
      freeCustomerLimit: Number(freeCustomerLimit),
    });
  };

  const handleSaveEmail = () => {
    saveSettings({ supportEmail, smtpHost, smtpPort, smtpUser });
  };

  const handleSaveGateways = () => {
    saveSettings({ gateways });
  };

  const { mutate: clearLogs, isPending: clearingLogs } = useMutation({
    mutationFn: () => adminAPI.clearAuditLogs(),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setConfirmAction(null);
    },
    onError: () => toast.error("Failed to clear logs"),
  });

  const { mutate: resetWhatsApp, isPending: resettingWA } = useMutation({
    mutationFn: () => adminAPI.resetWhatsAppSessions(),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setConfirmAction(null);
    },
    onError: () => toast.error("Failed to reset WhatsApp sessions"),
  });

  const Toggle = ({ value, onChange, disabled }) => (
    <button
      onClick={() => !disabled && onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-colors flex-shrink-0 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } ${value ? "bg-primary" : "bg-dark-200 dark:bg-gray-600"}`}
    >
      <div
        className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
          value ? "translate-x-7" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title">Platform Settings</h1>
        <p className="text-sm text-dark-400">
          Only superadmins can change platform-wide settings
        </p>
      </div>

      {!isSuperAdmin && (
        <div className="card bg-warning-light border border-warning/20 flex items-center gap-3">
          <AlertTriangle size={20} className="text-warning flex-shrink-0" />
          <p className="text-sm text-warning font-medium">
            You need Superadmin access to modify platform settings.
          </p>
        </div>
      )}

      {/* Platform stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Users",
            value: stats?.stats?.totalUsers || 0,
            color: "text-primary",
          },
          {
            label: "Active Subs",
            value: stats?.stats?.activeSubs || 0,
            color: "text-success",
          },
          {
            label: "Total Invoices",
            value: stats?.stats?.totalInvoices || 0,
            color: "text-warning",
          },
          {
            label: "Open Tickets",
            value: stats?.stats?.openTickets || 0,
            color: "text-danger",
          },
        ].map((s, i) => (
          <div key={i} className="card text-center py-4">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-dark-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Platform controls */}
      <div
        className={`card space-y-4 ${!isSuperAdmin ? "opacity-50 pointer-events-none" : ""}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-danger-light rounded-xl flex items-center justify-center">
            <Shield size={18} className="text-danger" />
          </div>
          <div>
            <h2 className="font-bold text-dark dark:text-white">
              Platform Controls
            </h2>
            <p className="text-xs text-dark-400">Superadmin only</p>
          </div>
        </div>

        {[
          {
            label: "Maintenance Mode",
            desc: "Temporarily disable user access to the platform",
            value: maintenanceMode,
            onChange: setMaintenanceMode,
            danger: true,
          },
          {
            label: "New Registrations",
            desc: "Allow new users to create accounts",
            value: newRegistrations,
            onChange: setNewRegistrations,
          },
          {
            label: "Email Notifications",
            desc: "Send system emails to users",
            value: emailNotifs,
            onChange: setEmailNotifs,
          },
        ].map((ctrl, i) => (
          <div
            key={i}
            className={`flex items-center justify-between p-4 rounded-xl border ${
              ctrl.danger && ctrl.value
                ? "bg-danger-light border-danger/20"
                : "bg-gray-50 dark:bg-dark border-transparent"
            }`}
          >
            <div>
              <p
                className={`text-sm font-semibold ${ctrl.danger && ctrl.value ? "text-danger" : "text-dark dark:text-white"}`}
              >
                {ctrl.label}
              </p>
              <p className="text-xs text-dark-400">{ctrl.desc}</p>
            </div>
            <Toggle value={ctrl.value} onChange={ctrl.onChange} />
          </div>
        ))}

        <button
          onClick={handleSaveControls}
          disabled={isPending}
          className="btn btn-primary w-full"
        >
          {isPending ? "Saving..." : "Save Controls"}
        </button>
      </div>

      {/* Plan Limits */}
      {isSuperAdmin && (
        <div className="card space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-warning-light rounded-xl flex items-center justify-center">
              <Users size={18} className="text-warning" />
            </div>
            <div>
              <h2 className="font-bold text-dark dark:text-white">
                Free Plan Limits
              </h2>
              <p className="text-xs text-dark-400">
                Set limits for free tier users
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Invoice Limit</label>
              <input
                type="number"
                value={freeInvoiceLimit}
                onChange={(e) => setFreeInvoiceLimit(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">Customer Limit</label>
              <input
                type="number"
                value={freeCustomerLimit}
                onChange={(e) => setFreeCustomerLimit(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <button
            onClick={handleSaveLimits}
            disabled={isPending}
            className="btn btn-primary w-full"
          >
            {isPending ? "Saving..." : "Save Limits"}
          </button>
        </div>
      )}

      {/* Payment Gateways */}
      {isSuperAdmin && (
        <div className="card space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-success-light rounded-xl flex items-center justify-center">
              <CreditCard size={18} className="text-success" />
            </div>
            <div>
              <h2 className="font-bold text-dark dark:text-white">
                Payment Gateways
              </h2>
              <p className="text-xs text-dark-400">
                Enable or disable payment methods
              </p>
            </div>
          </div>
          {[
            { key: "paystack", label: "Paystack" },
            { key: "flutterwave", label: "Flutterwave" },
            { key: "bankTransfer", label: "Bank Transfer" },
          ].map((gw) => (
            <div
              key={gw.key}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark rounded-xl"
            >
              <p className="text-sm font-medium text-dark dark:text-white">
                {gw.label}
              </p>
              <Toggle
                value={gateways[gw.key]}
                onChange={(v) => setGateways((p) => ({ ...p, [gw.key]: v }))}
              />
            </div>
          ))}
          <button
            onClick={handleSaveGateways}
            disabled={isPending}
            className="btn btn-primary w-full"
          >
            {isPending ? "Saving..." : "Save Gateways"}
          </button>
        </div>
      )}

      {/* Email Config */}
      {isSuperAdmin && (
        <div className="card space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
              <Mail size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-dark dark:text-white">
                Email Configuration
              </h2>
              <p className="text-xs text-dark-400">
                SMTP settings for system emails
              </p>
            </div>
          </div>
          <div>
            <label className="label">Support Email</label>
            <input
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              placeholder="support@trackeet.ng"
              className="input"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">SMTP Host</label>
              <input
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                placeholder="smtp.zoho.com"
                className="input"
              />
            </div>
            <div>
              <label className="label">SMTP Port</label>
              <input
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                placeholder="587"
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">SMTP User</label>
            <input
              value={smtpUser}
              onChange={(e) => setSmtpUser(e.target.value)}
              placeholder="noreply@trackeet.ng"
              className="input"
            />
          </div>
          <button
            onClick={handleSaveEmail}
            disabled={isPending}
            className="btn btn-primary w-full"
          >
            {isPending ? "Saving..." : "Save Email Config"}
          </button>
        </div>
      )}

      {/* Danger zone */}
      {isSuperAdmin && (
        <div className="card border border-danger/20 space-y-3">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-danger-light rounded-xl flex items-center justify-center">
              <Trash2 size={18} className="text-danger" />
            </div>
            <div>
              <h2 className="font-bold text-danger">Danger Zone</h2>
              <p className="text-xs text-dark-400">
                Irreversible actions — use with caution
              </p>
            </div>
          </div>
          <button
            onClick={() => setConfirmAction("clear-logs")}
            className="w-full p-3 rounded-xl border border-danger/30 text-danger text-sm font-semibold hover:bg-danger-light transition-all text-left flex items-center gap-3"
          >
            <Database size={16} />
            <div>
              <p>Clear all audit logs older than 90 days</p>
              <p className="text-xs font-normal text-dark-400">
                Permanently deletes old activity and admin logs
              </p>
            </div>
          </button>
          <button
            onClick={() => setConfirmAction("reset-whatsapp")}
            className="w-full p-3 rounded-xl border border-danger/30 text-danger text-sm font-semibold hover:bg-danger-light transition-all text-left flex items-center gap-3"
          >
            <RefreshCw size={16} />
            <div>
              <p>Reset all WhatsApp sessions</p>
              <p className="text-xs font-normal text-dark-400">
                Disconnects all users from WhatsApp — they'll need to reconnect
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Confirm modal */}
      {confirmAction && (
        <div className="modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 text-center space-y-3">
              <div className="w-14 h-14 bg-danger-light rounded-2xl flex items-center justify-center mx-auto">
                {confirmAction === "clear-logs" ? (
                  <Database size={24} className="text-danger" />
                ) : (
                  <RefreshCw size={24} className="text-danger" />
                )}
              </div>
              <h3 className="font-black text-dark dark:text-white text-lg">
                Are you sure?
              </h3>
              <p className="text-sm text-dark-400">
                {confirmAction === "clear-logs"
                  ? "This will permanently delete all audit logs and activity logs older than 90 days. This cannot be undone."
                  : "This will disconnect all users from WhatsApp. They will need to scan the QR code again to reconnect."}
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (confirmAction === "clear-logs") clearLogs();
                    else resetWhatsApp();
                  }}
                  disabled={clearingLogs || resettingWA}
                  className="btn bg-danger text-white hover:bg-danger/90 flex-1"
                >
                  {clearingLogs || resettingWA
                    ? "Processing..."
                    : "Yes, Proceed"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Platform info */}
      <div className="card space-y-3">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
            <Settings size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-dark dark:text-white">
              Platform Info
            </h2>
            <p className="text-xs text-dark-400">Read-only platform details</p>
          </div>
        </div>
        {[
          { label: "Platform Name", value: "Trackeet" },
          { label: "Version", value: "1.0.0" },
          { label: "Environment", value: import.meta.env.MODE || "production" },
          { label: "Your Role", value: user?.role },
          { label: "Your Email", value: user?.email },
          { label: "Support Email", value: supportEmail },
          { label: "Website", value: "trackeet.ng" },
        ].map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark rounded-xl"
          >
            <span className="text-sm text-dark-400">{r.label}</span>
            <span className="font-semibold text-sm text-dark dark:text-white capitalize">
              {r.value}
            </span>
          </div>
        ))}

        {/* Analytics link */}

        <a
          href="https://analytics.google.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-between p-3 bg-primary-light rounded-xl hover:bg-primary/20 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-primary" />
            <span className="text-sm font-semibold text-primary">
              View Website Analytics
            </span>
          </div>
          <ExternalLink size={14} className="text-primary" />
        </a>
      </div>
    </div>
  );
}
