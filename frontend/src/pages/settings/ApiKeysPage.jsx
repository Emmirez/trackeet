import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Key,
  Plus,
  Copy,
  Trash2,
  X,
  CheckCircle,
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
} from "lucide-react";
import { apiKeyAPI } from "../../services/api.js";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const PERMISSIONS = [
  { value: "invoices", label: "Invoices", desc: "Read and create invoices" },
  { value: "customers", label: "Customers", desc: "Read and manage customers" },
  { value: "payments", label: "Payments", desc: "Read payment records" },
  { value: "reports", label: "Reports", desc: "Access business reports" },
];

export default function ApiKeysPage() {
  const qc = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [keyName, setKeyName] = useState("");
  const [permissions, setPermissions] = useState([
    "invoices",
    "customers",
    "payments",
    "reports",
  ]);
  const [newKey, setNewKey] = useState(null);
  const [showKey, setShowKey] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => apiKeyAPI.getKeys().then((r) => r.data),
  });

  const { mutate: generate, isPending: generating } = useMutation({
    mutationFn: apiKeyAPI.generate,
    onSuccess: (res) => {
      toast.success("API key generated!");
      setNewKey(res.data.fullKey);
      setShowCreate(false);
      setKeyName("");
      setPermissions(["invoices", "customers", "payments", "reports"]);
      qc.invalidateQueries(["api-keys"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to generate key"),
  });

  const { mutate: revoke } = useMutation({
    mutationFn: apiKeyAPI.revoke,
    onSuccess: () => {
      toast.success("Key revoked");
      qc.invalidateQueries(["api-keys"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to revoke"),
  });

  const { mutate: deleteKey } = useMutation({
    mutationFn: apiKeyAPI.delete,
    onSuccess: () => {
      toast.success("Key deleted");
      qc.invalidateQueries(["api-keys"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to delete"),
  });

  const togglePermission = (perm) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const copyKey = (key) => {
    navigator.clipboard.writeText(key);
    toast.success("Copied to clipboard!");
  };

  const handleRevoke = (key) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Revoke "{key.name}"?</p>
          <p className="text-xs text-dark-400">
            Any app using this key will lose access immediately.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                revoke(key._id);
                toast.dismiss(t.id);
              }}
              className="px-3 py-1 bg-danger text-white text-xs font-bold rounded-lg"
            >
              Revoke
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

  const keys = data?.keys || [];

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      <div className="section-header">
        <div>
          <h1 className="page-title">API Keys</h1>
          <p className="text-dark-500 text-sm">
            Connect your apps and systems to Trackeet
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn btn-primary btn-sm flex-shrink-0"
        >
          <Plus size={16} /> Generate Key
        </button>
      </div>

      {/* New key display */}
      {newKey && (
        <div className="card border-2 border-success/30 bg-success-light/30">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle size={18} className="text-success" />
            <p className="font-semibold text-dark dark:text-white">
              API Key Generated!
            </p>
          </div>
          <div className="p-3 bg-white dark:bg-dark rounded-xl border border-dark-200 dark:border-gray-700 mb-3">
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs text-dark dark:text-white flex-1 break-all">
                {showKey
                  ? newKey
                  : newKey.replace(/./g, "•").substring(0, 40) + "..."}
              </p>
              <button
                onClick={() => setShowKey(!showKey)}
                className="text-dark-400 flex-shrink-0"
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                onClick={() => copyKey(newKey)}
                className="btn btn-primary btn-sm flex-shrink-0"
              >
                <Copy size={12} /> Copy
              </button>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-warning-light rounded-xl">
            <AlertTriangle
              size={14}
              className="text-warning flex-shrink-0 mt-0.5"
            />
            <p className="text-xs text-dark-500">
              <strong>Copy this key now.</strong> For security reasons, it will
              never be shown again. Store it safely.
            </p>
          </div>
          <button
            onClick={() => setNewKey(null)}
            className="btn btn-ghost btn-sm mt-3 w-full"
          >
            I've saved my key
          </button>
        </div>
      )}

      {/* How to use */}
      <div className="card">
        <h2 className="font-semibold text-dark dark:text-white mb-3">
          How to Use
        </h2>
        <p className="text-sm text-dark-400 mb-3">
          Include your API key in the request header:
        </p>
        <div className="p-3 bg-dark rounded-xl font-mono text-xs text-success overflow-x-auto">
          <p className="text-gray-400"># Example request</p>
          <p className="mt-1">curl https://api.gettrackeet.com/v1/invoices \</p>
          <p className="ml-4">
            -H{" "}
            <span className="text-warning">"x-api-key: tsk_your_key_here"</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { method: "GET", path: "/v1/invoices", desc: "List all invoices" },
            { method: "POST", path: "/v1/invoices", desc: "Create an invoice" },
            {
              method: "GET",
              path: "/v1/customers",
              desc: "List all customers",
            },
            { method: "GET", path: "/v1/payments", desc: "List all payments" },
          ].map((endpoint, i) => (
            <div key={i} className="p-3 bg-gray-50 dark:bg-dark rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    endpoint.method === "GET"
                      ? "bg-success-light text-success"
                      : endpoint.method === "POST"
                        ? "bg-primary-light text-primary"
                        : "bg-warning-light text-warning"
                  }`}
                >
                  {endpoint.method}
                </span>
                <p className="font-mono text-xs text-dark dark:text-white">
                  {endpoint.path}
                </p>
              </div>
              <p className="text-xs text-dark-400">{endpoint.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Keys list */}
      <div className="card">
        <h2 className="font-semibold text-dark dark:text-white mb-4">
          Your API Keys {keys.length > 0 && `(${keys.length}/5)`}
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="empty-state py-8">
            <Key size={40} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No API keys yet
            </p>
            <p className="text-dark-400 text-sm">
              Generate a key to connect your apps to Trackeet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((key, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl border ${
                  key.status === "revoked"
                    ? "border-danger/20 bg-danger-light/20 opacity-60"
                    : "border-dark-200 dark:border-gray-700 bg-gray-50 dark:bg-dark"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        key.status === "revoked"
                          ? "bg-danger-light"
                          : "bg-primary-light"
                      }`}
                    >
                      <Key
                        size={15}
                        className={
                          key.status === "revoked"
                            ? "text-danger"
                            : "text-primary"
                        }
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-dark dark:text-white">
                          {key.name}
                        </p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            key.status === "active"
                              ? "bg-success-light text-success"
                              : "bg-danger-light text-danger"
                          }`}
                        >
                          {key.status}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-dark-400">
                        {key.prefix}••••••••••••••••
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-dark-400">
                        <span>
                          Created {dayjs(key.createdAt).format("D MMM YYYY")}
                        </span>
                        {key.lastUsed && (
                          <span>Last used {dayjs(key.lastUsed).fromNow()}</span>
                        )}
                        <span>{key.usageCount || 0} requests</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {key.status === "active" && (
                      <button
                        onClick={() => handleRevoke(key)}
                        className="btn btn-ghost btn-sm text-warning border border-warning/20 hover:bg-warning-light"
                      >
                        Revoke
                      </button>
                    )}
                    <button
                      onClick={() => deleteKey(key._id)}
                      className="p-1.5 rounded-lg hover:bg-danger-light text-dark-300 hover:text-danger transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Permissions */}
                <div className="flex gap-1 flex-wrap mt-3">
                  {(key.permissions || []).map((perm) => (
                    <span
                      key={perm}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-light text-primary capitalize"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Security notice */}
      <div className="card border border-warning/20 bg-warning-light/20">
        <div className="flex items-start gap-3">
          <Shield size={18} className="text-warning flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-dark dark:text-white">
              Security Best Practices
            </p>
            <ul className="text-xs text-dark-400 mt-1 space-y-1">
              <li>
                • Never share your API key publicly or commit it to version
                control
              </li>
              <li>
                • Use environment variables to store your API key in your app
              </li>
              <li>• Only grant permissions your app actually needs</li>
              <li>
                • Revoke keys immediately if you suspect they've been
                compromised
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Generate Key Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700">
              <div>
                <h3 className="font-bold text-dark dark:text-white">
                  Generate API Key
                </h3>
                <p className="text-xs text-dark-400">
                  Create a key for your app or integration
                </p>
              </div>
              <button
                onClick={() => setShowCreate(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Key Name *</label>
                <input
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. My POS System, Zapier Integration"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Permissions *</label>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSIONS.map((perm) => (
                    <button
                      key={perm.value}
                      onClick={() => togglePermission(perm.value)}
                      className={`py-3 px-3 rounded-xl text-sm font-semibold border-2 transition-all text-left
                        ${
                          permissions.includes(perm.value)
                            ? "bg-primary-light text-primary border-primary/30"
                            : "border-dark-200 dark:border-gray-600 text-dark-400"
                        }`}
                    >
                      <p>{perm.label}</p>
                      <p className="text-[10px] font-normal opacity-70 mt-0.5">
                        {perm.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-warning-light rounded-xl">
                <p className="text-xs font-semibold text-warning">
                  ⚠️ Important
                </p>
                <p className="text-xs text-dark-500 mt-0.5">
                  The full API key will only be shown once after generation.
                  Make sure to copy and store it safely.
                </p>
              </div>

              <button
                onClick={() => {
                  if (!keyName.trim()) return toast.error("Enter a key name");
                  if (permissions.length === 0)
                    return toast.error("Select at least one permission");
                  generate({ name: keyName, permissions });
                }}
                disabled={generating}
                className="btn btn-primary w-full py-3"
              >
                {generating ? (
                  "Generating..."
                ) : (
                  <>
                    <Key size={16} /> Generate API Key
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
