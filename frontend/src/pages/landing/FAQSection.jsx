import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { Section, fade } from './animations.jsx'
import { FAQ } from './landingData.js'

export default function FAQSection() {
  const [open, setOpen] = useState(null)

  return (
    <section id="faq" className="py-20 bg-gray-50 dark:bg-surface">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Section>
          <motion.div variants={fade} className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-dark dark:text-white mb-4">Frequently asked questions</h2>
            <p className="text-dark-500 dark:text-gray-400">
              Got more questions? <a href="mailto:hello@trackeet.ng" className="text-primary hover:underline">Email us</a>
            </p>
          </motion.div>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <motion.div key={i} variants={fade} className="card cursor-pointer"
                onClick={() => setOpen(open === i ? null : i)}>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-semibold text-dark dark:text-white text-sm">{item.q}</h3>
                  <ChevronDown size={18} className={`text-dark-400 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}/>
                </div>
                <AnimatePresence>
                  {open === i && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <p className="text-dark-500 dark:text-gray-400 text-sm leading-relaxed pt-3 border-t border-dark-200 dark:border-gray-700 mt-3">{item.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </Section>
      </div>
    </section>
  )
}