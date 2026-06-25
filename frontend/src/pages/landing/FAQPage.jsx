import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, ArrowRight, Mail } from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const FAQS = [
  {
    category: "Getting Started",
    items: [
      {
        q: "Is Trackeet really free to start?",
        a: "Yes! Our Free plan lets you create up to 5 invoices per month with no credit card required. Perfect for trying Trackeet before committing.",
      },
      {
        q: "How long does setup take?",
        a: "Less than 5 minutes. Sign up, add your business name and logo, and you are ready to create your first invoice.",
      },
      {
        q: "Do I need to install anything?",
        a: "No. Trackeet is a web app — it works in your browser on any device. No download needed. A mobile app is coming soon.",
      },
    ],
  },
  {
    category: "WhatsApp & Automation",
    items: [
      {
        q: "How does WhatsApp automation work?",
        a: "You connect your WhatsApp number via a QR code scan — just like WhatsApp Web. Trackeet then automatically sends invoices, payment confirmations and reminders to your customers. No manual sending needed.",
      },
      {
        q: "Will my customers know it is automated?",
        a: "Messages are sent from your WhatsApp number, so they appear as normal WhatsApp messages from you. You can also customise the message templates.",
      },
      {
        q: "What if my WhatsApp disconnects?",
        a: "You will get a notification and can reconnect by scanning the QR code again. Your settings and templates are saved.",
      },
    ],
  },
  {
    category: "Payments & Billing",
    items: [
      {
        q: "How do I pay for my subscription?",
        a: "We accept Paystack (card payments), Flutterwave, bank transfer to our GTBank account, and Stripe for international payments.",
      },
      {
        q: "Can I pay annually and save?",
        a: "Yes! Annual billing saves you 20% compared to monthly. You can switch at any time.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes, cancel at any time from your settings. Your account stays active until the end of your billing period with no cancellation fees.",
      },
      {
        q: "Do you offer refunds?",
        a: "We offer a 7-day refund if you are not satisfied. Contact support@gettrackeet.com within 7 days of your payment.",
      },
    ],
  },
  {
    category: "Team & Plans",
    items: [
      {
        q: "Can I use Trackeet for my team?",
        a: "Yes! The Business plan supports up to 3 team members and Enterprise supports unlimited. Each person gets their own login.",
      },
      {
        q: "Can I upgrade or downgrade my plan?",
        a: "Yes, you can change your plan at any time from the Subscription page. Upgrades take effect immediately.",
      },
      {
        q: "What happens if I hit my invoice limit?",
        a: "You will be notified and prompted to upgrade. Existing invoices remain accessible, but you cannot create new ones until you upgrade or the month resets.",
      },
    ],
  },
  {
    category: "Security & Data",
    items: [
      {
        q: "Is my financial data safe?",
        a: "Absolutely. We use AES-256 encryption, JWT authentication, rate limiting and daily backups. We never share your data with third parties.",
      },
      {
        q: "Can I export my data?",
        a: "Yes. You can export reports as PDF and your invoice data at any time. Your data belongs to you.",
      },
      {
        q: "What happens to my data if I cancel?",
        a: "Your data is kept for 90 days after cancellation in case you change your mind. After that it is permanently deleted.",
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card cursor-pointer" onClick={() => setOpen(!open)}>
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-semibold text-dark dark:text-white text-sm">{q}</h3>
        <ChevronDown
          size={18}
          className={`text-dark-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-dark-500 dark:text-gray-400 text-sm leading-relaxed pt-3 border-t border-dark-200 dark:border-gray-700 mt-3">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQPage() {
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
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark dark:via-surface dark:to-dark text-center">
        <div className="max-w-3xl mx-auto px-4">
          <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-6">
            <HelpCircle size={28} className="text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-dark dark:text-white mb-4">
            Frequently asked <span className="gradient-text">questions</span>
          </h1>
          <p className="text-lg text-dark-500 dark:text-gray-400">
            Can't find what you're looking for?{" "}
            <a
              href="mailto:hello@gettrackeet.com"
              className="text-primary hover:underline font-semibold"
            >
              Email us
            </a>
          </p>
        </div>
      </section>

      {/* FAQ sections */}
      <section className="py-16 bg-white dark:bg-dark">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          {FAQS.map((section, i) => (
            <div key={i}>
              <h2 className="text-lg font-bold text-dark dark:text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center text-primary text-sm font-black">
                  {i + 1}
                </span>
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.items.map((item, j) => (
                  <FAQItem key={j} {...item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still need help */}
      <section className="py-16 bg-gray-50 dark:bg-surface text-center">
        <div className="max-w-xl mx-auto px-4">
          <Mail size={40} className="text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">
            Still have questions?
          </h2>
          <p className="text-dark-500 dark:text-gray-400 mb-6">
            Our support team is happy to help. We typically respond within a few
            hours.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href="mailto:hello@gettrackeet.com"
              className="btn btn-primary btn-lg"
            >
              <Mail size={18} /> Email Support
            </a>
            <Link to="/register" className="btn btn-secondary btn-lg">
              Try Trackeet Free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
