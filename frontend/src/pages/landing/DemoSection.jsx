import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Play, ArrowRight, CheckCircle, X } from "lucide-react";
import { Section, fade } from "./animations.jsx";
import { DEMO_CONTENT } from "./landingData.js";

const TABS = [
  "Create Invoice",
  "Track Payments",
  "WhatsApp Auto",
  "Online Store",
];

const PHONE_SCREENS = [
  // Screen 1 — Create Invoice
  <div className="w-full h-full bg-gray-50 flex flex-col">
    <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-2">
      <div className="w-6 h-6 bg-primary rounded-lg" />
      <span className="text-xs font-bold text-dark">Create Invoice</span>
    </div>
    <div className="p-3 space-y-2 flex-1 overflow-hidden">
      <div className="bg-white rounded-xl p-3 shadow-sm">
        <p className="text-[9px] text-dark-400 mb-1">Customer</p>
        <p className="text-[11px] font-semibold text-dark">Sarah Johnson</p>
      </div>
      <div className="bg-white rounded-xl p-3 shadow-sm">
        <p className="text-[9px] text-dark-400 mb-2">Items</p>
        {[
          { name: "Logo Design", price: "₦150,000" },
          { name: "Web Development", price: "₦300,000" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex justify-between items-center py-1 border-b border-gray-50"
          >
            <p className="text-[10px] font-medium text-dark">{item.name}</p>
            <p className="text-[10px] font-bold text-primary">{item.price}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-3 shadow-sm">
        <div className="flex justify-between">
          <p className="text-[9px] text-dark-400">Subtotal</p>
          <p className="text-[9px] text-dark">₦450,000</p>
        </div>
        <div className="flex justify-between mt-1">
          <p className="text-[10px] font-black text-dark">Total</p>
          <p className="text-[10px] font-black text-primary">₦450,000</p>
        </div>
      </div>
      <button className="w-full bg-primary text-white text-[10px] font-bold py-2.5 rounded-xl">
        Save & Send Invoice
      </button>
    </div>
    <div className="bg-white border-t border-gray-100 flex items-center justify-around py-2">
      {["🏠", "📄", "💳", "👥", "📊"].map((icon, i) => (
        <span
          key={i}
          className={`text-sm ${i === 1 ? "opacity-100" : "opacity-30"}`}
        >
          {icon}
        </span>
      ))}
    </div>
  </div>,

  // Screen 2 — Track Payments
  <div className="w-full h-full bg-gray-50 flex flex-col">
    <div className="bg-white px-4 py-3 border-b border-gray-100 flex items-center gap-2">
      <div className="w-6 h-6 bg-success rounded-lg" />
      <span className="text-xs font-bold text-dark">Payments</span>
    </div>
    <div className="p-3 space-y-2 flex-1 overflow-hidden">
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-2xl p-3 text-white">
        <p className="text-[9px] opacity-80">Total Received</p>
        <p className="text-base font-black">₦1,750,000</p>
        <p className="text-[9px] opacity-80 mt-1">+12 payments this month</p>
      </div>
      {[
        {
          name: "Sarah Johnson",
          amount: "₦250,000",
          date: "24 May",
          status: "paid",
        },
        {
          name: "Michael Brown",
          amount: "₦150,000",
          date: "23 May",
          status: "paid",
        },
        {
          name: "Excel Stores",
          amount: "₦350,000",
          date: "21 May",
          status: "paid",
        },
        {
          name: "Linda Ikeji",
          amount: "₦100,000",
          date: "19 May",
          status: "paid",
        },
      ].map((row, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-white rounded-xl p-2.5 shadow-sm"
        >
          <div className="w-7 h-7 bg-primary-light rounded-full flex items-center justify-center text-primary text-[10px] font-bold flex-shrink-0">
            {row.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-dark truncate">
              {row.name}
            </p>
            <p className="text-[9px] text-dark-400">{row.date}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold text-dark">{row.amount}</p>
            <span className="text-[8px] font-bold text-success">✓ Paid</span>
          </div>
        </div>
      ))}
    </div>
    <div className="bg-white border-t border-gray-100 flex items-center justify-around py-2">
      {["🏠", "📄", "💳", "👥", "📊"].map((icon, i) => (
        <span
          key={i}
          className={`text-sm ${i === 2 ? "opacity-100" : "opacity-30"}`}
        >
          {icon}
        </span>
      ))}
    </div>
  </div>,

  // Screen 3 — WhatsApp Auto
  <div className="w-full h-full bg-gray-50 flex flex-col">
    <div className="bg-[#075E54] px-4 py-3 flex items-center gap-2">
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
        className="w-5 h-5"
        alt="WA"
      />
      <span className="text-xs font-bold text-white">WhatsApp Automation</span>
    </div>
    <div className="p-3 space-y-2 flex-1 overflow-hidden bg-[#ECE5DD]">
      {[
        {
          from: "trackeet",
          msg: "Hi Sarah! 👋 Your invoice INV-2024-0018 for ₦250,000 is ready. Due: 31 May 2024.",
          time: "10:30 AM",
        },
        {
          from: "customer",
          msg: "Thanks! I will pay by Friday.",
          time: "10:45 AM",
        },
        {
          from: "trackeet",
          msg: "Payment reminder: INV-2024-0018 for ₦250,000 is due tomorrow. Please arrange payment. 🙏",
          time: "9:00 AM",
        },
        {
          from: "trackeet",
          msg: "Payment received! ✅ ₦250,000 confirmed. Thank you Sarah! Receipt attached.",
          time: "2:15 PM",
        },
      ].map((msg, i) => (
        <div
          key={i}
          className={`flex ${msg.from === "customer" ? "justify-start" : "justify-end"}`}
        >
          <div
            className={`max-w-[75%] px-3 py-2 rounded-2xl text-[9px] shadow-sm ${msg.from === "customer" ? "bg-white text-dark rounded-tl-none" : "bg-[#DCF8C6] text-dark rounded-tr-none"}`}
          >
            <p className="leading-relaxed">{msg.msg}</p>
            <p className="text-[7px] text-dark-400 mt-1 text-right">
              {msg.time}
            </p>
          </div>
        </div>
      ))}
    </div>
    <div className="bg-white border-t border-gray-100 flex items-center justify-around py-2">
      {["🏠", "📄", "💳", "👥", "📊"].map((icon, i) => (
        <span
          key={i}
          className={`text-sm ${i === 4 ? "opacity-100" : "opacity-30"}`}
        >
          {icon}
        </span>
      ))}
    </div>
  </div>,

  // Screen 4 — Online Store
  <div className="w-full h-full bg-gray-50 flex flex-col">
    <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-4 py-3 flex items-center justify-between">
      <div>
        <p className="text-[9px] text-white/80">trackeet.ng/store/</p>
        <p className="text-xs font-black text-white">Sarah's Fashion</p>
      </div>
      <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
        <span className="text-sm">👗</span>
      </div>
    </div>
    <div className="p-2 flex-1 overflow-hidden space-y-2">
      <div className="grid grid-cols-2 gap-1.5">
        {[
          { name: "Red Gown", price: "₦15,000", emoji: "👗", badge: "NEW" },
          { name: "Black Bag", price: "₦8,500", emoji: "👜", badge: "🔥" },
          { name: "Sneakers", price: "₦22,000", emoji: "👟", badge: null },
          { name: "Sunglasses", price: "₦5,000", emoji: "🕶️", badge: "SALE" },
        ].map((p, i) => (
          <div
            key={i}
            className="bg-white rounded-xl overflow-hidden shadow-sm"
          >
            <div className="h-16 bg-gradient-to-br from-purple-100 to-pink-50 flex items-center justify-center relative">
              <span className="text-3xl">{p.emoji}</span>
              {p.badge && (
                <span className="absolute top-1 left-1 text-[7px] font-black bg-pink-500 text-white px-1 py-0.5 rounded-full">
                  {p.badge}
                </span>
              )}
              <button className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                <span className="text-[8px]">❤️</span>
              </button>
            </div>
            <div className="p-1.5">
              <p className="text-[9px] font-bold text-gray-800 truncate">
                {p.name}
              </p>
              <p className="text-[9px] font-black text-purple-600">{p.price}</p>
              <button className="w-full mt-1 bg-green-500 text-white text-[7px] font-bold py-1 rounded-lg flex items-center justify-center gap-0.5">
                <span>💬</span> Order
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl p-2 shadow-sm flex items-center gap-2">
        <span className="text-sm">🛒</span>
        <div className="flex-1">
          <p className="text-[9px] font-bold text-gray-800">Cart — 2 items</p>
          <p className="text-[9px] text-gray-400">₦23,500 total</p>
        </div>
        <button className="bg-green-500 text-white text-[7px] font-bold px-2 py-1 rounded-lg">
          Order via WhatsApp
        </button>
      </div>
    </div>
    <div className="bg-white border-t border-gray-100 flex items-center justify-around py-2">
      {["🏠", "❤️", "🛒", "📦", "📞"].map((icon, i) => (
        <span
          key={i}
          className={`text-sm ${i === 0 ? "opacity-100" : "opacity-30"}`}
        >
          {icon}
        </span>
      ))}
    </div>
  </div>,
];

function PhoneMockup({ screen }) {
  return (
    <div className="relative w-56 h-[480px] mx-auto">
      {/* Phone shell */}
      <div className="absolute inset-0 bg-gray-900 rounded-[3rem] shadow-2xl border-[6px] border-gray-800">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-b-2xl z-10" />
        {/* Side buttons */}
        <div className="absolute -left-2 top-20 w-1 h-7 bg-gray-700 rounded-l-lg" />
        <div className="absolute -left-2 top-32 w-1 h-10 bg-gray-700 rounded-l-lg" />
        <div className="absolute -right-2 top-24 w-1 h-12 bg-gray-700 rounded-r-lg" />
        {/* Screen */}
        <div className="absolute inset-1 bg-white rounded-[2.5rem] overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 pt-2 pb-1 bg-white">
            <span className="text-[9px] font-bold text-dark">9:41</span>
            <div className="flex items-center gap-0.5">
              <div className="w-3 h-1.5 border border-dark rounded-sm">
                <div className="w-2/3 h-full bg-dark rounded-sm" />
              </div>
            </div>
          </div>
          {/* Dynamic screen content */}
          <div className="w-full" style={{ height: "calc(100% - 28px)" }}>
            {screen}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DemoSection() {
  const [activeTab, setActiveTab] = useState(0);
  const [showVideo, setShowVideo] = useState(false);

  return (
    <section id="demo" className="py-20 bg-gray-50 dark:bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Section>
          <motion.div variants={fade} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-dark dark:text-white mb-4">
              See how it works
            </h2>
            <p className="text-dark-500 dark:text-gray-400">
              Simple, fast, and designed for how you actually work
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-10 flex-wrap">
            {TABS.map((t, i) => (
              <button
                key={i}
                onClick={() => setActiveTab(i)}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === i ? "bg-primary text-white shadow-glow-sm" : "bg-white dark:bg-dark text-dark-500 hover:bg-primary-light hover:text-primary"}`}
              >
                {t}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-2 gap-10 items-center"
            >
              {/* Left — text */}
              <div>
                <h3 className="text-2xl font-bold text-dark dark:text-white mb-4">
                  {DEMO_CONTENT[activeTab].title}
                </h3>
                <p className="text-dark-500 dark:text-gray-400 mb-6 leading-relaxed">
                  {DEMO_CONTENT[activeTab].desc}
                </p>
                <div className="space-y-3">
                  {DEMO_CONTENT[activeTab].steps.map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-primary-light rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">
                          {i + 1}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-dark dark:text-white">
                        {s}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-8">
                  <Link to="/register" className="btn btn-primary">
                    Get Started <ArrowRight size={18} />
                  </Link>
                  {DEMO_CONTENT[activeTab].loomId && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="btn btn-secondary"
                    >
                      <Play size={16} /> Watch Demo
                    </button>
                  )}
                </div>
              </div>

              {/* Right — phone mockup */}
              <div className="relative flex justify-center">
                <PhoneMockup screen={PHONE_SCREENS[activeTab]} />

                {/* Floating badge 1 */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute -right-4 top-16 bg-white rounded-2xl shadow-lg p-2.5 flex items-center gap-2 border border-gray-100 max-w-[160px]"
                >
                  <div className="w-7 h-7 bg-success-light rounded-xl flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={14} className="text-success" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-dark">
                      {activeTab === 3
                        ? "New Store Order!"
                        : "Payment Received!"}
                    </p>
                    <p className="text-[9px] text-dark-400">
                      {activeTab === 3
                        ? "Red Gown × 1 💬"
                        : "₦250,000 from Sarah"}
                    </p>
                  </div>
                </motion.div>

                {/* Floating badge 2 */}
                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                  className="absolute -left-4 bottom-20 bg-white rounded-2xl shadow-lg p-2.5 flex items-center gap-2 border border-gray-100 max-w-[150px]"
                >
                  {activeTab === 3 ? (
                    <div className="w-7 h-7 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 text-base">
                      🛍️
                    </div>
                  ) : (
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                      className="w-7 h-7 flex-shrink-0"
                      alt="WA"
                    />
                  )}
                  <div>
                    <p className="text-[10px] font-bold text-dark">
                      {activeTab === 3 ? "Store is Live! 🎉" : "Invoice Sent!"}
                    </p>
                    <p className="text-[9px] text-dark-400">
                      {activeTab === 3
                        ? "trackeet.ng/store/..."
                        : "Via WhatsApp ✅"}
                    </p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </AnimatePresence>
        </Section>
      </div>

      {/* Video modal */}
      {showVideo && DEMO_CONTENT[activeTab].loomId && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowVideo(false)}
        >
          <div
            className="bg-white dark:bg-surface rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-dark-100 dark:border-gray-700">
              <p className="font-bold text-dark dark:text-white text-sm">
                {DEMO_CONTENT[activeTab].title}
              </p>
              <button
                onClick={() => setShowVideo(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>
            <div
              className="relative"
              style={{ paddingBottom: "62.5%", height: 0 }}
            >
              <iframe
                src={`https://www.loom.com/embed/${DEMO_CONTENT[activeTab].loomId}`}
                className="absolute top-0 left-0 w-full h-full"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
