import Product from "../models/Product.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import { uploadImage } from "../config/cloudinary.js";
import User from "../models/User.js";
import Review from "../models/Review.js";
import { logActivity } from "../utils/activityLogger.js";

const PLAN_LIMITS = {
  free: { products: 10 },
  starter: { products: 50 },
  business: { products: 500 },
  enterprise: { products: Infinity },
};

// DASHBOARD (owner)
export const getProducts = asyncHandler(async (req, res) => {
  const { category, search, featured, status } = req.query;
  const query = { user: req.user._id };

  if (category) query.category = category;
  if (featured === "true") query.isFeatured = true;
  if (status === "active") query.isActive = true;
  if (status === "inactive") query.isActive = false;
  if (search)
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { tags: { $regex: search, $options: "i" } },
    ];

  const products = await Product.find(query).sort({ createdAt: -1 });
  res.json({ success: true, products });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!product) throw new AppError("Product not found", 404);
  res.json({ success: true, product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    comparePrice,
    category,
    inStock,
    stockCount,
    isFeatured,
    isTrending,
    isBestSeller,
    isNewArrival,
    attributes,
    tags,
    whatsappOrderable,
    variants,
  } = req.body;

  if (!name?.trim()) throw new AppError("Product name is required", 400);
  if (!price || price < 0) throw new AppError("Valid price is required", 400);

  // Plan limit check
  const plan = req.user.plan || "free";
  const limit = PLAN_LIMITS[plan]?.products ?? 10;
  if (limit !== Infinity) {
    const productCount = await Product.countDocuments({ user: req.user._id });
    if (productCount >= limit) {
      throw new AppError(
        `You've reached the ${limit} product limit on the ${plan} plan. Upgrade to add more products.`,
        403,
      );
    }
  }

  const product = await Product.create({
    user: req.user._id,
    name: name.trim(),
    description,
    price: parseFloat(price),
    comparePrice: comparePrice ? parseFloat(comparePrice) : null,
    category,
    inStock: inStock !== undefined ? inStock : true,
    stockCount: stockCount || null,
    isFeatured: isFeatured || false,
    isTrending: isTrending || false,
    isBestSeller: isBestSeller || false,
    isNewArrival: isNewArrival !== false,
    attributes: attributes || {},
    tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
    whatsappOrderable: whatsappOrderable !== false,
    variants: variants || [],
  });

  await logActivity({
    userId: req.user._id,
    action: "Created product",
    entity: "product",
    entityId: product._id,
    details: `${product.name} — ₦${product.price?.toLocaleString()}`,
    ip: req.ip,
    userName: `${req.user.firstName} ${req.user.lastName}`,
  }).catch(() => {});

  res.status(201).json({ success: true, product });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!product) throw new AppError("Product not found", 404);

  const allowed = [
    "name",
    "description",
    "price",
    "comparePrice",
    "category",
    "inStock",
    "stockCount",
    "isFeatured",
    "isTrending",
    "isBestSeller",
    "isNewArrival",
    "isActive",
    "attributes",
    "tags",
    "whatsappOrderable",
    "variants",
  ];
  allowed.forEach((f) => {
    if (req.body[f] !== undefined) product[f] = req.body[f];
  });
  await product.save();

  await logActivity({
    userId: req.user._id,
    action: "Updated product",
    entity: "product",
    entityId: product._id,
    details: product.name,
    ip: req.ip,
    userName: `${req.user.firstName} ${req.user.lastName}`,
  }).catch(() => {});

  res.json({ success: true, product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!product) throw new AppError("Product not found", 404);

  await logActivity({
    userId: req.user._id,
    action: "Deleted product",
    entity: "product",
    entityId: product._id,
    details: product.name,
    ip: req.ip,
    userName: `${req.user.firstName} ${req.user.lastName}`,
  }).catch(() => {});
  res.json({ success: true, message: "Product deleted" });
});

export const uploadProductImages = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!product) throw new AppError("Product not found", 404);
  if (!req.files?.length) throw new AppError("No images uploaded", 400);

  const urls = await Promise.all(
    req.files.map((f) =>
      uploadImage(f.path.replace(/\\/g, "/"), "trackeet/products"),
    ),
  );
  product.images = [...(product.images || []), ...urls].slice(0, 5);
  await product.save();

  res.json({ success: true, images: product.images });
});

export const removeProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!product) throw new AppError("Product not found", 404);

  product.images = product.images.filter((img) => img !== req.body.imageUrl);
  await product.save();

  res.json({ success: true, images: product.images });
});

export const toggleProductStatus = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!product) throw new AppError("Product not found", 404);
  product.isActive = !product.isActive;
  await product.save();
  res.json({ success: true, product });
});

//  PUBLIC STOREFRONT
export const getStorefront = asyncHandler(async (req, res) => {
  const { storeName } = req.params;

  const owner = await User.findOne({ storeName, storeActive: true }).select(
    "firstName lastName businessName businessLogo businessAddress phone businessCategory storeName storeTheme storePrimaryColor storeFont storeBannerImage businessHours subscriptionPlan socialLinks  alwaysOpen  aboutUs termsAndConditions refundPolicy contactEmail contactPhones",
  );
  if (!owner) throw new AppError("Store not found", 404);

  const [reviewStats, totalOrders] = await Promise.all([
    Review.aggregate([
      { $match: { user: owner._id, approved: true } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]),
    Product.aggregate([
      { $match: { user: owner._id, isActive: true } },
      { $group: { _id: null, totalOrders: { $sum: "$orderCount" } } },
    ]),
  ]);

  const avgRating = reviewStats[0]?.avgRating?.toFixed(1) || null;
  const totalReviews = reviewStats[0]?.count || 0;
  const orderCount = totalOrders[0]?.totalOrders || 0;

  const products = await Product.find({ user: owner._id, isActive: true }).sort(
    { isFeatured: -1, createdAt: -1 },
  );

  const featured = products.filter((p) => p.isFeatured);
  const trending = products.filter((p) => p.isTrending);
  const newArrivals = products.filter((p) => p.isNewArrival).slice(0, 8);
  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  res.json({
    success: true,
    store: {
      name: owner.businessName || `${owner.firstName} ${owner.lastName}`,
      logo: owner.businessLogo,
      address: owner.businessAddress,
      phone: owner.phone,
      category: owner.businessCategory,
      storeName: owner.storeName,
      theme: owner.storeTheme || "default",
      primaryColor: owner.storePrimaryColor,
      font: owner.storeFont,
      bannerImage: owner.storeBannerImage,
      hours: owner.businessHours,
      socialLinks: owner.socialLinks,
      alwaysOpen: owner.alwaysOpen,
      aboutUs: owner.aboutUs,
      termsAndConditions: owner.termsAndConditions,
      refundPolicy: owner.refundPolicy,
      contactEmail: owner.contactEmail,
      contactPhones: owner.contactPhones,
      stats: {
        orders: orderCount,
        rating: avgRating,
        totalReviews,
      },
      verified: owner.subscriptionPlan && owner.subscriptionPlan !== "free",
    },
    products,
    featured,
    trending,
    newArrivals,
    categories,
    total: products.length,
  });
});

export const getStoreProduct = asyncHandler(async (req, res) => {
  const { storeName, productId } = req.params;

  const owner = await User.findOne({ storeName, storeActive: true });
  if (!owner) throw new AppError("Store not found", 404);

  const product = await Product.findOne({
    _id: productId,
    user: owner._id,
    isActive: true,
  });
  if (!product) throw new AppError("Product not found", 404);

  // Increment views
  product.views = (product.views || 0) + 1;
  await product.save();

  // Related products
  const related = await Product.find({
    user: owner._id,
    isActive: true,
    category: product.category,
    _id: { $ne: product._id },
  }).limit(4);

  res.json({
    success: true,
    product,
    related,
    store: { name: owner.businessName, phone: owner.phone, storeName },
  });
});

export const trackProductView = asyncHandler(async (req, res) => {
  const result = await Product.findByIdAndUpdate(
    req.params.productId,
    { $inc: { views: 1 } },
    { new: true },
  );

  res.json({ success: true });
});

export const trackProductOrder = asyncHandler(async (req, res) => {
  const result = await Product.findByIdAndUpdate(
    req.params.productId || req.params.id,
    { $inc: { orderCount: 1 } },
    { new: true },
  );

  res.json({ success: true });
});
