const getKey = (storeName) => `rv_${storeName}`;
const MAX = 6;

export const addRecentlyViewed = (storeName, product) => {
  try {
    const key = getKey(storeName);
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const filtered = existing.filter((p) => p._id !== product._id);
    const updated = [product, ...filtered].slice(0, MAX);
    localStorage.setItem(key, JSON.stringify(updated));
  } catch {}
};

export const getRecentlyViewed = (storeName) => {
  try {
    return JSON.parse(localStorage.getItem(getKey(storeName)) || "[]");
  } catch {
    return [];
  }
};
