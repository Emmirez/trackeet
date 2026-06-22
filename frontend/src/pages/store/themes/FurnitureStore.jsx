import { useState } from "react";
import {
  Search,
  Package,
  ExternalLink,
  Ruler,
  Truck,
  Heart,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader.jsx";
import StoreProductModal from "../components/StoreProductModal.jsx";
import { useCart } from "../../../context/CartContext.jsx";
import toast from "react-hot-toast";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

export default function FurnitureStore({
  store,
  products,
  featured,
  newArrivals,
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
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(
    defaultProduct || null,
  );

  const { addItem } = useCart();

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = !activeCategory || p.category === activeCategory;
    const matchTab =
      activeTab === "all"
        ? true
        : activeTab === "featured"
          ? p.isFeatured
          : activeTab === "new"
            ? p.isNewArrival
            : true;
    return matchSearch && matchCategory && matchTab;
  });

  return (
    <div
      className="min-h-screen bg-[#faf7f4]"
      style={{ fontFamily: store?.font || "'Inter', sans-serif" }}
    >
      {/* Furniture header — warm brown/wood */}
      <StoreHeader
        store={store}
        onWhatsApp={handleWhatsAppContact}
        onShare={handleShare}
        headerBg="bg-gradient-to-br from-amber-800 via-amber-700 to-yellow-700"
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search furniture & decor..."
            className="w-full bg-white text-gray-800 pl-11 pr-4 py-3 rounded-2xl text-sm font-medium shadow-lg outline-none placeholder:text-gray-400"
          />
        </div>
      </StoreHeader>

      <div className="max-w-lg mx-auto px-4 pb-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 -mt-4 mb-5">
          {[
            { label: "Pieces", value: products.length },
            { label: "Featured", value: featured.length },
            { label: "New In", value: newArrivals.length },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 text-center shadow-md"
            >
              <p className="text-lg font-black text-amber-700">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Delivery banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-5 flex items-center gap-3">
          <Truck size={20} className="text-amber-700 flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800">
              Delivery Available
            </p>
            <p className="text-xs text-amber-600">
              Chat with us on WhatsApp to arrange delivery
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
          {[
            { key: "all", label: "All Pieces", emoji: "🪑" },
            { key: "featured", label: "Featured", emoji: "⭐" },
            { key: "new", label: "New In", emoji: "✨" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${
                activeTab === tab.key
                  ? "bg-amber-700 text-white shadow-md"
                  : "bg-white text-gray-600 shadow-sm hover:bg-amber-50"
              }`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* Category pills */}
        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-5">
            <button
              onClick={() => setActiveCategory("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                !activeCategory
                  ? "bg-amber-700 text-white"
                  : "bg-white text-gray-600 shadow-sm"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(activeCategory === c ? "" : c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${
                  activeCategory === c
                    ? "bg-amber-700 text-white"
                    : "bg-white text-gray-600 shadow-sm"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Products — wide card layout like a showroom */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🪑</div>
            <p className="font-bold text-gray-700">No pieces found</p>
            <p className="text-gray-500 text-sm mt-1">Try a different search</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((p) => (
              <div
                key={p._id}
                onClick={() => {
                  setSelectedProduct(p);
                  handleProductView(p);
                }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
              >
                {/* Wide image */}
                <div className="relative h-48 bg-amber-50">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      🪑
                    </div>
                  )}
                  {p.comparePrice > p.price && (
                    <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-black px-2 py-1 rounded-full">
                      -
                      {Math.round(
                        ((p.comparePrice - p.price) / p.comparePrice) * 100,
                      )}
                      % OFF
                    </div>
                  )}
                  {p.isNewArrival && (
                    <div className="absolute top-3 left-3 bg-amber-700 text-white text-xs font-black px-2 py-1 rounded-full">
                      NEW
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(p);
                    }}
                    className="absolute top-3 right-12 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm z-10"
                  >
                    <Heart
                      size={15}
                      className={
                        isWishlisted(p._id)
                          ? "text-red-500 fill-red-500"
                          : "text-gray-400"
                      }
                    />
                  </button>
                  {!p.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white font-bold bg-black/60 px-3 py-1.5 rounded-full">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {p.inStock &&
                    p.stockCount !== null &&
                    p.stockCount <= 5 &&
                    p.stockCount > 0 && (
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="text-[9px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                          🔥 Only {p.stockCount} left!
                        </span>
                      </div>
                    )}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-gray-800 text-base">
                        {p.name}
                      </p>
                      {p.category && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {p.category}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-black text-amber-700">
                        {fmtN(p.price)}
                      </p>
                      {p.comparePrice > p.price && (
                        <p className="text-xs text-gray-400 line-through">
                          {fmtN(p.comparePrice)}
                        </p>
                      )}
                    </div>
                  </div>

                  {p.description && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2">
                      {p.description}
                    </p>
                  )}

                  {/* Specs */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {p.attributes?.material && (
                      <span className="text-[10px] bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded-full">
                        🪵 {p.attributes.material}
                      </span>
                    )}
                    {p.attributes?.dimensions && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Ruler size={8} /> {p.attributes.dimensions}
                      </span>
                    )}
                    {p.attributes?.color && (
                      <span className="text-[10px] bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-full">
                        🎨 {p.attributes.color}
                      </span>
                    )}
                    {p.attributes?.assembly === true && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                        🔧 Assembly Required
                      </span>
                    )}
                  </div>

                  {p.inStock && p.whatsappOrderable && (
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addItem(p);
                          toast.success(`Added to cart! 🛒`, {
                            duration: 1500,
                          });
                        }}
                        className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-700 text-white font-bold text-lg shadow-sm flex-shrink-0"
                      >
                        +
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsAppOrder(p);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white text-sm font-bold py-2.5 rounded-xl hover:bg-green-600 transition-colors shadow-sm"
                      >
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                          className="w-4 h-4"
                          alt="WA"
                        />
                        Enquire via WhatsApp
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

       
      </div>

      <StoreProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOrder={handleWhatsAppOrder}
        onContact={handleWhatsAppContact}
        actionLabel="Enquire via WhatsApp 🪑"
        category="furniture"
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
