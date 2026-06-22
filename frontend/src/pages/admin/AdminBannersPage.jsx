import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Edit,
  Megaphone,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import { adminAPI } from "../../services/api.js";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const TYPES = [
  {
    value: "info",
    label: "ℹ️ Info",
    color: "bg-primary-light text-primary border-primary/20",
  },
  {
    value: "success",
    label: "✅ Success",
    color: "bg-success-light text-success border-success/20",
  },
  {
    value: "warning",
    label: "⚠️ Warning",
    color: "bg-warning-light text-warning border-warning/20",
  },
  {
    value: "danger",
    label: "🚨 Danger",
    color: "bg-danger-light text-danger border-danger/20",
  },
];

const PLANS = [
  { value: "all", label: "All Users" },
  { value: "free", label: "Free" },
  { value: "starter", label: "Starter" },
  { value: "business", label: "Business" },
  { value: "enterprise", label: "Enterprise" },
];

const TYPE_STYLES = {
  info: "bg-primary-light border-primary/20 text-primary",
  success: "bg-success-light border-success/20 text-success",
  warning: "bg-warning-light border-warning/20 text-warning",
  danger: "bg-danger-light border-danger/20 text-danger",
};

export default function AdminBannersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("info");
  const [targetPlan, setTargetPlan] = useState("all");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaLink, setCtaLink] = useState("");
  const [dismissible, setDismissible] = useState(true);
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-dashboard-banners"],
    queryFn: () => adminAPI.getDashboardBanners().then((r) => r.data),
  });

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: (d) => adminAPI.createDashboardBanner(d),
    onSuccess: () => {
      toast.success("Banner created!");
      qc.invalidateQueries(["admin-dashboard-banners"]);
      resetForm();
    },
    onError: () => toast.error("Failed to create banner"),
  });

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateDashboardBanner(id, data),
    onSuccess: () => {
      toast.success("Banner updated!");
      qc.invalidateQueries(["admin-dashboard-banners"]);
      resetForm();
    },
    onError: () => toast.error("Failed to update banner"),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id) => adminAPI.deleteDashboardBanner(id),
    onSuccess: () => {
      toast.success("Banner deleted");
      qc.invalidateQueries(["admin-dashboard-banners"]);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const { mutate: toggle } = useMutation({
    mutationFn: ({ id, isActive }) =>
      adminAPI.updateDashboardBanner(id, { isActive }),
    onSuccess: () => qc.invalidateQueries(["admin-dashboard-banners"]),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setTitle("");
    setMessage("");
    setType("info");
    setTargetPlan("all");
    setCtaLabel("");
    setCtaLink("");
    setDismissible(true);
    setStartDate(dayjs().format("YYYY-MM-DD"));
    setEndDate("");
  };

  const handleEdit = (b) => {
    setEditing(b);
    setTitle(b.title);
    setMessage(b.message);
    setType(b.type);
    setTargetPlan(b.targetPlan);
    setCtaLabel(b.ctaLabel || "");
    setCtaLink(b.ctaLink || "");
    setDismissible(b.dismissible);
    setStartDate(dayjs(b.startDate).format("YYYY-MM-DD"));
    setEndDate(b.endDate ? dayjs(b.endDate).format("YYYY-MM-DD") : "");
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!message.trim()) return toast.error("Message is required");

    const data = {
      title,
      message,
      type,
      targetPlan,
      ctaLabel: ctaLabel || null,
      ctaLink: ctaLink || null,
      dismissible,
      startDate,
      endDate: endDate || null,
    };

    if (editing) {
      update({ id: editing._id, data });
    } else {
      create(data);
    }
  };

  const banners = data?.banners || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title"></h1>
          <p className="text-sm text-dark-400">
            Show announcements to users in their dashboard
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} /> Create 
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-dark dark:text-white">
              {editing ? "Edit Banner" : "Create Banner"}
            </h2>
            <button onClick={resetForm} className="btn btn-ghost p-1.5">
              <X size={16} />
            </button>
          </div>

          {/* Type */}
          <div>
            <label className="label">Banner Type</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setType(t.value)}
                  className={`p-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                    type === t.value
                      ? t.color + " border-2"
                      : "border-dark-200 dark:border-gray-700 text-dark-400"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Target plan */}
          <div>
            <label className="label">Target Audience</label>
            <div className="flex gap-2 flex-wrap">
              {PLANS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setTargetPlan(p.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    targetPlan === p.value
                      ? "bg-primary text-white border-primary"
                      : "bg-white dark:bg-surface text-dark-400 border-dark-200 dark:border-gray-700"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="label">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 🎉 New Feature Available!"
              className="input"
            />
          </div>

          {/* Message */}
          <div>
            <label className="label">Message *</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe the announcement..."
              rows={3}
              className="input resize-none"
            />
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">
                CTA Button Label{" "}
                <span className="text-dark-400 font-normal">(optional)</span>
              </label>
              <input
                value={ctaLabel}
                onChange={(e) => setCtaLabel(e.target.value)}
                placeholder="e.g. Learn More"
                className="input"
              />
            </div>
            <div>
              <label className="label">
                CTA Link{" "}
                <span className="text-dark-400 font-normal">(optional)</span>
              </label>
              <input
                value={ctaLink}
                onChange={(e) => setCtaLink(e.target.value)}
                placeholder="e.g. /dashboard/subscription"
                className="input"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">
                End Date{" "}
                <span className="text-dark-400 font-normal">(optional)</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Dismissible */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark rounded-xl">
            <div>
              <p className="text-sm font-semibold text-dark dark:text-white">
                Dismissible
              </p>
              <p className="text-xs text-dark-400">
                Allow users to close the banner
              </p>
            </div>
            <button
              onClick={() => setDismissible(!dismissible)}
              className={`relative w-12 h-6 rounded-full transition-colors ${dismissible ? "bg-primary" : "bg-dark-200 dark:bg-gray-600"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${dismissible ? "translate-x-7" : "translate-x-1"}`}
              />
            </button>
          </div>

          {/* Preview */}
          {title && (
            <div>
              <label className="label">Preview</label>
              <div className={`p-4 rounded-xl border ${TYPE_STYLES[type]}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-sm">{title}</p>
                    {message && (
                      <p className="text-xs mt-0.5 opacity-80">{message}</p>
                    )}
                    {ctaLabel && ctaLink && (
                      <button className="mt-2 text-xs font-bold underline opacity-90">
                        {ctaLabel} →
                      </button>
                    )}
                  </div>
                  {dismissible && (
                    <X size={14} className="opacity-60 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={resetForm} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={creating || updating}
              className="btn btn-primary flex-1"
            >
              {creating || updating
                ? "Saving..."
                : editing
                  ? "Update Banner"
                  : "Create Banner"}
            </button>
          </div>
        </div>
      )}

      {/* Banners list */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : banners.length === 0 ? (
          <div className="empty-state py-16">
            <Megaphone size={40} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No banners yet
            </p>
            <p className="text-dark-400 text-sm">
              Create your first dashboard banner
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {banners.map((b) => (
              <div key={b._id} className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      b.type === "info"
                        ? "bg-primary"
                        : b.type === "success"
                          ? "bg-success"
                          : b.type === "warning"
                            ? "bg-warning"
                            : "bg-danger"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-dark dark:text-white">
                        {b.title}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${TYPE_STYLES[b.type]}`}
                      >
                        {b.type}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-dark-400">
                        {b.targetPlan === "all" ? "All Users" : b.targetPlan}
                      </span>
                      {!b.isActive && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-dark-400">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-dark-400 mt-0.5 line-clamp-1">
                      {b.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-dark-400">
                      <span>
                        Start: {dayjs(b.startDate).format("D MMM YYYY")}
                      </span>
                      {b.endDate && (
                        <span>
                          End: {dayjs(b.endDate).format("D MMM YYYY")}
                        </span>
                      )}
                      {b.ctaLabel && <span>CTA: {b.ctaLabel}</span>}
                      {b.dismissible && <span>Dismissible</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() =>
                        toggle({ id: b._id, isActive: !b.isActive })
                      }
                      title={b.isActive ? "Deactivate" : "Activate"}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {b.isActive ? (
                        <ToggleRight size={18} className="text-success" />
                      ) : (
                        <ToggleLeft size={18} className="text-dark-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(b)}
                      className="p-1.5 rounded-lg hover:bg-primary-light text-dark-400 hover:text-primary transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => remove(b._id)}
                      className="p-1.5 rounded-lg hover:bg-danger-light text-dark-400 hover:text-danger transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
