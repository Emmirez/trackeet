import { createContext, useContext, useState, useEffect } from "react";

const WishlistContext = createContext();

export function WishlistProvider({ children, storeName }) {
  const storageKey = `wl_${storeName}`;

  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, storageKey]);

  const addItem = (product) => {
    setItems((prev) => {
      if (prev.find((i) => i._id === product._id)) return prev;
      return [...prev, product];
    });
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((i) => i._id !== productId));
  };

  const toggleItem = (product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i._id === product._id);
      if (exists) return prev.filter((i) => i._id !== product._id);
      return [...prev, product];
    });
  };

  const isWishlisted = (productId) => items.some((i) => i._id === productId);

  return (
    <WishlistContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        toggleItem,
        isWishlisted,
        total: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
