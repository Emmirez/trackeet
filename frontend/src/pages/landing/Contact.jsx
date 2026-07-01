import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  MessageSquare,
  Clock,
  Send,
  CheckCircle,
  ChevronDown,
  Check,
} from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const SUBJECTS = [
  "General Question",
  "Technical Support",
  "Billing & Subscription",
  "Feature Request",
  "Partnership",
  "Other",
];

function CustomSelect({ value, onChange, placeholder }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-left flex items-center justify-between transition-all
          ${open ? "border-primary ring-2 ring-primary/20" : "border-dark-200 dark:border-gray-600"}
          bg-white dark:bg-surface text-dark dark:text-gray-100`}
      >
        <span
          className={
            value
              ? "text-dark dark:text-white"
              : "text-dark-400 dark:text-gray-500"
          }
        >
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-dark-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface border border-dark-200 dark:border-gray-700 rounded-2xl shadow-xl z-20 overflow-hidden animate-slide-up">
            {SUBJECTS.map((subject, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  onChange(subject);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-all hover:bg-primary-light dark:hover:bg-primary/10 hover:text-primary
                  ${value === subject ? "bg-primary-light dark:bg-primary/10 text-primary font-semibold" : "text-dark dark:text-gray-300"}`}
              >
                <span>{subject}</span>
                {value === subject && (
                  <Check size={15} className="text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const CONTACT_METHODS = [
  {
    icon: Mail,
    color: "bg-primary-light text-primary",
    title: "Email Us",
    value: "hello@gettrackeet.com",
    sub: "We reply within a few hours",
    href: "mailto:hello@gettrackeet.com",
  },
  {
    icon: MessageSquare,
    color: "bg-[#dcfce7] text-[#16a34a]",
    title: "WhatsApp",
    value: "+234 916 043 1735",
    sub: "Chat with us on WhatsApp",
    href: "https://wa.me/2349160431735",
  },
  {
    icon: Phone,
    color: "bg-warning-light text-warning",
    title: "Call Us",
    value: "+234 916 043 1735",
    sub: "Mon–Fri, 9am–6pm WAT",
    href: "tel:+2349160431735",
  },
  {
    icon: MapPin,
    color: "bg-danger-light text-danger",
    title: "Visit Us",
    value: "Lagos, Nigeria 🇳🇬",
    sub: "Victoria Island, Lagos",
    href: "#",
  },
];

export default function ContactPage() {
  const [scrolled, setScrolled] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: connect to backend /api/contact
    setSent(true);
  };

  return (
    <div className="font-poppins overflow-x-hidden">
      <Navbar scrolled={scrolled} />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark dark:via-surface dark:to-dark text-center">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Mail size={28} className="text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-dark dark:text-white mb-4">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-lg text-dark-500 dark:text-gray-400">
              Have a question, feedback or just want to say hello? We would love
              to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact methods */}
      <section className="py-16 bg-white dark:bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {CONTACT_METHODS.map((c, i) => (
              <motion.a
                key={i}
                variants={fade}
                href={c.href}
                className="card flex flex-col items-center text-center hover:shadow-glow-sm hover:-translate-y-1 transition-all group"
              >
                <div
                  className={`w-14 h-14 ${c.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <c.icon size={24} />
                </div>
                <h3 className="font-bold text-dark dark:text-white mb-1">
                  {c.title}
                </h3>
                <p className="text-sm font-semibold text-primary mb-1">
                  {c.value}
                </p>
                <p className="text-xs text-dark-400">{c.sub}</p>
              </motion.a>
            ))}
          </motion.div>

          {/* Form + Info */}
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl font-bold text-dark dark:text-white mb-6">
                Send us a message
              </h2>
              {sent ? (
                <div className="card text-center py-12">
                  <div className="w-16 h-16 bg-success-light rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-success" />
                  </div>
                  <h3 className="text-xl font-bold text-dark dark:text-white mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-dark-500 dark:text-gray-400">
                    We will get back to you within a few hours.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Your Name</label>
                      <input
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="Amaka Okonkwo"
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="input-label">Email Address</label>
                      <input
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        type="email"
                        placeholder="you@business.com"
                        className="input"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Subject</label>
                    <CustomSelect
                      value={form.subject}
                      onChange={(val) => setForm({ ...form, subject: val })}
                      placeholder="Select a subject"
                    />
                  </div>
                  <div>
                    <label className="input-label">Message</label>
                    <textarea
                      value={form.message}
                      onChange={(e) =>
                        setForm({ ...form, message: e.target.value })
                      }
                      placeholder="Tell us how we can help..."
                      rows={5}
                      className="input resize-none"
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-full">
                    <Send size={16} /> Send Message
                  </button>
                </form>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                    <Clock size={18} className="text-primary" />
                  </div>
                  <h3 className="font-bold text-dark dark:text-white">
                    Support Hours
                  </h3>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    { day: "Monday – Friday", hours: "9:00 AM – 6:00 PM WAT" },
                    { day: "Saturday", hours: "10:00 AM – 2:00 PM WAT" },
                    { day: "Sunday", hours: "Closed (emergency only)" },
                  ].map((r, i) => (
                    <div
                      key={i}
                      className="flex justify-between items-center py-2 border-b border-dark-200 dark:border-gray-700 last:border-0"
                    >
                      <span className="text-dark-500 dark:text-gray-400">
                        {r.day}
                      </span>
                      <span className="font-semibold text-dark dark:text-white">
                        {r.hours}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h3 className="font-bold text-dark dark:text-white mb-3">
                  Frequently Contacted About
                </h3>
                <div className="space-y-2">
                  {[
                    "How to connect WhatsApp",
                    "Upgrading my subscription",
                    "Downloading invoice as PDF",
                    "Adding team members",
                    "Bank transfer verification",
                  ].map((t, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle
                        size={14}
                        className="text-success flex-shrink-0"
                      />
                      <span className="text-dark-500 dark:text-gray-400">
                        {t}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card bg-primary-light dark:bg-primary/10 border border-primary/20">
                <p className="text-sm font-semibold text-primary mb-1">
                  💡 Quick tip
                </p>
                <p className="text-sm text-dark-500 dark:text-gray-400">
                  For faster help, check our{" "}
                  <a
                    href="/help"
                    className="text-primary font-semibold hover:underline"
                  >
                    Help Center
                  </a>{" "}
                  first — most questions are answered there instantly.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
