import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { productAPI } from "../../services/api.js";

import FashionStore from "./themes/FashionStore.jsx";
import FoodStore from "./themes/FoodStore.jsx";
import BeautyStore from "./themes/BeautyStore.jsx";
import PharmacyStore from "./themes/PharmacyStore.jsx";
import ElectronicsStore from "./themes/ElectronicsStore.jsx";
import FurnitureStore from "./themes/FurnitureStore.jsx";
import HomeServicesStore from "./themes/HomeServicesStore.jsx";
import PrintingStore from "./themes/PrintingStore.jsx";
import FreelanceStore from "./themes/FreelanceStore.jsx";
import GroceryStore from "./themes/GroceryStore.jsx";
import GeneralStore from "./themes/GeneralStore.jsx";
import POSStore from "./themes/POSStore.jsx";
import { Helmet } from "react-helmet-async";
import { CartProvider, useCart } from "../../context/CartContext.jsx";
import CartDrawer from "./components/CartDrawer.jsx";
import FloatingCart from "./components/FloatingCart.jsx";
import {
  addRecentlyViewed,
  getRecentlyViewed,
} from "../../utils/recentlyViewed.js";
import StoreProductModal from "./components/StoreProductModal.jsx";
import { X, ExternalLink } from "lucide-react";
import StoreBanner from "./components/StoreBanner.jsx";
import {
  WishlistProvider,
  useWishlist,
} from "../../context/WishlistContext.jsx";
import WishlistDrawer from "./components/WishlistDrawer.jsx";
import BottomNav from "./components/BottomNav.jsx";
import OrderTrackingModal from "./components/OrderTrackingModal.jsx";
import { trackingAPI } from "../../services/api.js";
import { subscriberAPI } from "../../services/api.js";

const STORE_THEMES = {
  fashion: FashionStore,
  food: FoodStore,
  beauty: BeautyStore,
  pharmacy: PharmacyStore,
  electronics: ElectronicsStore,
  general: GeneralStore,
  grocery: GroceryStore,
  furniture: FurnitureStore,
  home_services: HomeServicesStore,
  printing: PrintingStore,
  freelance: FreelanceStore,
  pos: POSStore,
};

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

const SERVICE_CATEGORIES = [
  "beauty",
  "home_services",
  "printing",
  "freelance",
  "pos",
];

// Inner component — has access to CartContext
function StoreContent({
  store,
  products,
  featured,
  trending,
  newArrivals,
  categories,
  defaultProduct,
}) {
  const { addItem } = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  const showCart = !SERVICE_CATEGORIES.includes(store.category);
  const [recentlyViewed, setRecentlyViewed] = useState(() =>
    getRecentlyViewed(store.storeName),
  );
  const [trackingOpen, setTrackingOpen] = useState(false);

  const [subEmail, setSubEmail] = useState("");
  const [subName, setSubName] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const [storeModal, setStoreModal] = useState(null);

  const [wishlistOpen, setWishlistOpen] = useState(false);
  const { toggleItem, isWishlisted } = useWishlist();

  const handleSubscribe = async () => {
    if (!subEmail.trim()) return;
    setSubscribing(true);
    try {
      const res = await subscriberAPI.subscribe(store.storeName, {
        email: subEmail,
        name: subName,
      });
      setSubscribed(true);
      setSubEmail("");
      setSubName("");
    } catch (err) {
      console.error(err);
    } finally {
      setSubscribing(false);
    }
  };

  const handleScrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const handleToggleWishlist = (product) => {
    toggleItem({
      _id: product._id,
      name: product.name,
      price: product.price,
      images: product.images,
      category: product.category,
      inStock: product.inStock,
      whatsappOrderable: product.whatsappOrderable,
    });
  };

  const getWaPhone = () => {
    const phone = store.phone?.replace(/\D/g, "") || "";
    return phone.startsWith("0") ? "234" + phone.slice(1) : phone;
  };

  const handleWhatsAppOrder = (product, quantity = 1, booking = {}) => {
    const waPhone = getWaPhone();
    if (!waPhone) return;

    if (product._id) {
      productAPI.trackOrder?.(product._id).catch(() => {});
      productAPI.trackView?.(product._id).catch(() => {});
    }

    const isPOS = store?.category === "pos";
    const imageText =
      product.images?.length > 0
        ? `\n🖼️ *Product Photos:*\n${product.images.map((img, i) => `Photo ${i + 1}: ${img}`).join("\n")}`
        : "";

    const msg = isPOS
      ? encodeURIComponent(
          `Hello! 👋 I'd like to use your *${product.name}* service.\n\n` +
            `💳 *Service:* ${product.name}\n` +
            `💰 *Charge:* ${fmtN(product.price)}\n` +
            (product.attributes?.transactionType
              ? `📋 *Type:* ${product.attributes.transactionType}\n`
              : "") +
            `\nPlease confirm you are available. Thank you!`,
        )
      : encodeURIComponent(
          `Hello! 👋 I'd like to order:\n\n` +
            `🛍️ *${product.name}*\n` +
            (booking.variants &&
            Object.keys(booking.variants).filter((k) => booking.variants[k])
              .length > 0
              ? Object.entries(booking.variants)
                  .filter(([_, v]) => v)
                  .map(([k, v]) => `   • ${k}: *${v}*`)
                  .join("\n") + "\n"
              : "") +
            `💰 *Price:* ${fmtN(product.price)}` +
            (quantity > 1
              ? ` x ${quantity} = *${fmtN(product.price * quantity)}*`
              : "") +
            `\n` +
            (booking.date ? `📅 *Date:* ${booking.date}\n` : "") +
            (booking.time ? `⏰ *Time:* ${booking.time}\n` : "") +
            (product.attributes && Object.keys(product.attributes).length > 0
              ? `\n📋 *Details:* ${Object.entries(product.attributes)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(", ")}\n`
              : "") +
            imageText +
            `\nPlease confirm availability. Thank you!`,
        );

    window.open(`https://wa.me/${waPhone}?text=${msg}`, "_blank");
  };

  const handleAddToCart = (product, quantity = 1) => {
    for (let i = 0; i < quantity; i++) addItem(product);
  };

  const handleProductView = (product) => {
    if (product?._id) {
      productAPI.trackView?.(product._id).catch(() => {});
      addRecentlyViewed(store.storeName, {
        _id: product._id,
        name: product.name,
        price: product.price,
        images: product.images,
        category: product.category,
        inStock: product.inStock,
        whatsappOrderable: product.whatsappOrderable,
      });
      setRecentlyViewed(getRecentlyViewed(store.storeName));
    }
  };

  const handleProductShare = (product) => {
    const productUrl = `${window.location.origin}/store/${store.storeName}`;
    const imageText =
      product.images?.length > 0
        ? `\n\n🖼️ *Product Photos:*\n${product.images
            .slice(0, 3)
            .map((img, i) => `Photo ${i + 1}: ${img}`)
            .join(
              "\n",
            )}${product.images.length > 3 ? `\n+${product.images.length - 3} more photos` : ""}`
        : "";
    const text = `Check out *${product.name}* at ${store.name}! 🛍️\n💰 ${fmtN(product.price)}${imageText}\n\n🛍️ Shop here: ${productUrl}`;

    if (navigator.share) {
      navigator.share({ title: product.name, text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      alert("Product link copied!");
    }
  };

  const handleWhatsAppContact = () => {
    const waPhone = getWaPhone();
    if (!waPhone) return;
    const msg = encodeURIComponent(
      `Hello! 👋 I found your store on Trackeet and I'd like to know more.`,
    );
    window.open(`https://wa.me/${waPhone}?text=${msg}`, "_blank");
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: store.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Store link copied!");
    }
  };

  const handleCartOrder = (cartItems) => {
    const waPhone = getWaPhone();
    if (!waPhone) return;

    const itemsList = cartItems
      .map((item) => {
        const imageText =
          item.images?.length > 0
            ? `\n🖼️ ${item.images
                .slice(0, 2)
                .map((img, i) => `Photo ${i + 1}: ${img}`)
                .join(" | ")}`
            : "";
        return `🛍️ *${item.name}* x${item.quantity} — ${fmtN(item.price * item.quantity)}${imageText}`;
      })
      .join("\n\n");

    const total = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);

    const msg = encodeURIComponent(
      `Hello! 👋 I'd like to order the following items:\n\n` +
        `${itemsList}\n\n` +
        `💰 *Total: ${fmtN(total)}*\n\n` +
        `Please confirm availability. Thank you!`,
    );
    window.open(`https://wa.me/${waPhone}?text=${msg}`, "_blank");
  };

  const StoreComponent = STORE_THEMES[store.category] || GeneralStore;

  const [rvProduct, setRvProduct] = useState(null);

  return (
    <div className="bg-white" style={{ colorScheme: "light" }}>
      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div className="fixed bottom-24 left-4 z-20">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3 w-64">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500">
                👀 Recently Viewed
              </p>
              <button
                onClick={() => setRecentlyViewed([])}
                className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={10} className="text-gray-500" />
              </button>
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {recentlyViewed.map((p) => (
                <div
                  key={p._id}
                  onClick={() => setRvProduct(p)}
                  className="flex-shrink-0 w-16 cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xl">
                        🛍️
                      </div>
                    )}
                  </div>
                  <p className="text-[9px] font-bold text-gray-700 truncate mt-1">
                    {p.name}
                  </p>
                  <p className="text-[9px] font-black text-purple-600">
                    {fmtN(p.price)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <StoreProductModal
        product={rvProduct}
        onClose={() => setRvProduct(null)}
        onOrder={handleWhatsAppOrder}
        onContact={handleWhatsAppContact}
        actionLabel="Order via WhatsApp"
        category={store.category}
        onShare={handleProductShare}
        onAddToCart={handleAddToCart}
        storeName={store.storeName}
        allProducts={products}
        onSelectProduct={(p) => {
          setRvProduct(p);
        }}
      />
      <div className="pb-20">
        <StoreBanner storeName={store.storeName} />

        <StoreComponent
          store={store}
          products={products}
          featured={featured}
          trending={trending}
          newArrivals={newArrivals}
          categories={categories}
          handleWhatsAppOrder={handleWhatsAppOrder}
          handleWhatsAppContact={handleWhatsAppContact}
          handleProductView={handleProductView}
          handleShare={handleShare}
          handleProductShare={handleProductShare}
          handleAddToCart={handleAddToCart}
          storeName={store.storeName}
          defaultProduct={defaultProduct}
          onToggleWishlist={handleToggleWishlist}
          isWishlisted={isWishlisted}
        />
      </div>

      {/* Newsletter */}
      <div className="px-4 mb-4">
        <div className="bg-purple-50 rounded-2xl p-4 text-center space-y-3">
          <p className="font-black text-gray-800 text-sm">
            📬 Get Updates from {store.name}
          </p>
          <p className="text-xs text-gray-500">
            Subscribe for new products, sales and offers
          </p>
          {subscribed ? (
            <div className="py-2">
              <p className="text-sm font-bold text-purple-600">
                🎉 You're subscribed!
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                We'll keep you posted on the latest updates.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                value={subName}
                onChange={(e) => setSubName(e.target.value)}
                placeholder="Your name (optional)"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-400 bg-white"
              />
              <div className="flex gap-2 w-full">
                <input
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  placeholder="Your email address"
                  type="email"
                  className="min-w-0 flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-purple-400 bg-white"
                />
                <button
                  onClick={handleSubscribe}
                  disabled={subscribing || !subEmail.trim()}
                  className="shrink-0 bg-purple-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {subscribing ? "..." : "Join"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Store footer */}
      <div className="px-4 pb-8 mt-4 mb-20 lg:mb-8">
        <div className="text-center py-4 bg-gray-50 rounded-2xl space-y-3">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            {store.aboutUs && (
              <button
                onClick={() => setStoreModal("about")}
                className="text-xs text-gray-500 hover:text-purple-500 transition-colors font-medium"
              >
                About Us
              </button>
            )}
            {(store.contactEmail || store.contactPhones?.length > 0) && (
              <button
                onClick={() => setStoreModal("contact")}
                className="text-xs text-gray-500 hover:text-purple-500 transition-colors font-medium"
              >
                Contact Us
              </button>
            )}
            {store.termsAndConditions && (
              <button
                onClick={() => setStoreModal("terms")}
                className="text-xs text-gray-500 hover:text-purple-500 transition-colors font-medium"
              >
                Terms & Conditions
              </button>
            )}
            {store.refundPolicy && (
              <button
                onClick={() => setStoreModal("refund")}
                className="text-xs text-gray-500 hover:text-purple-500 transition-colors font-medium"
              >
                Refund Policy
              </button>
            )}
            {/* <button
              onClick={() => setTrackingOpen(true)}
              className="text-xs text-gray-500 hover:text-purple-500 transition-colors font-medium"
            >
              📦 Track Order
            </button> */}
          </div>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} {store.name}. All rights reserved.
          </p>

          <a
            href="https://gettrackeet.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-purple-500 transition-colors"
          >
            Powered by{" "}
            <span className="font-bold text-purple-500">Trackeet</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* Store policy modal */}
      {storeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="font-black text-gray-800 text-lg">
                {storeModal === "about"
                  ? "About Us"
                  : storeModal === "terms"
                    ? "Terms & Conditions"
                    : storeModal === "refund"
                      ? "Refund Policy"
                      : "Contact Us"}
              </h3>
              <button
                onClick={() => setStoreModal(null)}
                className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                <X size={16} className="text-gray-500" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto flex-1">
              {storeModal === "contact" ? (
                <div className="space-y-4">
                  {store.contactEmail && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                        Email
                      </p>
                      <a
                        href={`mailto:${store.contactEmail}`}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-purple-50 transition-colors"
                      >
                        <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">✉️</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {store.contactEmail}
                        </span>
                      </a>
                    </div>
                  )}
                  {store.contactPhones?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                        Phone Numbers
                      </p>
                      <div className="space-y-2">
                        {store.contactPhones.map((phone, i) => (
                          <a
                            key={i}
                            href={`tel:${phone}`}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-purple-50 transition-colors"
                          >
                            <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                              <span className="text-sm">📞</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-700">
                              {phone}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {store.phone && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                        WhatsApp
                      </p>
                      <a
                        href={`https://wa.me/${store.phone?.replace(/\D/g, "").replace(/^0/, "234")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl hover:bg-green-50 transition-colors"
                      >
                        <div className="w-9 h-9 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <span className="text-sm">💬</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          Chat on WhatsApp
                        </span>
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {storeModal === "about"
                    ? store.aboutUs
                    : storeModal === "terms"
                      ? store.termsAndConditions
                      : storeModal === "refund"
                        ? store.refundPolicy
                        : ""}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <BottomNav
        category={store.category}
        onHome={handleScrollTop}
        onWishlist={() => setWishlistOpen(true)}
        onCart={() => setCartOpen(true)}
        onContact={handleWhatsAppContact}
        onTrack={() => setTrackingOpen(true)}
      />

      <WishlistDrawer
        open={wishlistOpen}
        onClose={() => setWishlistOpen(false)}
        onOrder={handleWhatsAppOrder}
        onProductClick={(p) => setRvProduct(p)}
        category={store.category}
      />

      {showCart && (
        <>
          <CartDrawer
            open={cartOpen}
            onClose={() => setCartOpen(false)}
            onOrder={handleCartOrder}
            store={store}
            onProductClick={(p) => {
              setRvProduct(p);
            }}
          />
        </>
      )}

      <OrderTrackingModal
        open={trackingOpen}
        onClose={() => setTrackingOpen(false)}
        storeName={store.storeName}
      />
    </div>
  );
}

// Outer component — fetches data and wraps CartProvider
export default function StorefrontPage({ defaultProduct }) {
  const { storeName } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["storefront", storeName],
    queryFn: () => productAPI.getStorefront(storeName).then((r) => r.data),
  });

  useEffect(() => {
    // Force light mode on storefront
    document.documentElement.classList.remove("dark");
    document.documentElement.setAttribute("data-theme", "light");

    return () => {
      // Restore when leaving storefront
      const savedTheme = localStorage.getItem("theme-storage");
      if (savedTheme) {
        try {
          const parsed = JSON.parse(savedTheme);
          if (parsed?.state?.isDark) {
            document.documentElement.classList.add("dark");
          }
        } catch {}
      }
    };
  }, []);

  if (isLoading)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading store...</p>
        </div>
      </div>
    );

  if (!data?.store)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Store Not Found
          </h1>
          <p className="text-gray-500">
            This store doesn't exist or is currently unavailable.
          </p>
          <a
            href="/"
            className="inline-block mt-4 px-6 py-3 bg-purple-600 text-white rounded-2xl font-semibold"
          >
            Go to Trackeet
          </a>
        </div>
      </div>
    );

  const store = data.store;
  const products = data.products || [];
  const featured = data.featured || [];
  const trending = data.trending || [];
  const newArrivals = data.newArrivals || [];
  const categories = data.categories || [];

  const seoTitle = `${store.name} — Shop on Trackeet`;
  const seoDesc = `Browse products and services from ${store.name}. Order via WhatsApp instantly.`;
  const seoImage = store.logo || "https://gettrackeet.com/og-default.png";
  const seoUrl = `https://gettrackeet.com/store/${store.storeName}`;

  return (
    <CartProvider storeName={store.storeName}>
      <WishlistProvider storeName={store.storeName}>
        <Helmet>
          <title>{seoTitle}</title>
          <meta name="description" content={seoDesc} />
          <meta property="og:title" content={seoTitle} />
          <meta property="og:description" content={seoDesc} />
          <meta property="og:image" content={seoImage} />
          <meta property="og:url" content={seoUrl} />
          <meta property="og:type" content="website" />
          <meta property="og:site_name" content="Trackeet" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={seoTitle} />
          <meta name="twitter:description" content={seoDesc} />
          <meta name="twitter:image" content={seoImage} />
        </Helmet>
        <StoreContent
          store={store}
          products={products}
          featured={featured}
          trending={trending}
          newArrivals={newArrivals}
          categories={categories}
          defaultProduct={defaultProduct}
        />
      </WishlistProvider>
    </CartProvider>
  );
}
