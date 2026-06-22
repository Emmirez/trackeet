import { useState } from "react";
import {
  Search,
  ExternalLink,
  Clock,
  MapPin,
  CheckCircle,
  Wrench,
  Heart,
} from "lucide-react";
import StoreHeader from "../components/StoreHeader.jsx";
import StoreProductModal from "../components/StoreProductModal.jsx";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

export default function HomeServicesStore({
  store,
  products,
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
      className="min-h-screen bg-[#f0fdf4]"
      style={{ fontFamily: store?.font || "'Inter', sans-serif" }}
    >
      <StoreHeader
        store={store}
        onWhatsApp={handleWhatsAppContact}
        onShare={handleShare}
        headerBg="bg-gradient-to-br from-blue-700 via-blue-600 to-teal-600"
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
        <div className="grid grid-cols-3 gap-3 -mt-4 mb-5">
          {[
            { label: "Services", value: products.length },
            { label: "Categories", value: categories.length },
            {
              label: "Available",
              value: products.filter((p) => p.inStock).length,
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-3 text-center shadow-md"
            >
              <p className="text-lg font-black text-blue-600">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-5">
          <p className="font-black text-blue-800 text-sm mb-2">
            ✅ Why Choose Us?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              "Experienced Professionals",
              "Fast Response",
              "Quality Guaranteed",
              "Affordable Rates",
            ].map((t, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <CheckCircle
                  size={12}
                  className="text-blue-500 flex-shrink-0"
                />
                <span className="text-xs text-blue-700">{t}</span>
              </div>
            ))}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-5">
            <button
              onClick={() => setActiveCategory("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${!activeCategory ? "bg-blue-600 text-white" : "bg-white text-gray-600 shadow-sm"}`}
            >
              All Services
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(activeCategory === c ? "" : c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${activeCategory === c ? "bg-blue-600 text-white" : "bg-white text-gray-600 shadow-sm"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔧</div>
            <p className="font-bold text-gray-700">No services found</p>
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
                <div className="flex gap-4 p-4">
                  <div className="relative w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {p.images?.[0] ? (
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Wrench size={28} className="text-blue-400" />
                    )}
                    {!p.inStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                        <span className="text-white text-[8px] font-bold text-center px-1">
                          Unavailable
                        </span>
                      </div>
                    )}
                    {p.inStock &&
                      p.stockCount !== null &&
                      p.stockCount <= 5 &&
                      p.stockCount > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-orange-500/90 text-center rounded-b-2xl">
                          <span className="text-[8px] font-bold text-white">
                            ⚡ {p.stockCount} slots!
                          </span>
                        </div>
                      )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-black text-gray-800 flex-1 truncate">
                            {p.name}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleWishlist(p);
                            }}
                            className="w-7 h-7 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0"
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
                        {p.category && (
                          <span className="text-[10px] bg-blue-100 text-blue-600 font-semibold px-2 py-0.5 rounded-full">
                            {p.category}
                          </span>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-black text-blue-600">
                          {fmtN(p.price)}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Starting from
                        </p>
                      </div>
                    </div>
                    {p.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {p.description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      {p.attributes?.duration && (
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          <Clock size={9} /> {p.attributes.duration}
                        </span>
                      )}
                      {p.attributes?.serviceArea && (
                        <span className="text-[10px] text-gray-500 flex items-center gap-1">
                          <MapPin size={9} /> {p.attributes.serviceArea}
                        </span>
                      )}
                    </div>
                    {!p.inStock ? (
                      <span className="mt-3 inline-block text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-xl">
                        Currently Unavailable
                      </span>
                    ) : (
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
                        Request Service
                      </button>
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
        actionLabel="Request Service 🔧"
        category="home_services"
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
