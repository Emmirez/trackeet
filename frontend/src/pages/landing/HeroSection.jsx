import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  CheckCircle,
  FileText,
  CreditCard,
  MessageSquare,
  Clock,
  ArrowRight,
  Star,
  ChevronDown,
  Zap,
  ChevronRight,
} from "lucide-react";
import { TESTIMONIALS } from "./landingData.js";

const ROTATING_TEXTS = [
  { line1: "Get Paid", line2: "Faster.", color: "gradient-text" },
  { line1: "Look More", line2: "Professional.", color: "gradient-text" },
  { line1: "Stop Chasing", line2: "Payments.", color: "gradient-text" },
  { line1: "Automate Your", line2: "WhatsApp.", color: "gradient-text" },
  { line1: "Launch Your", line2: "Online Store." },
  { line1: "Send Bulk", line2: "Messages.", color: "gradient-text" },
  {
    line1: "Customer",
    line2: "Communication Platform.",
    color: "gradient-text",
  },
];

export default function HeroSection() {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((i) => (i + 1) % ROTATING_TEXTS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark dark:via-surface dark:to-dark">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/*  Left  */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light text-primary text-sm font-semibold rounded-full mb-6 shadow-sm">
            <Zap size={14} /> Built for Nigeria Businesses 🇳🇬
          </div>

          {/* Rotating headline */}
          <div className="mb-6 min-h-[160px] sm:min-h-[140px] lg:min-h-[180px]">
            <AnimatePresence mode="wait">
              <motion.h1
                key={textIndex}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-dark dark:text-white leading-tight"
              >
                {ROTATING_TEXTS[textIndex].line1}
                <br />
                <span className="gradient-text">
                  {ROTATING_TEXTS[textIndex].line2}
                </span>
              </motion.h1>
            </AnimatePresence>

            {/* Rotating dots indicator */}
            <div className="flex items-center gap-2 mt-4">
              {ROTATING_TEXTS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setTextIndex(i)}
                  className={`transition-all duration-300 rounded-full ${i === textIndex ? "w-6 h-2 bg-primary" : "w-2 h-2 bg-dark-200 hover:bg-primary/40"}`}
                />
              ))}
            </div>
          </div>

          <p className="text-lg text-dark-500 dark:text-gray-400 mb-8 max-w-lg leading-relaxed">
            Create invoices, track payments, automate WhatsApp messages and
            launch your
            <span className="text-primary font-semibold">
              {" "}
              free online store
            </span>{" "}
            — all in one place. Built for Nigerian businesses that want to look
            professional and get paid faster.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Link to="/register" className="btn btn-primary btn-lg shadow-glow">
              Start for Free <ArrowRight size={20} />
            </Link>
            <button
              onClick={() =>
                document
                  .getElementById("demo")
                  .scrollIntoView({ behavior: "smooth" })
              }
              className="btn btn-secondary btn-lg group"
            >
              <span className="w-7 h-7 bg-primary-light rounded-full flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                <ChevronRight
                  size={14}
                  className="text-primary group-hover:text-white"
                />
              </span>
              See How It Works
            </button>
          </div>

          {/* Trust badges */}
          <div className="flex items-center gap-6 text-sm text-dark-400 mb-8">
            <div className="flex items-center gap-1.5">
              <CheckCircle size={16} className="text-success" /> No credit card
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={16} className="text-success" /> Free plan
              forever
            </div>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-3 p-3 bg-white dark:bg-surface rounded-2xl shadow-card w-fit border border-dark-200/50 dark:border-gray-700/40">
            <div className="flex -space-x-2">
              {TESTIMONIALS.slice(0, 5).map((t, i) => (
                <img
                  key={i}
                  src={t.avatar}
                  alt={t.name}
                  className="w-8 h-8 rounded-full border-2 border-white object-cover"
                />
              ))}
            </div>
            <div>
              <div className="flex text-warning text-sm">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
              </div>
              <p className="text-xs text-dark-400">
                Loved by{" "}
                <strong className="text-dark dark:text-white">12,000+</strong>{" "}
                businesses
              </p>
            </div>
          </div>
        </motion.div>

        {/* Right Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative block"
        >
          <div className="animate-float">
            {/* Glow behind card */}
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl scale-95 -z-10" />

            <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl p-1.5 border border-dark-200/50 dark:border-gray-700/50 overflow-hidden">
              {/* Browser bar */}
              <div className="bg-dark-100 dark:bg-gray-800 rounded-2xl px-4 py-2 flex items-center gap-2 mb-1">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-danger" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                </div>
                <div className="flex-1 bg-white dark:bg-gray-700 rounded-full px-3 py-0.5 text-xs text-dark-400 font-medium flex items-center gap-1">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  app.trackeet.ng
                </div>
              </div>

              {/* Dashboard */}
              <div className="bg-gray-50 dark:bg-dark rounded-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-dark-400">Good morning,</p>
                    <p className="font-bold text-dark dark:text-white">
                      John 👋
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-light rounded-xl flex items-center justify-center relative">
                      <span className="text-base">🔔</span>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full border-2 border-white" />
                    </div>
                    <img
                      src="/Trackeet-logo.png"
                      alt="Trackeet"
                      className="w-9 h-9"
                    />
                  </div>
                </div>

                {/* Balance card */}
                <div className="bg-gradient-to-r from-primary via-purple-600 to-purple-700 rounded-2xl p-4 text-white mb-4 relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />
                  <p className="text-xs opacity-80 mb-1 relative">
                    Total Balance
                  </p>
                  <p className="text-2xl font-black mb-1 relative">
                    ₦1,250,000
                  </p>
                  <p className="text-xs opacity-80 relative flex items-center gap-1">
                    <span className="text-success-light">▲</span> +12.5% from
                    last month
                  </p>
                  <div className="grid grid-cols-4 gap-2 mt-4 relative">
                    {[
                      { l: "Invoice", I: FileText },
                      { l: "Payment", I: CreditCard },
                      { l: "Remind", I: Clock },
                      { l: "WhatsApp", I: MessageSquare },
                    ].map(({ l, I }, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors cursor-pointer">
                          <I size={14} />
                        </div>
                        <span className="text-[9px] opacity-80">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    {
                      label: "Paid",
                      value: "₦1.75M",
                      color: "text-success",
                      bg: "bg-success-light",
                    },
                    {
                      label: "Pending",
                      value: "₦500k",
                      color: "text-warning",
                      bg: "bg-warning-light",
                    },
                    {
                      label: "Overdue",
                      value: "₦200k",
                      color: "text-danger",
                      bg: "bg-danger-light",
                    },
                  ].map((s, i) => (
                    <div
                      key={i}
                      className={`${s.bg} rounded-xl p-2 text-center`}
                    >
                      <p className={`text-xs font-black ${s.color}`}>
                        {s.value}
                      </p>
                      <p className="text-[9px] text-dark-400">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Invoice list */}
                <div className="space-y-1.5">
                  {[
                    {
                      name: "Sarah Johnson",
                      inv: "INV-2024-0018",
                      amount: "₦250,000",
                      status: "paid",
                      bg: "bg-primary",
                    },
                    {
                      name: "Michael Brown",
                      inv: "INV-2024-0017",
                      amount: "₦150,000",
                      status: "pending",
                      bg: "bg-success",
                    },
                    {
                      name: "Excel Stores",
                      inv: "INV-2024-0016",
                      amount: "₦350,000",
                      status: "overdue",
                      bg: "bg-warning",
                    },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-white dark:bg-surface rounded-xl p-2.5 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div
                        className={`avatar w-7 h-7 text-xs flex-shrink-0 ${row.bg}`}
                      >
                        {row.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-dark dark:text-white truncate">
                          {row.inv}
                        </p>
                        <p className="text-[10px] text-dark-400 truncate">
                          {row.name}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs font-bold text-dark dark:text-white">
                          {row.amount}
                        </p>
                        <span
                          className={
                            "badge-" + row.status + " text-[8px] px-1.5 py-0.5"
                          }
                        >
                          {row.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Floating badge — payment */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute left-2 top-16 bg-white dark:bg-surface rounded-2xl shadow-xl p-3 flex items-center gap-2 border border-dark-200/50"
          >
            <div className="w-9 h-9 bg-success-light rounded-xl flex items-center justify-center">
              <CheckCircle size={18} className="text-success" />
            </div>
            <div>
              <p className="text-xs font-bold text-dark dark:text-white">
                Payment Received!
              </p>
              <p className="text-[10px] text-dark-400">₦250,000 from Sarah</p>
            </div>
          </motion.div>

          {/* Floating badge — WhatsApp */}
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
            className="absolute right-2 bottom-16 bg-white dark:bg-surface rounded-2xl shadow-xl p-3 flex items-center gap-2 border border-dark-200/50"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              className="w-8 h-8"
              alt="WhatsApp"
            />
            <div>
              <p className="text-xs font-bold text-dark dark:text-white">
                Invoice Sent!
              </p>
              <p className="text-[10px] text-dark-400">Via WhatsApp ✅</p>
            </div>
          </motion.div>

          {/* Floating badge — new customer */}
          <motion.div
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 3, repeat: Infinity, delay: 0.8 }}
            className="absolute right-2 top-1/3 bg-white dark:bg-surface rounded-2xl shadow-xl p-3 flex items-center gap-2 border border-dark-200/50"
          >
            <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center text-lg">
              🎉
            </div>
            <div>
              <p className="text-xs font-bold text-dark dark:text-white">
                New Customer!
              </p>
              <p className="text-[10px] text-dark-400">Linda Ikeji added</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Floating badge — store */}
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, delay: 1.5 }}
          className="absolute left-0 bottom-8 bg-white dark:bg-surface rounded-2xl shadow-xl p-3 flex items-center gap-2 border border-dark-200/50"
        >
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center text-lg">
            🛍️
          </div>
          <div>
            <p className="text-xs font-bold text-dark dark:text-white">
              New Store Order!
            </p>
            <p className="text-[10px] text-dark-400">Via WhatsApp 💬</p>
          </div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <a
        href="#features"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-dark-400 hover:text-primary transition-colors animate-bounce-slow"
      >
        <span className="text-xs font-medium">Scroll to explore</span>
        <ChevronDown size={20} />
      </a>
    </section>
  );
}
