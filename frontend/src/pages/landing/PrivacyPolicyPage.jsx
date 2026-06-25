import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    content: [
      {
        subtitle: "Account Information",
        text: "When you create a Trackeet account, we collect your name, email address, phone number, and business name. This information is necessary to provide our services.",
      },
      {
        subtitle: "Business Data",
        text: "We store the invoices, customer information, payment records, and product/storefront data you create on Trackeet. This data belongs to you and is only used to provide the service.",
      },
      {
        subtitle: "Storefront Visitor Data",
        text: "If you operate an online store on Trackeet, we may collect limited information from your customers (such as name, phone number, and order details) when they place orders or leave reviews. This information is shared with you, the store owner, to fulfil orders.",
      },
      {
        subtitle: "Usage Data",
        text: "We collect information about how you use Trackeet, including pages visited, features used, and actions taken. This helps us improve the product.",
      },
      {
        subtitle: "Device Information",
        text: "We collect basic device information such as browser type, operating system, and IP address for security and analytics purposes.",
      },
    ],
  },
  {
    title: "2. How We Use Your Information",
    content: [
      {
        subtitle: "Providing the Service",
        text: "We use your information to create and manage your account, process invoices, and deliver the features you have requested.",
      },
      {
        subtitle: "Communications",
        text: "We may send you emails about your account, product updates, and important notices. You can opt out of marketing emails at any time.",
      },
      {
        subtitle: "Improving Trackeet",
        text: "We use anonymised usage data to understand how people use Trackeet and to improve our features and user experience.",
      },
      {
        subtitle: "Security",
        text: "We use your information to detect and prevent fraud, abuse, and security threats to our platform and your account.",
      },
    ],
  },
  {
    title: "3. Data Sharing",
    content: [
      {
        subtitle: "We Do Not Sell Your Data",
        text: "Trackeet does not sell, rent, or trade your personal information or business data to third parties. Your data is yours.",
      },
      {
        subtitle: "Service Providers",
        text: "We share data with trusted service providers who help us operate Trackeet, including Paystack (payments), Cloudinary (file storage), and email providers. These providers are bound by strict data processing agreements.",
      },
      {
        subtitle: "Legal Requirements",
        text: "We may disclose your information if required by Nigerian law, court order, or governmental authority.",
      },
    ],
  },
  {
    title: "4. Data Security",
    content: [
      {
        subtitle: "Encryption",
        text: "All data transmitted between your browser and our servers is encrypted using TLS (Transport Layer Security). Data at rest is encrypted using AES-256 encryption.",
      },
      {
        subtitle: "Authentication",
        text: "We use industry-standard JWT (JSON Web Token) authentication with secure token expiration to protect your account.",
      },
      {
        subtitle: "Access Controls",
        text: "Access to customer data is strictly limited to authorised Trackeet staff who need it to provide support. All access is logged and audited.",
      },
      {
        subtitle: "Backups",
        text: "Your data is backed up daily to ensure it is never lost. Backups are stored in encrypted form in a separate location.",
      },
    ],
  },
  {
    title: "5. Your Rights",
    content: [
      {
        subtitle: "Access Your Data",
        text: "You can access all your data at any time through your Trackeet dashboard. You can also request a full export of your data by emailing privacy@gettrackeet.com.",
      },
      {
        subtitle: "Delete Your Data",
        text: "You can delete your account and all associated data at any time from Settings → Account → Delete Account. Data is permanently deleted within 90 days.",
      },
      {
        subtitle: "Correct Your Data",
        text: "You can update your personal and business information at any time through your account settings.",
      },
      {
        subtitle: "Data Portability",
        text: "You can export your invoices, customer list, and payment records at any time from the Reports section.",
      },
    ],
  },
  {
    title: "6. Cookies",
    content: [
      {
        subtitle: "What We Use",
        text: "Trackeet uses essential cookies to keep you logged in and remember your preferences (such as dark mode). We do not use advertising cookies.",
      },
      {
        subtitle: "Analytics",
        text: "We use Google Analytics to understand how Trackeet is used. This is only activated if you accept our cookie consent banner. No personally identifiable information is included in analytics data, and you may decline analytics cookies at any time.",
      },
      {
        subtitle: "Your Consent",
        text: "When you first visit Trackeet, you will be shown a cookie consent banner allowing you to accept or decline non-essential cookies. You can change your preference at any time by clearing your browser's local storage for our site.",
      },
    ],
  },
  {
    title: "7. Data Retention",
    content: [
      {
        subtitle: "Active Accounts",
        text: "We retain your data for as long as your account is active. Invoice and payment records are kept for a minimum of 7 years as required by Nigerian tax regulations.",
      },
      {
        subtitle: "Deleted Accounts",
        text: "When you delete your account, your personal data is removed within 90 days. Some anonymised data may be retained for analytics purposes.",
      },
    ],
  },
  {
    title: "8. Changes to This Policy",
    content: [
      {
        subtitle: "Notification",
        text: "We will notify you of any material changes to this Privacy Policy via email and an in-app notification at least 30 days before the changes take effect.",
      },
    ],
  },
  {
    title: "9. Contact Us",
    content: [
      {
        subtitle: "Privacy Questions",
        text: "If you have any questions about this Privacy Policy or how we handle your data, please contact us at privacy@gettrackeet.com or write to us at Trackeet Technologies Ltd, Victoria Island, Lagos, Nigeria.",
      },
    ],
  },
];

export default function PrivacyPolicyPage() {
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
              <Shield size={28} className="text-primary" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-dark dark:text-white mb-4">
              Privacy <span className="gradient-text">Policy</span>
            </h1>
            <p className="text-dark-500 dark:text-gray-400 mb-4">
              Your privacy is important to us. This policy explains how Trackeet
              collects, uses, and protects your information.
            </p>
            <p className="text-sm text-dark-400">Last updated: June 2026</p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white dark:bg-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Summary card */}
          <div className="card bg-primary-light dark:bg-primary/10 border border-primary/20 mb-12">
            <h2 className="font-bold text-primary mb-3">
              Summary (Plain English)
            </h2>
            <ul className="space-y-2">
              {[
                "✅ We do not sell your data — ever",
                "✅ Your business data belongs to you",
                "✅ We use bank-grade encryption to protect your data",
                "✅ You can delete your account and data at any time",
                "✅ We only collect data we actually need to run the service",
              ].map((item, i) => (
                <li
                  key={i}
                  className="text-sm text-dark dark:text-white font-medium"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Sections */}
          <div className="space-y-10">
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
                <div className="space-y-4">
                  {section.content.map((item, j) => (
                    <div key={j}>
                      <h3 className="font-semibold text-dark dark:text-white mb-1 text-sm">
                        {item.subtitle}
                      </h3>
                      <p className="text-dark-500 dark:text-gray-400 text-sm leading-relaxed">
                        {item.text}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
