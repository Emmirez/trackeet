import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, ArrowRight, Zap } from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const PLANS = [
  {
    name: "Free",
    price: 0,
    period: "Forever",
    badge: null,
    highlight: false,
    cta: "Get Started Free",
    ctaStyle: "btn-secondary",
    features: [
      "5 invoices per month",
      "Basic customer list",
      "PDF download",
      "Manual payment tracking",
      "🛍️ Free online store",
      "Email support",
    ],
  },
  {
    name: "Starter",
    price: 2000,
    period: "per month",
    badge: "Most Popular",
    highlight: true,
    cta: "Start Starter Plan",
    ctaStyle: "btn-primary",
    features: [
      "50 invoices per month",
      "Unlimited customers",
      "WhatsApp automation",
      "Payment reminders",
      "PDF receipts",
      "🛍️ Free online store",
      "Product variants & reviews",
      "Basic reports",
      "Priority support",
    ],
  },
  {
    name: "Business",
    price: 5000,
    period: "per month",
    badge: "Best Value",
    highlight: false,
    cta: "Start Business Plan",
    ctaStyle: "btn-secondary",
    features: [
      "Unlimited invoices",
      "All Starter features",
      "AI business insights",
      "WhatsApp campaigns",
      "Advanced reports",
      "🛍️ Free online store",
      "Store analytics",
      "Newsletter",
      "Multi-user (3 seats)",
      "Dedicated support",
    ],
  },
  {
    name: "Enterprise",
    price: null,
    period: "Custom pricing",
    badge: null,
    highlight: false,
    cta: "Contact Sales",
    ctaStyle: "btn-secondary",
    features: [
      "Everything in Business",
      "Unlimited seats",
      "Custom integrations",
      "API access",
      "🛍️ Custom store domain",
      "SLA guarantee",
      "Onboarding support",
      "Custom invoice templates",
    ],
  },
];

export default function PricingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [annual, setAnnual] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  return (
    <div className="font-poppins overflow-x-hidden">
      <Navbar scrolled={scrolled} />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark dark:via-surface dark:to-dark">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl sm:text-5xl font-black text-dark dark:text-white mb-4">
            Simple, honest <span className="gradient-text">pricing</span>
          </h1>
          <p className="text-lg text-dark-500 dark:text-gray-400 mb-8">
            No hidden fees. Cancel anytime. Start free — includes your own
            online store.
          </p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-white dark:bg-dark rounded-xl p-1 border border-dark-200 dark:border-gray-700">
            <button
              onClick={() => setAnnual(false)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${!annual ? "bg-primary text-white shadow-sm" : "text-dark-400"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${annual ? "bg-primary text-white shadow-sm" : "text-dark-400"}`}
            >
              Annual{" "}
              <span className="bg-success text-white text-xs px-2 py-0.5 rounded-full">
                Save 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Lifestyle image banner */}
      <div className="py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              src: "/images/team1.jpg",
              label: "Track Every Payment",
              emoji: "💰",
            },
            {
              src: "/images/fashion.jpg",
              label: "Launch Your Store",
              emoji: "🛍️",
            },
            {
              src: "/images/eating.jpg",
              label: "Food Businesses",
              emoji: "🍔",
            },
            { src: "/images/business.jpg", label: "Grow Faster", emoji: "📈" },
          ].map((img, i) => (
            <div
              key={i}
              className="relative h-36 rounded-2xl overflow-hidden group"
            >
              <img
                src={img.src}
                alt={img.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-3 flex items-center gap-1.5">
                <span className="text-sm">{img.emoji}</span>
                <p className="text-white text-xs font-semibold">{img.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Plans */}
      <section className="py-16 bg-white dark:bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Storefront banner */}
          <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/30 flex items-center gap-4 flex-wrap">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
              🛍️
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-dark dark:text-white text-sm">
                Free online store included in every plan
              </p>
              <p className="text-xs text-dark-400 mt-0.5">
                Get your own storefront at gettrackeet.com/store/yourname — add
                products, share your link and receive orders via WhatsApp.
              </p>
            </div>
            <Link
              to="/register"
              className="btn btn-primary btn-sm flex-shrink-0"
            >
              Get Your Store →
            </Link>
          </div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {PLANS.map((plan, i) => (
              <motion.div
                key={i}
                variants={fade}
                className={`card relative flex flex-col ${plan.highlight ? "border-2 border-primary shadow-glow scale-105" : "border border-dark-200 dark:border-gray-700"}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                    {plan.badge}
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-dark dark:text-white mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    {plan.price === null ? (
                      <span className="text-2xl font-black text-dark dark:text-white">
                        Custom
                      </span>
                    ) : plan.price === 0 ? (
                      <span className="text-3xl font-black text-dark dark:text-white">
                        Free
                      </span>
                    ) : (
                      <>
                        <span className="text-3xl font-black text-dark dark:text-white">
                          ₦
                          {annual
                            ? Math.round(plan.price * 0.8 * 12).toLocaleString()
                            : plan.price.toLocaleString()}
                        </span>
                        <span className="text-dark-400 text-sm">
                          {annual ? "/year" : "/month"}
                        </span>
                      </>
                    )}
                  </div>
                  {annual && plan.price > 0 && (
                    <p className="text-xs text-success mt-1 font-medium">
                      Save ₦{Math.round(plan.price * 0.2 * 12).toLocaleString()}
                      /year
                    </p>
                  )}
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-start gap-2 text-sm">
                      <CheckCircle
                        size={16}
                        className="text-success flex-shrink-0 mt-0.5"
                      />
                      <span className="text-dark-500 dark:text-gray-400">
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                {plan.name === "Enterprise" && (
                  <Link
                    to="/sla"
                    className="text-xs text-primary hover:underline block text-center mb-2"
                  >
                    View SLA Terms →
                  </Link>
                )}
                {plan.cta === "Contact Sales" ? (
                  <a
                    href="mailto:sales@gettrackeet.com?subject=Enterprise Plan Enquiry"
                    className={`btn ${plan.ctaStyle} w-full`}
                  >
                    {plan.cta}
                  </a>
                ) : (
                  <Link
                    to="/register"
                    className={`btn ${plan.ctaStyle} w-full`}
                  >
                    {plan.cta}
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
          {/* Payment methods */}
          <div className="mt-16 text-center">
            <p className="text-sm text-dark-400 mb-6 font-medium">
              Secure payments via
            </p>
            <div className="flex items-center justify-center gap-6 flex-wrap mb-8">
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
                <span className="text-xs text-dark-400 font-medium">
                  Paystack
                </span>
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
                <span className="text-xs text-dark-400 font-medium">
                  Stripe
                </span>
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

            {/* Bank transfer instructions */}
            {/* <div className="card max-w-lg mx-auto text-left">
              <p className="text-sm font-semibold text-dark dark:text-white mb-1">
                Bank Transfer Instructions
              </p>
              <p className="text-xs text-dark-400">
                Transfer to: <strong>Trackeet Technologies Ltd</strong> · GTBank
                · 0123456789
              </p>
              <p className="text-xs text-dark-400 mt-1">
                Use your email as payment reference. Send proof to{" "}
                <a href="mailto:hello@gettrackeet.com" className="text-primary">
                  hello@gettrackeet.com
                </a>
              </p>
            </div> */}
          </div>
        </div>
      </section>

      {/* Bottom CTA banner */}
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark">
        <div className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden h-64">
          <img
            src="/images/sal.jpg"
            alt="Nigerian business owners"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 flex items-center justify-center flex-col text-center px-8">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Start free. Upgrade when ready.
            </h3>
            <p className="text-white/80 text-sm max-w-md mb-5">
              Join 12,000+ Nigerian businesses already using Trackeet to get
              paid faster and look more professional.
            </p>
            <Link
              to="/register"
              className="bg-white text-dark font-bold px-8 py-3 rounded-2xl hover:bg-gray-100 transition-all shadow-xl hover:scale-105"
            >
              Get Started Free →
            </Link>
          </div>
        </div>
      </div>

      <Footer />

      <Footer />
    </div>
  );
}
