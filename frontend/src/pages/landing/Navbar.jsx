import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Home,
  Zap,
  DollarSign,
  HelpCircle,
  Info,
  LogIn,
  ArrowRight,
  Users,
  Sun,
  Moon,
} from "lucide-react";
import useThemeStore from "../../store/themeStore.js";

const NAV_LINKS = [
  { label: "Home", icon: Home, to: "/" },
  { label: "Features", icon: Zap, to: "/features" },
  { label: "Pricing", icon: DollarSign, to: "/pricing" },
  { label: "How it Works", icon: Info, to: "/how-it-works" },
  { label: "About", icon: Users, to: "/about" },
  { label: "FAQ", icon: HelpCircle, to: "/faq" },
];

export default function Navbar({ scrolled }) {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const { isDark, toggle } = useThemeStore();

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass shadow-sm" : "bg-transparent"}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/Trackeet-logo.png" alt="Trackeet" className="w-9 h-9" />
            <span className="text-xl font-bold text-dark dark:text-white">
              Trackeet
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            {NAV_LINKS.map(({ label, icon: Icon, to }) => (
              <Link
                key={label}
                to={to}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all
                  ${
                    pathname === to
                      ? "bg-primary-light text-primary"
                      : "text-dark-500 hover:bg-primary-light hover:text-primary"
                  }`}
              >
                <Icon size={14} />
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark/Light toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun size={18} className="text-dark-400" />
              ) : (
                <Moon size={18} className="text-dark-400" />
              )}
            </button>
            <Link to="/login" className="btn btn-ghost btn-sm">
              <LogIn size={15} /> Login
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Get Started Free <ArrowRight size={15} />
            </Link>
          </div>

          {/* Mobile: dark toggle + Start Free + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDark ? (
                <Sun size={18} className="text-dark-400" />
              ) : (
                <Moon size={18} className="text-dark-400" />
              )}
            </button>
            <Link
              to="/register"
              className="btn btn-primary btn-sm text-xs px-3 py-2"
            >
              Start Free
            </Link>
            <button className="p-2" onClick={() => setOpen(!open)}>
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-surface border-t border-dark-200 dark:border-gray-700 pb-4"
            >
              {NAV_LINKS.map(({ label, icon: Icon, to }) => (
                <Link
                  key={label}
                  to={to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all
                    ${
                      pathname === to
                        ? "text-primary bg-primary-light"
                        : "text-dark-500 hover:text-primary hover:bg-primary-light"
                    }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
              <div className="flex gap-3 px-4 pt-3 border-t border-dark-200 dark:border-gray-700 mt-2">
                <Link to="/login" className="btn btn-secondary flex-1 btn-sm">
                  <LogIn size={14} /> Login
                </Link>
                <Link to="/register" className="btn btn-primary flex-1 btn-sm">
                  Get Started <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
