import { useState } from "react";
import {
  Search,
  ExternalLink,
  CreditCard,
  ArrowRightLeft,
  Phone,
  Wifi,
  Receipt,
  CheckCircle,
  Heart,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader.jsx";
import StoreProductModal from "../components/StoreProductModal.jsx";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

const SERVICE_ICONS = {
  withdrawal: CreditCard,
  transfer: ArrowRightLeft,
  airtime: Phone,
  data: Wifi,
  bill: Receipt,
  default: CreditCard,
};

const getServiceIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("withdraw")) return CreditCard;
  if (n.includes("transfer")) return ArrowRightLeft;
  if (n.includes("airtime")) return Phone;
  if (n.includes("data")) return Wifi;
  if (n.includes("bill")) return Receipt;
  return CreditCard;
};

export default function POSStore({
  store,
  products,
  featured,
  categories,
  handleWhatsAppOrder,
  handleWhatsAppContact,
  handleProductView,
  handleShare,
  handleProductShare,
  handleAddToCart,
  onToggleWishlist,
  isWishlisted,
  storeName,
  defaultProduct,
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(
    defaultProduct || null,
  );

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = !activeCategory || p.category === activeCategory;
    return matchSearch && matchCategory;
  });

  const availableServices = products.filter((p) => p.inStock).length;

  return (
    <div
      className="min-h-screen bg-[#f0f4ff]"
      style={{ fontFamily: store?.font || "'Inter', sans-serif" }}
    >
      {/* POS header — professional blue/indigo */}
      <StoreHeader
        store={store}
        onWhatsApp={handleWhatsAppContact}
        onShare={handleShare}
        headerBg="bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-500"
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="w-full bg-white text-gray-800 pl-11 pr-4 py-3 rounded-2xl text-sm font-medium shadow-lg outline-none placeholder:text-gray-400"
          />
        </div>
      </StoreHeader>

      <div className="max-w-lg mx-auto px-4 pb-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 -mt-4 mb-5">
          {[
            { label: "Services", value: products.length },
            { label: "Available", value: availableServices },
            { label: "Categories", value: categories.length },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 text-center shadow-md"
            >
              <p className="text-lg font-black text-indigo-600">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-5">
          <p className="font-black text-indigo-800 text-sm mb-2">
            ✅ Why Use Our Services?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Fast & Reliable",
              "Secure Transactions",
              "Competitive Rates",
              "Available Now",
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle
                  size={12}
                  className="text-indigo-500 flex-shrink-0"
                />
                <span className="text-xs text-indigo-700">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-5">
            <button
              onClick={() => setActiveCategory("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                !activeCategory
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-600 shadow-sm"
              }`}
            >
              All Services
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(activeCategory === c ? "" : c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                  activeCategory === c
                    ? "bg-indigo-600 text-white"
                    : "bg-white text-gray-600 shadow-sm"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Section title */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-gray-800">
            {activeCategory || "Our Services"}
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({filtered.length})
            </span>
          </h2>
        </div>

        {/* Services — price list style */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💳</div>
            <p className="font-bold text-gray-700">No services found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => {
              const Icon = getServiceIcon(p.name);
              return (
                <div
                  key={p._id}
                  onClick={() => {
                    setSelectedProduct(p);
                    handleProductView(p);
                  }}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer border-l-4 ${
                    p.inStock
                      ? "border-indigo-500"
                      : "border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4 p-4">
                    {/* Icon */}
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        p.inStock ? "bg-indigo-50" : "bg-gray-100"
                      }`}
                    >
                      <Icon
                        size={22}
                        className={
                          p.inStock ? "text-indigo-600" : "text-gray-400"
                        }
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-gray-800 flex-1">
                          {p.name}
                        </p>
                        {p.isFeatured && (
                          <span className="text-[9px] font-bold bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                            Popular
                          </span>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(p);
                          }}
                          className="w-7 h-7 bg-indigo-50 rounded-full flex items-center justify-center flex-shrink-0"
                        >
                          <Heart
                            size={13}
                            className={
                              isWishlisted(p._id)
                                ? "text-red-500 fill-red-500"
                                : "text-gray-400"
                            }
                          />
                        </button>
                      </div>
                      {p.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {p.description}
                        </p>
                      )}
                      {p.attributes?.transactionType && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          Type: {p.attributes.transactionType}
                        </p>
                      )}
                    </div>

                    {/* Price + status */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-base font-black text-indigo-600">
                        {fmtN(p.price)}
                      </p>
                      <p className="text-[10px] text-gray-400">charge</p>
                      {p.attributes?.commission && (
                        <p className="text-[10px] text-gray-400">
                          {p.attributes.commission} commission
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Available / Unavailable footer */}
                  <div
                    className={`px-4 py-2 flex items-center justify-between ${
                      p.inStock ? "bg-indigo-50" : "bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <div
                        className={`w-2 h-2 rounded-full ${p.inStock ? "bg-green-500" : "bg-gray-400"}`}
                      />
                      <span
                        className={`text-xs font-semibold ${p.inStock ? "text-green-600" : "text-gray-400"}`}
                      >
                        {p.inStock ? "Available Now" : "Unavailable"}
                      </span>
                    </div>
                    {p.inStock && p.whatsappOrderable && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsAppOrder(p);
                        }}
                        className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-green-600 shadow-sm"
                      >
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                          className="w-3.5 h-3.5"
                          alt="WA"
                        />
                        Use Service
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* How it works */}
        <div className="mt-6 bg-white border border-indigo-100 rounded-2xl p-4">
          <p className="font-black text-gray-800 text-sm mb-3">
            💡 How It Works
          </p>
          <div className="space-y-2">
            {[
              { step: "1", text: "Choose a service above" },
              { step: "2", text: "Tap 'Use Service' to chat on WhatsApp" },
              { step: "3", text: "Confirm availability and agree on amount" },
              { step: "4", text: "Meet the agent or have them come to you" },
              { step: "5", text: "Transaction completed on the spot" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[10px] font-black">
                    {s.step}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{s.text}</p>
              </div>
            ))}
          </div>
        </div>

        
      </div>

      <StoreProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOrder={handleWhatsAppOrder}
        onContact={handleWhatsAppContact}
        actionLabel="Use Service 💳"
        category="pos"
        onShare={handleProductShare}
        storeName={storeName}
        onAddToCart={handleAddToCart}
        allProducts={products}
        onSelectProduct={(p) => {
          setSelectedProduct(p);
          handleProductView?.(p);
        }}
      />
    </div>
  );
}
