import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LogIn } from "lucide-react";
import { Section, fade } from "./animations.jsx";

export default function CTASection() {
  return (
    <div className="py-8 bg-white dark:bg-dark">
      <div className="max-w-6xl mx-4 sm:mx-8 lg:mx-auto">
        <Section>
          <motion.div
            variants={fade}
            className="bg-gradient-to-br from-primary to-purple-700 rounded-3xl py-20 px-8 relative overflow-hidden text-center"
          >
            {/* Background blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full" />
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/5 rounded-full" />
            </div>

            <div className="relative max-w-4xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
                Ready to get paid faster?
              </h2>
              <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
                Join 12,000+ businesses already using Trackeet. Start free, no
                credit card needed.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="btn bg-white text-primary hover:bg-primary-light btn-lg shadow-xl"
                >
                  Start for Free <ArrowRight size={20} />
                </Link>
                <Link
                  to="/login"
                  className="btn border-2 border-white text-white hover:bg-white/10 btn-lg"
                >
                  <LogIn size={20} /> Login to Dashboard
                </Link>
              </div>
            </div>
          </motion.div>
        </Section>
      </div>
    </div>
  );
}
