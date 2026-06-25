import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  Heart,
  Zap,
  Users,
  Globe,
  ChevronDown,
  Mail,
} from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const fade = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const PERKS = [
  {
    icon: Zap,
    color: "bg-primary-light text-primary",
    title: "Remote First",
    desc: "Work from anywhere in Nigeria. We are fully remote with optional Lagos office access.",
  },
  {
    icon: Heart,
    color: "bg-danger-light text-danger",
    title: "Health Insurance",
    desc: "Full HMO coverage for you and one dependent, from day one.",
  },
  {
    icon: Users,
    color: "bg-success-light text-success",
    title: "Learning Budget",
    desc: "₦200,000 annual budget for courses, books, conferences and personal development.",
  },
  {
    icon: Globe,
    color: "bg-warning-light text-warning",
    title: "Competitive Pay",
    desc: "Market-rate salaries in Naira, paid on time every month. No delays.",
  },
  {
    icon: Briefcase,
    color: "bg-info-light text-info",
    title: "Equity",
    desc: "All full-time employees receive stock options. We grow together.",
  },
  {
    icon: Clock,
    color: "bg-purple-100 text-purple-600",
    title: "Flexible Hours",
    desc: "No 9–5 rigidity. Work when you are most productive, deliver results.",
  },
];

const OPENINGS = [
  {
    title: "Senior Frontend Engineer",
    team: "Engineering",
    type: "Full-time",
    location: "Remote (Nigeria)",
    desc: "We are looking for a Senior Frontend Engineer to help us build the best invoicing experience for Nigerian businesses. You will work closely with our product and design teams to ship high-quality React features.",
    requirements: [
      "At least 4 years of experience with React",
      "Strong knowledge of Tailwind CSS and responsive design",
      "Experience with REST APIs and state management (Zustand, Redux)",
      "Attention to detail and a passion for great UI",
      "Ability to work independently in a remote environment",
    ],
  },
  {
    title: "Backend Engineer (Node.js)",
    team: "Engineering",
    type: "Full-time",
    location: "Remote (Nigeria)",
    desc: "Join our backend team to build the APIs and services that power Trackeet. You will work on everything from invoice generation to WhatsApp automation and payment processing.",
    requirements: [
      "At least 3 years of experience with Node.js and Express",
      "Strong knowledge of MongoDB and Mongoose",
      "Experience with RESTful API design and JWT authentication",
      "Familiarity with payment APIs (Paystack, Flutterwave)",
      "Experience with real-time features (Socket.io) is a plus",
    ],
  },
  {
    title: "Product Designer",
    team: "Design",
    type: "Full-time",
    location: "Remote (Nigeria)",
    desc: "We are looking for a Product Designer who understands how Nigerian business owners think. You will design features that are simple enough for a Lagos market trader but powerful enough for a growing SME.",
    requirements: [
      "At least 3 years of product design experience",
      "Strong portfolio of mobile and web product designs",
      "Proficiency in Figma",
      "Experience conducting user research and usability testing",
      "Understanding of the Nigerian SME market is a big plus",
    ],
  },
  {
    title: "Customer Success Manager",
    team: "Customer Success",
    type: "Full-time",
    location: "Lagos or Remote",
    desc: "Be the first point of contact for our customers. Help them get the most out of Trackeet, resolve issues quickly, and gather feedback that shapes our product roadmap.",
    requirements: [
      "At least 2 years in a customer success or support role",
      "Excellent written and verbal communication in English",
      "Patient, empathetic and solution-oriented",
      "Familiarity with SaaS products",
      "Experience with Nigerian small businesses is a big plus",
    ],
  },
  {
    title: "Growth Marketer",
    team: "Marketing",
    type: "Full-time",
    location: "Remote (Nigeria)",
    desc: "Drive user acquisition and retention for Trackeet across Nigeria. You will run campaigns, manage social media, create content, and find creative ways to get Trackeet in front of every business owner in Nigeria.",
    requirements: [
      "At least 2 years of experience in growth or digital marketing",
      "Experience running paid campaigns (Meta, Google)",
      "Strong copywriting skills in Nigerian English",
      "Data-driven mindset — you measure everything",
      "Deep understanding of the Nigerian SME market",
    ],
  },
];

function JobCard({ job }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      variants={fade}
      className="card hover:shadow-glow-sm transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-bold text-dark dark:text-white mb-1">
            {job.title}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-dark-400">
              <Users size={12} /> {job.team}
            </span>
            <span className="flex items-center gap-1 text-xs text-dark-400">
              <Clock size={12} /> {job.type}
            </span>
            <span className="flex items-center gap-1 text-xs text-dark-400">
              <MapPin size={12} /> {job.location}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setOpen(!open)}
            className="btn btn-ghost border border-dark-200 dark:border-gray-700 btn-sm"
          >
            {open ? "Hide Details" : "View Details"}
            <ChevronDown
              size={14}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
          <a
            href={`mailto:careers@gettrackeet.com?subject=Application: ${job.title}`}
            className="btn btn-primary btn-sm"
          >
            Apply <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="border-t border-dark-200 dark:border-gray-700 pt-4 space-y-4"
        >
          <p className="text-sm text-dark-500 dark:text-gray-400 leading-relaxed">
            {job.desc}
          </p>
          <div>
            <p className="text-sm font-semibold text-dark dark:text-white mb-2">
              Requirements
            </p>
            <ul className="space-y-1.5">
              {job.requirements.map((r, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-dark-500 dark:text-gray-400"
                >
                  <span className="text-primary mt-0.5 flex-shrink-0">→</span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <a
            href={`mailto:careers@gettrackeet.com?subject=Application: ${job.title}`}
            className="btn btn-primary w-full sm:w-auto"
          >
            Apply for this Role <ArrowRight size={16} />
          </a>
        </motion.div>
      )}
    </motion.div>
  );
}

export default function CareersPage() {
  const [scrolled, setScrolled] = useState(false);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const teams = ["All", ...new Set(OPENINGS.map((j) => j.team))];
  const filtered =
    filter === "All" ? OPENINGS : OPENINGS.filter((j) => j.team === filter);

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
              <Briefcase size={14} /> We are hiring
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-dark dark:text-white mb-6">
              Help us build the future of{" "}
              <span className="gradient-text">Nigerian business</span>
            </h1>
            <p className="text-lg text-dark-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
              We are a small, ambitious team on a mission to help every Nigerian
              business owner get paid faster and look more professional. Come
              build with us.
            </p>
            <div className="flex items-center justify-center gap-6 text-sm text-dark-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-success rounded-full" />
                {OPENINGS.length} open roles
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-primary rounded-full" />
                Remote first
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-warning rounded-full" />
                Lagos, Nigeria
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Perks */}
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
                Why work at Trackeet?
              </h2>
              <p className="text-dark-500 dark:text-gray-400">
                We take care of our people so they can take care of our
                customers
              </p>
            </motion.div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {PERKS.map((p, i) => (
                <motion.div
                  key={i}
                  variants={fade}
                  className="card hover:shadow-glow-sm hover:-translate-y-1 transition-all"
                >
                  <div
                    className={`w-12 h-12 ${p.color} rounded-2xl flex items-center justify-center mb-4`}
                  >
                    <p.icon size={22} />
                  </div>
                  <h3 className="font-bold text-dark dark:text-white mb-2">
                    {p.title}
                  </h3>
                  <p className="text-sm text-dark-500 dark:text-gray-400 leading-relaxed">
                    {p.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Open roles */}
      <section className="py-20 bg-gray-50 dark:bg-surface">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            <motion.div variants={fade} className="text-center mb-10">
              <h2 className="text-3xl font-black text-dark dark:text-white mb-4">
                Open Positions
              </h2>
              <p className="text-dark-500 dark:text-gray-400">
                {OPENINGS.length} roles across Engineering, Design, Marketing
                and more
              </p>
            </motion.div>

            {/* Filter tabs */}
            <div className="flex gap-2 flex-wrap justify-center mb-8">
              {teams.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${filter === t ? "bg-primary text-white shadow-glow-sm" : "bg-white dark:bg-dark text-dark-500 border border-dark-200 dark:border-gray-700 hover:border-primary hover:text-primary"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filtered.map((job, i) => (
                <JobCard key={i} job={job} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* No fit? */}
      <section className="py-16 bg-white dark:bg-dark text-center">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-4xl mb-4">🙋🏿</div>
          <h2 className="text-2xl font-bold text-dark dark:text-white mb-2">
            Don't see your role?
          </h2>
          <p className="text-dark-500 dark:text-gray-400 mb-6">
            We are always looking for exceptional people. Send us your CV and
            tell us how you can help Trackeet grow.
          </p>
          <a
            href="mailto:careers@gettrackeet.com?subject=Open Application"
            className="btn btn-primary btn-lg"
          >
            <Mail size={18} /> Send Open Application
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
