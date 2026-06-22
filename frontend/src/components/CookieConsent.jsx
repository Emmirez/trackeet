import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { Link } from "react-router-dom";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      // Small delay so it doesn't feel jarring on page load
      const timer = setTimeout(() => setShow(true), 1000);
      return () => clearTimeout(timer);
    } else if (consent === "accepted") {
      enableAnalytics();
    }
  }, []);

  const enableAnalytics = () => {
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  };

  const disableAnalytics = () => {
    if (window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
      });
    }
  };

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    enableAnalytics();
    setShow(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    disableAnalytics();
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] p-4 animate-fade-in">
      <div className="max-w-3xl mx-auto bg-white dark:bg-surface rounded-2xl shadow-2xl border border-dark-200 dark:border-gray-700 p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
            <Cookie size={20} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-dark dark:text-white text-sm mb-1">
              We use cookies 🍪
            </p>
            <p className="text-xs text-dark-400 leading-relaxed mb-4">
              We use cookies to improve your experience and understand how you
              use Trackeet. By clicking "Accept" you agree to our use of cookies
              as described in our{" "}
              <Link
                to="/privacy"
                className="text-primary hover:underline font-semibold"
              >
                Privacy Policy
              </Link>
              .
            </p>
            <div className="flex gap-2 flex-wrap">
              <button onClick={handleAccept} className="btn btn-primary btn-sm">
                Accept All
              </button>
              <button
                onClick={handleDecline}
                className="btn btn-secondary btn-sm"
              >
                Decline
              </button>
            </div>
          </div>
          <button
            onClick={handleDecline}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
          >
            <X size={16} className="text-dark-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
