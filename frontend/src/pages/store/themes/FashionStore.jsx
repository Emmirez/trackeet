import { useState } from "react";
import { Search, Package, ExternalLink, Sparkles, Heart } from "lucide-react";
import StoreHeader from "../components/StoreHeader.jsx";
import StoreProductModal from "../components/StoreProductModal.jsx";
import { useCart } from "../../../context/CartContext.jsx";
import toast from "react-hot-toast";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");
const GENDER_FILTERS = ["All", "Men", "Women", "Kids", "Unisex"];

export default function FashionStore({
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
  const [activeGender, setActiveGender] = useState("All");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(
    defaultProduct || null,
  );
  const { addItem } = useCart();

  const filtered = products.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = !activeCategory || p.category === activeCategory;
    const matchGender =
      activeGender === "All" || p.attributes?.gender === activeGender;
    const matchTab =
      activeTab === "all"
        ? true
        : activeTab === "featured"
          ? p.isFeatured
          : activeTab === "new"
            ? p.isNewArrival
            : activeTab === "sale"
              ? p.comparePrice > p.price
              : true;
    return matchSearch && matchCategory && matchGender && matchTab;
  });

  return (
    <div
      className="min-h-screen bg-[#faf9f7]"
      style={{ fontFamily: store?.font || "'Inter', sans-serif" }}
    >
      <StoreHeader
        store={store}
        onWhatsApp={handleWhatsAppContact}
        onShare={handleShare}
        headerBg="bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600"
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
        <div className="grid grid-cols-3 gap-3 -mt-4 mb-5">
          {[
            { label: "Styles", value: products.length },
            { label: "Featured", value: featured.length },
            { label: "New In", value: newArrivals.length },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 text-center shadow-md"
            >
              <p className="text-lg font-black text-rose-500">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
          {[
            { key: "all", label: "All Styles", emoji: "👗" },
            { key: "featured", label: "Featured", emoji: "⭐" },
            { key: "new", label: "New In", emoji: "✨" },
            { key: "sale", label: "On Sale", emoji: "🏷️" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${activeTab === tab.key ? "bg-rose-500 text-white shadow-md" : "bg-white text-gray-600 shadow-sm hover:bg-rose-50"}`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
          {GENDER_FILTERS.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGender(g)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 border-2 transition-all ${activeGender === g ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
            >
              {g}
            </button>
          ))}
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-5">
            <button
              onClick={() => setActiveCategory("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${!activeCategory ? "bg-rose-500 text-white" : "bg-white text-gray-600 shadow-sm"}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(activeCategory === c ? "" : c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${activeCategory === c ? "bg-rose-500 text-white" : "bg-white text-gray-600 shadow-sm"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {newArrivals.length > 0 &&
          activeTab === "all" &&
          !search &&
          !activeCategory && (
            <div className="mb-5">
              <h2 className="font-black text-gray-800 flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-rose-500" /> New Arrivals
              </h2>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {newArrivals.slice(0, 6).map((p) => (
                  <div
                    key={p._id}
                    onClick={() => {
                      setSelectedProduct(p);
                      handleProductView?.(p);
                    }}
                    className="flex-shrink-0 w-36 bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-36 bg-gray-100">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={24} className="text-gray-300" />
                        </div>
                      )}
                      <span className="absolute top-1 left-1 text-[9px] font-bold bg-rose-500 text-white px-1.5 py-0.5 rounded-full">
                        NEW
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(p);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-sm"
                      >
                        <Heart
                          size={11}
                          className={
                            isWishlisted(p._id)
                              ? "text-red-500 fill-red-500"
                              : "text-gray-400"
                          }
                        />
                      </button>
                      {/* Sold out overlay */}
                      {!p.inStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-t-2xl">
                          <span className="text-white text-[9px] font-bold bg-black/60 px-2 py-0.5 rounded-full">
                            Sold Out
                          </span>
                        </div>
                      )}
                      {/* Low stock badge */}
                      {p.inStock &&
                        p.stockCount !== null &&
                        p.stockCount <= 5 &&
                        p.stockCount > 0 && (
                          <div className="absolute bottom-1 left-1 right-1">
                            <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                              🔥 Only {p.stockCount} left!
                            </span>
                          </div>
                        )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs font-black text-rose-500 mt-0.5">
                        {fmtN(p.price)}
                      </p>
                      {p.inStock && p.whatsappOrderable && (
                        <div className="flex gap-1 mt-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addItem(p);
                              toast.success(`Added!`, {
                                duration: 1500,
                                icon: "🛒",
                              });
                            }}
                            className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm hover:bg-purple-700"
                          >
                            +
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleWhatsAppOrder(p);
                            }}
                            className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center hover:bg-green-600"
                          >
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                              className="w-3.5 h-3.5"
                              alt="WA"
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-gray-800">
            {activeTab === "all"
              ? "All Styles"
              : activeTab === "featured"
                ? "⭐ Featured"
                : activeTab === "new"
                  ? "✨ New In"
                  : "🏷️ On Sale"}
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({filtered.length})
            </span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">👗</div>
            <p className="font-bold text-gray-700">No styles found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((p) => (
              <div
                key={p._id}
                onClick={() => {
                  setSelectedProduct(p);
                  handleProductView?.(p);
                }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="relative aspect-[4/5] bg-gray-100">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package size={32} className="text-gray-300" />
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWishlist(p);
                    }}
                    className="absolute top-2 left-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm z-10"
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
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      -
                      {Math.round(
                        ((p.comparePrice - p.price) / p.comparePrice) * 100,
                      )}
                      %
                    </div>
                  )}
                  {p.isNewArrival && (
                    <div className="absolute top-10 left-2 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      NEW
                    </div>
                  )}
                  {!p.inStock && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded-full">
                        Sold Out
                      </span>
                    </div>
                  )}
                  {p.inStock &&
                    p.stockCount !== null &&
                    p.stockCount <= 5 &&
                    p.stockCount > 0 && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <span className="text-[9px] font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                          🔥 Only {p.stockCount} left!
                        </span>
                      </div>
                    )}
                  {p.attributes?.size && (
                    <div className="absolute bottom-2 left-2 right-2 flex gap-1 flex-wrap">
                      {String(p.attributes.size)
                        .split(",")
                        .slice(0, 3)
                        .map((s, i) => (
                          <span
                            key={i}
                            className="text-[8px] font-bold bg-white/90 text-gray-700 px-1.5 py-0.5 rounded"
                          >
                            {s.trim()}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {p.name}
                  </p>
                  {p.attributes?.color && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      🎨 {p.attributes.color}
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-sm font-black text-rose-500">
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
                            toast.success(`${p.name} added to cart!`, {
                              duration: 1500,
                              icon: "🛒",
                            });
                          }}
                          className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-700 shadow-sm text-white font-bold text-lg"
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
        actionLabel="Order via WhatsApp 👗"
        category="fashion"
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
