import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  Crown,
  CheckCircle,
  Zap,
  Star,
  ArrowRight,
  Tag,
  X,
  Loader,
} from "lucide-react";
import api,{ subscriptionAPI, promoAPI } from "../../services/api.js";
import useAuthStore from "../../store/authStore.js";
import { fmt } from "../../utils/helpers.js";
import toast from "react-hot-toast";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    period: "Forever",
    color: "border-dark-200",
    badge: null,
    features: [
      "5 invoices/month",
      "Basic customers",
      "PDF download",
      "Manual tracking",
      "Email support",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 2000,
    period: "per month",
    color: "border-primary",
    badge: "Most Popular",
    features: [
      "50 invoices/month",
      "Unlimited customers",
      "WhatsApp automation",
      "Payment reminders",
      "PDF receipts",
      "Basic reports",
      "Priority support",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 5000,
    period: "per month",
    color: "border-warning",
    badge: "Best Value",
    features: [
      "Unlimited invoices",
      "All Starter features",
      "AI insights",
      "WhatsApp campaigns",
      "Advanced reports",
      "3 team members",
      "Dedicated support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: null,
    period: "Custom pricing",
    color: "border-success",
    badge: null,
    features: [
      "Everything in Business",
      "Unlimited team members",
      "Custom integrations",
      "API access",
      "SLA guarantee",
      "Custom templates",
      "Onboarding support",
    ],
  },
];

export default function SubscriptionPage() {
  const { user } = useAuthStore();
  const [annual, setAnnual] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const qc = useQueryClient();
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const shouldVerify = searchParams.get("verify") === "1";
    const reference =
      searchParams.get("reference") || localStorage.getItem("paystack_ref");

    if (shouldVerify && reference && !verifying && !verified) {
      setVerifying(true);
      subscriptionAPI
        .verify({ reference })
        .then(() => {
          setVerified(true);
          toast.success("🎉 Payment successful! Your plan has been upgraded.");
          qc.invalidateQueries(["subscription"]);
         // Refresh user data from server
          useAuthStore.getState().refreshUser();
          localStorage.removeItem("paystack_ref");
          setSearchParams({});
        })
        .catch(() => {
          toast.error("Payment verification failed. Contact support.");
        })
        .finally(() => setVerifying(false));
    }
  }, []);
  const { data: current } = useQuery({
    queryKey: ["subscription"],
    queryFn: () => subscriptionAPI.getCurrent().then((r) => r.data),
  });

  const { mutate: initiate, isPending } = useMutation({
    mutationFn: subscriptionAPI.initiate,
    onSuccess: (res) => {
      if (res.data.paymentUrl) {
        localStorage.setItem("paystack_ref", res.data.reference);
        window.location.href = res.data.paymentUrl;
      }
    },
    onError: () => toast.error("Failed to initiate payment"),
  });

  const { mutate: validatePromo, isPending: validating } = useMutation({
    mutationFn: (data) => promoAPI.validate(data),
    onSuccess: (res) => {
      setAppliedPromo(res.data.promo);
      toast.success(
        `Promo applied! You save ₦${res.data.promo.discountAmount.toLocaleString()}`,
      );
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Invalid promo code"),
  });

  const handleApplyPromo = (plan) => {
    if (!promoCode.trim()) return toast.error("Enter a promo code");
    const price = annual ? Math.round(plan.price * 0.8 * 12) : plan.price;
    validatePromo({ code: promoCode, plan: plan.id, amount: price });
    setSelectedPlan(plan);
  };

  const handleUpgrade = (plan) => {
    const promoId =
      appliedPromo && selectedPlan?.id === plan.id ? appliedPromo._id : null;
    initiate({ planId: plan.id, annual, promoCodeId: promoId });
  };

  const removePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setSelectedPlan(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="page-title whitespace-nowrap">Billing Plan</h1>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setAnnual(false)}
            className={`btn btn-sm flex-1 sm:flex-none ${!annual ? "btn-primary" : "btn-ghost border border-dark-200 dark:border-gray-700"}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`btn btn-sm flex-1 sm:flex-none ${annual ? "btn-primary" : "btn-ghost border border-dark-200 dark:border-gray-700"}`}
          >
            Annual
            <span className="ml-1 bg-success text-white text-[10px] px-1.5 py-0.5 rounded-full">
              -20%
            </span>
          </button>
        </div>
      </div>

      {verifying && (
        <div className="card bg-primary-light border border-primary/20 flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <p className="text-sm font-semibold text-primary">
            Verifying your payment... please wait
          </p>
        </div>
      )}

      {verified && (
        <div className="card bg-success-light border border-success/20 flex items-center gap-3">
          <CheckCircle size={20} className="text-success flex-shrink-0" />
          <p className="text-sm font-semibold text-success">
            🎉 Payment verified! Your plan has been upgraded successfully.
          </p>
        </div>
      )}

      {current?.subscription && (
        <div className="card bg-gradient-to-r from-primary to-purple-700 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Crown size={20} />
            <h2 className="font-bold">
              Current Plan: {user?.plan?.toUpperCase()}
            </h2>
          </div>
          <p className="text-white/80 text-sm">
            Renews on {fmt.date(current.subscription.endDate)}
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`card flex flex-col relative border-2 ${plan.color} ${user?.plan === plan.id ? "ring-2 ring-primary ring-offset-2" : ""}`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
                {plan.badge}
              </div>
            )}
            {user?.plan === plan.id && (
              <div className="absolute -top-3 right-3 bg-success text-white text-xs font-bold px-2 py-1 rounded-full">
                Current
              </div>
            )}
            <div className="mb-4">
              <h3 className="font-bold text-dark dark:text-white mb-1">
                {plan.name}
              </h3>
              {plan.price === null ? (
                <span className="text-2xl font-black text-dark dark:text-white">
                  Custom
                </span>
              ) : plan.price === 0 ? (
                <span className="text-2xl font-black text-dark dark:text-white">
                  Free
                </span>
              ) : (
                <>
                  <span className="text-2xl font-black text-dark dark:text-white">
                    ₦
                    {annual
                      ? Math.round(plan.price * 0.8 * 12).toLocaleString()
                      : plan.price.toLocaleString()}
                  </span>
                  <span className="text-dark-400 text-xs ml-1">
                    {annual ? "/yr" : "/mo"}
                  </span>
                </>
              )}
            </div>
            <ul className="space-y-2 flex-1 mb-4">
              {plan.features.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <CheckCircle
                    size={13}
                    className="text-success flex-shrink-0 mt-0.5"
                  />
                  <span className="text-dark-500 dark:text-gray-400">{f}</span>
                </li>
              ))}
            </ul>
            {user?.plan === plan.id ? (
              <div className="btn btn-ghost border border-success text-success cursor-default">
                Current Plan
              </div>
            ) : plan.price === 0 ? (
              <div className="btn btn-ghost border border-dark-200 cursor-default">
                Free Plan
              </div>
            ) : plan.price === null ? (
              <a
                href="mailto:sales@gettrackeet.com?subject=Enterprise Plan Enquiry"
                className="btn btn-secondary"
              >
                Contact Sales
              </a>
            ) : (
              <div className="space-y-2">
                {/* Promo code input */}
                {appliedPromo && selectedPlan?.id === plan.id ? (
                  <div className="flex items-center justify-between p-2.5 bg-success-light rounded-xl border border-success/20">
                    <div>
                      <p className="text-xs font-bold text-success flex items-center gap-1">
                        <Tag size={11} /> {appliedPromo.code}
                      </p>
                      <p className="text-[10px] text-success/80">
                        Save ₦{appliedPromo.discountAmount.toLocaleString()} → ₦
                        {appliedPromo.finalAmount.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={removePromo}
                      className="text-success hover:text-danger transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-1.5">
                    <input
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      placeholder="Promo code"
                      className="input flex-1 py-2 text-xs font-mono"
                    />
                    <button
                      onClick={() => handleApplyPromo(plan)}
                      disabled={validating}
                      className="btn btn-secondary px-3 py-2 text-xs"
                    >
                      {validating ? (
                        <Loader size={12} className="animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </button>
                  </div>
                )}

                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={isPending}
                  className="btn btn-primary w-full"
                >
                  {isPending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      {appliedPromo && selectedPlan?.id === plan.id
                        ? `Pay ₦${appliedPromo.finalAmount.toLocaleString()}`
                        : "Upgrade"}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="card">
        <h2 className="font-semibold text-dark dark:text-white mb-4">
          Payment Methods We Accept
        </h2>
        <div className="flex items-center justify-center gap-6 flex-wrap mb-6">
          {/* Paystack */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white shadow-card border border-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 48 48" className="w-10 h-10">
                <rect width="48" height="48" rx="24" fill="#00C3F7" />
                <rect
                  x="10"
                  y="16"
                  width="28"
                  height="5"
                  rx="2.5"
                  fill="white"
                />
                <rect
                  x="10"
                  y="26"
                  width="20"
                  height="5"
                  rx="2.5"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-xs text-dark-400 font-medium">Paystack</span>
          </div>

          {/* Flutterwave */}
          {/* <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white shadow-card border border-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 48 48" className="w-10 h-10">
                <rect width="48" height="48" rx="24" fill="#F5A623" />
                <path
                  d="M14 18 Q24 14 34 18 Q24 22 14 18Z"
                  fill="white"
                  opacity="0.9"
                />
                <path
                  d="M12 26 Q22 22 32 26 Q22 30 12 26Z"
                  fill="white"
                  opacity="0.7"
                />
                <path
                  d="M16 34 Q24 30 32 34 Q24 38 16 34Z"
                  fill="white"
                  opacity="0.5"
                />
              </svg>
            </div>
            <span className="text-xs text-dark-400 font-medium">
              Flutterwave
            </span>
          </div> */}

          {/* Stripe */}
          {/* <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white shadow-card border border-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 48 48" className="w-10 h-10">
                <rect width="48" height="48" rx="24" fill="#635BFF" />
                <path
                  d="M24 16c-3 0-5 1.4-5 3.5 0 4.5 7.5 3.2 7.5 5.5 0 1-1 1.5-2.5 1.5-2 0-4-.8-5.5-1.8v4c1.5.8 3.3 1.3 5.5 1.3 3.2 0 5.5-1.5 5.5-3.8 0-4.5-7.5-3.3-7.5-5.5 0-.8.8-1.2 2-1.2 1.8 0 3.5.7 4.8 1.5v-3.8C27.5 16.5 25.8 16 24 16z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-xs text-dark-400 font-medium">Stripe</span>
          </div> */}

          {/* Bank Transfer */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white shadow-card border border-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 48 48" className="w-10 h-10">
                <rect width="48" height="48" rx="24" fill="#10B981" />
                <path
                  d="M24 10L10 17v3h28v-3L24 10zm-9 12h4v10h-4zm6.5 0h4v10h-4zm6.5 0h4v10h-4zM10 34h28v4H10z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-xs text-dark-400 font-medium">
              Bank Transfer
            </span>
          </div>

          {/* Cash */}
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-white shadow-card border border-gray-100 flex items-center justify-center">
              <svg viewBox="0 0 48 48" className="w-10 h-10">
                <rect width="48" height="48" rx="24" fill="#0F172A" />
                <rect
                  x="8"
                  y="16"
                  width="32"
                  height="18"
                  rx="3"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                />
                <circle
                  cx="24"
                  cy="25"
                  r="5"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                />
                <circle cx="24" cy="25" r="2" fill="white" />
                <circle cx="12" cy="25" r="1.5" fill="white" />
                <circle cx="36" cy="25" r="1.5" fill="white" />
              </svg>
            </div>
            <span className="text-xs text-dark-400 font-medium">Cash</span>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-dark rounded-xl">
          <p className="text-sm font-semibold text-dark dark:text-white mb-1">
            Bank Transfer Instructions
          </p>
          <p className="text-xs text-dark-400">
            Transfer to: <strong>Trackeet Technologies</strong> · Contact us at{" "}
            <a href="mailto:hello@gettrackeet.com" className="text-primary">
              hello@gettrackeet.com
            </a>{" "}
            for account details.
          </p>
          <p className="text-xs text-dark-400 mt-1">
            Use your email as payment reference. Send proof to{" "}
            <a href="mailto:hello@gettrackeet.com" className="text-primary">
              hello@gettrackeet.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
