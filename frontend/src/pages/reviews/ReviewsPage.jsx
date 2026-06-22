import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Star, Check, Trash2, MessageSquare, Package } from "lucide-react";
import { reviewAPI } from "../../services/api.js";
import toast from "react-hot-toast";
import dayjs from "dayjs";

function StarDisplay({ rating, size = 14 }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={size}
          className={
            s <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200"
          }
        />
      ))}
    </div>
  );
}

export default function ReviewsPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("pending");
  const [replyText, setReplyText] = useState({});
  const [showReply, setShowReply] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["my-reviews", activeTab],
    queryFn: () =>
      reviewAPI.getMyReviews({ status: activeTab }).then((r) => r.data),
  });

  const { mutate: approve } = useMutation({
    mutationFn: (id) => reviewAPI.approve(id),
    onSuccess: () => {
      toast.success("Review approved!");
      qc.invalidateQueries(["my-reviews"]);
    },
    onError: () => toast.error("Failed to approve"),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id) => reviewAPI.delete(id),
    onSuccess: () => {
      toast.success("Review deleted");
      qc.invalidateQueries(["my-reviews"]);
    },
    onError: () => toast.error("Failed to delete"),
  });

  const { mutate: reply } = useMutation({
    mutationFn: ({ id, text }) => reviewAPI.reply(id, { reply: text }),
    onSuccess: (_, { id }) => {
      toast.success("Reply saved!");
      setShowReply((prev) => ({ ...prev, [id]: false }));
      setReplyText((prev) => ({ ...prev, [id]: "" }));
      qc.invalidateQueries(["my-reviews"]);
    },
    onError: () => toast.error("Failed to save reply"),
  });

  const reviews = data?.reviews || [];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">Reviews</h1>
          <p className="text-xs text-dark-400">
            Manage customer product reviews
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { key: "pending", label: "Pending Approval" },
          { key: "approved", label: "Approved" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.key
                ? "bg-white dark:bg-surface text-dark dark:text-white shadow-sm"
                : "text-dark-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="card empty-state py-12">
          <Star size={40} className="text-dark-200" />
          <p className="font-semibold text-dark dark:text-white">
            No {activeTab} reviews
          </p>
          <p className="text-xs text-dark-400">
            {activeTab === "pending"
              ? "No reviews waiting for approval"
              : "No approved reviews yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="card space-y-3">
              {/* Product info */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {r.product?.images?.[0] ? (
                    <img
                      src={r.product.images[0]}
                      alt={r.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={16} className="text-dark-200" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-dark-400">Product</p>
                  <p className="text-sm font-bold text-dark dark:text-white truncate">
                    {r.product?.name || "Unknown"}
                  </p>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                    r.approved
                      ? "bg-success-light text-success"
                      : "bg-warning-light text-warning"
                  }`}
                >
                  {r.approved ? "Approved" : "Pending"}
                </span>
              </div>

              {/* Review content */}
              <div className="bg-gray-50 dark:bg-dark rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-dark dark:text-white">
                      {r.name}
                    </p>
                    {r.phone && (
                      <p className="text-xs text-dark-400">{r.phone}</p>
                    )}
                  </div>
                  <StarDisplay rating={r.rating} />
                </div>
                <p className="text-sm text-dark-500 dark:text-gray-300">
                  {r.comment}
                </p>
                {r.reply && (
                  <div className="pl-3 border-l-2 border-primary/40">
                    <p className="text-xs font-bold text-primary">
                      Your reply:
                    </p>
                    <p className="text-xs text-dark-400 mt-0.5">{r.reply}</p>
                  </div>
                )}
                <p className="text-[10px] text-dark-300">
                  {dayjs(r.createdAt).format("D MMM YYYY · h:mm A")}
                </p>
              </div>

              {/* Reply form */}
              {showReply[r._id] && (
                <div className="space-y-2">
                  <textarea
                    value={replyText[r._id] || ""}
                    onChange={(e) =>
                      setReplyText((prev) => ({
                        ...prev,
                        [r._id]: e.target.value,
                      }))
                    }
                    placeholder="Write your reply..."
                    rows={2}
                    className="input resize-none text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        reply({ id: r._id, text: replyText[r._id] || "" })
                      }
                      className="btn btn-primary btn-sm flex-1"
                    >
                      Save Reply
                    </button>
                    <button
                      onClick={() =>
                        setShowReply((prev) => ({ ...prev, [r._id]: false }))
                      }
                      className="btn btn-ghost btn-sm border border-dark-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                {!r.approved && (
                  <button
                    onClick={() => approve(r._id)}
                    className="btn btn-success btn-sm flex-1 flex items-center justify-center gap-1"
                  >
                    <Check size={14} /> Approve
                  </button>
                )}
                <button
                  onClick={() =>
                    setShowReply((prev) => ({ ...prev, [r._id]: !prev[r._id] }))
                  }
                  className="btn btn-ghost btn-sm border border-dark-200 flex items-center gap-1"
                >
                  <MessageSquare size={14} /> Reply
                </button>
                <button
                  onClick={() =>
                    toast(
                      (t) => (
                        <div className="flex items-center gap-3">
                          <p className="text-sm font-semibold">
                            Delete review?
                          </p>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                remove(r._id);
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
                  className="btn btn-ghost btn-sm border border-dark-200 text-danger hover:bg-danger-light"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
