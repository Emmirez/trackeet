import { motion } from "framer-motion";
import { Section, fade } from "./animations.jsx";
import { HOW_IT_WORKS } from "./landingData.js";

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-white dark:bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Section>
          <motion.div variants={fade} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-dark dark:text-white mb-4">
              Up and running in{" "}
              <span className="gradient-text">under 5 minutes</span>
            </h2>
            <p className="text-dark-500 dark:text-gray-400 max-w-xl mx-auto">
              Invoices, payments, WhatsApp automation and your free online store
              — ready before your next customer calls.
            </p>
          </motion.div>
          {/* Real business showcase images */}
          <div className="grid grid-cols-3 gap-4 mb-16 rounded-3xl overflow-hidden">
            <div className="relative h-48 rounded-2xl overflow-hidden group col-span-1">
              <img
                src="/images/invoice.jpg"
                alt="Business owner sending invoice"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="text-white text-xs font-bold">Create Invoice</p>
                <p className="text-white/70 text-[10px]">30 seconds flat</p>
              </div>
            </div>
            <div className="relative h-48 rounded-2xl overflow-hidden group col-span-1">
              <img
                src="/images/whats.jpg"
                alt="WhatsApp business messaging"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="text-white text-xs font-bold">
                  WhatsApp Automation
                </p>
                <p className="text-white/70 text-[10px]">Auto-send invoices</p>
              </div>
            </div>
            <div className="relative h-48 rounded-2xl overflow-hidden group col-span-1">
              <img
                src="/images/store3.jpg"
                alt="Online store"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3">
                <p className="text-white text-xs font-bold">Online Store</p>
                <p className="text-white/70 text-[10px]">Free storefront</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-8">
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div key={i} variants={fade} className="text-center group">
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
        </Section>
      </div>
      {/* Bottom lifestyle image + CTA */}
      <motion.div
        variants={fade}
        className="mt-16 relative rounded-3xl overflow-hidden"
      >
        <img
          src="/images/restuarant.jpg"
          alt="Nigerian business owner"
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-purple-00/80" />
        <div className="absolute inset-0 flex items-center justify-center flex-col text-center p-8">
          <h3 className="text-2xl font-black text-white mb-2">
            Ready to get started?
          </h3>
          <p className="text-white/80 text-sm mb-6 max-w-md">
            Join 12,000+ Nigerian businesses already using Trackeet to get paid
            faster.
          </p>

          <a
            href="/register"
            className="bg-white text-primary font-bold px-8 py-3 rounded-2xl hover:bg-primary-light transition-colors"
          >
            Start Free Today →
          </a>
        </div>
      </motion.div>
    </section>
  );
}
