import {
  Heart,
  ShoppingCart,
  Phone,
  Home,
  UtensilsCrossed,
  Calendar,
  MessageCircle,
  Package,
} from "lucide-react";
import { useCart } from "../../../context/CartContext.jsx";
import { useWishlist } from "../../../context/WishlistContext.jsx";

const SERVICE_CATEGORIES = [
  "beauty",
  "home_services",
  "printing",
  "freelance",
  "pos",
];
const FOOD_CATEGORIES = ["food"];

export default function BottomNav({
  category,
  onHome,
  onWishlist,
  onCart,
  onContact,
  onBook,
  onTrack,
}) {
  const { totalItems } = useCart();
  const { total: wishlistTotal } = useWishlist();

  const isService = SERVICE_CATEGORIES.includes(category);
  const isFood = FOOD_CATEGORIES.includes(category);

  const tabs = isService
    ? [
        { icon: Home, label: "Home", onClick: onHome },
        {
          icon: Heart,
          label: "Saved",
          onClick: onWishlist,
          badge: wishlistTotal,
        },
        { icon: Calendar, label: "Book", onClick: onContact },
        { icon: Phone, label: "Contact", onClick: onContact },
        { icon: Package, label: "Track", onClick: onTrack },
      ]
    : isFood
      ? [
          { icon: UtensilsCrossed, label: "Menu", onClick: onHome },
          {
            icon: Heart,
            label: "Saved",
            onClick: onWishlist,
            badge: wishlistTotal,
          },
          {
            icon: ShoppingCart,
            label: "Cart",
            onClick: onCart,
            badge: totalItems,
          },
          { icon: Phone, label: "Contact", onClick: onContact },
          { icon: Package, label: "Track", onClick: onTrack },
        ]
      : [
          { icon: Home, label: "Home", onClick: onHome },
          {
            icon: Heart,
            label: "Wishlist",
            onClick: onWishlist,
            badge: wishlistTotal,
          },
          {
            icon: ShoppingCart,
            label: "Cart",
            onClick: onCart,
            badge: totalItems,
          },
          { icon: Phone, label: "Contact", onClick: onContact },
          { icon: Package, label: "Track", onClick: onTrack },
        ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-100 shadow-2xl">
      <div className="max-w-lg mx-auto px-2 py-2">
        <div className="grid grid-cols-5 gap-1">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={tab.onClick}
              className="relative flex flex-col items-center gap-1 py-2 px-1 rounded-2xl hover:bg-gray-50 transition-colors"
            >
              <div className="relative">
                <tab.icon size={20} className="text-gray-600" />
                {tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-purple-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold text-gray-500">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
