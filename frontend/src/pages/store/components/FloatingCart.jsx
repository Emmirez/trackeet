import { ShoppingCart } from "lucide-react";
import { useCart } from "../../../context/CartContext.jsx";

export default function FloatingCart({ onClick, primaryColor }) {
  const { totalItems } = useCart();

  if (totalItems === 0) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-4 z-30 flex items-center gap-2 text-white py-3 px-4 rounded-2xl shadow-2xl font-bold text-sm transition-all hover:scale-105 active:scale-95"
      style={{ backgroundColor: primaryColor || "#7C3AED" }}
    >
      <ShoppingCart size={20} />
      <span>Cart</span>
      <span className="bg-white text-purple-600 text-xs font-black w-6 h-6 rounded-full flex items-center justify-center">
        {totalItems}
      </span>
    </button>
  );
}
