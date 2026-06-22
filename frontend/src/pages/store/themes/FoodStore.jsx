import { useState } from "react";
import {
  Search,
  Package,
  ExternalLink,
  Clock,
  Flame,
  Star,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader.jsx";
import StoreProductModal from "../components/StoreProductModal.jsx";
import { useCart } from "../../../context/CartContext.jsx";
import toast from "react-hot-toast";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

export default function FoodStore({
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
  Heart
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
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
    return matchSearch && matchCategory;
  });

  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);
  const chefSpecials = products.filter((p) => p.isFeatured).slice(0, 4);
  const topItems = [
    ...new Map(
      [...bestSellers, ...chefSpecials].map((p) => [p._id, p]),
    ).values(),
  ].slice(0, 4);

  return (
    <div
      className="min-h-screen bg-[#fff8f0]"
      style={{ fontFamily: store?.font || "'Inter', sans-serif" }}
    >
      <StoreHeader
        store={store}
        onWhatsApp={handleWhatsAppContact}
        onShare={handleShare}
        headerBg="bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-500"
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search menu..."
            className="w-full bg-white text-gray-800 pl-11 pr-4 py-3 rounded-2xl text-sm font-medium shadow-lg outline-none placeholder:text-gray-400"
          />
        </div>
      </StoreHeader>

      <div className="max-w-lg mx-auto px-4 pb-8">
        <div className="grid grid-cols-3 gap-3 -mt-4 mb-5">
          {[
            { label: "Menu Items", value: products.length },
            { label: "Categories", value: categories.length },
            {
              label: "New on Menu",
              value: products.filter((p) => p.isNewArrival).length,
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 text-center shadow-md"
            >
              <p className="text-lg font-black text-orange-500">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        {topItems.length > 0 && !search && (
          <div className="mb-6">
            <h2 className="font-black text-gray-800 mb-3 flex items-center gap-2">
              <Flame size={16} className="text-orange-500" /> Top Picks
            </h2>

            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {topItems.map((p) => (
                <div
                  key={p._id}
                  onClick={() => {
                    setSelectedProduct(p);
                    handleProductView(p);
                  }}
                  className="flex-shrink-0 w-40 bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                >
                  <div className="relative h-28 bg-orange-50">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🍔
                      </div>
                    )}
                    <span className="absolute top-1 left-1 text-[9px] font-bold bg-orange-500 text-white px-1.5 py-0.5 rounded-full">
                      {p.isBestSeller ? "🔥 Most Ordered" : "👨‍🍳 Chef's Special"}
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
                    {!p.inStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold bg-black/60 px-2 py-0.5 rounded-full">
                          Not Available
                        </span>
                      </div>
                    )}
                    {p.inStock &&
                      p.stockCount !== null &&
                      p.stockCount <= 5 &&
                      p.stockCount > 0 && (
                        <div className="absolute bottom-1 left-1 right-1">
                          <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                            🔥 Limited portions!
                          </span>
                        </div>
                      )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-bold text-gray-800 truncate">
                      {p.name}
                    </p>
                    <p className="text-sm font-black text-orange-500">
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

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-5">
            <button
              onClick={() => setActiveCategory("")}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${!activeCategory ? "bg-orange-500 text-white shadow-md" : "bg-white text-gray-600 shadow-sm"}`}
            >
              🍽️ All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(activeCategory === c ? "" : c)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${activeCategory === c ? "bg-orange-500 text-white shadow-md" : "bg-white text-gray-600 shadow-sm"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        {/* New on Menu */}
        {products.filter((p) => p.isNewArrival).length > 0 && !search && (
          <div className="mb-6">
            <h2 className="font-black text-gray-800 mb-3 flex items-center gap-2">
              <span>🆕</span> New on Menu
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {products
                .filter((p) => p.isNewArrival)
                .slice(0, 4)
                .map((p) => (
                  <div
                    key={p._id}
                    onClick={() => {
                      setSelectedProduct(p);
                      handleProductView?.(p);
                    }}
                    className="flex-shrink-0 w-40 bg-white rounded-2xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-28 bg-orange-50">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          🍔
                        </div>
                      )}
                      <span className="absolute top-1 left-1 text-[9px] font-bold bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                        🆕 New
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
                      {!p.inStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white text-[9px] font-bold bg-black/60 px-2 py-0.5 rounded-full">
                            Not Available
                          </span>
                        </div>
                      )}
                      {p.inStock &&
                        p.stockCount !== null &&
                        p.stockCount <= 5 &&
                        p.stockCount > 0 && (
                          <div className="absolute bottom-1 left-1 right-1">
                            <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                              🔥 Limited portions!
                            </span>
                          </div>
                        )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {p.name}
                      </p>
                      <p className="text-sm font-black text-orange-500">
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
            {activeCategory || "Full Menu"}
            <span className="text-sm font-normal text-gray-400 ml-2">
              ({filtered.length} items)
            </span>
          </h2>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="font-bold text-gray-700">Nothing found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <div
                key={p._id}
                onClick={() => {
                  setSelectedProduct(p);
                  handleProductView?.(p);
                }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex gap-3 p-3">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-orange-50 flex-shrink-0">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        🍔
                      </div>
                    )}
                    {!p.inStock && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="text-white text-[8px] font-bold text-center px-1">
                          Not Available
                        </span>
                      </div>
                    )}
                    {p.inStock &&
                      p.stockCount !== null &&
                      p.stockCount <= 5 &&
                      p.stockCount > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-center">
                          <span className="text-[8px] font-bold text-white">
                            Limited!
                          </span>
                        </div>
                      )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-gray-800 flex-1 truncate">
                        {p.name}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWishlist(p);
                        }}
                        className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0"
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
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {p.attributes?.prepTime && (
                        <span className="text-[10px] text-gray-500 flex items-center gap-0.5">
                          <Clock size={9} /> {p.attributes.prepTime}
                        </span>
                      )}
                      {p.attributes?.portion && (
                        <span className="text-[10px] bg-orange-50 text-orange-600 font-semibold px-1.5 py-0.5 rounded-full">
                          {p.attributes.portion}
                        </span>
                      )}
                      {p.attributes?.spiceLevel && (
                        <span className="text-[10px] text-gray-500">
                          🌶️ {p.attributes.spiceLevel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-base font-black text-orange-500">
                        {fmtN(p.price)}
                      </p>
                      {!p.inStock ? (
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">
                          Not Available
                        </span>
                      ) : p.whatsappOrderable ? (
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
                            className="flex items-center gap-1.5 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-green-600 shadow-sm"
                          >
                            <img
                              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                              className="w-3.5 h-3.5"
                              alt="WA"
                            />{" "}
                            Order
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
                {(p.isBestSeller || p.isFeatured) && (
                  <div className="bg-orange-50 px-3 py-1.5 flex items-center gap-1">
                    <Star size={10} className="text-orange-500" />
                    <span className="text-[10px] font-bold text-orange-600">
                      {p.isBestSeller ? "Most Ordered" : "Chef's Special"}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-orange-50 rounded-2xl text-center">
          <p className="text-sm font-bold text-orange-700">📱 How to Order</p>
          <p className="text-xs text-orange-600 mt-1">
            Click any item then tap "Order via WhatsApp" to place your order
          </p>
        </div>

       
      </div>

      <StoreProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onOrder={handleWhatsAppOrder}
        onContact={handleWhatsAppContact}
        actionLabel="Order Now 🍔"
        category="food"
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
