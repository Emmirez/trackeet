import { MapPin, Phone, Share2 } from "lucide-react";
import { getStoreStatus } from "../../../utils/storeHours.js";

const CATEGORY_EMOJIS = {
  fashion: "👗",
  food: "🍔",
  beauty: "💅",
  pharmacy: "💊",
  electronics: "📱",
  pos: "💳",
  grocery: "🛒",
  furniture: "🪑",
  home_services: "🔧",
  printing: "🖨️",
  freelance: "💻",
  general: "🏪",
};

export default function StoreHeader({
  store,
  onWhatsApp,
  onShare,
  headerBg,
  children,
}) {
  const categoryEmoji = CATEGORY_EMOJIS[store?.category] || "🏪";

  const handleCall = () => {
    if (store?.phone) window.location.href = `tel:${store.phone}`;
  };

  // Branding overrides
  const primaryColor = store?.primaryColor || null;
  const fontFamily = store?.font || null;
  const bannerImage = store?.bannerImage || null;

  // Build header style
  const headerStyle = {};
  if (bannerImage) {
    headerStyle.backgroundImage = `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(${bannerImage})`;
    headerStyle.backgroundSize = "cover";
    headerStyle.backgroundPosition = "center";
  } else if (primaryColor) {
    headerStyle.background = `linear-gradient(135deg, ${primaryColor}dd, ${primaryColor}99)`;
  }
  if (fontFamily) headerStyle.fontFamily = fontFamily;

  // Button style using primary color
  const btnStyle = primaryColor
    ? { backgroundColor: primaryColor, border: "none" }
    : {};

  return (
    <div
      className={
        !bannerImage && !primaryColor
          ? headerBg ||
            "bg-gradient-to-br from-purple-700 via-purple-600 to-indigo-600"
          : ""
      }
      style={headerStyle}
    >
      <div className="max-w-lg mx-auto px-4 pt-8 pb-6 text-white">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0">
            {store?.logo ? (
              <img
                src={store.logo}
                alt={store.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-white/30 shadow-xl"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center border-4 border-white/30 shadow-xl">
                <span className="text-4xl">{categoryEmoji}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black">{store?.name}</h1>
              {store?.verified ||
                (true && (
                  <span className="text-[10px] font-bold bg-blue-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1 flex-shrink-0">
                    ✓ Verified
                  </span>
                ))}
            </div>
            {store?.address && (
              <div className="flex items-center gap-1 mt-1 opacity-80">
                <MapPin size={16} />
                <p className="text-sm">{store.address}</p>
              </div>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full capitalize">
                {categoryEmoji} {store?.category?.replace("_", " ")}
              </span>
              {(() => {
                const status = getStoreStatus(store?.hours, store?.alwaysOpen);
                return (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      status.isOpen
                        ? "bg-green-400/30 text-green-100"
                        : "bg-red-400/30 text-red-100"
                    }`}
                  >
                    {status.isOpen ? "●" : "○"} {status.label}
                  </span>
                );
              })()}
            </div>

            {/* Store stats */}
            {(store?.stats?.orders > 0 || store?.stats?.rating) && (
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                {store.stats.orders > 0 && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    🛍️{" "}
                    {store.stats.orders >= 500
                      ? "500+ orders"
                      : store.stats.orders >= 100
                        ? "100+ orders"
                        : store.stats.orders >= 50
                          ? "50+ orders"
                          : `${store.stats.orders} orders`}
                  </span>
                )}
                {store.stats.rating && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    ⭐ {store.stats.rating} ({store.stats.totalReviews}{" "}
                    {store.stats.totalReviews === 1 ? "review" : "reviews"})
                  </span>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onShare}
            className="p-2 bg-white/20 rounded-xl hover:bg-white/30 transition-colors flex-shrink-0"
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* Social links */}
        {(store?.socialLinks?.facebook ||
          store?.socialLinks?.instagram ||
          store?.socialLinks?.tiktok ||
          store?.socialLinks?.website) && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            {store.socialLinks.facebook && (
              <a
                href={store.socialLinks.facebook}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                title="Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            )}
            {store.socialLinks.instagram && (
              <a
                href={store.socialLinks.instagram}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                title="Instagram"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </a>
            )}
            {store.socialLinks.tiktok && (
              <a
                href={store.socialLinks.tiktok}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                title="TikTok"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z" />
                </svg>
              </a>
            )}
            {store.socialLinks.website && (
              <a
                href={store.socialLinks.website}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                title="Website"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
              </a>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={onWhatsApp}
            className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-2xl font-bold text-sm transition-colors shadow-lg"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              className="w-5 h-5"
              alt="WA"
            />
            Chat with Us
          </button>
          <button
            onClick={handleCall}
            style={
              primaryColor ? { backgroundColor: "rgba(255,255,255,0.2)" } : {}
            }
            className="flex items-center justify-center gap-2 bg-white/20 hover:bg-white/30 text-white py-3 rounded-2xl font-bold text-sm transition-colors"
          >
            <Phone size={16} /> Call Us
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}
