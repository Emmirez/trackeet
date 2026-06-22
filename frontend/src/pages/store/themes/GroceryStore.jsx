// GroceryStore.jsx
import { useState } from "react";
import { Search, ExternalLink, Tag, Scale, Heart } from "lucide-react";
import StoreHeader from "../components/StoreHeader.jsx";
import StoreProductModal from "../components/StoreProductModal.jsx";
import { useCart } from "../../../context/CartContext.jsx";
import toast from "react-hot-toast";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

export default function GroceryStore({
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

  const onSale = products.filter((p) => p.comparePrice > p.price);

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
            : activeTab === "sale"
              ? p.comparePrice > p.price
              : true;
    return matchSearch && matchCategory && matchTab;
  });

  return (
    <div
      className="min-h-screen bg-[#f0fdf4]"
      style={{ fontFamily: store?.font || "'Inter', sans-serif" }}
    >
      <StoreHeader
        store={store}
        onWhatsApp={handleWhatsAppContact}
        onShare={handleShare}
        headerBg="bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500"
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groceries..."
            className="w-full bg-white text-gray-800 pl-11 pr-4 py-3 rounded-2xl text-sm font-medium shadow-lg outline-none placeholder:text-gray-400"
          />
        </div>
      </StoreHeader>

      <div className="max-w-lg mx-auto px-4 pb-8">
        <div className="grid grid-cols-3 gap-3 -mt-4 mb-5">
          {[
            { label: "Items", value: products.length },
            { label: "On Sale", value: onSale.length },
            {
              label: "In Stock",
              value: products.filter((p) => p.inStock).length,
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 text-center shadow-md"
            >
              <p className="text-lg font-black text-green-600">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {onSale.length > 0 && !search && (
          <div className="bg-red-500 text-white rounded-2xl p-3 mb-5 flex items-center gap-3">
            <Tag size={20} className="flex-shrink-0" />
            <div>
              <p className="font-black text-sm">
                🏷️ {onSale.length} items on sale today!
              </p>
              <p className="text-xs text-red-100">
                Tap "On Sale" tab to see all deals
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
          {[
            { key: "all", label: "All Items", emoji: "🛒" },
            { key: "featured", label: "Featured", emoji: "⭐" },
            { key: "new", label: "New Stock", emoji: "✨" },
            { key: "sale", label: "On Sale", emoji: "🏷️" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${activeTab === tab.key ? "bg-green-600 text-white shadow-md" : "bg-white text-gray-600 shadow-sm hover:bg-green-50"}`}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-5">
            <button
              onClick={() => setActiveCategory("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${!activeCategory ? "bg-green-600 text-white" : "bg-white text-gray-600 shadow-sm"}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(activeCategory === c ? "" : c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${activeCategory === c ? "bg-green-600 text-white" : "bg-white text-gray-600 shadow-sm"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🛒</div>
            <p className="font-bold text-gray-700">No items found</p>
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
                <div className="relative aspect-square bg-green-50">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🛒
                    </div>
                  )}
                  {p.comparePrice > p.price && (
                    <div className="absolute top-10 right-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      -
                      {Math.round(
                        ((p.comparePrice - p.price) / p.comparePrice) * 100,
                      )}
                      %
                    </div>
                  )}
                  {p.isNewArrival && !p.comparePrice && (
                    <div className="absolute top-2 left-2 bg-green-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      NEW
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
                </div>
                <div className="p-3">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {p.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    {p.attributes?.weight && (
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <Scale size={8} /> {p.attributes.weight}
                      </span>
                    )}
                    {p.attributes?.unit && (
                      <span className="text-[10px] text-gray-400">
                        per {p.attributes.unit}
                      </span>
                    )}
                    {p.attributes?.brand && (
                      <span className="text-[10px] bg-gray-100 text-gray-500 font-semibold px-1.5 py-0.5 rounded">
                        {p.attributes.brand}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <p className="text-sm font-black text-green-600">
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

        <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-2xl text-center">
          <p className="text-sm font-bold text-green-700">
            🚚 Delivery Available
          </p>
          <p className="text-xs text-green-600 mt-1">
            Order via WhatsApp for home delivery or pickup
          </p>
        </div>

       
      </div>

      <StoreProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOrder={handleWhatsAppOrder}
        onContact={handleWhatsAppContact}
        actionLabel="Order via WhatsApp 🛒"
        category="grocery"
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
