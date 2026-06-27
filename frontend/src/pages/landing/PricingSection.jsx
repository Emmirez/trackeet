import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { Section, fade } from "./animations.jsx";
import { PLANS } from "./landingData.js";

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  return (
    <section id="pricing" className="py-20 bg-gray-50 dark:bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Section>
          <motion.div variants={fade} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-dark dark:text-white mb-4">
              Simple, honest <span className="gradient-text">pricing</span>
            </h2>
            <p className="text-dark-500 dark:text-gray-400 mb-6">
              No hidden fees. Cancel anytime.
            </p>
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
          </motion.div>
          {/* Lifestyle image banner */}
          <motion.div variants={fade} className="mb-8 relative rounded-3xl overflow-hidden h-48">
            <img
              src="/images/money.jpg"
              alt="Nigerian business owners"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/40 to-purple-10/70" />
            <div className="absolute inset-0 flex items-center px-8 gap-8">
              <div className="flex-1">
                <p className="text-white/80 text-sm font-medium mb-1">Trusted by 12,000+ businesses</p>
                <h3 className="text-white text-2xl font-black mb-2">Plans that grow with your business</h3>
                <p className="text-white/70 text-sm">Start free. Upgrade when you're ready. No contracts.</p>
              </div>
              <div className="hidden md:grid grid-cols-2 gap-3">
                {[
                  { value: "12K+", label: "Businesses" },
                  { value: "₦2.4B+", label: "Invoiced" },
                  { value: "98%", label: "Satisfaction" },
                  { value: "36", label: "States" },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center">
                    <p className="text-white font-black text-lg">{stat.value}</p>
                    <p className="text-white/70 text-xs">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
          {/* Storefront banner */}
          <motion.div
            variants={fade}
            className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/30 flex items-center gap-4 flex-wrap"
          >
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
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          </div>
          <motion.div variants={fade} className="mt-12 text-center">
            <p className="text-sm text-dark-400 mb-4 font-medium">
              Secure payments via
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
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
          </motion.div>
        </Section>
      </div>
    </section>
  );
}
