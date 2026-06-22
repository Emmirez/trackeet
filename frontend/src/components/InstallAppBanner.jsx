import { useState } from "react";
import { X, Download, Share } from "lucide-react";
import { useInstallPrompt } from "../hooks/useInstallPrompt.js";

export default function InstallAppBanner() {
  const { isInstallable, isInstalled, promptInstall, isIOS } =
    useInstallPrompt();
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem("installBannerDismissed") === "true",
  );
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  if (isInstalled || dismissed) return null;
  if (!isInstallable && !isIOS) return null;

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("installBannerDismissed", "true");
  };

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    await promptInstall();
  };

  return (
    <>
      <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:max-w-sm z-40 bg-white dark:bg-surface rounded-2xl shadow-2xl border border-dark-200 dark:border-gray-700 p-4 animate-fade-in">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X size={14} className="text-dark-400" />
        </button>
        <div className="flex items-start gap-3">
          <img
            src="/favicon_io/android-chrome-192x192.png"
            alt="Trackeet"
            className="w-12 h-12 rounded-xl flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="font-bold text-dark dark:text-white text-sm">
              Install Trackeet
            </p>
            <p className="text-xs text-dark-400 mt-0.5">
              Get quick access from your home screen — works like a real app
            </p>
            <button
              onClick={handleInstall}
              className="btn btn-primary btn-sm mt-3 w-full"
            >
              <Download size={14} /> Install App
            </button>
          </div>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSInstructions && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setShowIOSInstructions(false)}
        >
          <div
            className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-sm p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-bold text-dark dark:text-white">
                Install on iPhone
              </p>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={16} className="text-dark-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                  1
                </div>
                <p className="text-sm text-dark dark:text-white flex items-center gap-1.5">
                  Tap the <Share size={16} className="text-primary" /> Share
                  button below
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                  2
                </div>
                <p className="text-sm text-dark dark:text-white">
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                  3
                </div>
                <p className="text-sm text-dark dark:text-white">
                  Tap <strong>"Add"</strong> — Trackeet is now on your home
                  screen!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
