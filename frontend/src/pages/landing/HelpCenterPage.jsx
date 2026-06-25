import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  CreditCard,
  MessageSquare,
  Settings,
  Users,
  BarChart3,
  ChevronDown,
  ArrowRight,
  Mail,
} from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const CATEGORIES = [
  {
    icon: FileText,
    color: "bg-primary-light text-primary",
    title: "Invoicing",
    articles: [
      {
        title: "How to create your first invoice",
        content:
          "Go to Invoices → New Invoice. Select a customer, add your items with prices, set a due date and click Save & Send. The invoice is automatically numbered and sent to your customer via WhatsApp.",
      },
      {
        title: "How to download an invoice as PDF",
        content:
          "Open any invoice → click Download PDF. The PDF is generated with your business logo, bank details and all invoice items. You can share it via email or WhatsApp.",
      },
      {
        title: "How to add a discount to an invoice",
        content:
          "When creating an invoice, scroll to the totals section and enter a discount percentage. The discount is automatically calculated and shown on the invoice.",
      },
      {
        title: "How to mark an invoice as paid",
        content:
          "Open the invoice → click Mark as Paid. Select the payment method (bank transfer, cash, etc.) and enter the amount. The invoice status updates instantly.",
      },
      {
        title: "What is the difference between draft and pending?",
        content:
          "Draft means the invoice is saved but not sent to the customer. Pending means it has been sent and you are waiting for payment. You can convert a draft to pending at any time.",
      },
    ],
  },
  {
    icon: MessageSquare,
    color: "bg-[#dcfce7] text-[#16a34a]",
    title: "WhatsApp Automation",
    articles: [
      {
        title: "How to connect your WhatsApp",
        content:
          "Go to WhatsApp page → you will see a QR code. Open WhatsApp on your phone → tap More (three dots) → Linked Devices → Link a Device → scan the QR code. You are connected!",
      },
      {
        title: "What automations are available?",
        content:
          "Trackeet can automatically send: invoice when created, payment confirmation when marked paid, payment reminder before due date, and a daily business summary to yourself.",
      },
      {
        title: "Can I customise the WhatsApp messages?",
        content:
          "Currently messages use our default templates. Custom message templates are coming in the next update. You can turn each automation on or off individually.",
      },
      {
        title: "Why is my WhatsApp showing as disconnected?",
        content:
          "WhatsApp sessions can expire if your phone is offline for too long or if you log out of WhatsApp. Simply go to the WhatsApp page and scan the QR code again to reconnect.",
      },
    ],
  },
  {
    icon: CreditCard,
    color: "bg-success-light text-success",
    title: "Payments & Billing",
    articles: [
      {
        title: "How to pay for a subscription",
        content:
          "Go to Settings → Subscription. Choose your plan and click Upgrade. You can pay via Paystack (card), Flutterwave, or bank transfer. Annual plans save you 20%.",
      },
      {
        title: "How does bank transfer payment work?",
        content:
          "Select Bank Transfer on the subscription page. Transfer the exact amount to our GTBank account (Trackeet Technologies Ltd, 0123456789). Email your proof of payment to billing@gettrackeet.com with your email as reference.",
      },
      {
        title: "How to get a refund",
        content:
          "We offer a 7-day refund policy. Email billing@gettrackeet.com within 7 days of payment with your transaction reference. Refunds are processed within 3–5 business days.",
      },
      {
        title: "What happens when my free plan limit is reached?",
        content:
          "You will see a notification when you are near your 5 invoice limit. You can upgrade to a paid plan or wait until the next month when the limit resets.",
      },
    ],
  },
  {
    icon: Users,
    color: "bg-info-light text-info",
    title: "Customers",
    articles: [
      {
        title: "How to add a new customer",
        content:
          "Go to Customers → Add Customer. Enter their name, phone number (WhatsApp number), email and business name. Their outstanding balance and invoice history will update automatically.",
      },
      {
        title: "How to view a customer's invoice history",
        content:
          "Go to Customers → click any customer name. You will see their full profile, total spent, outstanding balance, and all invoices you have created for them.",
      },
      {
        title: "Can I import customers from Excel?",
        content:
          "CSV/Excel import is coming soon. For now, add customers manually. Each customer takes less than 30 seconds to add.",
      },
    ],
  },
  {
    icon: Settings,
    color: "bg-warning-light text-warning",
    title: "Account & Settings",
    articles: [
      {
        title: "How to add your business logo",
        content:
          "Go to Settings → Business → Upload Logo. Your logo will appear on all invoices and PDF downloads. Supported formats: PNG, JPG, WebP. Max size: 5MB.",
      },
      {
        title: "How to change your bank details",
        content:
          "Go to Settings → Business. Update your bank name, account number and account name. These details appear on all your invoices so customers know where to pay.",
      },
      {
        title: "How to change your password",
        content:
          "Go to Settings → Security. Enter your current password, then your new password twice. Click Update Password. You will receive a confirmation email.",
      },
      {
        title: "How to switch between dark and light mode",
        content:
          "Click the moon/sun icon in the sidebar (desktop) or in Settings → Appearance. Your preference is saved automatically.",
      },
    ],
  },
  {
    icon: BarChart3,
    color: "bg-danger-light text-danger",
    title: "Reports",
    articles: [
      {
        title: "How to view my revenue report",
        content:
          "Go to Reports. You can view your revenue by week, month or year. The chart shows your revenue trend over time. Switch between periods using the buttons at the top.",
      },
      {
        title: "How to export a report as PDF",
        content:
          "Go to Reports → select your period → click Export Report PDF at the bottom. The PDF includes your revenue chart, invoice breakdown and top customers.",
      },
    ],
  },
];

function ArticleItem({ title, content }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-dark-200 dark:border-gray-700 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left hover:text-primary transition-colors"
      >
        <span className="text-sm font-medium text-dark dark:text-white">
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`text-dark-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-dark-500 dark:text-gray-400 leading-relaxed pb-4">
              {content}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HelpCenterPage() {
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(0);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const filtered = search
    ? CATEGORIES.map((cat) => ({
        ...cat,
        articles: cat.articles.filter(
          (a) =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.content.toLowerCase().includes(search.toLowerCase()),
        ),
      })).filter((cat) => cat.articles.length > 0)
    : CATEGORIES;

  return (
    <div className="font-poppins overflow-x-hidden">
      <Navbar scrolled={scrolled} />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark dark:via-surface dark:to-dark text-center">
        <div className="max-w-2xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-black text-dark dark:text-white mb-4">
              Help <span className="gradient-text">Center</span>
            </h1>
            <p className="text-lg text-dark-500 dark:text-gray-400 mb-8">
              Find answers to common questions about using Trackeet
            </p>
            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-400"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for help..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-dark-200 dark:border-gray-700 bg-white dark:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none text-sm shadow-sm"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white dark:bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {search ? (
            // Search results
            <div className="space-y-8">
              {filtered.length === 0 ? (
                <div className="text-center py-16">
                  <Search size={48} className="text-dark-200 mx-auto mb-4" />
                  <p className="font-semibold text-dark dark:text-white mb-2">
                    No results found
                  </p>
                  <p className="text-dark-400 text-sm mb-6">
                    Try different keywords or contact our support team
                  </p>
                  <Link to="/contact" className="btn btn-primary">
                    <Mail size={16} /> Contact Support
                  </Link>
                </div>
              ) : (
                filtered.map((cat, i) => (
                  <div key={i}>
                    <h2 className="font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
                      <div
                        className={`w-8 h-8 ${cat.color} rounded-lg flex items-center justify-center`}
                      >
                        <cat.icon size={16} />
                      </div>
                      {cat.title}
                    </h2>
                    <div className="card">
                      {cat.articles.map((a, j) => (
                        <ArticleItem key={j} {...a} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="card p-2 space-y-1 sticky top-24">
                  {CATEGORIES.map((cat, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveCategory(i)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left
                        ${activeCategory === i ? "bg-primary-light text-primary" : "text-dark-500 hover:bg-gray-50 dark:hover:bg-gray-800 dark:text-gray-400"}`}
                    >
                      <div
                        className={`w-7 h-7 ${cat.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                      >
                        <cat.icon size={14} />
                      </div>
                      {cat.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Articles */}
              <div className="lg:col-span-3">
                <div className="flex items-center gap-3 mb-6">
                  <div
                    className={`w-10 h-10 ${CATEGORIES[activeCategory].color} rounded-xl flex items-center justify-center`}
                  >
                    {(() => {
                      const Icon = CATEGORIES[activeCategory].icon;
                      return <Icon size={20} />;
                    })()}
                  </div>
                  <h2 className="text-xl font-bold text-dark dark:text-white">
                    {CATEGORIES[activeCategory].title}
                  </h2>
                  <span className="text-sm text-dark-400">
                    {CATEGORIES[activeCategory].articles.length} articles
                  </span>
                </div>
                <div className="card">
                  {CATEGORIES[activeCategory].articles.map((a, j) => (
                    <ArticleItem key={j} {...a} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Still need help */}
      <section className="py-16 bg-gray-50 dark:bg-surface text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">
            Still need help?
          </h2>
          <p className="text-dark-500 dark:text-gray-400 mb-6">
            Our support team typically responds within a few hours.
          </p>
          <Link to="/contact" className="btn btn-primary btn-lg">
            <Mail size={18} /> Contact Support
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
