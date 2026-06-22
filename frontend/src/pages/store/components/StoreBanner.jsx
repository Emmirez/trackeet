import { useState } from "react";
import { X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { bannerAPI } from "../../../services/api.js";

export default function StoreBanner({ storeName }) {
  const [dismissed, setDismissed] = useState([]);

  const { data } = useQuery({
    queryKey: ["store-banners", storeName],
    queryFn: () => bannerAPI.getStoreBanners(storeName).then((r) => r.data),
    enabled: !!storeName,
  });

  const banners = (data?.banners || []).filter(
    (b) => !dismissed.includes(b._id),
  );

  if (banners.length === 0) return null;

  return (
    <div className="space-y-1">
      {banners.map((b) => (
        <div
          key={b._id}
          className="relative px-4 py-3 text-white flex items-center gap-3"
          style={{ backgroundColor: b.color }}
        >
          <span className="text-xl flex-shrink-0">{b.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm">{b.title}</p>
            <p className="text-xs opacity-90">{b.message}</p>
          </div>
          <button
            onClick={() => setDismissed((prev) => [...prev, b._id])}
            className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 flex-shrink-0"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
}
