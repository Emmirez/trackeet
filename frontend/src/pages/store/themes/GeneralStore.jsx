import { useState } from "react";
import { Search, Package, ExternalLink, Heart } from "lucide-react";
import StoreHeader from "../components/StoreHeader.jsx";
import StoreProductModal from "../components/StoreProductModal.jsx";
import { useCart } from "../../../context/CartContext.jsx";
import toast from "react-hot-toast";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

export default function GeneralStore({
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
          : activeTab === "trending"
            ? p.isTrending
            : activeTab === "new"
              ? p.isNewArrival
              : activeTab === "bestseller"
                ? p.isBestSeller
                : true;
    return matchSearch && matchCategory && matchTab;
  });

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: store?.font || "'Inter', sans-serif" }}
    >
      <StoreHeader
        store={store}
        onWhatsApp={handleWhatsAppContact}
        onShare={handleShare}
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${store?.name}...`}
            className="w-full bg-white text-gray-800 pl-11 pr-4 py-3 rounded-2xl text-sm font-medium shadow-lg outline-none placeholder:text-gray-400"
          />
        </div>
      </StoreHeader>

      <div className="max-w-lg mx-auto px-4 pb-8">
        <div className="grid grid-cols-3 gap-3 -mt-4 mb-6">
          {[
            { label: "Products", value: products.length },
            { label: "Featured", value: featured.length },
            { label: "New", value: newArrivals.length },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 text-center shadow-md"
            >
              <p className="text-lg font-black text-purple-600">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
          {[
            { key: "all", label: "All", emoji: "🛍️" },
            { key: "featured", label: "Featured", emoji: "⭐" },
            { key: "trending", label: "Trending", emoji: "🔥" },
            { key: "new", label: "New", emoji: "✨" },
            { key: "bestseller", label: "Best Seller", emoji: "🏆" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${activeTab === tab.key ? "bg-purple-600 text-white shadow-md" : "bg-white text-gray-600 shadow-sm hover:bg-purple-50"}`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-5">
            <button
              onClick={() => setActiveCategory("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${!activeCategory ? "bg-purple-600 text-white" : "bg-white text-gray-600 shadow-sm"}`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(activeCategory === c ? "" : c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${activeCategory === c ? "bg-purple-600 text-white" : "bg-white text-gray-600 shadow-sm"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="font-bold text-gray-700">No products found</p>
            <p className="text-gray-500 text-sm mt-1">
              Try a different search or category
            </p>
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
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
              >
                <div className="relative aspect-square bg-gray-100">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} className="text-gray-300" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {p.isFeatured && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                        ⭐
                      </span>
                    )}
                    {p.isTrending && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        🔥
                      </span>
                    )}
                    {p.isBestSeller && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                        🏆
                      </span>
                    )}
                    {p.isNewArrival && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        New
                      </span>
                    )}
                  </div>
                  {!p.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded-full">
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
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(p);
                    }}
                    className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm z-10"
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
                  {p.comparePrice > p.price && (
                    <div className="absolute top-10 right-2 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      -
                      {Math.round(
                        ((p.comparePrice - p.price) / p.comparePrice) * 100,
                      )}
                      %
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {p.name}
                  </p>
                  {p.category && (
                    <p className="text-xs text-gray-400 mt-0.5">{p.category}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-base font-black text-purple-600">
                        {fmtN(p.price)}
                      </p>
                      {p.comparePrice > p.price && (
                        <p className="text-xs text-gray-400 line-through">
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
                          className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center hover:bg-green-600 transition-colors shadow-sm"
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
        actionLabel="Order via WhatsApp"
        category={store?.category || "general"}
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
