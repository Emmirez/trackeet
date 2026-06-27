import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Star, Send, MessageSquare, X, ChevronDown } from "lucide-react";
import { feedbackAPI } from "../services/api.js";
import toast from "react-hot-toast";

const CATEGORIES = [
  { value: "general", label: "General" },
  { value: "invoicing", label: "Invoicing" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "store", label: "Store" },
  { value: "support", label: "Support" },
  { value: "pricing", label: "Pricing" },
];

const RATING_LABELS = {
  1: "😞 Poor",
  2: "😐 Fair",
  3: "🙂 Good",
  4: "😊 Great",
  5: "🤩 Excellent",
};

const SHOW_AFTER_MS = 2 * 60 * 1000; // 2 minutes
const COOLDOWN_DAYS = 7; // show again after 7 days

const shouldShowFeedback = () => {
  const lastSeen = localStorage.getItem("feedback-last-shown");
  if (!lastSeen) return true;
  const daysSince = (Date.now() - Number(lastSeen)) / (1000 * 60 * 60 * 24);
  return daysSince >= COOLDOWN_DAYS;
};

export default function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!shouldShowFeedback()) return;
    const timer = setTimeout(() => setVisible(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem("feedback-last-shown", Date.now().toString());
  };
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const qc = useQueryClient();

  const { data: myFeedback } = useQuery({
    queryKey: ["my-feedback"],
    queryFn: () => feedbackAPI.getMy().then((r) => r.data),
    enabled: open,
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: feedbackAPI.submit,
    onSuccess: () => {
      toast.success("Thank you for your feedback! 🙏");
      setOpen(false);
      setVisible(false);
      setRating(0);
      setMessage("");
      localStorage.setItem("feedback-last-shown", Date.now().toString());
      qc.invalidateQueries(["my-feedback"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to submit"),
  });

  const handleSubmit = () => {
    if (!rating) return toast.error("Please select a rating");
    submit({ rating, category, message, isPublic });
  };

  const lastFeedback = myFeedback?.feedback?.[0];

  return (
    <>
      {/* Floating button */}
      {visible && (
        <div className="fixed bottom-24 right-4 lg:bottom-6 z-30 flex items-center gap-1">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2.5 rounded-2xl shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
          >
            <Star size={16} className="fill-white" />
            <span className="text-sm font-bold">Rate Trackeet</span>
          </button>
          <button
            onClick={handleDismiss}
            className="w-6 h-6 bg-dark-400 hover:bg-danger text-white rounded-full flex items-center justify-center transition-colors shadow-lg"
            title="Dismiss"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md animate-slide-up">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-dark-100 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                  <MessageSquare size={18} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-dark dark:text-white">
                    Rate Your Experience
                  </h3>
                  <p className="text-xs text-dark-400">
                    Help us improve Trackeet
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="btn btn-ghost p-1.5"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Previous feedback notice */}
              {lastFeedback && (
                <div className="p-3 bg-primary-light rounded-xl">
                  <p className="text-xs text-primary font-semibold">
                    Your last rating: {"⭐".repeat(lastFeedback.rating)} —{" "}
                    {new Date(lastFeedback.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              {/* Star rating */}
              <div>
                <label className="label">Overall Rating *</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={`transition-colors ${
                          star <= (hovered || rating)
                            ? "text-warning fill-warning"
                            : "text-dark-200"
                        }`}
                      />
                    </button>
                  ))}
                  {(hovered || rating) > 0 && (
                    <span className="text-sm font-bold text-dark dark:text-white ml-2">
                      {RATING_LABELS[hovered || rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="label">What are you rating?</label>
                <div className="flex gap-2 flex-wrap">
                  {CATEGORIES.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setCategory(c.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        category === c.value
                          ? "bg-primary text-white border-primary"
                          : "bg-white dark:bg-surface text-dark-400 border-dark-200 dark:border-gray-700"
                      }`}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="label">
                  Message{" "}
                  <span className="text-dark-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you love or what we can improve..."
                  rows={3}
                  className="input resize-none"
                />
              </div>

              {/* Public toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark rounded-xl">
                <div>
                  <p className="text-sm font-semibold text-dark dark:text-white">
                    Make public
                  </p>
                  <p className="text-xs text-dark-400">
                    Show your review as a testimonial on gettrackeet.com landing
                    page
                  </p>
                </div>
                <button
                  onClick={() => setIsPublic(!isPublic)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${isPublic ? "bg-primary" : "bg-dark-200 dark:bg-gray-600"}`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${isPublic ? "translate-x-5" : "translate-x-0.5"}`}
                  />
                </button>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isPending || !rating}
                className="btn btn-primary w-full py-3"
              >
                {isPending ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send size={16} /> Submit Feedback
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
