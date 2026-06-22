import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Edit,
  BookOpen,
  ToggleLeft,
  ToggleRight,
  X,
  Zap,
  Wrench,
  Bug,
  Shield,
} from "lucide-react";
import { adminAPI } from "../../services/api.js";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const TYPES = [
  {
    value: "feature",
    label: "🚀 Feature",
    color: "bg-primary-light text-primary",
  },
  {
    value: "improvement",
    label: "⚡ Improvement",
    color: "bg-warning-light text-warning",
  },
  {
    value: "bugfix",
    label: "🐛 Bug Fix",
    color: "bg-success-light text-success",
  },
  {
    value: "security",
    label: "🔒 Security",
    color: "bg-danger-light text-danger",
  },
];

const TYPE_CONFIG = {
  feature: { label: "🚀 Feature", color: "bg-primary-light text-primary" },
  improvement: {
    label: "⚡ Improvement",
    color: "bg-warning-light text-warning",
  },
  bugfix: { label: "🐛 Bug Fix", color: "bg-success-light text-success" },
  security: { label: "🔒 Security", color: "bg-danger-light text-danger" },
};

export default function AdminChangelogPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const [version, setVersion] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("feature");
  const [items, setItems] = useState([""]);
  const [isPublished, setIsPublished] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-changelogs"],
    queryFn: () => adminAPI.getChangelogs().then((r) => r.data),
  });

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: (d) => adminAPI.createChangelog(d),
    onSuccess: () => {
      toast.success("Changelog created!");
      qc.invalidateQueries(["admin-changelogs"]);
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updateChangelog(id, data),
    onSuccess: () => {
      toast.success("Changelog updated!");
      qc.invalidateQueries(["admin-changelogs"]);
      resetForm();
    },
    onError: () => toast.error("Failed to update"),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id) => adminAPI.deleteChangelog(id),
    onSuccess: () => {
      toast.success("Changelog deleted");
      qc.invalidateQueries(["admin-changelogs"]);
    },
  });

  const { mutate: togglePublish } = useMutation({
    mutationFn: ({ id, isPublished }) =>
      adminAPI.updateChangelog(id, { isPublished }),
    onSuccess: () => qc.invalidateQueries(["admin-changelogs"]),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setVersion("");
    setTitle("");
    setDescription("");
    setType("feature");
    setItems([""]);
    setIsPublished(false);
  };

  const handleEdit = (c) => {
    setEditing(c);
    setVersion(c.version);
    setTitle(c.title);
    setDescription(c.description || "");
    setType(c.type);
    setItems(c.items?.length ? c.items : [""]);
    setIsPublished(c.isPublished);
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!version.trim()) return toast.error("Version is required");
    if (!title.trim()) return toast.error("Title is required");

    const payload = {
      version,
      title,
      description,
      type,
      items: items.filter((i) => i.trim()),
      isPublished,
    };

    if (editing) update({ id: editing._id, data: payload });
    else create(payload);
  };

  const addItem = () => setItems((prev) => [...prev, ""]);
  const updateItem = (i, val) =>
    setItems((prev) => prev.map((item, idx) => (idx === i ? val : item)));
  const removeItem = (i) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const changelogs = data?.changelogs || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title"></h1>
          <p className="text-sm text-dark-600">
            Post updates that appear on the public changelog page
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} /> Post 
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Entries", value: changelogs.length },
          {
            label: "Published",
            value: changelogs.filter((c) => c.isPublished).length,
          },
          {
            label: "Drafts",
            value: changelogs.filter((c) => !c.isPublished).length,
          },
        ].map((s, i) => (
          <div key={i} className="card text-center py-3">
            <p className="text-xl font-black text-primary">{s.value}</p>
            <p className="text-xs text-dark-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-dark dark:text-white">
              {editing ? "Edit Changelog" : "New Changelog Entry"}
            </h2>
            <button onClick={resetForm} className="btn btn-ghost p-1.5">
              <X size={16} />
            </button>
          </div>

          {/* Version + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Version *</label>
              <input
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="e.g. v1.2.0"
                className="input font-mono"
              />
            </div>
            <div>
              <label className="label">Type</label>
              <div className="flex gap-2 flex-wrap">
                {TYPES.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setType(t.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                      type === t.value
                        ? t.color + " border-transparent"
                        : "border-dark-200 dark:border-gray-700 text-dark-400"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="label">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. WhatsApp Campaigns, Delivery Tracking"
              className="input"
            />
          </div>

          {/* Description */}
          <div>
            <label className="label">
              Description{" "}
              <span className="text-dark-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief overview of this release..."
              rows={2}
              className="input resize-none"
            />
          </div>

          {/* Items */}
          <div>
            <label className="label">Change Items</label>
            <div className="space-y-2">
              {items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) => updateItem(i, e.target.value)}
                    placeholder={`e.g. Added delivery fee to invoices`}
                    className="input flex-1"
                  />
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(i)}
                      className="btn btn-ghost p-2 hover:text-danger"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addItem}
                className="btn btn-secondary btn-sm w-full"
              >
                <Plus size={14} /> Add Item
              </button>
            </div>
          </div>

          {/* Publish toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark rounded-xl">
            <div>
              <p className="text-sm font-semibold text-dark dark:text-white">
                Publish immediately
              </p>
              <p className="text-xs text-dark-400">
                Make visible on public changelog page
              </p>
            </div>
            <button
              onClick={() => setIsPublished(!isPublished)}
              className={`relative w-12 h-6 rounded-full transition-colors ${isPublished ? "bg-primary" : "bg-dark-200 dark:bg-gray-600"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublished ? "translate-x-7" : "translate-x-1"}`}
              />
            </button>
          </div>

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
                  ? "Update"
                  : "Create"}
            </button>
          </div>
        </div>
      )}

      {/* Changelogs list */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-xl" />
            ))}
          </div>
        ) : changelogs.length === 0 ? (
          <div className="empty-state py-16">
            <BookOpen size={40} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No changelog entries yet
            </p>
            <p className="text-dark-400 text-sm">
              Create your first release note
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {changelogs.map((c) => (
              <div key={c._id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-black text-dark dark:text-white text-sm">
                        {c.version}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_CONFIG[c.type]?.color}`}
                      >
                        {TYPE_CONFIG[c.type]?.label}
                      </span>
                      {c.isPublished ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success-light text-success">
                          Published
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-dark-400">
                          Draft
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-dark dark:text-white mt-0.5">
                      {c.title}
                    </p>
                    {c.description && (
                      <p className="text-xs text-dark-400 mt-0.5">
                        {c.description}
                      </p>
                    )}
                    {c.items?.length > 0 && (
                      <ul className="mt-2 space-y-0.5">
                        {c.items.slice(0, 3).map((item, i) => (
                          <li
                            key={i}
                            className="text-xs text-dark-400 flex items-start gap-1.5"
                          >
                            <span className="text-primary mt-0.5">•</span>
                            {item}
                          </li>
                        ))}
                        {c.items.length > 3 && (
                          <li className="text-xs text-dark-400">
                            +{c.items.length - 3} more items
                          </li>
                        )}
                      </ul>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-dark-400">
                      <span>{dayjs(c.createdAt).format("D MMM YYYY")}</span>
                      {c.publishedAt && (
                        <span>
                          Published {dayjs(c.publishedAt).format("D MMM YYYY")}
                        </span>
                      )}
                      {c.createdBy && <span>by {c.createdBy.firstName}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() =>
                        togglePublish({
                          id: c._id,
                          isPublished: !c.isPublished,
                        })
                      }
                      title={c.isPublished ? "Unpublish" : "Publish"}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {c.isPublished ? (
                        <ToggleRight size={18} className="text-success" />
                      ) : (
                        <ToggleLeft size={18} className="text-dark-400" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(c)}
                      className="p-1.5 rounded-lg hover:bg-primary-light text-dark-400 hover:text-primary transition-colors"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => remove(c._id)}
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
