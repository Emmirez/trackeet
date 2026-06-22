import { X, Trash2, ShoppingCart, Plus, Minus } from "lucide-react";
import { useCart } from "../../../context/CartContext.jsx";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

export default function CartDrawer({
  open,
  onClose,
  onOrder,
  store,
  onProductClick,
}) {
  const {
    items,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    clearCart,
  } = useCart();

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="font-black text-gray-800 text-lg">Your Cart 🛒</h2>
            <p className="text-xs text-gray-400">
              {totalItems} item{totalItems !== 1 ? "s" : ""} from {store?.name}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs text-red-500 font-semibold px-3 py-1.5 bg-red-50 rounded-xl"
              >
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center"
            >
              <X size={18} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🛒</div>
              <p className="font-bold text-gray-700">Your cart is empty</p>
              <p className="text-sm text-gray-400 mt-1">
                Add items to get started
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-3 bg-gray-50 rounded-2xl p-3"
              >
                {/* Image — clickable */}
                <button
                  onClick={() => onProductClick?.(item)}
                  className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 hover:ring-2 hover:ring-purple-400 transition-all"
                >
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
                </button>

                {/* Info — clickable */}
                <button
                  onClick={() => onProductClick?.(item)}
                  className="flex-1 min-w-0 text-left hover:opacity-70 transition-opacity"
                >
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {item.name}
                  </p>
                  <p className="text-sm font-black text-purple-600">
                    {fmtN(item.price)}
                  </p>
                  {item.quantity > 1 && (
                    <p className="text-xs text-gray-400">
                      Total: {fmtN(item.price * item.quantity)}
                    </p>
                  )}
                  <p className="text-[10px] text-purple-400 font-semibold mt-0.5">
                    Tap to view details →
                  </p>
                </button>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity - 1)}
                    className="w-7 h-7 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center hover:border-purple-400 transition-colors"
                  >
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-black w-5 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    className="w-7 h-7 bg-white border-2 border-gray-200 rounded-lg flex items-center justify-center hover:border-purple-400 transition-colors"
                  >
                    <Plus size={12} />
                  </button>
                  <button
                    onClick={() => removeItem(item._id)}
                    className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors ml-1"
                  >
                    <Trash2 size={12} className="text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Subtotal ({totalItems} items)
              </p>
              <p className="text-xl font-black text-gray-800">
                {fmtN(totalPrice)}
              </p>
            </div>
            <button
              onClick={() => {
                onOrder(items);
                clearCart();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold text-base transition-colors shadow-lg"
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                className="w-6 h-6"
                alt="WA"
              />
              Order All via WhatsApp
            </button>
          </div>
        )}
      </div>
    </>
  );
}
