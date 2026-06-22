import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Send,
  Bell,
  Mail,
  Users,
  CheckCircle,
  Clock,
  Trash2,
} from "lucide-react";
import { adminAPI } from "../../services/api.js";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const PLANS = [
  { value: "all", label: "All Users" },
  { value: "free", label: "Free Plan" },
  { value: "starter", label: "Starter Plan" },
  { value: "business", label: "Business Plan" },
  { value: "enterprise", label: "Enterprise Plan" },
];

export default function AdminBroadcastPage() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("notification");
  const [targetPlan, setTargetPlan] = useState("all");

  const { data } = useQuery({
    queryKey: ["admin-broadcasts"],
    queryFn: () => adminAPI.getBroadcasts().then((r) => r.data),
  });

  const { mutate: send, isPending } = useMutation({
    mutationFn: (d) => adminAPI.sendBroadcast(d),
    onSuccess: (res) => {
      toast.success(res.data.message);
      qc.invalidateQueries(["admin-broadcasts"]);
      setTitle("");
      setMessage("");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to send"),
  });

  const { mutate: deleteBroadcast } = useMutation({
    mutationFn: (id) => adminAPI.deleteBroadcast(id),
    onSuccess: () => {
      toast.success("Broadcast deleted");
      qc.invalidateQueries(["admin-broadcasts"]);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const handleSend = () => {
    if (!title.trim()) return toast.error("Enter a title");
    if (!message.trim()) return toast.error("Enter a message");
    send({ title, message, type, targetPlan });
  };

  const broadcasts = data?.broadcasts || [];

  return (
    <div className="space-y-5 animate-fade-in max-w-3xl">
      <div>
        <h1 className="page-title">Broadcast Message</h1>
        <p className="text-sm text-dark-400">
          Send messages to all users or filter by plan
        </p>
      </div>

      {/* Compose */}
      <div className="card space-y-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
            <Send size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-dark dark:text-white">
              Compose Broadcast
            </h2>
            <p className="text-xs text-dark-400">
              Superadmin only — sends to real users
            </p>
          </div>
        </div>

        {/* Type selector */}
        <div>
          <label className="label">Message Type</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                value: "notification",
                label: "🔔 In-App Notification",
                desc: "Shows in user notification bell",
              },
              {
                value: "email",
                label: "📧 Email",
                desc: "Sent to user email address",
              },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  type === t.value
                    ? "border-primary bg-primary-light"
                    : "border-dark-200 dark:border-gray-700"
                }`}
              >
                <p
                  className={`text-sm font-bold ${type === t.value ? "text-primary" : "text-dark dark:text-white"}`}
                >
                  {t.label}
                </p>
                <p className="text-xs text-dark-400 mt-0.5">{t.desc}</p>
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
            placeholder="e.g. New Feature Announcement"
            className="input"
          />
        </div>

        {/* Message */}
        <div>
          <label className="label">Message *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message here..."
            rows={5}
            className="input resize-none"
          />
        </div>

        {/* Preview */}
        {title && message && (
          <div className="p-4 bg-gray-50 dark:bg-dark rounded-xl border border-dark-100 dark:border-gray-700">
            <p className="text-xs font-bold text-dark-400 uppercase mb-2">
              Preview
            </p>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                {type === "email" ? (
                  <Mail size={14} className="text-primary" />
                ) : (
                  <Bell size={14} className="text-primary" />
                )}
              </div>
              <div>
                <p className="text-sm font-bold text-dark dark:text-white">
                  {title}
                </p>
                <p className="text-xs text-dark-400 mt-0.5 whitespace-pre-wrap">
                  {message}
                </p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={isPending}
          className="btn btn-primary w-full py-3"
        >
          {isPending ? (
            "Sending..."
          ) : (
            <>
              <Send size={16} />
              Send to{" "}
              {PLANS.find((p) => p.value === targetPlan)?.label || "All Users"}
            </>
          )}
        </button>
      </div>

      {/* Broadcast history */}
      {broadcasts.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-dark-100 dark:border-gray-700">
            <h3 className="font-bold text-dark dark:text-white">
              Broadcast History
            </h3>
          </div>
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {broadcasts.map((b) => (
              <div key={b._id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        b.type === "email"
                          ? "bg-primary-light"
                          : "bg-warning-light"
                      }`}
                    >
                      {b.type === "email" ? (
                        <Mail size={14} className="text-primary" />
                      ) : (
                        <Bell size={14} className="text-warning" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dark dark:text-white">
                        {b.title}
                      </p>
                      <p className="text-xs text-dark-400 mt-0.5 line-clamp-1">
                        {b.message}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-dark-400 flex items-center gap-1">
                          <Users size={9} /> {b.recipientCount} recipients
                        </span>
                        <span className="text-[10px] text-success flex items-center gap-1">
                          <CheckCircle size={9} /> {b.successCount} sent
                        </span>
                        {b.failCount > 0 && (
                          <span className="text-[10px] text-danger">
                            {b.failCount} failed
                          </span>
                        )}
                        <span className="text-[10px] text-dark-400 flex items-center gap-1">
                          <Clock size={9} />{" "}
                          {dayjs(b.createdAt).format("D MMM YYYY h:mm A")}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                            b.targetPlan === "all"
                              ? "bg-primary-light text-primary"
                              : "bg-gray-100 text-dark-400"
                          }`}
                        >
                          {b.targetPlan === "all" ? "All Plans" : b.targetPlan}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        b.status === "sent"
                          ? "bg-success-light text-success"
                          : b.status === "sending"
                            ? "bg-warning-light text-warning"
                            : "bg-danger-light text-danger"
                      }`}
                    >
                      {b.status}
                    </span>
                    <button
                      onClick={() => deleteBroadcast(b._id)}
                      className="p-1.5 rounded-lg hover:bg-danger-light text-dark-400 hover:text-danger transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
