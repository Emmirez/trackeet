import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Mail, Send, Trash2, Users, X } from "lucide-react";
import { subscriberAPI } from "../../services/api.js";
import dayjs from "dayjs";
import toast from "react-hot-toast";

export default function NewsletterPage() {
  const qc = useQueryClient();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [showCompose, setShowCompose] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["subscribers"],
    queryFn: () => subscriberAPI.getAll().then((r) => r.data),
  });

  const { mutate: sendNewsletter, isPending: sending } = useMutation({
    mutationFn: () => subscriberAPI.sendNewsletter({ subject, message }),
    onSuccess: (res) => {
      toast.success(res.data.message);
      setShowCompose(false);
      setSubject("");
      setMessage("");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to send"),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id) => subscriberAPI.delete(id),
    onSuccess: () => {
      toast.success("Subscriber removed");
      qc.invalidateQueries(["subscribers"]);
    },
  });

  const subscribers = data?.subscribers || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title"></h1>
          <p className="text-sm text-dark-600">
            {total} subscriber{total !== 1 ? "s" : ""} from your store
          </p>
        </div>
        <button
          onClick={() => setShowCompose(true)}
          disabled={total === 0}
          className="btn btn-primary flex-shrink-0"
        >
          <Send size={19} /> Send Newsletter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center py-4">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-2">
            <Users size={18} className="text-primary" />
          </div>
          <p className="text-2xl font-black text-primary">{total}</p>
          <p className="text-xs text-dark-400">Total Subscribers</p>
        </div>
        <div className="card text-center py-4">
          <div className="w-10 h-10 bg-success-light rounded-xl flex items-center justify-center mx-auto mb-2">
            <Mail size={18} className="text-success" />
          </div>
          <p className="text-2xl font-black text-success">{total}</p>
          <p className="text-xs text-dark-400">Active</p>
        </div>
      </div>

      {/* Subscribers list */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : subscribers.length === 0 ? (
          <div className="empty-state py-16">
            <Mail size={40} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No subscribers yet
            </p>
            <p className="text-dark-400 text-sm">
              Subscribers will appear here when customers sign up from your
              store
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {subscribers.map((sub) => (
              <div key={sub._id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-black text-sm">
                    {(sub.name || sub.email)?.[0]?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  {sub.name && (
                    <p className="text-sm font-semibold text-dark dark:text-white truncate">
                      {sub.name}
                    </p>
                  )}
                  <p className="text-xs text-dark-400 truncate">{sub.email}</p>
                  <p className="text-[10px] text-dark-300">
                    {dayjs(sub.createdAt).format("D MMM YYYY")}
                  </p>
                </div>
                <button
                  onClick={() => remove(sub._id)}
                  className="p-1.5 rounded-lg hover:bg-danger-light text-dark-400 hover:text-danger transition-colors flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose modal */}
      {showCompose && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700">
              <div>
                <h3 className="font-bold text-dark dark:text-white">
                  Send Newsletter
                </h3>
                <p className="text-xs text-dark-400">
                  To {total} subscriber{total !== 1 ? "s" : ""}
                </p>
              </div>
              <button
                onClick={() => setShowCompose(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Subject *</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. New Arrivals This Week! 🎉"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Message *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your newsletter message..."
                  rows={6}
                  className="input resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCompose(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => sendNewsletter()}
                  disabled={sending || !subject.trim() || !message.trim()}
                  className="btn btn-primary flex-1"
                >
                  {sending ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send size={14} /> Send
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
