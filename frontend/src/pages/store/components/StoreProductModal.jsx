import { X, Package, MessageCircle, Star, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { reviewAPI } from "../../../services/api.js";
import toast from "react-hot-toast";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

// Category-specific modal config
const MODAL_CONFIG = {
  fashion: {
    stockLabel: "In Stock",
    outStockLabel: "Sold Out",
    featuredLabel: "⭐ Featured",
    trendingLabel: "🔥 Trending",
    bestSellerLabel: "🏆 Best Seller",
    newLabel: "✨ New Arrival",
  },
  food: {
    stockLabel: "Available Today",
    outStockLabel: "Not Available",
    featuredLabel: "👨‍🍳 Chef's Special",
    trendingLabel: null,
    bestSellerLabel: "🔥 Most Ordered",
    newLabel: "🆕 New on Menu",
  },
  beauty: {
    stockLabel: "Available",
    outStockLabel: "Fully Booked",
    featuredLabel: "⭐ Featured",
    trendingLabel: null,
    bestSellerLabel: "💅 Most Popular",
    newLabel: "✨ New Service",
  },
  pharmacy: {
    stockLabel: "In Stock",
    outStockLabel: "Out of Stock",
    featuredLabel: "⭐ Featured",
    trendingLabel: null,
    bestSellerLabel: null,
    newLabel: null,
  },
  electronics: {
    stockLabel: "In Stock",
    outStockLabel: "Out of Stock",
    featuredLabel: "⭐ Featured",
    trendingLabel: "🔥 Trending",
    bestSellerLabel: "🏆 Best Seller",
    newLabel: "🆕 New In",
  },
  pos: {
    stockLabel: "Available",
    outStockLabel: "Unavailable",
    featuredLabel: "⭐ Featured",
    trendingLabel: null,
    bestSellerLabel: null,
    newLabel: null,
  },
  grocery: {
    stockLabel: "In Stock",
    outStockLabel: "Out of Stock",
    featuredLabel: "⭐ Featured",
    trendingLabel: null,
    bestSellerLabel: "🔥 Hot Item",
    newLabel: "🆕 New Stock",
  },
  furniture: {
    stockLabel: "Available",
    outStockLabel: "Out of Stock",
    featuredLabel: "⭐ Featured",
    trendingLabel: null,
    bestSellerLabel: null,
    newLabel: "✨ New Arrival",
  },
  home_services: {
    stockLabel: "Available",
    outStockLabel: "Unavailable",
    featuredLabel: "⭐ Featured",
    trendingLabel: null,
    bestSellerLabel: "🔧 Most Requested",
    newLabel: null,
  },
  printing: {
    stockLabel: "Available",
    outStockLabel: "Unavailable",
    featuredLabel: "⭐ Popular",
    trendingLabel: null,
    bestSellerLabel: null,
    newLabel: null,
  },
  freelance: {
    stockLabel: "Taking Orders",
    outStockLabel: "Not Available",
    featuredLabel: "⭐ Featured",
    trendingLabel: null,
    bestSellerLabel: "💼 Most Popular",
    newLabel: null,
  },
  general: {
    stockLabel: "In Stock",
    outStockLabel: "Out of Stock",
    featuredLabel: "⭐ Featured",
    trendingLabel: "🔥 Trending",
    bestSellerLabel: "🏆 Best Seller",
    newLabel: "✨ New Arrival",
  },
};

function ImageCarousel({ images, name }) {
  const [current, setCurrent] = useState(0);

  return (
    <div className="relative">
      <img
        src={images[current]}
        alt={name}
        className="w-full h-72 object-contain bg-gray-50 rounded-t-3xl transition-all duration-300"
      />

      {/* Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrent((i) => (i === 0 ? images.length - 1 : i - 1))
            }
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-sm font-bold"
          >
            ‹
          </button>
          <button
            onClick={() =>
              setCurrent((i) => (i === images.length - 1 ? 0 : i + 1))
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-sm font-bold"
          >
            ›
          </button>
        </>
      )}

      {/* Dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${i === current ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function StarRating({ rating, onChange, size = 20 }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={onChange ? "cursor-pointer" : "cursor-default"}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= (hover || rating)
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function StoreProductModal({
  product,
  onClose,
  onOrder,
  onContact,
  actionLabel,
  onAddToCart,
  category,
  onShare,
  storeName,
  allProducts,
  onSelectProduct,
}) {
  const [quantity, setQuantity] = useState(1);
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewPhone, setReviewPhone] = useState("");
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [selectedVariants, setSelectedVariants] = useState({});

  useEffect(() => {
    setSelectedVariants({});
    setQuantity(1);
    setBookingDate("");
    setBookingTime("");
    setShowReviewForm(false);
    setReviewName("");
    setReviewPhone("");
    setReviewRating(0);
    setReviewComment("");
  }, [product]);

  const { data: reviewData } = useQuery({
    queryKey: ["reviews", product?._id],
    queryFn: () =>
      reviewAPI.getForProduct(storeName, product._id).then((r) => r.data),
    enabled: !!product?._id && !!storeName,
  });

  const { mutate: submitReview, isPending: submitting } = useMutation({
    mutationFn: () =>
      reviewAPI.submit(storeName, product._id, {
        name: reviewName,
        phone: reviewPhone,
        rating: reviewRating,
        comment: reviewComment,
      }),
    onSuccess: () => {
      toast.success("Review submitted! It will appear after approval.");
      setShowReviewForm(false);
      setReviewName("");
      setReviewPhone("");
      setReviewRating(0);
      setReviewComment("");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to submit review"),
  });

  const handleSubmitReview = () => {
    if (!reviewName.trim()) return toast.error("Enter your name");
    if (!reviewRating) return toast.error("Select a rating");
    if (!reviewComment.trim()) return toast.error("Write a comment");
    submitReview();
  };

  const reviews = reviewData?.reviews || [];
  const avgRating = reviewData?.avgRating || 0;
  const totalReviews = reviewData?.total || 0;

  const related = allProducts
    ? allProducts
        .filter(
          (p) =>
            p._id !== product?._id &&
            p.inStock &&
            p.category === product?.category,
        )
        .slice(0, 6)
    : [];

  if (!product) return null;

  const cfg = MODAL_CONFIG[category] || MODAL_CONFIG.general;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[60] flex items-end justify-center"
      onClick={onClose}
    >
      <div
        id="product-modal-scroll"
        className="bg-white w-full max-w-lg rounded-t-3xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image carousel */}
        <div className="relative">
          {product.images?.length > 0 ? (
            <ImageCarousel images={product.images} name={product.name} />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-t-3xl flex items-center justify-center">
              <Package size={48} className="text-gray-300" />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md"
          >
            <X size={18} className="text-gray-700" />
          </button>
          {onShare && (
            <button
              onClick={() => onShare(product)}
              className="absolute top-14 right-4 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center shadow-md"
            >
              <Share2 size={16} className="text-gray-700" />
            </button>
          )}
          {product.comparePrice > product.price && (
            <div className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              -
              {Math.round(
                ((product.comparePrice - product.price) /
                  product.comparePrice) *
                  100,
              )}
              % OFF
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Name + price */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h2 className="text-xl font-black text-gray-800">
                {product.name}
              </h2>
              {product.category && (
                <span className="text-xs bg-purple-100 text-purple-600 font-semibold px-2 py-0.5 rounded-full mt-1 inline-block">
                  {product.category}
                </span>
              )}
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-black text-purple-600">
                {fmtN(product.price)}
              </p>
              {product.comparePrice > product.price && (
                <p className="text-sm text-gray-400 line-through">
                  {fmtN(product.comparePrice)}
                </p>
              )}
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>
          )}

          {/* Attributes */}
          {product.attributes && Object.keys(product.attributes).length > 0 && (
            <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
              {Object.entries(product.attributes)
                .filter(
                  ([_, val]) =>
                    val !== null &&
                    val !== undefined &&
                    val !== false &&
                    val !== "",
                )
                .map(([key, val]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-500 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {typeof val === "boolean"
                        ? val
                          ? "Yes"
                          : "No"
                        : String(val)}
                    </span>
                  </div>
                ))}
            </div>
          )}

          {/* Category-specific badges */}
          <div className="flex flex-wrap gap-2">
            {product.isFeatured && cfg.featuredLabel && (
              <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded-full">
                {cfg.featuredLabel}
              </span>
            )}
            {product.isTrending && cfg.trendingLabel && (
              <span className="text-xs bg-purple-100 text-purple-700 font-bold px-3 py-1 rounded-full">
                {cfg.trendingLabel}
              </span>
            )}
            {product.isBestSeller && cfg.bestSellerLabel && (
              <span className="text-xs bg-green-100 text-green-700 font-bold px-3 py-1 rounded-full">
                {cfg.bestSellerLabel}
              </span>
            )}
            {product.isNewArrival && cfg.newLabel && (
              <span className="text-xs bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full">
                {cfg.newLabel}
              </span>
            )}
          </div>

          {/* Stock status — category specific */}
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className={`flex items-center gap-2 text-sm font-semibold ${product.inStock ? "text-green-600" : "text-red-500"}`}
            >
              <div
                className={`w-2 h-2 rounded-full ${product.inStock ? "bg-green-500" : "bg-red-500"}`}
              />
              {product.inStock ? cfg.stockLabel : cfg.outStockLabel}
            </div>
            {product.inStock &&
              product.stockCount !== null &&
              product.stockCount <= 5 &&
              product.stockCount > 0 && (
                <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                  🔥 Only {product.stockCount} left!
                </span>
              )}
          </div>

          {/* Action button */}
          {product.inStock && product.whatsappOrderable ? (
            <div className="space-y-3">
              {/* Booking date/time — beauty & home services */}
              {["beauty", "home_services"].includes(category) && (
                <div className="bg-gray-50 rounded-2xl px-4 py-3 space-y-3">
                  <p className="text-sm font-bold text-gray-700">
                    📅 Preferred Date & Time
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Date</p>
                      <input
                        type="date"
                        min={new Date().toISOString().split("T")[0]}
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Time</p>
                      <input
                        type="time"
                        value={bookingTime}
                        onChange={(e) => setBookingTime(e.target.value)}
                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Variant selectors — product categories only */}
              {product.variants?.length > 0 &&
                ![
                  "food",
                  "beauty",
                  "home_services",
                  "freelance",
                  "pos",
                  "pharmacy",
                ].includes(category) && (
                  <div className="space-y-3">
                    {product.variants.map((variant) => (
                      <div key={variant.name}>
                        <p className="text-sm font-bold text-gray-700 mb-2">
                          {variant.name}
                          {selectedVariants[variant.name] && (
                            <span className="ml-2 text-purple-600 font-black">
                              — {selectedVariants[variant.name]}
                            </span>
                          )}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          {variant.options.map((option) => (
                            <button
                              key={option}
                              onClick={() =>
                                setSelectedVariants((prev) => ({
                                  ...prev,
                                  [variant.name]:
                                    prev[variant.name] === option
                                      ? null
                                      : option,
                                }))
                              }
                              className={`px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                                selectedVariants[variant.name] === option
                                  ? "border-purple-600 bg-purple-600 text-white"
                                  : "border-gray-200 bg-white text-gray-700 hover:border-purple-400"
                              }`}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              {/* Quantity selector — hide for service-based categories */}
              {![
                "beauty",
                "home_services",
                "printing",
                "freelance",
                "pos",
              ].includes(category) && (
                <div className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                  <p className="text-sm font-bold text-gray-700">Quantity</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-8 h-8 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center text-lg font-bold text-gray-600 hover:border-primary hover:text-primary transition-colors"
                    >
                      −
                    </button>
                    <span className="text-lg font-black text-gray-800 w-6 text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-8 h-8 bg-white border-2 border-gray-200 rounded-xl flex items-center justify-center text-lg font-bold text-gray-600 hover:border-primary hover:text-primary transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Total */}
              {quantity > 1 &&
                ![
                  "beauty",
                  "home_services",
                  "printing",
                  "freelance",
                  "pos",
                ].includes(category) && (
                  <div className="flex items-center justify-between px-1">
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-lg font-black text-purple-600">
                      {fmtN(product.price * quantity)}
                    </p>
                  </div>
                )}

              {/* Add to Cart — product categories only */}
              {![
                "beauty",
                "home_services",
                "printing",
                "freelance",
                "pos",
              ].includes(category) && (
                <button
                  onClick={() => {
                    onAddToCart?.(product, quantity);
                    toast.success(`${product.name} added to cart! 🛒`, {
                      duration: 1500,
                    });
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-3.5 rounded-2xl font-bold text-base transition-colors"
                >
                  🛒 Add to Cart
                </button>
              )}

              {/* Order via WhatsApp — all categories */}
              <button
                onClick={() =>
                  onOrder(product, quantity, {
                    date: bookingDate,
                    time: bookingTime,
                    variants: selectedVariants,
                  })
                }
                className="w-full flex items-center justify-center gap-3 bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-bold text-base transition-colors shadow-lg"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  className="w-6 h-6"
                  alt="WA"
                />
                {actionLabel}
              </button>
            </div>
          ) : (
            <button
              onClick={onContact}
              className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-2xl font-bold text-base transition-colors"
            >
              <MessageCircle size={20} /> Chat with Seller
            </button>
          )}
          {/* Reviews Section */}
          <div className="border-t border-gray-100 pt-4 space-y-4">
            {/* Rating summary */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">Customer Reviews</p>
                {totalReviews > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={Math.round(avgRating)} size={14} />
                    <span className="text-sm font-bold text-gray-700">
                      {avgRating}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({totalReviews} review{totalReviews !== 1 ? "s" : ""})
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-xl hover:bg-purple-100 transition-colors"
              >
                {showReviewForm ? "Cancel" : "✍️ Write Review"}
              </button>
            </div>

            {/* Review form */}
            {showReviewForm && (
              <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                <p className="text-sm font-bold text-gray-700">Your Review</p>
                <div className="flex justify-center">
                  <StarRating
                    rating={reviewRating}
                    onChange={setReviewRating}
                    size={28}
                  />
                </div>
                <input
                  value={reviewName}
                  onChange={(e) => setReviewName(e.target.value)}
                  placeholder="Your name *"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-400"
                />
                <input
                  value={reviewPhone}
                  onChange={(e) => setReviewPhone(e.target.value)}
                  placeholder="Phone number (optional)"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-400"
                />
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share your experience... *"
                  rows={3}
                  className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2.5 outline-none focus:border-purple-400 resize-none"
                />
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="w-full bg-purple-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors"
                >
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            )}

            {/* Reviews list */}
            {reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r._id} className="bg-gray-50 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-bold text-gray-800">
                        {r.name}
                      </p>
                      <StarRating rating={r.rating} size={12} />
                    </div>
                    <p className="text-sm text-gray-600">{r.comment}</p>
                    {r.reply && (
                      <div className="mt-2 pl-3 border-l-2 border-purple-300">
                        <p className="text-xs font-bold text-purple-600">
                          Owner replied:
                        </p>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {r.reply}
                        </p>
                      </div>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2">
                      {new Date(r.createdAt).toLocaleDateString("en-NG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-3">
                No reviews yet — be the first to review!
              </p>
            )}
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="font-bold text-gray-800">You may also like</p>
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {related.map((p) => (
                  <div
                    key={p._id}
                    onClick={() => {
                      onSelectProduct?.(p);
                      document
                        .getElementById("product-modal-scroll")
                        ?.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="flex-shrink-0 w-32 bg-gray-50 rounded-2xl overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                  >
                    <div className="h-28 bg-gray-100 relative">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={24} className="text-gray-300" />
                        </div>
                      )}
                      {p.stockCount !== null &&
                        p.stockCount <= 5 &&
                        p.stockCount > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-red-500/90 text-center">
                            <span className="text-[8px] font-bold text-white">
                              🔥 Only {p.stockCount} left!
                            </span>
                          </div>
                        )}
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-bold text-gray-800 truncate">
                        {p.name}
                      </p>
                      <p className="text-xs font-black text-purple-600 mt-0.5">
                        {fmtN(p.price)}
                      </p>
                      {p.whatsappOrderable && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOrder(p, 1, {});
                          }}
                          className="mt-1.5 w-full flex items-center justify-center gap-1 bg-green-500 text-white text-[10px] font-bold py-1 rounded-lg hover:bg-green-600"
                        >
                          <img
                            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                            className="w-3 h-3"
                            alt="WA"
                          />
                          Order
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
