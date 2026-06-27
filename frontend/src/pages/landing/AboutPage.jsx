import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  Target,
  Heart,
  Zap,
  ArrowRight,
  CheckCircle,
  Mail,
  MapPin,
  Twitter,
  Linkedin,
  Instagram,
} from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const VALUES = [
  {
    icon: Target,
    color: "bg-primary-light text-primary",
    title: "Built for Africa",
    desc: "Every feature is designed around how Nigerian businesses actually operate — cash payments, WhatsApp communication, and Naira transactions.",
  },
  {
    icon: Heart,
    color: "bg-danger-light text-danger",
    title: "We Care About You",
    desc: "We listen to every piece of feedback. Every feature on Trackeet exists because a real business owner in Nigeria asked for it.",
  },
  {
    icon: Users,
    color: "bg-success-light text-success",
    title: "Community First",
    desc: "We are building more than software — we are building a movement of empowered Nigerian entrepreneurs who run professional businesses.",
  },
  {
    icon: Zap,
    color: "bg-warning-light text-warning",
    title: "Simple & Fast",
    desc: "If it takes more than 30 seconds to do something on Trackeet, we have failed. Speed and simplicity are non-negotiable.",
  },
];

const TEAM = [
  {
    name: "Emma Obaro",
    role: "CEO & Co-founder",
    emoji: "👨🏿‍💼",
    bg: "bg-primary",
    photo: "/images/james1.jpg",
  },
  {
    name: "James Justin",
    role: "CTO & Co-founder",
    emoji: "👩🏿‍💻",
    bg: "bg-success",
    photo: "/images/james2.jpg",
  },
  {
    name: "Dara Obinna",
    role: "Head of Product",
    emoji: "👨🏿‍🎨",
    bg: "bg-warning",
    photo: "/images/tega1.jpg",
  },
  {
    name: "Tega Jones",
    role: "Head of Customer Success",
    emoji: "👩🏿‍🤝‍👩🏿",
    bg: "bg-danger",
    photo: "/images/tega.jpg",
  },
];

const TIMELINE = [
  {
    year: "2022",
    title: "The Problem",
    desc: "Our founder loses ₦800,000 to unpaid invoices with no proper tracking system. The idea for Trackeet is born.",
  },
  {
    year: "2023",
    title: "Trackeet Launches",
    desc: "We launch with 3 features — invoicing, payment tracking, and WhatsApp sending. 500 businesses sign up in the first month.",
  },
  {
    year: "2024",
    title: "WhatsApp Automation",
    desc: "We add full WhatsApp automation. Businesses report saving 2–3 hours daily. We hit 5,000 users.",
  },
  {
    year: "2025",
    title: "12,000+ Businesses",
    desc: "Trackeet processes over 2.4 billion in invoices. We expand from Lagos to all 36 states.",
  },
];

export default function AboutPage() {
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
      <section className="pt-32 pb-20 bg-gradient-to-br from-primary-50 via-white to-purple-50 dark:from-dark dark:via-surface dark:to-dark relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-400/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light text-primary text-sm font-semibold rounded-full mb-6">
              🇳🇬 Made in Lagos, Nigeria
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-dark dark:text-white mb-6">
              We are on a mission to help{" "}
              <span className="gradient-text">every Nigerian business</span> get
              paid faster
            </h1>
            <p className="text-lg text-dark-500 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              Trackeet was born in Lagos out of a simple frustration — too many
              hardworking business owners were losing money because they had no
              proper system to invoice customers and track payments.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn btn-primary btn-lg">
                Join 12k+ Businesses <ArrowRight size={20} />
              </Link>
              <a
                href="mailto:hello@gettrackeet.com"
                className="btn btn-secondary btn-lg"
              >
                <Mail size={18} /> Talk to Us
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Hero image strip */}
      <div className="py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { src: "/images/business.jpg", label: "Our Mission" },
            { src: "/images/paid.jpg", label: "Payment Solutions" },
            { src: "/images/store3.jpg", label: "Nigerian Businesses" },
            { src: "/images/create.jpg", label: "Built for Africa" },
          ].map((img, i) => (
            <div key={i} className="relative h-36 rounded-2xl overflow-hidden group">
              <img
                src={img.src}
                alt={img.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent" />
              <p className="absolute bottom-2 left-3 text-white text-xs font-semibold">{img.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="py-8 bg-white dark:bg-dark">
        <div className="max-w-6xl mx-4 sm:mx-8 lg:mx-auto">
          <div className="bg-primary rounded-3xl py-12 px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "12k+", label: "Businesses Served" },
                { value: "2.4B+", label: "Invoices Processed" },
                { value: "36", label: "States in Nigeria" },
                { value: "98%", label: "Customer Satisfaction" },
              ].map((s, i) => (
                <div key={i} className="text-center text-white">
                  <p className="text-3xl font-black mb-1">{s.value}</p>
                  <p className="text-sm opacity-80 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-20 bg-white dark:bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid lg:grid-cols-2 gap-16 items-center"
          >
            <motion.div variants={fade}>
              <h2 className="text-3xl font-black text-dark dark:text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-dark-500 dark:text-gray-400 leading-relaxed">
                <p>
                  In 2022, our founder Emma Obaro was running a small design
                  agency in Lagos. He had 15 active clients, was doing great
                  work, but at the end of every month he struggled to know
                  exactly who had paid and who still owed him money. He lost
                  almost ₦800,000 that year to clients who claimed they never
                  received invoices.
                </p>
                <p>
                  He looked for software to solve this problem. Everything he
                  found was built for American or European businesses —
                  complicated, expensive, and completely ignoring the reality
                  that his clients paid via bank transfer and preferred to
                  communicate on WhatsApp.
                </p>
                <p>
                  So he built Trackeet. Simple invoicing, automatic WhatsApp
                  messages, and real payment tracking — built specifically for
                  how Nigerian businesses actually work.
                </p>
                <p>
                  Today, over 12,000 businesses across Nigeria use Trackeet to
                  look professional, get paid faster, and spend less time
                  chasing money.
                </p>
              </div>
            </motion.div>
            
            <motion.div variants={fade} className="space-y-4">
              {/* Story image */}
              <div className="relative h-48 rounded-3xl overflow-hidden mb-6">
                <img
                  src="/images/business.jpg"
                  alt="Our story"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white font-bold text-sm">From Lagos to all 36 states 🇳🇬</p>
                  <p className="text-white/70 text-xs mt-1">12,000+ businesses trust Trackeet</p>
                </div>
              </div>
              {TIMELINE.map((t, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-primary">
                        {t.year}
                      </span>
                    </div>
                    {i < TIMELINE.length - 1 && (
                      <div className="w-0.5 flex-1 bg-primary-light mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <h3 className="font-bold text-dark dark:text-white mb-1">
                      {t.title}
                    </h3>
                    <p className="text-sm text-dark-500 dark:text-gray-400 leading-relaxed">
                      {t.desc}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Full width banner */}
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-white dark:bg-dark">
        <div className="max-w-7xl mx-auto relative rounded-3xl overflow-hidden h-56">
          <img
            src="/images/sign.jpg"
            alt="Nigerian businesses"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 flex items-center justify-center flex-col text-center px-8">
            <h3 className="text-2xl sm:text-3xl font-black text-white mb-3">
              Built by Nigerians, for Nigerians 🇳🇬
            </h3>
            <p className="text-white/80 text-sm max-w-md">
              Every feature in Trackeet was built based on real feedback from Nigerian business owners just like you.
            </p>
          </div>
        </div>
      </div>


      {/* Values */}
      <section className="py-20 bg-gray-50 dark:bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div variants={fade} className="text-center mb-12">
              <h2 className="text-3xl font-black text-dark dark:text-white mb-4">
                What We Believe In
              </h2>
              <p className="text-dark-500 dark:text-gray-400">
                The values that drive every decision we make
              </p>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {VALUES.map((v, i) => (
                <motion.div
                  key={i}
                  variants={fade}
                  className="card text-center hover:shadow-glow-sm transition-all hover:-translate-y-1"
                >
                  <div
                    className={`w-14 h-14 ${v.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}
                  >
                    <v.icon size={24} />
                  </div>
                  <h4 className="font-bold text-dark dark:text-white mb-2">
                    {v.title}
                  </h4>
                  <p className="text-dark-500 dark:text-gray-400 text-sm leading-relaxed">
                    {v.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-white dark:bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div variants={fade} className="text-center mb-12">
              <h2 className="text-3xl font-black text-dark dark:text-white mb-4">
                Meet the Team
              </h2>
              <p className="text-dark-500 dark:text-gray-400">
                Nigerians building for Nigerians
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {TEAM.map((member, i) => (
                <motion.div
                  key={i}
                  variants={fade}
                  className="card text-center hover:shadow-glow-sm transition-all hover:-translate-y-1"
                >
                  <div className="w-20 h-20 rounded-3xl mx-auto mb-4 overflow-hidden">
                    {member.photo ? (
                      <img
                        src={member.photo}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-20 h-20 ${member.bg} rounded-3xl flex items-center justify-center text-4xl`}>
                        {member.emoji}
                      </div>
                    )}
                  </div>
                  <h4 className="font-bold text-dark dark:text-white mb-1">
                    {member.name}
                  </h4>
                  <p className="text-dark-500 dark:text-gray-400 text-sm">
                    {member.role}
                  </p>
                  <div className="flex justify-center gap-2 mt-4">
                    {[Twitter, Linkedin].map((Icon, j) => (
                      <a
                        key={j}
                        href="#"
                        className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center hover:bg-primary-light hover:text-primary transition-colors"
                      >
                        <Icon size={14} />
                      </a>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 bg-gray-50 dark:bg-surface">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-black text-dark dark:text-white mb-4">
              Get in Touch
            </h2>
            <p className="text-dark-500 dark:text-gray-400 mb-8">
              We would love to hear from you — whether you have a question,
              feedback, or just want to say hello.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                {
                  icon: Mail,
                  label: "Email",
                  value: "hello@gettrackeet.com",
                  href: "mailto:hello@gettrackeet.com",
                },
                {
                  icon: Twitter,
                  label: "Twitter",
                  value: "@trackeet",
                  href: "#",
                },
                {
                  icon: MapPin,
                  label: "Location",
                  value: "Lagos, Nigeria 🇳🇬",
                  href: "#",
                },
              ].map((c, i) => (
                <a
                  key={i}
                  href={c.href}
                  className="card flex flex-col items-center gap-2 hover:shadow-glow-sm hover:-translate-y-1 transition-all"
                >
                  <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                    <c.icon size={18} className="text-primary" />
                  </div>
                  <p className="text-xs text-dark-400">{c.label}</p>
                  <p className="text-sm font-semibold text-dark dark:text-white">
                    {c.value}
                  </p>
                </a>
              ))}
            </div>
            <Link to="/register" className="btn btn-primary btn-lg">
              Start for Free <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
