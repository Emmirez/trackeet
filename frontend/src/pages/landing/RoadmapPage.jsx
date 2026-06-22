import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Clock, Star } from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const ROADMAP = [
  {
    quarter: "Q2 2026",
    status: "In Progress",
    color: "border-warning",
    bgColor: "bg-warning-light",
    textColor: "text-warning",
    icon: "🔨",
    items: [
      { done: true, text: "WhatsApp Auto Reply with keyword detection" },
      { done: true, text: "Bulk WhatsApp Campaigns with audience targeting" },
      { done: true, text: "Daily Business Summary via WhatsApp" },
      { done: true, text: "Export Business Reports as PDF" },
      { done: false, text: "Multi-currency support (USD, GBP, EUR)" },
      { done: false, text: "Invoice templates — choose from 5 designs" },
      {
        done: false,
        text: "Recurring invoices — auto-generate monthly invoices",
      },
    ],
  },
  {
    quarter: "Q3 2026",
    status: "Planned",
    color: "border-primary",
    bgColor: "bg-primary-light",
    textColor: "text-primary",
    icon: "📋",
    items: [
      { done: false, text: "Mobile app — iOS and Android" },
      {
        done: false,
        text: "Paystack and Flutterwave payment links on invoices",
      },
      { done: false, text: "Team members — invite staff to your account" },
      { done: false, text: "Expense tracking — track your business expenses" },
      { done: false, text: "Tax reporting — generate tax-ready reports" },
      {
        done: false,
        text: "Customer portal — customers view their invoices online",
      },
    ],
  },
  {
    quarter: "Q4 2026",
    status: "Future",
    color: "border-success",
    bgColor: "bg-success-light",
    textColor: "text-success",
    icon: "🌟",
    items: [
      { done: false, text: "AI-powered payment predictions" },
      { done: false, text: "Inventory management integration" },
      { done: false, text: "Bank statement reconciliation" },
      { done: false, text: "WhatsApp Business API integration" },
      {
        done: false,
        text: "Accounting software integrations (QuickBooks, Sage)",
      },
      { done: false, text: "Multi-branch support for larger businesses" },
    ],
  },
];

const COMPLETED = [
  "Invoice creation with items, discounts and due dates",
  "Customer management with outstanding balance tracking",
  "Partial payment tracking with progress bar",
  "WhatsApp invoice and receipt sending",
  "Quick Record for POS agents",
  "Transaction status tracking (pending, failed, reversed)",
  "Overdue invoice auto-marking",
  "Revenue charts and business reports",
  "Dark mode",
  "Free tier with 5 invoices/month",
];

export default function RoadmapPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      <Navbar scrolled={scrolled} />

      {/* Header */}
      <div className="bg-white dark:bg-surface border-b border-dark-200 dark:border-gray-700 mt-16">
        <div className="max-w-4xl mx-auto px-4 py-10">
          <h1 className="text-3xl sm:text-4xl font-black text-dark dark:text-white">
            Product <span className="gradient-text">Roadmap</span>
          </h1>
          <p className="text-dark-400 mt-2">
            Where Trackeet is headed — built transparently with our users
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
        {/* Suggest feature */}
        <div className="card bg-gradient-to-br from-primary/10 to-purple-50 dark:from-primary/10 dark:to-purple-900/10 border border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0">
              <Star size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-dark dark:text-white">
                Have a feature request?
              </h2>
              <p className="text-dark-400 text-sm">
                We build what our users need. Tell us what would make Trackeet
                perfect for your business.
              </p>
            </div>
            <a
              href="mailto:hello@trackeet.ng?subject=Feature Request"
              className="btn btn-primary btn-sm flex-shrink-0"
            >
              Suggest Feature
            </a>
          </div>
        </div>

        {/* Roadmap quarters */}
        {ROADMAP.map((quarter, i) => (
          <div key={i} className={`card border-l-4 ${quarter.color}`}>
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">{quarter.icon}</span>
              <div>
                <h2 className="text-xl font-black text-dark dark:text-white">
                  {quarter.quarter}
                </h2>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${quarter.bgColor} ${quarter.textColor}`}
                >
                  {quarter.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              {quarter.items.map((item, j) => (
                <div key={j} className="flex items-center gap-3">
                  {item.done ? (
                    <CheckCircle
                      size={16}
                      className="text-success flex-shrink-0"
                    />
                  ) : (
                    <Clock size={16} className="text-dark-300 flex-shrink-0" />
                  )}
                  <p
                    className={`text-sm flex-1 ${item.done ? "text-dark-400 line-through" : "text-dark-500 dark:text-gray-400"}`}
                  >
                    {item.text}
                  </p>
                  {item.done && (
                    <span className="text-xs bg-success-light text-success px-2 py-0.5 rounded-full font-semibold">
                      Done ✓
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Completed */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-success-light rounded-xl flex items-center justify-center">
              <CheckCircle size={18} className="text-success" />
            </div>
            <div>
              <h2 className="text-xl font-black text-dark dark:text-white">
                Already Shipped ✅
              </h2>
              <p className="text-xs text-dark-400">
                Features live in Trackeet today
              </p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-2">
            {COMPLETED.map((item, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-xl">
                <CheckCircle size={14} className="text-success flex-shrink-0" />
                <p className="text-sm text-dark-500 dark:text-gray-400">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="card bg-gradient-to-br from-primary to-purple-700 text-white text-center">
          <h2 className="text-2xl font-black mb-2">
            Start using Trackeet today 🚀
          </h2>
          <p className="text-white/80 mb-6 text-sm">
            Free forever plan — no credit card required
          </p>
          <Link
            to="/register"
            className="btn bg-white text-primary font-bold hover:bg-gray-50 inline-flex"
          >
            Get Started Free
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
