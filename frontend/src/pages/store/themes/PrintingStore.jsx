import { useState } from "react";
import { Search, ExternalLink, Clock, Layers, Heart } from "lucide-react";
import StoreHeader from "../components/StoreHeader.jsx";
import StoreProductModal from "../components/StoreProductModal.jsx";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

export default function PrintingStore({
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
      className="min-h-screen bg-[#fafafa]"
      style={{ fontFamily: store?.font || "'Inter', sans-serif" }}
    >
      <StoreHeader
        store={store}
        onWhatsApp={handleWhatsAppContact}
        onShare={handleShare}
        headerBg="bg-gradient-to-br from-gray-900 via-red-900 to-gray-800"
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search printing services..."
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
              <p className="text-lg font-black text-red-600">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-gray-900 text-white rounded-2xl p-4 mb-5">
          <p className="font-black text-sm mb-2">🖨️ How to Order</p>
          <div className="space-y-1">
            {[
              "1. Choose your service below",
              "2. Tap WhatsApp to send your files",
              "3. We print & deliver or you pick up",
            ].map((s, i) => (
              <p key={i} className="text-xs text-gray-300">
                {s}
              </p>
            ))}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar mb-5">
            <button
              onClick={() => setActiveCategory("")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${!activeCategory ? "bg-red-600 text-white" : "bg-white text-gray-600 shadow-sm"}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategory(activeCategory === c ? "" : c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap flex-shrink-0 ${activeCategory === c ? "bg-red-600 text-white" : "bg-white text-gray-600 shadow-sm"}`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🖨️</div>
            <p className="font-bold text-gray-700">No services found</p>
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
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group border border-gray-100"
              >
                <div className="relative h-36 bg-gray-50">
                  {p.images?.[0] ? (
                    <img
                      src={p.images[0]}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Layers size={32} className="text-gray-300" />
                    </div>
                  )}
                  {p.isFeatured && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      Popular
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
                </div>
                <div className="p-3">
                  <p className="text-sm font-black text-gray-800 truncate">
                    {p.name}
                  </p>
                  {p.attributes?.size && (
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      📐 {p.attributes.size}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {p.attributes?.turnaround && (
                      <span className="text-[9px] text-gray-500 flex items-center gap-0.5">
                        <Clock size={8} /> {p.attributes.turnaround}
                      </span>
                    )}
                    {p.attributes?.material && (
                      <span className="text-[9px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                        {p.attributes.material}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-black text-red-600">
                      {fmtN(p.price)}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWhatsAppOrder(p);
                      }}
                      className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center hover:bg-green-600 shadow-sm"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                        className="w-3.5 h-3.5"
                        alt="WA"
                      />
                    </button>
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
        actionLabel="Order Print via WhatsApp 🖨️"
        category="printing"
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
