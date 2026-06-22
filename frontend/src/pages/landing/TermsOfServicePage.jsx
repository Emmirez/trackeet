import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    content:
      "By creating a Trackeet account or using our services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use Trackeet. These terms apply to all users of the platform, including individuals and businesses.",
  },
  {
    title: "2. Description of Service",
    content:
      "Trackeet is an invoicing, payment tracking, and WhatsApp automation platform designed for Nigerian businesses. We provide tools to create and send invoices, record payments, manage customers, and automate WhatsApp business communications. The service is provided on a subscription basis with a free tier available.",
  },
  {
    title: "3. Account Registration",
    content:
      "To use Trackeet, you must create an account with a valid email address and password. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must be at least 18 years old to create an account. You agree to provide accurate and complete information when registering and to update this information as necessary.",
  },
  {
    title: "4. Subscription Plans and Payments",
    subsections: [
      {
        subtitle: "4.1 Plans",
        text: "Trackeet offers Free, Starter, Business, and Enterprise subscription plans. Features and limits vary by plan as described on our Pricing page.",
      },
      {
        subtitle: "4.2 Billing",
        text: "Paid subscriptions are billed monthly or annually in advance. All prices are in Nigerian Naira (NGN) unless otherwise stated.",
      },
      {
        subtitle: "4.3 Payment Methods",
        text: "We accept payments via Paystack, Flutterwave, Stripe, and bank transfer. Payment processing is handled by these third-party providers and is subject to their terms.",
      },
      {
        subtitle: "4.4 Refunds",
        text: "We offer a 7-day money-back guarantee on all paid plans. Refund requests must be submitted to billing@trackeet.ng within 7 days of payment. Refunds are processed within 3–5 business days.",
      },
      {
        subtitle: "4.5 Upgrades and Downgrades",
        text: "You may upgrade or downgrade your plan at any time. Upgrades take effect immediately. Downgrades take effect at the start of the next billing period.",
      },
      {
        subtitle: "4.6 Cancellation",
        text: "You may cancel your subscription at any time from your account settings. Your account will remain active until the end of your current billing period. We do not charge cancellation fees.",
      },
    ],
  },
  {
    title: "6. Online Store",
    content:
      "Every Trackeet account includes a free online storefront accessible at trackeet.ng/store/yourstorename. You are responsible for the accuracy of product listings, pricing, and availability shown on your store. Orders placed through your store are communicated via WhatsApp and are subject to your own fulfillment and customer service practices. Trackeet does not process payments on your behalf for storefront orders unless explicitly stated.",
  },
  {
    title: "5. Free Plan Limitations",
    content:
      "The Free plan is limited to 5 invoices per calendar month and 10 customers. These limits reset on the first day of each month. The Free plan also includes a free online store. If you reach your limit, you will need to upgrade to a paid plan to create additional invoices.",
  },
  {
    title: "6. WhatsApp Integration",
    content:
      "The WhatsApp automation feature uses WhatsApp Web technology. By using this feature, you agree to comply with WhatsApp's Terms of Service. You are responsible for ensuring that your use of WhatsApp through Trackeet complies with applicable laws and WhatsApp's policies. Trackeet is not affiliated with or endorsed by WhatsApp or Meta.",
  },
  {
    title: "7. Your Data and Content",
    subsections: [
      {
        subtitle: "7.1 Ownership",
        text: "You retain full ownership of all data you enter into Trackeet, including customer information, invoices, and payment records. We do not claim any ownership rights over your data.",
      },
      {
        subtitle: "7.2 License to Us",
        text: "You grant Trackeet a limited licence to store, process, and display your data solely for the purpose of providing the service to you.",
      },
      {
        subtitle: "7.3 Data Accuracy",
        text: "You are responsible for the accuracy of all data you enter into Trackeet. Trackeet is not responsible for errors or losses arising from inaccurate data.",
      },
      {
        subtitle: "7.4 Data Export",
        text: "You can export your data at any time from the Reports section. We will provide your data in a standard format upon request.",
      },
    ],
  },
  {
    title: "8. Prohibited Uses",
    content:
      "You agree not to use Trackeet to: (a) create fraudulent invoices or engage in financial fraud; (b) spam or send unsolicited messages to customers via WhatsApp; (c) violate any applicable Nigerian or international laws; (d) reverse engineer, copy, or resell any part of the Trackeet platform; (e) share your account with unauthorised users; (f) use the service to store or transmit malicious code; (g) interfere with or disrupt the integrity of the service.",
  },
  {
    title: "9. Intellectual Property",
    content:
      "Trackeet, its logo, design, features, and all related technology are the intellectual property of Trackeet Technologies Ltd. Nothing in these terms grants you any rights to use Trackeet's trademarks, logos, or intellectual property without our prior written consent.",
  },
  {
    title: "10. Service Availability",
    content:
      "We aim to provide 99.9% uptime for Trackeet but cannot guarantee uninterrupted service. We may occasionally perform maintenance which could temporarily affect availability. We will provide advance notice of planned maintenance where possible. Trackeet is not liable for losses arising from service unavailability.",
  },
  {
    title: "11. Limitation of Liability",
    content:
      "To the maximum extent permitted by Nigerian law, Trackeet shall not be liable for any indirect, incidental, special, or consequential damages, including loss of profits, data, or business opportunities, arising from your use of the service. Our total liability to you for any claim shall not exceed the amount you paid to Trackeet in the 3 months preceding the claim.",
  },
  {
    title: "12. Indemnification",
    content:
      "You agree to indemnify and hold Trackeet, its directors, employees, and partners harmless from any claims, losses, damages, and expenses (including legal fees) arising from your use of the service, your violation of these terms, or your violation of any third party's rights.",
  },
  {
    title: "13. Termination",
    content:
      "Trackeet reserves the right to suspend or terminate your account if you violate these Terms of Service, engage in fraudulent activity, or for any other reason at our sole discretion with reasonable notice. Upon termination, your right to use the service ceases immediately. You may request an export of your data within 30 days of termination.",
  },
  {
    title: "14. Changes to Terms",
    content:
      "We reserve the right to modify these Terms of Service at any time. We will notify you of material changes via email at least 30 days before they take effect. Your continued use of Trackeet after changes take effect constitutes acceptance of the new terms.",
  },
  {
    title: "15. Governing Law",
    content:
      "These Terms of Service are governed by the laws of the Federal Republic of Nigeria. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.",
  },
  {
    title: "16. Contact",
    content:
      "If you have any questions about these Terms of Service, please contact us at legal@trackeet.ng or write to Trackeet Technologies Ltd, Victoria Island, Lagos, Nigeria.",
  },
];

export default function TermsOfServicePage() {
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
            <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText size={28} className="text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-dark dark:text-white mb-4">
              Terms of <span className="gradient-text">Service</span>
            </h1>
            <p className="text-dark-500 dark:text-gray-400 mb-4">
              Please read these terms carefully before using Trackeet.
            </p>
            <p className="text-sm text-dark-400">
              Last updated: June 2026 · Effective: June 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* Quick summary */}
      <section className="py-8 bg-white dark:bg-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card bg-primary-light dark:bg-primary/10 border border-primary/20 mb-12">
            <h2 className="font-bold text-primary mb-3">
              Summary (Plain English)
            </h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {[
                "✅ Free plan: 5 invoices/month, no credit card needed",
                "✅ You own all your data — we just store it for you",
                "✅ Cancel anytime, no cancellation fees",
                "✅ 7-day refund policy on all paid plans",
                "⚠️ Don't use Trackeet to create fraudulent invoices",
                "⚠️ WhatsApp automation must comply with WhatsApp's rules",
              ].map((item, i) => (
                <p
                  key={i}
                  className="text-sm text-dark dark:text-white font-medium"
                >
                  {item}
                </p>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-8">
            {SECTIONS.map((section, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-xl font-bold text-dark dark:text-white mb-4 pb-2 border-b border-dark-200 dark:border-gray-700">
                  {section.title}
                </h2>
                {section.content && (
                  <p className="text-dark-500 dark:text-gray-400 text-sm leading-relaxed">
                    {section.content}
                  </p>
                )}
                {section.subsections && (
                  <div className="space-y-4">
                    {section.subsections.map((sub, j) => (
                      <div key={j}>
                        <h3 className="font-semibold text-dark dark:text-white mb-1 text-sm">
                          {sub.subtitle}
                        </h3>
                        <p className="text-dark-500 dark:text-gray-400 text-sm leading-relaxed">
                          {sub.text}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
