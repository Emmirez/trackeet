import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    comparePrice: { type: Number }, // original price for showing discount
    category: { type: String },
    images: [{ type: String }], // Cloudinary URLs
    inStock: { type: Boolean, default: true },
    stockCount: { type: Number, default: null }, // null = unlimited

    // Status flags
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: true },

    // Category-specific fields (flexible)
    attributes: { type: mongoose.Schema.Types.Mixed, default: {} },
    // e.g. { size: ['S','M','L'], color: 'Red', material: 'Cotton' }
    // e.g. { dosage: '500mg', expiryDate: '2026-12', prescription: true }
    // e.g. { duration: '2 hours', stylist: 'Amaka' }
    variants: [
      {
        name: { type: String, required: true }, // e.g. "Color", "Size"
        options: [{ type: String }], // e.g. ["Red", "Blue", "Black"]
      },
    ],

    // WhatsApp commerce
    whatsappOrderable: { type: Boolean, default: true },
    orderCount: { type: Number, default: 0 },
    views: { type: Number, default: 0 },

    tags: [{ type: String }], // for search matching
  },
  { timestamps: true },
);

productSchema.index({ user: 1, isActive: 1 });
productSchema.index({ user: 1, category: 1 });
productSchema.index({ user: 1, isFeatured: 1 });
productSchema.index({ name: "text", description: "text", tags: "text" });

export default mongoose.model("Product", productSchema);
