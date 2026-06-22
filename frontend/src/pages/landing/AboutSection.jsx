import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Users, Target, Heart, ArrowRight, CheckCircle } from "lucide-react";
import { Section, fade } from "./animations.jsx";

const VALUES = [
  {
    icon: Target,
    color: "bg-primary-light text-primary",
    title: "Built for Africa",
    desc: "We understand the unique challenges of running a business in Nigeria — from cash-based payments to WhatsApp as the primary business tool.",
  },
  {
    icon: Heart,
    color: "bg-danger-light text-danger",
    title: "We Care About You",
    desc: "Every feature is built based on real feedback from Lagos business owners. Your success is our success.",
  },
  {
    icon: Users,
    color: "bg-success-light text-success",
    title: "Community First",
    desc: "We are building more than software — we are building a community of empowered Nigerian entrepreneurs.",
  },
];

const STATS = [
  { value: "12k+", label: "Businesses" },
  { value: "2.4B+", label: "Invoiced" },
  { value: "2023", label: "Founded" },
  { value: "Lagos", label: "Headquarters" },
];

export default function AboutSection() {
  return (
    <section className="py-20 bg-white dark:bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Section>
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            {/* Left */}
            <motion.div variants={fade}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light text-primary text-sm font-semibold rounded-full mb-6">
                🇳🇬 Made in Lagos
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-dark dark:text-white mb-6">
                We are on a mission to help{" "}
                <span className="gradient-text">every Nigerian business</span>{" "}
                get paid faster
              </h2>
              <p className="text-dark-500 dark:text-gray-400 leading-relaxed mb-6">
                Trackeet was born out of frustration. Our founder watched small
                business owners in Lagos lose money every day — not because they
                weren't working hard, but because they had no proper system to
                track who owed them money.
              </p>
              <p className="text-dark-500 dark:text-gray-400 leading-relaxed mb-8">
                We built Trackeet specifically for the Nigerian market — with
                Naira support, WhatsApp automation, and bank transfer payments
                built in from day one.
              </p>
              <div className="space-y-3 mb-8">
                {[
                  "Built specifically for Nigerian businesses",
                  "WhatsApp-first approach to customer communication",
                  "Naira payments with Paystack and bank transfer",
                  "Designed by Nigerians who understand the market",
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle
                      size={16}
                      className="text-success flex-shrink-0"
                    />
                    <span className="text-sm text-dark dark:text-white">
                      {p}
                    </span>
                  </div>
                ))}
              </div>
              <Link to="/about" className="btn btn-primary">
                Learn More About Us <ArrowRight size={18} />
              </Link>
            </motion.div>

            {/* Right — image + stats */}
            <motion.div variants={fade} className="space-y-6">
              {/* Image placeholder */}
              <div className="relative rounded-3xl overflow-hidden h-64 bg-gradient-to-br from-primary to-purple-700 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-6xl mb-3">🚀</div>
                  <p className="font-bold text-lg">Building for Nigeria</p>
                  <p className="text-white/70 text-sm">
                    Lagos · Abuja · Port Harcourt
                  </p>
                </div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full" />
                <div className="absolute -top-4 -left-4 w-20 h-20 bg-white/10 rounded-full" />
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-4">
                {STATS.map((s, i) => (
                  <div key={i} className="card text-center">
                    <p className="text-2xl font-black text-primary mb-1">
                      {s.value}
                    </p>
                    <p className="text-sm text-dark-400">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Values */}
          <motion.div variants={fade} className="text-center mb-12">
            <h3 className="text-2xl font-black text-dark dark:text-white mb-2">
              Our Values
            </h3>
            <p className="text-dark-500 dark:text-gray-400">
              What drives everything we build
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
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
        </Section>
      </div>
    </section>
  );
}
