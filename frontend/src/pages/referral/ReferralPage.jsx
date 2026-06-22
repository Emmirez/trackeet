import { useQuery } from "@tanstack/react-query";
import { referralAPI } from "../../services/api.js";
import { Copy, Gift, Users, CheckCircle, Clock, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const STATUS_CONFIG = {
  pending: { color: "bg-warning-light text-warning", label: "⏳ Pending" },
  converted: { color: "bg-success-light text-success", label: "✅ Converted" },
  flagged: { color: "bg-danger-light text-danger", label: "🚩 Flagged" },
};

export default function ReferralPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["referral"],
    queryFn: () => referralAPI.getStats().then((r) => r.data),
  });

  const referralLink = data?.referralLink || "";
  const freeMonths = data?.freeMonthsBalance || 0;
  const stats = data?.stats || { total: 0, converted: 0, pending: 0 };
  const referrals = data?.referrals || [];

  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const shareWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hey! I've been using Trackeet to manage my invoices, track payments and run my online store. It's amazing! 🚀\n\nSign up with my link and we both benefit:\n${referralLink}`,
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title"></h1>
        <p className="text-sm text-dark-600">
          Refer friends and earn free months on your plan
        </p>
      </div>

      {/* How it works */}
      <div className="card bg-gradient-to-r from-primary/5 to-purple-50 dark:from-primary/10 dark:to-purple-900/10 border border-primary/20">
        <p className="font-bold text-dark dark:text-white mb-3 flex items-center gap-2">
          <Gift size={18} className="text-primary" /> How it works
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { step: "1", label: "Share your link", emoji: "🔗" },
            {
              step: "2",
              label: "Friend upgrades to any paid plan",
              emoji: "💳",
            },
            { step: "3", label: "You both get 1 free month!", emoji: "🎉" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <p className="text-xs font-bold text-dark dark:text-white">
                {s.label}
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-dark-400 text-center mt-3">
         Earn up to 20 free months per calendar month — resets on the 1st 🚀
        </p>
      </div>

      {/* Free months balance */}
      {freeMonths > 0 && (
        <div className="card bg-success-light border border-success/20 text-center py-4">
          <p className="text-3xl font-black text-success">{freeMonths}</p>
          <p className="text-sm font-bold text-success">
            Free month{freeMonths !== 1 ? "s" : ""} available
          </p>
          <p className="text-xs text-dark-400 mt-1">
            Applied automatically on your next subscription payment
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total Referrals",
            value: stats.total,
            color: "text-primary",
            icon: Users,
          },
          {
            label: "Converted",
            value: stats.converted,
            color: "text-success",
            icon: CheckCircle,
          },
          {
            label: "Pending",
            value: stats.pending,
            color: "text-warning",
            icon: Clock,
          },
        ].map((s, i) => (
          <div key={i} className="card text-center py-3">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-dark-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Referral link */}
      <div className="card space-y-3">
        <p className="font-bold text-dark dark:text-white text-sm">
          Your Referral Link
        </p>
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-dark rounded-xl border border-dark-200 dark:border-gray-700">
          <p className="flex-1 text-xs text-dark-400 truncate font-mono">
            {referralLink || "Loading..."}
          </p>
          <button
            onClick={copyLink}
            className="btn btn-ghost p-1.5 hover:text-primary flex-shrink-0"
          >
            <Copy size={16} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={copyLink} className="btn btn-secondary btn-sm">
            <Copy size={14} /> Copy Link
          </button>
          <button onClick={shareWhatsApp} className="whatsapp-btn btn-sm">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              className="w-4 h-4"
              alt="WA"
            />
            Share on WhatsApp
          </button>
        </div>
      </div>

      {/* Referral code */}
      <div className="card flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-dark dark:text-white">
            Your Referral Code
          </p>
          <p className="text-xs text-dark-400">
            Friends can enter this manually at signup
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono font-black text-primary text-lg tracking-widest">
            {data?.referralCode || "—"}
          </span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(data?.referralCode || "");
              toast.success("Code copied!");
            }}
            className="btn btn-ghost p-1 hover:text-primary"
          >
            <Copy size={14} />
          </button>
        </div>
      </div>

      {/* Referral history */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-dark-100 dark:border-gray-700">
          <p className="font-bold text-dark dark:text-white text-sm">
            Referral History
          </p>
        </div>
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-14 rounded-xl" />
            ))}
          </div>
        ) : referrals.length === 0 ? (
          <div className="empty-state py-12">
            <Users size={40} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No referrals yet
            </p>
            <p className="text-dark-400 text-sm">
              Share your link to start earning free months
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {referrals.map((r, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-black text-sm">
                    {r.referred?.firstName?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark dark:text-white truncate">
                    {r.referred?.firstName} {r.referred?.lastName}
                  </p>
                  <p className="text-xs text-dark-400">
                    Joined {dayjs(r.createdAt).format("D MMM YYYY")}
                    {r.referredPlan && ` · Upgraded to ${r.referredPlan}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CONFIG[r.status]?.color}`}
                  >
                    {STATUS_CONFIG[r.status]?.label}
                  </span>
                  {r.status === "converted" && (
                    <span className="text-[10px] text-success font-semibold">
                      +1 free month
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Terms */}
      <div className="card bg-gray-50 dark:bg-dark border border-dark-100 dark:border-gray-700">
        <p className="text-xs font-bold text-dark dark:text-white mb-2">
          📋 Referral Terms
        </p>
        <ul className="space-y-1.5">
          {[
            "Both you and your referral get 1 free month when they upgrade to any paid plan",
            "Free months stack — no limit on how many you can earn",
            "Free months are applied automatically on your next payment",
            "Free months cannot be withdrawn as cash",
            "Fraudulent referrals (same device/IP) will be flagged and removed",
            "Maximum 20 referral bonuses earned per calendar month for referrer",
            "Trackeet reserves the right to cancel suspicious referral activity",
          ].map((t, i) => (
            <li
              key={i}
              className="flex items-start gap-2 text-xs text-dark-400"
            >
              <span className="text-primary flex-shrink-0 mt-0.5">•</span>
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
