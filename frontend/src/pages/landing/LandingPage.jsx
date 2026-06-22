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
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
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
