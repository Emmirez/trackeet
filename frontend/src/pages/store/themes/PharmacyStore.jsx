import { useState } from "react";
import {
  Search,
  ExternalLink,
  AlertCircle,
  ShieldCheck,
  Heart,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader.jsx";
import StoreProductModal from "../components/StoreProductModal.jsx";
import { useCart } from "../../../context/CartContext.jsx";
import toast from "react-hot-toast";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

export default function PharmacyStore({
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
  const [rxOnly, setRxOnly] = useState(false);
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
    const matchRx = !rxOnly || p.attributes?.prescription === true;
    return matchSearch && matchCategory && matchRx;
  });

  return (
    <div
      className="min-h-screen bg-[#f0f9ff]"
      style={{ fontFamily: store?.font || "'Inter', sans-serif" }}
    >
      <StoreHeader
        store={store}
        onWhatsApp={handleWhatsAppContact}
        onShare={handleShare}
        headerBg="bg-gradient-to-br from-teal-600 via-emerald-500 to-green-500"
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search medicines & products..."
            className="w-full bg-white text-gray-800 pl-11 pr-4 py-3 rounded-2xl text-sm font-medium shadow-lg outline-none placeholder:text-gray-400"
          />
        </div>
      </StoreHeader>

      <div className="max-w-lg mx-auto px-4 pb-8">
        <div className="grid grid-cols-3 gap-3 -mt-4 mb-5">
          {[
            { label: "Products", value: products.length },
            { label: "Categories", value: categories.length },
            {
              label: "In Stock",
              value: products.filter((p) => p.inStock).length,
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 text-center shadow-md"
            >
              <p className="text-lg font-black text-teal-600">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 mb-5 flex items-start gap-2">
          <ShieldCheck
            size={16}
            className="text-blue-500 flex-shrink-0 mt-0.5"
          />
          <p className="text-xs text-blue-700">
            Always consult a pharmacist before purchasing prescription drugs.
          </p>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-4">
            <button
              onClick={() => setActiveCategory("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${!activeCategory ? "bg-teal-600 text-white" : "bg-white text-gray-600 shadow-sm"}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(activeCategory === c ? "" : c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${activeCategory === c ? "bg-teal-600 text-white" : "bg-white text-gray-600 shadow-sm"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-4 bg-white rounded-xl px-4 py-3 shadow-sm">
          <div>
            <p className="text-sm font-bold text-gray-800">
              Prescription Only (Rx)
            </p>
            <p className="text-xs text-gray-400">
              Show only prescription medications
            </p>
          </div>
          <button
            onClick={() => setRxOnly(!rxOnly)}
            className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${rxOnly ? "bg-teal-600" : "bg-gray-200"}`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${rxOnly ? "left-6" : "left-0.5"}`}
            />
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">💊</div>
            <p className="font-bold text-gray-700">No products found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <div
                key={p._id}
                onClick={() => {
                  setSelectedProduct(p);
                  handleProductView(p);
                }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex gap-3 p-4">
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-teal-50 flex-shrink-0">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        💊
                      </div>
                    )}
                    {!p.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-xl">
                        <span className="text-white text-[8px] font-bold text-center px-1">
                          Out of Stock
                        </span>
                      </div>
                    )}
                    {p.inStock &&
                      p.stockCount !== null &&
                      p.stockCount <= 5 &&
                      p.stockCount > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-center">
                          <span className="text-[8px] font-bold text-white">
                            🔥 Only {p.stockCount} left!
                          </span>
                        </div>
                      )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-gray-800 text-sm flex-1">
                            {p.name}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWishlist(p);
                            }}
                            className="w-7 h-7 bg-teal-50 rounded-full flex items-center justify-center flex-shrink-0"
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
                        {p.attributes?.manufacturer && (
                          <p className="text-[10px] text-gray-400">
                            {p.attributes.manufacturer}
                          </p>
                        )}
                      </div>
                      <p className="text-sm font-black text-teal-600 flex-shrink-0">
                        {fmtN(p.price)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {p.attributes?.dosage && (
                        <span className="text-[10px] bg-teal-50 text-teal-700 font-semibold px-2 py-0.5 rounded-full">
                          {p.attributes.dosage}
                        </span>
                      )}
                      {p.attributes?.expiryDate && (
                        <span className="text-[10px] text-gray-400">
                          Exp: {p.attributes.expiryDate}
                        </span>
                      )}
                      {p.attributes?.prescription && (
                        <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                          <AlertCircle size={8} /> Rx Only
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                      >
                        {p.inStock ? "✓ In Stock" : "Out of Stock"}
                      </span>
                      {p.inStock && (
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
                      )}
                    </div>
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
        actionLabel="Order via WhatsApp 💊"
        category="pharmacy"
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
