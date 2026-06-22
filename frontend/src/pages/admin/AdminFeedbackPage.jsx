import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, MessageSquare, Trash2, Send, X } from "lucide-react";
import { feedbackAPI } from "../../services/api.js";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const CATEGORY_COLORS = {
  general: "bg-gray-100 text-dark-400",
  invoicing: "bg-primary-light text-primary",
  whatsapp: "bg-success-light text-success",
  store: "bg-warning-light text-warning",
  support: "bg-danger-light text-danger",
  pricing: "bg-purple-100 text-purple-600",
};

export default function AdminFeedbackPage() {
  const qc = useQueryClient();
  const [rating, setRating] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [replyModal, setReplyModal] = useState(null);
  const [replyText, setReplyText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-feedback", rating, category, page],
    queryFn: () =>
      feedbackAPI
        .getAll({ rating, category, page, limit: 20 })
        .then((r) => r.data),
  });

  const { mutate: reply, isPending: replying } = useMutation({
    mutationFn: ({ id, reply }) => feedbackAPI.reply(id, { reply }),
    onSuccess: () => {
      toast.success("Reply sent!");
      qc.invalidateQueries(["admin-feedback"]);
      setReplyModal(null);
      setReplyText("");
    },
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id) => feedbackAPI.delete(id),
    onSuccess: () => {
      toast.success("Deleted");
      qc.invalidateQueries(["admin-feedback"]);
    },
  });

  const feedback = data?.feedback || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const renderStars = (count, size = 14) =>
    [1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        className={s <= count ? "text-warning fill-warning" : "text-dark-200"}
      />
    ));

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title"></h1>
        <p className="text-sm text-dark-600">
          Ratings and reviews from Trackeet users
        </p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card text-center py-4 col-span-2 sm:col-span-1">
          <p className="text-4xl font-black text-warning">
            {data?.avgRating || "—"}
          </p>
          <div className="flex justify-center gap-0.5 my-1">
            {renderStars(Math.round(data?.avgRating || 0), 16)}
          </div>
          <p className="text-xs text-dark-400">Average Rating</p>
        </div>
        {(data?.ratingBreakdown || []).slice(0, 3).map((r) => (
          <div key={r.rating} className="card text-center py-4">
            <p className="text-xl font-black text-dark dark:text-white">
              {r.count}
            </p>
            <div className="flex justify-center gap-0.5 my-1">
              {renderStars(r.rating, 10)}
            </div>
            <p className="text-xs text-dark-400">{r.percent}%</p>
          </div>
        ))}
      </div>

      {/* Rating breakdown bar */}
      <div className="card space-y-2">
        <h3 className="font-bold text-dark dark:text-white mb-3">
          Rating Breakdown
        </h3>
        {(data?.ratingBreakdown || []).map((r) => (
          <div key={r.rating} className="flex items-center gap-3">
            <div className="flex items-center gap-1 w-20 flex-shrink-0">
              <span className="text-xs text-dark-400">{r.rating}</span>
              <Star size={12} className="text-warning fill-warning" />
            </div>
            <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
              <div
                className="bg-warning rounded-full h-2 transition-all"
                style={{ width: `${r.percent}%` }}
              />
            </div>
            <span className="text-xs text-dark-400 w-8 text-right">
              {r.count}
            </span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {["", "5", "4", "3", "2", "1"].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRating(r);
                setPage(1);
              }}
              className={`px-2 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                rating === r
                  ? "bg-primary text-white border-primary"
                  : "bg-white dark:bg-surface text-dark-400 border-dark-200 dark:border-gray-700"
              }`}
            >
              {r === ""
                ? "All"
                : r === "5"
                  ? "⭐⭐⭐⭐⭐"
                  : r === "4"
                    ? "⭐⭐⭐⭐"
                    : r === "3"
                      ? "⭐⭐⭐"
                      : r === "2"
                        ? "⭐⭐"
                        : "⭐"}
            </button>
          ))}
        </div>
        <div className="flex gap-1 flex-wrap">
          {[
            "",
            "general",
            "invoicing",
            "whatsapp",
            "store",
            "support",
            "pricing",
          ].map((c) => (
            <button
              key={c}
              onClick={() => {
                setCategory(c);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize ${
                category === c
                  ? "bg-primary text-white border-primary"
                  : "bg-white dark:bg-surface text-dark-400 border-dark-200 dark:border-gray-700"
              }`}
            >
              {c === "" ? "All Categories" : c}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback list */}
      <div className="space-y-3">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))
        ) : feedback.length === 0 ? (
          <div className="card empty-state py-16">
            <Star size={40} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No feedback yet
            </p>
          </div>
        ) : (
          feedback.map((f) => (
            <div key={f._id} className="card space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="avatar w-9 h-9 bg-primary text-white text-sm flex-shrink-0">
                    {f.user?.firstName?.[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark dark:text-white">
                      {f.user?.firstName} {f.user?.lastName}
                    </p>
                    <p className="text-xs text-dark-400">{f.user?.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex gap-0.5">
                        {renderStars(f.rating)}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${CATEGORY_COLORS[f.category]}`}
                      >
                        {f.category}
                      </span>
                      <span className="text-[10px] text-dark-400">
                        {dayjs(f.createdAt).fromNow()}
                      </span>
                      {f.isPublic && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-success-light text-success">
                          Public
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => {
                      setReplyModal(f);
                      setReplyText(f.adminReply || "");
                    }}
                    className="p-1.5 rounded-lg hover:bg-primary-light text-dark-400 hover:text-primary transition-colors"
                    title="Reply"
                  >
                    <Send size={14} />
                  </button>
                  <button
                    onClick={() => remove(f._id)}
                    className="p-1.5 rounded-lg hover:bg-danger-light text-dark-400 hover:text-danger transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {f.message && (
                <p className="text-sm text-dark-500 dark:text-gray-400 bg-gray-50 dark:bg-dark p-3 rounded-xl">
                  "{f.message}"
                </p>
              )}

              {f.adminReply && (
                <div className="p-3 bg-primary-light rounded-xl border border-primary/20">
                  <p className="text-xs font-bold text-primary mb-1">
                    Admin Reply · {dayjs(f.repliedAt).format("D MMM YYYY")}
                  </p>
                  <p className="text-xs text-dark-500 dark:text-gray-400">
                    {f.adminReply}
                  </p>
                </div>
              )}
            </div>
          ))
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

      {/* Reply modal */}
      {replyModal && (
        <div className="modal-overlay" onClick={() => setReplyModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-dark-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-bold text-dark dark:text-white">
                Reply to {replyModal.user?.firstName}
              </h3>
              <button onClick={() => setReplyModal(null)}>
                <X size={18} className="text-dark-400" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="p-3 bg-gray-50 dark:bg-dark rounded-xl">
                <div className="flex gap-0.5 mb-1">
                  {renderStars(replyModal.rating)}
                </div>
                <p className="text-xs text-dark-400">
                  {replyModal.message || "No message"}
                </p>
              </div>
              <div>
                <label className="label">Your Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  rows={4}
                  className="input resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setReplyModal(null)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    reply({ id: replyModal._id, reply: replyText })
                  }
                  disabled={replying || !replyText.trim()}
                  className="btn btn-primary flex-1"
                >
                  {replying ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
