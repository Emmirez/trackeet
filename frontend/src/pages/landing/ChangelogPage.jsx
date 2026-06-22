import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { useQuery } from "@tanstack/react-query";
import { changelogAPI } from "../../services/api.js";
import dayjs from "dayjs";

const CHANGELOG = [
  {
    version: "v1.3.0",
    date: "May 13, 2026",
    badge: "Latest",
    badgeColor: "bg-success text-white",
    changes: [
      {
        type: "new",
        icon: "✨",
        text: "WhatsApp Auto Reply with 12 keyword responses",
      },
      {
        type: "new",
        icon: "✨",
        text: "Daily Business Summary sent to owner via WhatsApp at 9PM",
      },
      {
        type: "new",
        icon: "✨",
        text: "Bulk WhatsApp Campaigns with smart audience targeting",
      },
      {
        type: "new",
        icon: "✨",
        text: "Recent Customers campaign audience added",
      },
      {
        type: "new",
        icon: "✨",
        text: "Specific customer picker for targeted campaigns",
      },
      { type: "new", icon: "✨", text: "Export Business Report as PDF" },
      {
        type: "fix",
        icon: "🐛",
        text: "Fixed paid campaign sending to already-thanked customers",
      },
      {
        type: "fix",
        icon: "🐛",
        text: "Fixed WhatsApp client not restoring after server restart",
      },
    ],
  },
  {
    version: "v1.2.0",
    date: "May 10, 2026",
    badge: null,
    changes: [
      {
        type: "new",
        icon: "✨",
        text: "Payment Reminder cron — daily reminders for pending, overdue and partial invoices",
      },
      {
        type: "new",
        icon: "✨",
        text: "Invoice Automation — auto-send invoice via WhatsApp on creation",
      },
      {
        type: "new",
        icon: "✨",
        text: "Payment Confirmation — auto-send receipt when invoice is marked paid",
      },
      {
        type: "new",
        icon: "✨",
        text: "WhatsApp Automation toggles — turn features on/off per owner",
      },
      {
        type: "imp",
        icon: "⚡",
        text: "Improved WhatsApp message formatting with items list and emojis",
      },
      {
        type: "fix",
        icon: "🐛",
        text: "Fixed txStatus not clearing when standard invoice is marked paid",
      },
    ],
  },
  {
    version: "v1.1.0",
    date: "May 7, 2026",
    badge: null,
    changes: [
      {
        type: "new",
        icon: "✨",
        text: "Quick Record — POS-style instant transaction recording",
      },
      {
        type: "new",
        icon: "✨",
        text: "Transaction Status (txStatus) — track pending, failed, reversed payments",
      },
      {
        type: "new",
        icon: "✨",
        text: "Update Transaction modal for transfer pending invoices",
      },
      {
        type: "new",
        icon: "✨",
        text: "Payments page now shows transfer pending and failed invoices",
      },
      {
        type: "imp",
        icon: "⚡",
        text: "PDF invoice redesigned with purple header, dynamic totals and status badge",
      },
      {
        type: "imp",
        icon: "⚡",
        text: "Invoice detail page shows txStatus badge and contextual action buttons",
      },
      {
        type: "fix",
        icon: "🐛",
        text: "Fixed overdue marking not running on server start",
      },
    ],
  },
  {
    version: "v1.0.0",
    date: "May 1, 2026",
    badge: "Initial Release",
    badgeColor: "bg-primary text-white",
    changes: [
      {
        type: "new",
        icon: "✨",
        text: "Invoice creation with items, discounts, due dates and notes",
      },
      {
        type: "new",
        icon: "✨",
        text: "Customer management with total spent and outstanding balance",
      },
      {
        type: "new",
        icon: "✨",
        text: "Payment tracking with partial payment support",
      },
      {
        type: "new",
        icon: "✨",
        text: "Dashboard with stats, revenue chart and recent invoices",
      },
      {
        type: "new",
        icon: "✨",
        text: "Reports page with revenue breakdown and pie chart",
      },
      {
        type: "new",
        icon: "✨",
        text: "WhatsApp integration — send invoices and receipts via WhatsApp",
      },
      {
        type: "new",
        icon: "✨",
        text: "Subscription plans — Free, Starter, Business, Enterprise",
      },
      { type: "new", icon: "✨", text: "Dark mode support" },
      {
        type: "new",
        icon: "✨",
        text: "JWT authentication with user and admin roles",
      },
    ],
  },
];

const TYPE_ICONS = {
  feature: "✨",
  improvement: "⚡",
  bugfix: "🐛",
  security: "🔒",
};

const TYPE_BADGE = {
  feature: "bg-primary-light text-primary",
  improvement: "bg-warning-light text-warning",
  bugfix: "bg-success-light text-success",
  security: "bg-danger-light text-danger",
};

export default function ChangelogPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const { data } = useQuery({
    queryKey: ["public-changelog"],
    queryFn: () => changelogAPI.getPublic().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  const realChangelogs = data?.changelogs || [];
  const useReal = realChangelogs.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      <Navbar scrolled={scrolled} />

      {/* Header */}
      <div className="bg-white dark:bg-surface border-b border-dark-200 dark:border-gray-700 mt-16">
        <div className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-3xl sm:text-4xl font-black text-dark dark:text-white">
            Changelog <span className="gradient-text">🚀</span>
          </h1>
          <p className="text-dark-400 mt-2">
            Every update, fix and improvement to Trackeet
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        {useReal
          ? // Real changelogs from DB
            realChangelogs.map((c, i) => (
              <div key={c._id} className="card">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                    <Zap size={18} className="text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-black text-dark dark:text-white font-mono">
                        {c.version}
                      </h2>
                      {i === 0 && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-success text-white">
                          Latest
                        </span>
                      )}
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${TYPE_BADGE[c.type]}`}
                      >
                        {TYPE_ICONS[c.type]} {c.type}
                      </span>
                    </div>
                    <p className="text-xs text-dark-400">
                      {dayjs(c.publishedAt || c.createdAt).format(
                        "MMMM D, YYYY",
                      )}
                    </p>
                  </div>
                </div>

                {c.description && (
                  <p className="text-sm text-dark-500 dark:text-gray-400 mb-4 p-3 bg-gray-50 dark:bg-dark rounded-xl">
                    {c.description}
                  </p>
                )}

                {c.items?.length > 0 && (
                  <div className="space-y-2">
                    {c.items.map((item, j) => (
                      <div
                        key={j}
                        className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
                      >
                        <span className="text-base flex-shrink-0 mt-0.5">
                          {TYPE_ICONS[c.type]}
                        </span>
                        <p className="text-sm text-dark-500 dark:text-gray-400">
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          : // Fallback to hardcoded
            CHANGELOG.map((release, i) => (
              <div key={i} className="card">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                    <Zap size={18} className="text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-black text-dark dark:text-white">
                        {release.version}
                      </h2>
                      {release.badge && (
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${release.badgeColor}`}
                        >
                          {release.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-dark-400">{release.date}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {release.changes.map((change, j) => (
                    <div
                      key={j}
                      className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
                    >
                      <span className="text-base flex-shrink-0 mt-0.5">
                        {change.icon}
                      </span>
                      <p className="text-sm text-dark-500 dark:text-gray-400">
                        {change.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}

        <div className="card bg-gradient-to-br from-primary to-purple-700 text-white text-center">
          <h2 className="text-xl font-black mb-1">
            Get notified of updates 🔔
          </h2>
          <p className="text-white/80 text-sm mb-4">
            We ship new features every week
          </p>
          <Link
            to="/register"
            className="btn bg-white text-primary font-bold hover:bg-gray-50 inline-flex"
          >
            Start for Free
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
