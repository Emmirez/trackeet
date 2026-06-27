import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  CreditCard,
  FileText,
  TrendingUp,
  Store,
  ArrowRight,
} from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { show: { transition: { staggerChildren: 0.12 } } };

const HOW_IT_WORKS = [
  {
    step: "01",
    icon: Users,
    color: "bg-primary-light text-primary",
    title: "Create your free account",
    desc: "Sign up in 60 seconds. No credit card required. Add your business name, logo and bank details so your invoices look professional from day one.",
  },
  {
    step: "02",
    icon: CreditCard,
    color: "bg-success-light text-success",
    title: "Add your customers",
    desc: "Build your customer list with their names, phone numbers and WhatsApp contacts. This powers the automation — no phone number, no WhatsApp message.",
  },
  {
    step: "03",
    icon: FileText,
    color: "bg-warning-light text-warning",
    title: "Create & send invoices",
    desc: "Select a customer, add your items and prices, set a due date and hit send. Trackeet generates the invoice number, calculates totals and sends it via WhatsApp.",
  },
  {
    step: "04",
    icon: Store,
    color: "bg-purple-100 text-purple-600",
    title: "Launch your online store",
    desc: "Every account comes with a free storefront at gettrackeet.com/store/yourname. Add products with photos and prices — customers browse and order directly via WhatsApp.",
  },
  {
    step: "05",
    icon: TrendingUp,
    color: "bg-danger-light text-danger",
    title: "Get paid & track everything",
    desc: "Trackeet automatically reminds your customers before their due date, marks invoices overdue, and lets you record payments with one tap.",
  },
];

export default function HowItWorksPage() {
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
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-black text-dark dark:text-white mb-4">
              Up and running in{" "}
              <span className="gradient-text">under 5 minutes</span>
            </h1>
            <p className="text-lg text-dark-500 dark:text-gray-400 mb-8 max-w-xl mx-auto">
              Invoices, payments, WhatsApp automation and your own online store
              — all set up before your next customer calls.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started Free <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Image strip */}
      <div className="py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              src: "/images/create.jpg",
              label: "Create Account",
              step: "01",
            },
            { src: "/images/track.jpg", label: "Track Payments", step: "02" },
            { src: "/images/fashion.jpg", label: "Launch Store", step: "03" },
            { src: "/images/paid.jpg", label: "Get Paid", step: "04" },
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
              <div className="absolute top-2 left-3 w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white text-[10px] font-black">
                  {img.step}
                </span>
              </div>
              <p className="absolute bottom-2 left-3 text-white text-xs font-semibold">
                {img.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Steps grid */}
      <section className="py-20 bg-white dark:bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div variants={fade} className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-black text-dark dark:text-white mb-4">
                How Trackeet works
              </h2>
              <p className="text-dark-500 dark:text-gray-400 max-w-xl mx-auto">
                Five simple steps to invoices, payments, WhatsApp automation and
                your free online store.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8 mb-20">
              {HOW_IT_WORKS.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fade}
                  className="text-center group"
                >
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-primary-light rounded-3xl flex items-center justify-center mx-auto group-hover:bg-primary group-hover:shadow-glow transition-all duration-300">
                      <step.icon
                        size={24}
                        className="text-primary group-hover:text-white transition-colors"
                      />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs font-black text-white">
                        {step.step}
                      </span>
                    </div>
                    {i < HOW_IT_WORKS.length - 1 && (
                      <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gradient-to-r from-primary-light to-transparent" />
                    )}
                  </div>
                  <h3 className="font-bold text-dark dark:text-white mb-2 text-sm">
                    {step.title}
                  </h3>
                  <p className="text-xs text-dark-500 dark:text-gray-400 leading-relaxed">
                    {step.desc}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Detailed breakdown */}
            <motion.div variants={fade} className="text-center mb-12">
              <h2 className="text-3xl font-black text-dark dark:text-white mb-4">
                Step by step breakdown
              </h2>
              <p className="text-dark-500 dark:text-gray-400 max-w-xl mx-auto">
                Everything you need to know about each step
              </p>
            </motion.div>

            <div className="space-y-16">
              {HOW_IT_WORKS.map((step, i) => (
                <motion.div
                  key={i}
                  variants={fade}
                  className={`flex flex-col ${i % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"} gap-10 items-center`}
                >
                  <div className="flex-shrink-0 w-full lg:w-80">
                    <div className="relative h-52 rounded-3xl overflow-hidden">
                      <img
                        src={
                          [
                            "/images/create.jpg",
                            "/images/customer.jpg",
                            "/images/money.jpg",
                            "/images/fashion.jpg",
                            "/images/paid.jpg",
                          ][i]
                        }
                        alt={step.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-sm font-black text-white">
                          {step.step}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                        <step.icon size={20} className="text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <h2 className="text-2xl font-bold text-dark dark:text-white mb-3">
                      {step.title}
                    </h2>
                    <p className="text-dark-500 dark:text-gray-400 mb-5 leading-relaxed">
                      {step.desc}
                    </p>
                    {step.step === "04" && (
                      <a
                        href="https://www.gettrackeet.com/store/trendova"
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-secondary btn-sm inline-flex"
                      >
                        <Store size={14} /> View Demo Store
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <div className="py-8 bg-white dark:bg-dark">
        <div className="max-w-6xl mx-4 sm:mx-8 lg:mx-auto">
          <div className="bg-primary rounded-3xl py-16 px-8 text-white text-center relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full pointer-events-none" />
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl font-black mb-4">Start in 60 seconds</h2>
              <p className="text-white/80 mb-2">
                Free forever. No credit card needed.
              </p>
              <p className="text-white/60 text-sm mb-8">
                Invoices · Payments · WhatsApp · Online Store
              </p>
              <Link
                to="/register"
                className="btn bg-white text-primary hover:bg-primary-light btn-lg"
              >
                Create Free Account <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
