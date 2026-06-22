import { useState } from "react";
import {
  Search,
  ExternalLink,
  Clock,
  RefreshCw,
  Star,
  Briefcase,
  Heart,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader.jsx";
import StoreProductModal from "../components/StoreProductModal.jsx";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");
const PACKAGE_COLORS = {
  Basic: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    border: "border-gray-200",
  },
  Standard: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  Premium: {
    bg: "bg-purple-50",
    text: "text-purple-600",
    border: "border-purple-200",
  },
};

export default function FreelanceStore({
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

  return (
    <div
      className="min-h-screen bg-[#f8faff]"
      style={{ fontFamily: store?.font || "'Inter', sans-serif" }}
    >
      <StoreHeader
        store={store}
        onWhatsApp={handleWhatsAppContact}
        onShare={handleShare}
        headerBg="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700"
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services & packages..."
            className="w-full bg-white text-gray-800 pl-11 pr-4 py-3 rounded-2xl text-sm font-medium shadow-lg outline-none placeholder:text-gray-400"
          />
        </div>
      </StoreHeader>

      <div className="max-w-lg mx-auto px-4 pb-8">
        <div className="grid grid-cols-3 gap-3 -mt-4 mb-5">
          {[
            { label: "Services", value: products.length },
            { label: "Categories", value: categories.length },
            { label: "Featured", value: featured.length },
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

        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0">
              <Briefcase size={20} className="text-white" />
            </div>
            <div>
              <p className="font-black text-gray-800">{store?.name}</p>
              <p className="text-xs text-gray-500">
                Professional · Available for projects
              </p>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    size={10}
                    className="text-yellow-400 fill-yellow-400"
                  />
                ))}
                <span className="text-[10px] text-gray-400 ml-1">5.0</span>
              </div>
            </div>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-5">
            <button
              onClick={() => setActiveCategory("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${!activeCategory ? "bg-indigo-600 text-white" : "bg-white text-gray-600 shadow-sm"}`}
            >
              All Services
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(activeCategory === c ? "" : c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${activeCategory === c ? "bg-indigo-600 text-white" : "bg-white text-gray-600 shadow-sm"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💻</div>
            <p className="font-bold text-gray-700">No services found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((p) => {
              const pkg = p.attributes?.package;
              const pkgStyle = PACKAGE_COLORS[pkg] || PACKAGE_COLORS.Basic;
              return (
                <div
                  key={p._id}
                  onClick={() => {
                    setSelectedProduct(p);
                    handleProductView(p);
                  }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                >
                  {pkg && (
                    <div
                      className={`${pkgStyle.bg} ${pkgStyle.text} px-4 py-2 text-xs font-black border-b ${pkgStyle.border}`}
                    >
                      {pkg === "Premium"
                        ? "⭐ PREMIUM PACKAGE"
                        : pkg === "Standard"
                          ? "💎 STANDARD PACKAGE"
                          : "📦 BASIC PACKAGE"}
                    </div>
                  )}
                  <div className="flex gap-4 p-4">
                    {p.images?.[0] && (
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <p className="font-black text-gray-800 flex-1 truncate">
                            {p.name}
                          </p>
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
                        <p className="text-lg font-black text-indigo-600 flex-shrink-0">
                          {fmtN(p.price)}
                        </p>
                      </div>
                      {p.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {p.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        {p.attributes?.deadline && (
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Clock size={9} /> {p.attributes.deadline} delivery
                          </span>
                        )}
                        {p.attributes?.revisions && (
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <RefreshCw size={9} /> {p.attributes.revisions}
                          </span>
                        )}
                        {p.attributes?.deliverable && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 font-semibold px-2 py-0.5 rounded-full">
                            📁 {p.attributes.deliverable}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWhatsAppOrder(p);
                        }}
                        className="mt-3 flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-green-600 shadow-sm"
                      >
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                          className="w-3.5 h-3.5"
                          alt="WA"
                        />{" "}
                        Hire Me
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        
      </div>

      <StoreProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOrder={handleWhatsAppOrder}
        onContact={handleWhatsAppContact}
        actionLabel="Hire Me via WhatsApp 💻"
        category="freelance"
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
