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
    </section>
  );
}
