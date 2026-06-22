import { motion } from "framer-motion";
import { Section, fade } from "./animations.jsx";
import { STATS } from "./landingData.js";

export default function StatsBar() {
  return (
    <div className="py-8 bg-white dark:bg-dark">
      <Section className="bg-primary py-12 rounded-3xl max-w-6xl mx-4 sm:mx-8 lg:mx-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ value, label, icon: Icon }, i) => (
              <motion.div
                key={i}
                variants={fade}
                className="text-center text-white"
              >
                <Icon size={24} className="mx-auto mb-2 opacity-80" />
                <p className="text-3xl font-black mb-1">{value}</p>
                <p className="text-sm opacity-80 font-medium">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}
