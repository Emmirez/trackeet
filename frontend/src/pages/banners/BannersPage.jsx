import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Megaphone,
  Edit2,
  X,
} from "lucide-react";
import { bannerAPI } from "../../services/api.js";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const TYPES = [
  {
    value: "announcement",
    label: "Announcement",
    emoji: "📢",
    color: "#3B82F6",
  },
  { value: "promo", label: "Promo", emoji: "🎉", color: "#7C3AED" },
  { value: "discount", label: "Discount", emoji: "🏷️", color: "#EF4444" },
  { value: "new_arrival", label: "New Arrival", emoji: "✨", color: "#10B981" },
];

const COLORS = [
  "#7C3AED",
  "#EF4444",
  "#F97316",
  "#EAB308",
  "#10B981",
  "#3B82F6",
  "#EC4899",
  "#1F2937",
];

function BannerForm({ onClose, onSave, initial }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [message, setMessage] = useState(initial?.message || "");
  const [type, setType] = useState(initial?.type || "announcement");
  const [color, setColor] = useState(initial?.color || "#7C3AED");
  const [emoji, setEmoji] = useState(initial?.emoji || "📢");
  const [startDate, setStartDate] = useState(
    initial?.startDate
      ? dayjs(initial.startDate).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD"),
  );
  const [endDate, setEndDate] = useState(
    initial?.endDate ? dayjs(initial.endDate).format("YYYY-MM-DD") : "",
  );
  const [saving, setSaving] = useState(false);

  const handleTypeChange = (t) => {
    const found = TYPES.find((x) => x.value === t);
    setType(t);
    if (found) {
      setEmoji(found.emoji);
      setColor(found.color);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!message.trim()) return toast.error("Message is required");
    setSaving(true);
    try {
      await onSave({
        title,
        message,
        type,
        color,
        emoji,
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || null,
      });
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center">
      <div className="bg-white dark:bg-surface w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-black  text-dark dark:text-white text-lg">
            {initial ? "Edit Banner" : "New Banner"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-gray-100 dark:bg-dark  rounded-full flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preview */}
        <div
          className="rounded-2xl p-4 text-white"
          style={{ backgroundColor: color }}
        >
          <p className="font-black text-base">
            {emoji} {title || "Banner Title"}
          </p>
          <p className="text-sm opacity-90 mt-0.5">
            {message || "Banner message goes here"}
          </p>
        </div>

        {/* Type */}
        <div>
          <label className="label">Type</label>
          <div className="grid grid-cols-2 gap-2">
            {TYPES.map((t) => (
              <button
                key={t.value}
                onClick={() => handleTypeChange(t.value)}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-semibold ${
                  type === t.value
                    ? "border-primary bg-primary-light text-primary"
                    : "border-dark-200 dark:border-gray-700 text-dark-400"
                }`}
              >
                <span>{t.emoji}</span> {t.label}
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
            placeholder="e.g. 20% OFF Sneakers This Week"
            className="input"
            maxLength={60}
          />
          <p className="text-xs text-dark-400 mt-1">{title.length}/60</p>
        </div>

        {/* Message */}
        <div>
          <label className="label">Message *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. Use code SAVE20 at checkout. Limited time only!"
            className="input resize-none"
            rows={2}
            maxLength={120}
          />
          <p className="text-xs text-dark-400 mt-1">{message.length}/120</p>
        </div>

        {/* Emoji */}
        <div>
          <label className="label">Emoji</label>
          <div className="flex gap-2 flex-wrap">
            {[
              "📢",
              "🎉",
              "🏷️",
              "✨",
              "🔥",
              "💥",
              "🎁",
              "⚡",
              "🛍️",
              "💅",
              "🚀",
              "❤️",
            ].map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all ${
                  emoji === e
                    ? "bg-primary-light ring-2 ring-primary"
                    : "bg-gray-100 dark:bg-dark"
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="label">Color</label>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 flex-wrap flex-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-xl transition-all hover:scale-110 ${color === c ? "ring-2 ring-offset-2 ring-dark" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-10 h-10 rounded-xl border-2 border-dark-200 cursor-pointer p-1"
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
            <label className="label">End Date (optional)</label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="input"
            />
          </div>
        </div>
        {endDate && (
          <p className="text-xs text-dark-400">
            Banner auto-hides after {dayjs(endDate).format("D MMM YYYY")}
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn btn-primary w-full"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Plus size={16} /> {initial ? "Update Banner" : "Create Banner"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function BannersPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["banners"],
    queryFn: () => bannerAPI.getMyBanners().then((r) => r.data),
  });

  const { mutate: deleteBanner } = useMutation({
    mutationFn: (id) => bannerAPI.delete(id),
    onSuccess: () => {
      toast.success("Banner deleted");
      qc.invalidateQueries(["banners"]);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const { mutate: toggleBanner } = useMutation({
    mutationFn: ({ id, isActive }) => bannerAPI.update(id, { isActive }),
    onSuccess: () => qc.invalidateQueries(["banners"]),
    onError: () => toast.error("Failed to update"),
  });

  const banners = data?.banners || [];
  const active = banners.filter((b) => b.isActive);
  const inactive = banners.filter((b) => !b.isActive);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="section-header">
        <div>
          
          <p className="text-xs text-dark-800">
            Promos, announcements and offers on your storefront
          </p>
        </div>
        <button
          onClick={() => {
            setEditing(null);
            setShowForm(true);
          }}
          className="btn btn-primary flex-shrink-0"
        >
          <Plus size={16} /> New Banner
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="skeleton h-24 rounded-2xl" />
          ))}
        </div>
      ) : banners.length === 0 ? (
        <div className="card empty-state py-12">
          <Megaphone size={40} className="text-dark-200" />
          <p className="font-semibold text-dark dark:text-white">
            No banners yet
          </p>
          <p className="text-xs text-dark-400">
            Create your first banner to show promos on your store
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary mt-2"
          >
            <Plus size={16} /> Create Banner
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {active.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-dark-400 uppercase tracking-wide">
                Active ({active.length})
              </p>
              {active.map((b) => (
                <BannerCard
                  key={b._id}
                  banner={b}
                  onToggle={() => toggleBanner({ id: b._id, isActive: false })}
                  onDelete={() =>
                    toast(
                      (t) => (
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-semibold">
                            Delete banner?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                deleteBanner(b._id);
                                toast.dismiss(t.id);
                              }}
                              className="px-3 py-1 bg-danger text-white text-xs font-bold rounded-lg"
                            >
                              Delete
                            </button>
                            <button
                              onClick={() => toast.dismiss(t.id)}
                              className="px-3 py-1 bg-gray-100 text-xs font-bold rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ),
                      { duration: 5000 },
                    )
                  }
                  onEdit={() => {
                    setEditing(b);
                    setShowForm(true);
                  }}
                />
              ))}
            </div>
          )}

          {inactive.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-dark-400 uppercase tracking-wide">
                Inactive ({inactive.length})
              </p>
              {inactive.map((b) => (
                <BannerCard
                  key={b._id}
                  banner={b}
                  onToggle={() => toggleBanner({ id: b._id, isActive: true })}
                  onDelete={() => deleteBanner(b._id)}
                  onEdit={() => {
                    setEditing(b);
                    setShowForm(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <BannerForm
          initial={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSave={async (data) => {
            if (editing) {
              await bannerAPI.update(editing._id, data);
              toast.success("Banner updated!");
            } else {
              await bannerAPI.create(data);
              toast.success("Banner created!");
            }
            qc.invalidateQueries(["banners"]);
          }}
        />
      )}
    </div>
  );
}

function BannerCard({ banner, onToggle, onDelete, onEdit }) {
  const isExpired = banner.endDate && new Date(banner.endDate) < new Date();

  return (
    <div className="card space-y-3">
      {/* Preview */}
      <div
        className="rounded-xl p-3 text-white"
        style={{ backgroundColor: banner.color }}
      >
        <p className="font-black text-sm">
          {banner.emoji} {banner.title}
        </p>
        <p className="text-xs opacity-90 mt-0.5">{banner.message}</p>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isExpired
              ? "bg-gray-100 text-gray-500"
              : banner.isActive
                ? "bg-success-light text-success"
                : "bg-gray-100 text-dark-400"
          }`}
        >
          {isExpired ? "Expired" : banner.isActive ? "Active" : "Inactive"}
        </span>
        <span className="text-[10px] text-dark-400 capitalize">
          {banner.type.replace("_", " ")}
        </span>
        {banner.startDate && (
          <span className="text-[10px] text-dark-400">
            From {dayjs(banner.startDate).format("D MMM")}
          </span>
        )}
        {banner.endDate && (
          <span className="text-[10px] text-dark-400">
            Until {dayjs(banner.endDate).format("D MMM YYYY")}
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onToggle}
          className="btn btn-ghost btn-sm border border-dark-200 flex items-center gap-1 flex-1"
        >
          {banner.isActive ? (
            <>
              <ToggleRight size={14} className="text-success" /> Deactivate
            </>
          ) : (
            <>
              <ToggleLeft size={14} /> Activate
            </>
          )}
        </button>
        <button
          onClick={onEdit}
          className="btn btn-ghost btn-sm border border-dark-200 flex items-center gap-1"
        >
          <Edit2 size={14} /> Edit
        </button>
        <button
          onClick={onDelete}
          className="btn btn-ghost btn-sm border border-dark-200 text-danger hover:bg-danger-light"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
