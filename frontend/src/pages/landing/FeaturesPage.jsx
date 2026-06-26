import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Zap,
  FileText,
  CreditCard,
  MessageSquare,
  BarChart3,
  Users,
  Shield,
  ArrowRight,
  CheckCircle,
  ShoppingBag,
  Store,
} from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const FEATURES = [
  {
    icon: FileText,
    color: "bg-primary-light text-primary",
    title: "Smart Invoicing",
    desc: "Create professional invoices in seconds with your logo and business details. Auto-numbered, PDF ready.",
    points: [
      "Auto-generated invoice numbers",
      "Your logo and business branding",
      "One-click PDF download",
      "Send directly via WhatsApp or email",
    ],
  },
  {
    icon: CreditCard,
    color: "bg-success-light text-success",
    title: "Payment Tracking",
    desc: "Know who paid and who owes you in real time. Never lose a naira to forgotten debts again.",
    points: [
      "Real-time payment status",
      "Record partial or full payments",
      "Outstanding balance per customer",
      "Payment history and audit trail",
    ],
  },
  {
    icon: MessageSquare,
    color: "bg-[#dcfce7] text-[#16a34a]",
    title: "WhatsApp Automation",
    desc: "Auto-send invoices, payment reminders and receipts directly to your customers on WhatsApp.",
    points: [
      "Auto-send invoices on creation",
      "Payment reminders before due date",
      "Receipt on payment received",
      "Daily business summary to yourself",
    ],
  },
  {
    icon: BarChart3,
    color: "bg-warning-light text-warning",
    title: "Business Reports",
    desc: "See your total revenue, best customers, and business growth trends at a glance.",
    points: [
      "Revenue charts by week/month/year",
      "Top paying customers",
      "Invoice overview pie chart",
      "Export reports as PDF",
    ],
  },
  {
    icon: Users,
    color: "bg-info-light text-info",
    title: "Customer Management",
    desc: "Keep all your customer records organised. Track history, spending and balances.",
    points: [
      "Full customer profile",
      "Invoice history per customer",
      "Outstanding balance tracking",
      "WhatsApp number stored for automation",
    ],
  },
  {
    icon: Shield,
    color: "bg-danger-light text-danger",
    title: "Bank-Grade Security",
    desc: "Your data is encrypted and protected. JWT auth, rate limiting and full audit logs.",
    points: [
      "AES-256 data encryption",
      "JWT authentication",
      "Rate limiting on all endpoints",
      "Full audit log of all actions",
    ],
  },
  {
    icon: Store,
    color: "bg-purple-100 text-purple-600",
    title: "Free Online Store",
    desc: "Every account gets a free storefront at gettrackeet.com/store/yourname. Add products, share your link and customers order via WhatsApp instantly.",
    points: [
      "Your own store link instantly",
      "Add products with photos and prices",
      "Customers browse and add to cart",
      "Orders arrive on your WhatsApp",
    ],
  },
  {
    icon: ShoppingBag,
    color: "bg-warning-light text-warning",
    title: "WhatsApp Commerce",
    desc: "No payment gateway needed. Customers pick products and order via WhatsApp — you confirm and deliver.",
    points: [
      "Cart system with multiple products",
      "Wishlist for saved products",
      "Product variants — size, color",
      "Order tracking for customers",
    ],
  },
];

export default function FeaturesPage() {
  const [scrolled, setScrolled] = useState(false);
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
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light text-primary text-sm font-semibold rounded-full mb-6">
            <Zap size={14} /> Everything you need
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-dark dark:text-white mb-4">
            Powerful features for
            <br />
            <span className="gradient-text">Modern businesses</span>
          </h1>
          <p className="text-lg text-dark-500 dark:text-gray-400 max-w-xl mx-auto mb-8">
            Invoices, payments, WhatsApp automation and your own free online
            store — everything a Nigerian business needs in one simple app.
          </p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Start for Free <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Business image strip */}
      <div className="bg-white dark:bg-dark px-4 pt-8">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-3">
          {[
            { src: "/images/pay.jpg", label: "Payment Tracking" },
            { src: "/images/fashion.jpg", label: "Online Store" },
            { src: "/images/restuarant.jpg", label: "Food Business" },
            { src: "/images/business.jpg", label: "Business Growth" },
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
              <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />
              <p className="absolute bottom-2 left-3 text-white text-xs font-semibold">
                {img.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Storefront banner */}
      <div className="bg-white dark:bg-dark px-4 pt-8">
        <div className="max-w-7xl mx-auto">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/30 flex items-center gap-4 flex-wrap">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
              🛍️
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-dark dark:text-white text-sm">
                New — Free online store for every account
              </p>
              <p className="text-xs text-dark-400 mt-0.5">
                Launch your storefront at gettrackeet.com/store/yourname. Add
                products, share your link and receive WhatsApp orders instantly.
              </p>
            </div>
            <Link
              to="/register"
              className="btn btn-primary btn-sm flex-shrink-0"
            >
              Get Your Store →
            </Link>
          </div>
        </div>
      </div>

      {/* Features grid */}
      <section className="py-20 bg-white dark:bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={i}
                variants={fade}
                className="card hover:shadow-glow-sm transition-all duration-300 hover:-translate-y-1"
              >
                <div
                  className={`w-12 h-12 ${f.color} rounded-2xl flex items-center justify-center mb-4`}
                >
                  <f.icon size={22} />
                </div>
                <h3 className="text-xl font-bold text-dark dark:text-white mb-2">
                  {f.title}
                </h3>
                <p className="text-dark-500 dark:text-gray-400 text-sm leading-relaxed mb-4">
                  {f.desc}
                </p>
                <ul className="space-y-2">
                  {f.points.map((p, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <CheckCircle
                        size={14}
                        className="text-success flex-shrink-0"
                      />
                      <span className="text-dark-500 dark:text-gray-400">
                        {p}
                      </span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Lifestyle banner */}
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark">
        <div className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden h-64">
          <img
            src="/images/invoice.jpg"
            alt="Business owners"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 flex items-center justify-center flex-col text-center px-8">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Everything your business needs
            </h3>
            <p className="text-white/80 text-sm max-w-md mb-5">
              Professional tools built specifically for Nigerian businesses —
              invoicing, payments, WhatsApp and your free online store.
            </p>
            <Link
              to="/register"
              className="bg-white text-dark font-bold px-8 py-3 rounded-2xl hover:bg-gray-100 transition-all shadow-xl hover:scale-105"
            >
              Start Free Today →
            </Link>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-8 bg-white dark:bg-dark">
        <div className="max-w-6xl mx-4 sm:mx-8 lg:mx-auto">
          <section className="bg-primary rounded-3xl py-16 px-8 text-white text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl font-black mb-4">Ready to try it?</h2>
              <p className="text-white/80 mb-2">
                Free plan available. No credit card required.
              </p>
              <p className="text-white/60 text-sm mb-8">
                Includes your free online store — ready in minutes.
              </p>
              <Link
                to="/register"
                className="btn bg-white text-primary hover:bg-primary-light btn-lg"
              >
                Get Started Free <ArrowRight size={20} />
              </Link>
            </div>
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
