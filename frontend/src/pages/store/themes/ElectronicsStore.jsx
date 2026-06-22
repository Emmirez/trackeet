import { useState } from "react";
import {
  Search,
  Package,
  ExternalLink,
  Shield,
  Cpu,
  Heart,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader.jsx";
import StoreProductModal from "../components/StoreProductModal.jsx";
import { useCart } from "../../../context/CartContext.jsx";
import toast from "react-hot-toast";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

export default function ElectronicsStore({
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
  const [activeBrand, setActiveBrand] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(
    defaultProduct || null,
  );

  const { addItem } = useCart();

  const brands = [
    ...new Set(products.map((p) => p.attributes?.brand).filter(Boolean)),
  ];

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description?.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = !activeCategory || p.category === activeCategory;
    const matchBrand = !activeBrand || p.attributes?.brand === activeBrand;
    const matchTab =
      activeTab === "all"
        ? true
        : activeTab === "featured"
          ? p.isFeatured
          : activeTab === "new"
            ? p.isNewArrival
            : activeTab === "bestseller"
              ? p.isBestSeller
              : true;
    return matchSearch && matchCategory && matchBrand && matchTab;
  });

  return (
    <div
      className="min-h-screen bg-[#0f172a]"
      style={{ fontFamily: store?.font || "'Inter', sans-serif" }}
    >
      <StoreHeader
        store={store}
        onWhatsApp={handleWhatsAppContact}
        onShare={handleShare}
        headerBg="bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900"
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phones, laptops, gadgets..."
            className="w-full bg-white/10 text-white pl-11 pr-4 py-3 rounded-2xl text-sm font-medium outline-none placeholder:text-gray-400 border border-white/20"
          />
        </div>
      </StoreHeader>

      <div className="max-w-lg mx-auto px-4 pb-8">
        <div className="grid grid-cols-3 gap-3 -mt-4 mb-5">
          {[
            { label: "Products", value: products.length },
            { label: "Brands", value: brands.length },
            { label: "New In", value: newArrivals.length },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-3 text-center shadow-md"
            >
              <p className="text-lg font-black text-blue-400">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
          {[
            { key: "all", label: "All", emoji: "📱" },
            { key: "featured", label: "Featured", emoji: "⭐" },
            { key: "new", label: "New In", emoji: "🆕" },
            { key: "bestseller", label: "Best Seller", emoji: "🏆" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${activeTab === tab.key ? "bg-blue-500 text-white shadow-md" : "bg-slate-800 text-gray-400 border border-slate-700 hover:bg-slate-700"}`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {brands.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
            <button
              onClick={() => setActiveBrand("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 border ${!activeBrand ? "bg-blue-500 text-white border-blue-500" : "bg-transparent text-gray-400 border-slate-700"}`}
            >
              All Brands
            </button>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setActiveBrand(activeBrand === b ? "" : b)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 border ${activeBrand === b ? "bg-blue-500 text-white border-blue-500" : "bg-transparent text-gray-400 border-slate-700"}`}
              >
                {b}
              </button>
            ))}
          </div>
        )}

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-5">
            <button
              onClick={() => setActiveCategory("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 border ${!activeCategory ? "bg-blue-500 text-white border-blue-500" : "bg-transparent text-gray-400 border-slate-700"}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(activeCategory === c ? "" : c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 border ${activeCategory === c ? "bg-blue-500 text-white border-blue-500" : "bg-transparent text-gray-400 border-slate-700"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📱</div>
            <p className="font-bold text-gray-300">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <div
                key={p._id}
                onClick={() => {
                  setSelectedProduct(p);
                  handleProductView(p);
                }}
                className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-blue-500 transition-all cursor-pointer group"
              >
                <div className="relative aspect-square bg-slate-700">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Cpu size={32} className="text-slate-500" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {p.isFeatured && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-400/20 text-yellow-400">
                        ⭐
                      </span>
                    )}
                    {p.isNewArrival && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-400/20 text-blue-400">
                        NEW
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(p);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center z-10"
                  >
                    <Heart
                      size={13}
                      className={
                        isWishlisted(p._id)
                          ? "text-red-500 fill-red-500"
                          : "text-white"
                      }
                    />
                  </button>
                  {p.comparePrice > p.price && (
                    <div className="absolute top-10 right-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      -
                      {Math.round(
                        ((p.comparePrice - p.price) / p.comparePrice) * 100,
                      )}
                      %
                    </div>
                  )}
                  {!p.inStock && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {p.inStock &&
                    p.stockCount !== null &&
                    p.stockCount <= 5 &&
                    p.stockCount > 0 && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                          🔥 Only {p.stockCount} left!
                        </span>
                      </div>
                    )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-white truncate">
                    {p.name}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {p.attributes?.brand && (
                      <span className="text-[9px] bg-blue-500/20 text-blue-400 font-semibold px-1.5 py-0.5 rounded">
                        {p.attributes.brand}
                      </span>
                    )}
                    {p.attributes?.storage && (
                      <span className="text-[9px] bg-slate-700 text-gray-400 px-1.5 py-0.5 rounded">
                        {p.attributes.storage}
                      </span>
                    )}
                    {p.attributes?.color && (
                      <span className="text-[9px] bg-slate-700 text-gray-400 px-1.5 py-0.5 rounded">
                        {p.attributes.color}
                      </span>
                    )}
                  </div>
                  {p.attributes?.warranty && (
                    <div className="flex items-center gap-1 mt-1">
                      <Shield size={9} className="text-green-400" />
                      <span className="text-[10px] text-green-400">
                        {p.attributes.warranty} warranty
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-sm font-black text-blue-400">
                        {fmtN(p.price)}
                      </p>
                      {p.comparePrice > p.price && (
                        <p className="text-xs text-gray-500 line-through">
                          {fmtN(p.comparePrice)}
                        </p>
                      )}
                    </div>
                    {p.inStock && p.whatsappOrderable && (
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem(p);
                            toast.success(`Added to cart! 🛒`, {
                              duration: 1500,
                            });
                          }}
                          className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-700 text-white font-bold text-lg shadow-sm"
                        >
                          +
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWhatsAppOrder(p);
                          }}
                          className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center hover:bg-green-600 shadow-sm"
                        >
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                            className="w-4 h-4"
                            alt="WA"
                          />
                        </button>
                      </div>
                    )}
                  </div>
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
        actionLabel="Buy via WhatsApp 📱"
        category="electronics"
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
