import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  Shield,
  Clock,
  Zap,
  AlertTriangle,
  HeartHandshake,
  Server,
} from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const SLA_TIERS = [
  {
    plan: "Business",
    color: "border-warning",
    bg: "bg-warning-light",
    text: "text-warning",
    features: [
      { label: "Uptime Guarantee", value: "99.5%" },
      { label: "Support Response Time", value: "24 hours" },
      { label: "Data Backup", value: "Daily" },
      { label: "Incident Notification", value: "4 hours" },
    ],
  },
  {
    plan: "Enterprise",
    color: "border-primary",
    bg: "bg-primary-light",
    text: "text-primary",
    highlight: true,
    features: [
      { label: "Uptime Guarantee", value: "99.9%" },
      { label: "Support Response Time", value: "2 hours" },
      { label: "Data Backup", value: "Hourly" },
      { label: "Incident Notification", value: "30 minutes" },
    ],
  },
];

const COMMITMENTS = [
  {
    icon: Server,
    color: "text-primary",
    bg: "bg-primary-light",
    title: "99.9% Uptime",
    desc: "We guarantee Trackeet will be available 99.9% of the time every month. That's less than 9 hours of downtime per year.",
  },
  {
    icon: Clock,
    color: "text-success",
    bg: "bg-success-light",
    title: "2-Hour Response",
    desc: "Enterprise customers get priority support with a guaranteed 2-hour first response time during business hours.",
  },
  {
    icon: Shield,
    color: "text-warning",
    bg: "bg-warning-light",
    title: "Data Security",
    desc: "Your business data is encrypted at rest and in transit. We perform hourly backups and can restore data within 1 hour.",
  },
  {
    icon: Zap,
    color: "text-purple-500",
    bg: "bg-purple-100",
    title: "Fast Performance",
    desc: "API response times under 500ms. Invoice generation under 2 seconds. WhatsApp delivery within 10 seconds.",
  },
  {
    icon: HeartHandshake,
    color: "text-danger",
    bg: "bg-danger-light",
    title: "Dedicated Support",
    desc: "Enterprise customers get a dedicated account manager and onboarding support to get started quickly.",
  },
  {
    icon: AlertTriangle,
    color: "text-warning",
    bg: "bg-warning-light",
    title: "Incident Credits",
    desc: "If we fail to meet our uptime guarantee, you'll receive service credits applied to your next billing cycle.",
  },
];

const CREDITS = [
  { uptime: "99.0% – 99.9%", credit: "10% of monthly fee" },
  { uptime: "95.0% – 99.0%", credit: "25% of monthly fee" },
  { uptime: "Below 95.0%", credit: "50% of monthly fee" },
];

export default function SLAPage() {
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
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
              <Shield size={20} className="text-primary" />
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary-light text-primary">
              Enterprise Feature
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-dark dark:text-white">
            Service Level <span className="gradient-text">Agreement</span>
          </h1>
          <p className="text-dark-400 mt-2 max-w-2xl">
            Our commitment to reliability, performance and support. We take
            uptime seriously so you can focus on running your business.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
        {/* SLA tiers */}
        <div>
          <h2 className="text-2xl font-black text-dark dark:text-white mb-6">
            SLA by Plan
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {SLA_TIERS.map((tier, i) => (
              <div
                key={i}
                className={`card relative border-2 ${tier.color} ${tier.highlight ? "shadow-glow" : ""}`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-4 py-1 rounded-full">
                    Recommended
                  </div>
                )}
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${tier.bg} mb-4`}
                >
                  <span className={`text-sm font-bold ${tier.text}`}>
                    {tier.plan} Plan
                  </span>
                </div>
                <div className="space-y-3">
                  {tier.features.map((f, j) => (
                    <div
                      key={j}
                      className="flex items-center justify-between py-2 border-b border-dark-100 dark:border-gray-800 last:border-0"
                    >
                      <span className="text-sm text-dark-400">{f.label}</span>
                      <span className={`text-sm font-bold ${tier.text}`}>
                        {f.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commitments */}
        <div>
          <h2 className="text-2xl font-black text-dark dark:text-white mb-6">
            Our Commitments
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COMMITMENTS.map((c, i) => (
              <div key={i} className="card hover:shadow-lg transition-shadow">
                <div
                  className={`w-10 h-10 ${c.bg} rounded-xl flex items-center justify-center mb-3`}
                >
                  <c.icon size={18} className={c.color} />
                </div>
                <h3 className="font-bold text-dark dark:text-white mb-1">
                  {c.title}
                </h3>
                <p className="text-sm text-dark-400">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Service credits */}
        <div className="card">
          <h2 className="text-xl font-black text-dark dark:text-white mb-2">
            Service Credits
          </h2>
          <p className="text-sm text-dark-400 mb-4">
            If Trackeet fails to meet the uptime guarantee, you are eligible for
            service credits:
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dark-200 dark:border-gray-700">
                  <th className="text-left py-3 text-dark-400 font-semibold">
                    Monthly Uptime
                  </th>
                  <th className="text-left py-3 text-dark-400 font-semibold">
                    Service Credit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-100 dark:divide-gray-800">
                {CREDITS.map((row, i) => (
                  <tr key={i}>
                    <td className="py-3 text-dark dark:text-white font-medium">
                      {row.uptime}
                    </td>
                    <td className="py-3 text-danger font-bold">{row.credit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-dark-400 mt-4">
            Credits are applied automatically to your next invoice. Claims must
            be submitted within 30 days of the incident.
          </p>
        </div>

        {/* Exclusions */}
        <div className="card border border-warning/20 bg-warning-light/20">
          <div className="flex items-start gap-3">
            <AlertTriangle
              size={18}
              className="text-warning flex-shrink-0 mt-0.5"
            />
            <div>
              <h3 className="font-bold text-dark dark:text-white mb-2">
                SLA Exclusions
              </h3>
              <p className="text-sm text-dark-400 mb-2">
                The SLA does not apply to downtime caused by:
              </p>
              <ul className="text-sm text-dark-400 space-y-1">
                <li>• Scheduled maintenance (announced 48 hours in advance)</li>
                <li>
                  • Third-party service failures (WhatsApp, payment providers)
                </li>
                <li>
                  • Force majeure events (natural disasters, power outages)
                </li>
                <li>• Customer actions that violate our Terms of Service</li>
                <li>• Free plan accounts</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card bg-gradient-to-br from-primary to-purple-700 text-white text-center">
          <Shield size={40} className="mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl font-black mb-2">Need Enterprise SLA?</h2>
          <p className="text-white/80 mb-6 text-sm max-w-md mx-auto">
            Contact our sales team to discuss custom SLA terms, dedicated
            infrastructure and enterprise support packages.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a
              href="mailto:sales@gettrackeet.com?subject=Enterprise SLA Enquiry"
              className="btn bg-white text-primary font-bold hover:bg-gray-50"
            >
              Contact Sales
            </a>
            <Link
              to="/pricing"
              className="btn border border-white text-white hover:bg-white/10"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
