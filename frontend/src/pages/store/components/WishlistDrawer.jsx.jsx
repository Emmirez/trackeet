import { X, Heart, ShoppingCart } from "lucide-react";
import { useWishlist } from "../../../context/WishlistContext.jsx";
import { useCart } from "../../../context/CartContext.jsx";
import toast from "react-hot-toast";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

export default function WishlistDrawer({
  open,
  onClose,
  onOrder,
  onProductClick,
  category,
}) {
  const { items, removeItem, total } = useWishlist();
  const { addItem } = useCart();

  const SERVICE_CATEGORIES = [
    "beauty",
    "home_services",
    "printing",
    "freelance",
    "pos",
  ];
  const showCart = !SERVICE_CATEGORIES.includes(category);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-800 text-lg flex items-center gap-2">
              <Heart size={20} className="text-red-500 fill-red-500" /> Wishlist
            </h2>
            <p className="text-xs text-gray-400">
              {total} saved item{total !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <X size={18} className="text-gray-600" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <Heart size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="font-bold text-gray-700">No saved items</p>
              <p className="text-sm text-gray-400 mt-1">
                Tap ❤️ on any product to save it
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => {
                  onProductClick?.(item);
                  
                }}
              >
                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">
                      🛍️
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-sm font-black text-purple-600">
                    {fmtN(item.price)}
                  </p>
                 <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.inStock ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}
                    >
                      {item.inStock ? "In Stock" : "Out of Stock"}
                    </span>
                    <span className="text-[10px] text-purple-400 font-semibold">
                      Tap to view →
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className="flex flex-col gap-1 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  {showCart && item.inStock && (
                    <button
                      onClick={() => {
                        addItem(item);
                        toast.success("Added to cart! 🛒", { duration: 1500 });
                      }}
                      className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center hover:bg-purple-700 text-white font-bold text-lg"
                    >
                      +
                    </button>
                  )}
                  {item.inStock && item.whatsappOrderable && (
                    <button
                      onClick={() => {
                        onOrder(item, 1, {});
                        onClose();
                      }}
                      className="w-8 h-8 bg-green-500 rounded-xl flex items-center justify-center hover:bg-green-600"
                    >
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                        className="w-4 h-4"
                        alt="WA"
                      />
                    </button>
                  )}
                  <button
                    onClick={() => removeItem(item._id)}
                    className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center hover:bg-red-100"
                  >
                    <X size={14} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
