import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { Section, fade } from './animations.jsx'
import { FEATURES } from './landingData.js'

export default function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-white dark:bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Section>
          <motion.div variants={fade} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-light text-primary text-sm font-semibold rounded-full mb-4">
              <Zap size={14}/> Everything you need
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-dark dark:text-white mb-4">
              Stop juggling apps.<br/>
              <span className="gradient-text">Do it all in Trackeet.</span>
            </h2>
            <p className="text-dark-500 dark:text-gray-400 max-w-xl mx-auto">
              Everything a Modern business owner needs to look professional and get paid faster — in one simple app.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div key={i} variants={fade}
                className="card hover:shadow-glow-sm transition-all duration-300 group hover:-translate-y-1">
                <div className={`w-12 h-12 ${f.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <f.icon size={22}/>
                </div>
                <h3 className="text-lg font-bold text-dark dark:text-white mb-2">{f.title}</h3>
                <p className="text-dark-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </Section>
      </div>
    </section>
  )
}