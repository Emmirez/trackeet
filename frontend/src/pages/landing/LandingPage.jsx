import { useState, useEffect } from "react";
import Navbar from "./Navbar.jsx";
import HeroSection from "./HeroSection.jsx";
import StatsBar from "./StatsBar.jsx";
import FeaturesSection from "./FeatureSection.jsx";
import DemoSection from "./DemoSection.jsx";
import HowItWorksSection from "./HowItWorkSection.jsx";
import PricingSection from "./PricingSection.jsx";
import TestimonialsSection from "./TestimonialSection.jsx";
import FAQSection from "./FAQSection.jsx";
import CTASection from "./CTASection.jsx";
import Footer from "./Footer.jsx";
import AboutSection from "./AboutSection.jsx";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="font-poppins overflow-x-hidden">
      <Navbar scrolled={scrolled} />
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <DemoSection />
      {/* Businesses We Serve — full width image section */}
      <section className="py-16 bg-gray-50 dark:bg-surface overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary mb-2">
              Works for every business
            </p>
            <h2 className="text-2xl sm:text-3xl font-black text-dark dark:text-white">
              Built for{" "}
              <span className="gradient-text">Nigerian businesses</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { src: "/images/fashion1.jpg", label: "Fashion", emoji: "👗" },
              { src: "/images/foods.jpg", label: "Food", emoji: "🍔" },
              { src: "/images/sal.jpg", label: "Beauty", emoji: "💅" },
              { src: "/images/gadget.jpg", label: "Electronics", emoji: "📱" },
              { src: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&auto=format&fit=crop&q=80", label: "Furniture", emoji: "🪑" },
              { src: "/images/pharm1.jpg", label: "Pharmacy", emoji: "💊" },
            ].map((item, i) => (
              <div
                key={i}
                className="relative h-40 rounded-2xl overflow-hidden group cursor-pointer"
              >
                <img
                  src={item.src}
                  alt={item.label}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/20 to-transparent" />
                <div className="absolute bottom-2 left-0 right-0 text-center">
                  <span className="text-lg">{item.emoji}</span>
                  <p className="text-white text-xs font-bold">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      {/* Full width lifestyle banner */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden h-80">
            <img
              src="/images/salon2.jpg"
              alt="Nigerian business owners using Trackeet"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50" />
            <div className="absolute inset-0 flex items-center justify-center flex-col text-center px-8">
              <p className="text-white/70 text-sm font-medium mb-2 tracking-wide uppercase">
                Join thousands of Nigerian businesses
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 drop-shadow-lg">
                Your business deserves better tools
              </h2>
              <p className="text-white/80 max-w-lg mb-6 text-sm leading-relaxed">
                Stop using notebooks, WhatsApp screenshots and Excel sheets.
                Trackeet gives you everything you need to run a professional
                business.
              </p>

              <a
                href="/register"
                className="bg-white text-dark font-bold px-8 py-3 rounded-2xl hover:bg-gray-100 transition-all shadow-xl hover:scale-105"
              >
                Start Free Today — No Credit Card →
              </a>
            </div>
          </div>
        </div>
      </section>

      <AboutSection />
      <FAQSection />
      <CTASection />
      <Footer />

      {/* Floating WhatsApp button */}

      <a
        href="https://wa.me/2348064018967?text=Hi!%20I%20have%20a%20question%20about%20Trackeet"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-2xl hover:bg-[#20BA5A] transition-all hover:scale-105 group"
      >
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
          className="w-6 h-6 flex-shrink-0"
          alt="WhatsApp"
        />
        <span className="text-sm font-bold max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          Chat with us
        </span>
      </a>
    </div>
  );
}
