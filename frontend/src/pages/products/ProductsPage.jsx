import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  X,
  Search,
  Package,
  Trash2,
  Eye,
  EyeOff,
  Edit3,
  Image as ImageIcon,
  Tag,
  ExternalLink,
  Copy,
  QrCode,
  TrendingUp,
  ShoppingBag,
  Star,
  BarChart3,
} from "lucide-react";
import { productAPI } from "../../services/api.js";
import { fmt } from "../../utils/helpers.js";
import useAuthStore from "../../store/authStore.js";
import toast from "react-hot-toast";
import imageCompression from "browser-image-compression";
import StoreQRModal from "../../components/StoreQRModal.jsx";

function ProductImageCarousel({ images, name }) {
  const [current, setCurrent] = useState(0);
  if (!images?.length) return null;

  return (
    <div className="relative w-full h-full">
      <img
        src={images[current]}
        alt={name}
        className="w-full h-full object-cover transition-all duration-300"
      />

      {images.length > 1 && (
        <>
          {/* Arrows */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((i) => (i === 0 ? images.length - 1 : i - 1));
            }}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-xs font-bold z-10"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrent((i) => (i === images.length - 1 ? 0 : i + 1));
            }}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center text-xs font-bold z-10"
          >
            ›
          </button>

          {/* Dots */}
          <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrent(i);
                }}
                className={`rounded-full transition-all ${i === current ? "w-3 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60"}`}
              />
            ))}
          </div>

          {/* Count badge */}
          <div className="absolute top-1.5 right-1.5 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10">
            {current + 1}/{images.length}
          </div>
        </>
      )}
    </div>
  );
}

//  Category config
const CATEGORY_CONFIG = {
  fashion: {
    productLabel: "Item",
    namePlaceholder: "e.g. Black Sneakers, Red Gown",
    descPlaceholder: "Describe the style, fit, and feel...",
    categoryPlaceholder: "e.g. Shoes, Bags, Dresses",
    tagsPlaceholder: "sneakers, black, casual, unisex",
    stockLabel: "Stock Count",
    priceLabel: "Selling Price (₦)",
    fields: [
      {
        key: "material",
        label: "Material",
        type: "text",
        placeholder: "Cotton, Polyester",
      },
      {
        key: "gender",
        label: "Gender",
        type: "select",
        options: ["Men", "Women", "Kids", "Unisex"],
      },
    ],
    toggles: [
      { key: "inStock", label: "In Stock", desc: "Item is available to order" },
      {
        key: "isFeatured",
        label: "⭐ Featured",
        desc: "Show in featured section",
      },
      {
        key: "isTrending",
        label: "🔥 Trending",
        desc: "Show in trending section",
      },
      {
        key: "isBestSeller",
        label: "🏆 Best Seller",
        desc: "Mark as best seller",
      },
      {
        key: "isNewArrival",
        label: "✨ New Arrival",
        desc: "Show in new arrivals",
      },
      {
        key: "whatsappOrderable",
        label: "💬 WhatsApp",
        desc: "Allow ordering via WhatsApp",
      },
    ],
  },
  food: {
    productLabel: "Meal",
    namePlaceholder: "e.g. Jollof Rice, Peppered Chicken",
    descPlaceholder: "Describe the taste and ingredients...",
    categoryPlaceholder: "e.g. Rice Dishes, Soups, Drinks",
    tagsPlaceholder: "jollof, rice, spicy, chicken",
    stockLabel: "Daily Quantity",
    priceLabel: "Price (₦)",
    fields: [
      {
        key: "portion",
        label: "Portion Size",
        type: "text",
        placeholder: "Small, Medium, Large",
      },
      {
        key: "prepTime",
        label: "Prep Time",
        type: "text",
        placeholder: "15 mins",
      },
      {
        key: "spiceLevel",
        label: "Spice Level",
        type: "select",
        options: ["Mild", "Medium", "Hot", "Extra Hot"],
      },
    ],
    toggles: [
      {
        key: "inStock",
        label: "✅ Available Today",
        desc: "This meal is available today",
      },
      {
        key: "isFeatured",
        label: "👨‍🍳 Chef's Special",
        desc: "Mark as chef's special",
      },
      {
        key: "isBestSeller",
        label: "🔥 Most Ordered",
        desc: "Most ordered meal",
      },
      {
        key: "isNewArrival",
        label: "🆕 New on Menu",
        desc: "Newly added to the menu",
      },
      {
        key: "whatsappOrderable",
        label: "💬 WhatsApp Orders",
        desc: "Allow ordering via WhatsApp",
      },
    ],
  },
  beauty: {
    productLabel: "Service",
    namePlaceholder: "e.g. Full Hair Styling, Gel Nails",
    descPlaceholder: "Describe the service and what's included...",
    categoryPlaceholder: "e.g. Hair, Nails, Makeup, Lashes",
    tagsPlaceholder: "hair, styling, braids, makeup",
    stockLabel: "Slots Available",
    priceLabel: "Service Price (₦)",
    fields: [
      {
        key: "duration",
        label: "Duration",
        type: "text",
        placeholder: "1 hour, 2 hours",
      },
      {
        key: "stylist",
        label: "Stylist/Artist",
        type: "text",
        placeholder: "Amaka, Temi",
      },
      {
        key: "serviceType",
        label: "Service Type",
        type: "text",
        placeholder: "e.g. Treatment",
      },
      { key: "booking", label: "Booking Required", type: "toggle" },
    ],
    toggles: [
      {
        key: "inStock",
        label: "✅ Available",
        desc: "Service is currently available",
      },
      {
        key: "isFeatured",
        label: "⭐ Featured",
        desc: "Show in featured services",
      },
      {
        key: "isBestSeller",
        label: "💅 Most Popular",
        desc: "Most booked service",
      },
      {
        key: "isNewArrival",
        label: "✨ New Service",
        desc: "Newly added service",
      },
      {
        key: "whatsappOrderable",
        label: "💬 WhatsApp Booking",
        desc: "Allow booking via WhatsApp",
      },
    ],
  },
  pharmacy: {
    productLabel: "Product",
    namePlaceholder: "e.g. Paracetamol 500mg, Vitamin C",
    descPlaceholder: "Describe usage and indications...",
    categoryPlaceholder: "e.g. Drugs, Supplements, OTC",
    tagsPlaceholder: "paracetamol, pain relief, fever",
    stockLabel: "Stock Count",
    priceLabel: "Price (₦)",
    fields: [
      {
        key: "dosage",
        label: "Dosage",
        type: "text",
        placeholder: "500mg, 1g",
      },
      {
        key: "manufacturer",
        label: "Manufacturer",
        type: "text",
        placeholder: "Emzor, GSK",
      },
      {
        key: "expiryDate",
        label: "Expiry Date",
        type: "text",
        placeholder: "Dec 2027",
      },
      { key: "prescription", label: "Prescription Required", type: "toggle" },
    ],
    toggles: [
      { key: "inStock", label: "✅ In Stock", desc: "Product is available" },
      {
        key: "isFeatured",
        label: "⭐ Featured",
        desc: "Show in featured products",
      },
      {
        key: "whatsappOrderable",
        label: "💬 WhatsApp Orders",
        desc: "Allow ordering via WhatsApp",
      },
    ],
  },
  electronics: {
    productLabel: "Product",
    namePlaceholder: "e.g. Samsung Galaxy A54, AirPods Pro",
    descPlaceholder: "Describe features and specs...",
    categoryPlaceholder: "e.g. Phones, Laptops, Accessories",
    tagsPlaceholder: "samsung, android, 128gb, black",
    stockLabel: "Stock Count",
    priceLabel: "Selling Price (₦)",
    fields: [
      {
        key: "brand",
        label: "Brand",
        type: "text",
        placeholder: "Samsung, Apple, Infinix",
      },
      {
        key: "model",
        label: "Model",
        type: "text",
        placeholder: "Galaxy A54, iPhone 15",
      },
      {
        key: "warranty",
        label: "Warranty",
        type: "text",
        placeholder: "1 year, 6 months",
      },
    ],
    toggles: [
      { key: "inStock", label: "✅ In Stock", desc: "Product is available" },
      {
        key: "isFeatured",
        label: "⭐ Featured",
        desc: "Show in featured section",
      },
      { key: "isTrending", label: "🔥 Trending", desc: "Currently trending" },
      {
        key: "isBestSeller",
        label: "🏆 Best Seller",
        desc: "Top selling product",
      },
      {
        key: "isNewArrival",
        label: "🆕 New In",
        desc: "Newly arrived product",
      },
      {
        key: "whatsappOrderable",
        label: "💬 WhatsApp",
        desc: "Allow ordering via WhatsApp",
      },
    ],
  },
  pos: {
    productLabel: "Service",
    namePlaceholder: "e.g. POS Withdrawal, Bank Transfer",
    descPlaceholder: "Describe the service and charges...",
    categoryPlaceholder: "e.g. Withdrawal, Transfer, Airtime",
    tagsPlaceholder: "pos, withdrawal, transfer, cash",
    stockLabel: "",
    priceLabel: "Charge/Fee (₦)",
    fields: [
      {
        key: "transactionType",
        label: "Transaction Type",
        type: "text",
        placeholder: "Withdrawal, Transfer",
      },
      {
        key: "commission",
        label: "Commission",
        type: "text",
        placeholder: "1.5%",
      },
    ],
    toggles: [
      {
        key: "inStock",
        label: "✅ Available",
        desc: "Service is currently available",
      },
      {
        key: "isFeatured",
        label: "⭐ Featured",
        desc: "Show in featured section",
      },
      {
        key: "whatsappOrderable",
        label: "💬 WhatsApp",
        desc: "Allow contact via WhatsApp",
      },
    ],
  },
  grocery: {
    productLabel: "Item",
    namePlaceholder: "e.g. Dangote Rice 5kg, Peak Milk",
    descPlaceholder: "Describe the product...",
    categoryPlaceholder: "e.g. Grains, Beverages, Household",
    tagsPlaceholder: "rice, 5kg, dangote, food",
    stockLabel: "Stock Count",
    priceLabel: "Price (₦)",
    fields: [
      {
        key: "unit",
        label: "Unit",
        type: "text",
        placeholder: "kg, litre, pack, carton",
      },
      {
        key: "weight",
        label: "Weight",
        type: "text",
        placeholder: "1kg, 500g, 5kg",
      },
      {
        key: "brand",
        label: "Brand",
        type: "text",
        placeholder: "Dangote, Nestle",
      },
    ],
    toggles: [
      { key: "inStock", label: "✅ In Stock", desc: "Item is available" },
      {
        key: "isFeatured",
        label: "⭐ Featured",
        desc: "Show in featured section",
      },
      {
        key: "isNewArrival",
        label: "🆕 New Stock",
        desc: "Newly restocked item",
      },
      { key: "isBestSeller", label: "🔥 Hot Item", desc: "Fast moving item" },
      {
        key: "whatsappOrderable",
        label: "💬 WhatsApp",
        desc: "Allow ordering via WhatsApp",
      },
    ],
  },
  furniture: {
    productLabel: "Piece",
    namePlaceholder: "e.g. 3-Seater Sofa, King Size Bed",
    descPlaceholder: "Describe the design and quality...",
    categoryPlaceholder: "e.g. Sofas, Beds, Tables, Chairs",
    tagsPlaceholder: "sofa, leather, living room, brown",
    stockLabel: "Units Available",
    priceLabel: "Price (₦)",
    fields: [
      {
        key: "material",
        label: "Material",
        type: "text",
        placeholder: "Wood, Leather, Fabric",
      },
      {
        key: "dimensions",
        label: "Dimensions",
        type: "text",
        placeholder: "120cm x 80cm x 75cm",
      },
      { key: "assembly", label: "Requires Assembly", type: "toggle" },
    ],
    toggles: [
      {
        key: "inStock",
        label: "✅ Available",
        desc: "Item is available for order",
      },
      {
        key: "isFeatured",
        label: "⭐ Featured",
        desc: "Show in featured section",
      },
      {
        key: "isNewArrival",
        label: "✨ New Arrival",
        desc: "Newly added piece",
      },
      {
        key: "whatsappOrderable",
        label: "💬 WhatsApp",
        desc: "Allow enquiry via WhatsApp",
      },
    ],
  },
  home_services: {
    productLabel: "Service",
    namePlaceholder: "e.g. Plumbing Repair, AC Servicing",
    descPlaceholder: "Describe what the service covers...",
    categoryPlaceholder: "e.g. Plumbing, Electrical, Cleaning",
    tagsPlaceholder: "plumbing, repair, pipes, leakage",
    stockLabel: "",
    priceLabel: "Starting Price (₦)",
    fields: [
      {
        key: "duration",
        label: "Estimated Duration",
        type: "text",
        placeholder: "2-3 hours",
      },
      {
        key: "serviceArea",
        label: "Service Area",
        type: "text",
        placeholder: "Ikeja, Lekki, VI",
      },
    ],
    toggles: [
      {
        key: "inStock",
        label: "✅ Available",
        desc: "Service is currently available",
      },
      {
        key: "isFeatured",
        label: "⭐ Featured",
        desc: "Show in featured services",
      },
      {
        key: "isBestSeller",
        label: "🔧 Most Requested",
        desc: "Highly requested service",
      },
      {
        key: "whatsappOrderable",
        label: "💬 WhatsApp",
        desc: "Allow booking via WhatsApp",
      },
    ],
  },
  printing: {
    productLabel: "Service",
    namePlaceholder: "e.g. A4 Flyers, Customised T-Shirt",
    descPlaceholder: "Describe the printing service...",
    categoryPlaceholder: "e.g. Flyers, Banners, T-Shirts",
    tagsPlaceholder: "flyers, A4, glossy, printing",
    stockLabel: "",
    priceLabel: "Price (₦)",
    fields: [
      {
        key: "size",
        label: "Size/Format",
        type: "text",
        placeholder: "A4, A3, Banner, Custom",
      },
      {
        key: "material",
        label: "Material",
        type: "text",
        placeholder: "Glossy, Matte, Canvas",
      },
      {
        key: "turnaround",
        label: "Turnaround",
        type: "text",
        placeholder: "24 hours, 48 hours",
      },
    ],
    toggles: [
      {
        key: "inStock",
        label: "✅ Available",
        desc: "Service is currently available",
      },
      {
        key: "isFeatured",
        label: "⭐ Popular",
        desc: "Show as popular service",
      },
      {
        key: "whatsappOrderable",
        label: "💬 WhatsApp",
        desc: "Accept orders via WhatsApp",
      },
    ],
  },
  freelance: {
    productLabel: "Package",
    namePlaceholder: "e.g. Logo Design, Website Development",
    descPlaceholder: "Describe what's included in this package...",
    categoryPlaceholder: "e.g. Design, Development, Writing",
    tagsPlaceholder: "logo, design, branding, creative",
    stockLabel: "",
    priceLabel: "Package Price (₦)",
    fields: [
      {
        key: "package",
        label: "Package Tier",
        type: "text",
        placeholder: "Basic, Standard, Premium",
      },
      {
        key: "deadline",
        label: "Delivery Time",
        type: "text",
        placeholder: "5 days, 2 weeks",
      },
      {
        key: "revisions",
        label: "Revisions",
        type: "text",
        placeholder: "3 revisions, Unlimited",
      },
      {
        key: "deliverable",
        label: "Deliverables",
        type: "text",
        placeholder: "Source files, PDF, PNG",
      },
    ],
    toggles: [
      {
        key: "inStock",
        label: "✅ Taking Orders",
        desc: "Currently accepting new projects",
      },
      {
        key: "isFeatured",
        label: "⭐ Featured",
        desc: "Show in featured packages",
      },
      {
        key: "isBestSeller",
        label: "💼 Most Popular",
        desc: "Most hired package",
      },
      {
        key: "whatsappOrderable",
        label: "💬 WhatsApp",
        desc: "Allow hiring via WhatsApp",
      },
    ],
  },
  general: {
    productLabel: "Product",
    namePlaceholder: "e.g. Product Name",
    descPlaceholder: "Describe your product...",
    categoryPlaceholder: "e.g. Category 1, Category 2",
    tagsPlaceholder: "tag1, tag2, tag3",
    stockLabel: "Stock Count",
    priceLabel: "Price (₦)",
    fields: [],
    toggles: [
      { key: "inStock", label: "✅ In Stock", desc: "Product is available" },
      {
        key: "isFeatured",
        label: "⭐ Featured",
        desc: "Show in featured section",
      },
      {
        key: "isTrending",
        label: "🔥 Trending",
        desc: "Show in trending section",
      },
      {
        key: "isBestSeller",
        label: "🏆 Best Seller",
        desc: "Mark as best seller",
      },
      {
        key: "isNewArrival",
        label: "✨ New Arrival",
        desc: "Show in new arrivals",
      },
      {
        key: "whatsappOrderable",
        label: "💬 WhatsApp",
        desc: "Allow ordering via WhatsApp",
      },
    ],
  },
};

const VARIANT_CATEGORIES = [
  "fashion",
  "electronics",
  "furniture",
  "grocery",
  "general",
  "printing",
];

const DEFAULT_FORM = {
  name: "",
  description: "",
  price: "",
  comparePrice: "",
  category: "",
  stockCount: "",
  inStock: true,
  isFeatured: false,
  isTrending: false,
  isBestSeller: false,
  isNewArrival: true,
  whatsappOrderable: true,
  tags: "",
  attributes: {},
  variants: [],
};

function VariantOptionInput({ onAdd, variantName }) {
  const [value, setValue] = useState("");

  const getPlaceholder = () => {
    const n = variantName?.toLowerCase() || "";
    if (n.includes("size")) return "e.g. XL";
    if (n.includes("color") || n.includes("colour")) return "e.g. Black";
    if (n.includes("material")) return "e.g. Polyester";
    if (n.includes("weight")) return "e.g. 1kg";
    if (n.includes("storage")) return "e.g. 128GB";
    if (n.includes("gender")) return "e.g. Unisex";
    return "Add option";
  };

  return (
    <div className="flex items-center gap-1">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            onAdd(value);
            setValue("");
          }
        }}
        placeholder={getPlaceholder()}
        className="input py-1 px-2 text-xs w-32"
      />

      <button
        onClick={() => {
          onAdd(value);
          setValue("");
        }}
        className="text-xs font-bold text-white bg-primary px-2 py-1 rounded-lg"
      >
        + Add
      </button>
    </div>
  );
}

export default function ProductsPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const fileRef = useRef(null);
  const category = user?.businessCategory || "general";
  const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.general;
  const fields = config.fields || [];
  const toggles = config.toggles || [];
  const storeName = user?.storeName;

  const [showAdd, setShowAdd] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [form, setForm] = useState(DEFAULT_FORM);
  const [images, setImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);

  const [showQR, setShowQR] = useState(false);

  const [activeTab, setActiveTab] = useState("products");

  const { data, isLoading } = useQuery({
    queryKey: ["products", search, filterCat, filterStatus],
    queryFn: () =>
      productAPI
        .getAll({ search, category: filterCat, status: filterStatus })
        .then((r) => r.data),
    refetchInterval: activeTab === "analytics" ? 10000 : false,
  });

  const { data: allData } = useQuery({
    queryKey: ["products-all"],
    queryFn: () => productAPI.getAll({}).then((r) => r.data),
  });

  const { mutate: createProduct, isPending: creating } = useMutation({
    mutationFn: productAPI.create,
    onSuccess: async (res) => {
      if (imageFiles.length > 0) {
        const fd = new FormData();
        imageFiles.forEach((f) => fd.append("images", f));
        await productAPI.uploadImages(res.data.product._id, fd);
      }
      toast.success(`${config.productLabel} added!`);
      qc.invalidateQueries(["products"]);
      qc.invalidateQueries(["products-all"]);
      qc.invalidateQueries(["storefront", storeName]);
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const { mutate: updateProduct, isPending: updating } = useMutation({
    mutationFn: ({ id, data }) => productAPI.update(id, data),
    onSuccess: async (res, { id }) => {
      // Upload any new images added during edit
      if (imageFiles.length > 0) {
        try {
          const fd = new FormData();
          imageFiles.forEach((f) => fd.append("images", f));
          await productAPI.uploadImages(id, fd);
        } catch {
          toast.error("Product updated but new images failed to upload.");
        }
      }

      // Remove images that were deleted during edit
      if (editProduct) {
        const removedImages =
          editProduct.images?.filter((img) => !images.includes(img)) || [];
        for (const imageUrl of removedImages) {
          try {
            await productAPI.removeImage(id, { imageUrl });
          } catch {}
        }
      }

      toast.success(`${config.productLabel} updated!`);
      qc.invalidateQueries(["products"]);
      qc.invalidateQueries(["products-all"]);
      qc.invalidateQueries(["storefront", storeName]);
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const { mutate: deleteProduct } = useMutation({
    mutationFn: productAPI.delete,
    onSuccess: () => {
      toast.success("Deleted!");
      qc.invalidateQueries(["products"]);
      qc.invalidateQueries(["products-all"]);
      qc.invalidateQueries(["storefront", storeName]);
    },
  });

  const { mutate: toggleProduct } = useMutation({
    mutationFn: productAPI.toggle,
    onSuccess: () => qc.invalidateQueries(["products"]),
  });

  const resetForm = () => {
    setShowAdd(false);
    setEditProduct(null);
    setForm(DEFAULT_FORM);
    setImages([]);
    setImageFiles([]);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      comparePrice: p.comparePrice || "",
      category: p.category || "",
      stockCount: p.stockCount || "",
      inStock: p.inStock,
      isFeatured: p.isFeatured,
      isTrending: p.isTrending,
      isBestSeller: p.isBestSeller,
      isNewArrival: p.isNewArrival,
      whatsappOrderable: p.whatsappOrderable,
      tags: (p.tags || []).join(", "),
      attributes: p.attributes || {},
      variants: p.variants || [],
    });
    setImages(p.images || []);
    setShowAdd(true);
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) return toast.error("Max 5 images");

    const options = {
      maxSizeMB: 0.5, // compress to max 500KB
      maxWidthOrHeight: 1200, // resize to max 1200px
      useWebWorker: true,
    };

    toast.loading("Compressing images...", { id: "compress" });

    try {
      const compressed = await Promise.all(
        files.map((f) => imageCompression(f, options)),
      );

      // Show previews
      compressed.forEach((f) => {
        const reader = new FileReader();
        reader.onload = (ev) =>
          setImages((prev) => [...prev, ev.target.result]);
        reader.readAsDataURL(f);
      });

      setImageFiles((prev) => [...prev, ...compressed]);
      toast.success(
        `${compressed.length} image${compressed.length > 1 ? "s" : ""} ready`,
        { id: "compress" },
      );
    } catch (err) {
      toast.error("Failed to compress images", { id: "compress" });
    }
  };

  const handleSubmit = () => {
    if (!form.name.trim())
      return toast.error(`${config.productLabel} name required`);
    if (!form.price || parseFloat(form.price) < 0)
      return toast.error("Valid price required");
    const data = {
      ...form,
      price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      stockCount: form.stockCount ? parseInt(form.stockCount) : null,
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      variants: form.variants.filter(
        (v) => v.name.trim() && v.options.length > 0,
      ),
    };
    editProduct
      ? updateProduct({ id: editProduct._id, data })
      : createProduct(data);
  };

  const setAttr = (key, val) =>
    setForm((f) => ({ ...f, attributes: { ...f.attributes, [key]: val } }));

  const products = data?.products || [];
  const categories = [
    ...new Set(
      (allData?.products || []).map((p) => p.category).filter(Boolean),
    ),
  ];
  const productLimit =
    user?.plan === "free" ? 10 : user?.plan === "starter" ? 50 : Infinity;
  const isAtLimit = products.length >= productLimit;
  const isNearLimit = products.length >= productLimit - 2;
  const storeUrl = `${window.location.origin}/store/${storeName}`;

  const mostViewed = [...products]
    .sort((a, b) => (b.views || 0) - (a.views || 0))
    .slice(0, 5);
  const mostOrdered = [...products]
    .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0))
    .slice(0, 5);
  const totalViews = products.reduce((s, p) => s + (p.views || 0), 0);
  const totalOrders = products.reduce((s, p) => s + (p.orderCount || 0), 0);
  const maxViews = mostViewed[0]?.views || 1;
  const maxOrders = mostOrdered[0]?.orderCount || 1;

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="text-xs text-dark-400">Manage your store catalogue</p>
        </div>
        <button
          onClick={() => {
            if (isAtLimit && user?.plan === "free") {
              toast.error(`Upgrade to add more than ${productLimit} products`);
              return;
            }
            setShowAdd(true);
          }}
          className={`btn btn-sm ${isAtLimit && user?.plan === "free" ? "btn-secondary opacity-60" : "btn-primary"}`}
        >
          <Plus size={16} /> Add {config.productLabel}
        </button>
      </div>
      {storeName && (
        <div className="card bg-gradient-to-r from-primary/10 to-purple-50 dark:from-primary/20 dark:to-purple-900/10 border border-primary/20">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
              <ExternalLink size={18} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-dark dark:text-white">
                Your Storefront
              </p>
              <p className="text-xs text-dark-400 truncate">{storeUrl}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(storeUrl);
                toast.success("Copied!");
              }}
              className="btn btn-ghost btn-sm border border-dark-200 dark:border-gray-700"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={() => setShowQR(true)}
              className="btn btn-ghost btn-sm border border-dark-200 dark:border-gray-700"
            >
              <QrCode size={14} />
            </button>

            <a
              href={`/store/${storeName}`}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary btn-sm flex-1 justify-center"
            >
              <ExternalLink size={14} /> View Store
            </a>
          </div>
        </div>
      )}

      {/* Plan limit banner */}
      {user?.plan === "free" && isNearLimit && (
        <div
          className={`card border ${isAtLimit ? "border-danger/30 bg-danger-light/20" : "border-warning/30 bg-warning-light/20"}`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">{isAtLimit ? "🚫" : "⚠️"}</span>
            <div className="flex-1">
              <p
                className={`text-sm font-bold ${isAtLimit ? "text-danger" : "text-warning"}`}
              >
                {isAtLimit
                  ? `You've reached the ${productLimit} product limit`
                  : `${productLimit - products.length} product slot${productLimit - products.length === 1 ? "" : "s"} remaining`}
              </p>
              <p className="text-xs text-dark-400 mt-0.5">
                Upgrade to Starter for 50 products or Business for unlimited
              </p>
            </div>

            <a
              href="/dashboard/subscription"
              className="btn btn-primary btn-sm flex-shrink-0"
            >
              Upgrade
            </a>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: `Total`, value: products.length, color: "text-primary" },
          {
            label: "Active",
            value: products.filter((p) => p.isActive).length,
            color: "text-success",
          },
          {
            label: "Featured",
            value: products.filter((p) => p.isFeatured).length,
            color: "text-warning",
          },
        ].map((s, i) => (
          <div key={i} className="card py-3 text-center">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-dark-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { key: "products", label: "Products", icon: Package },
          { key: "analytics", label: "Analytics", icon: BarChart3 },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.key
                ? "bg-white dark:bg-surface text-dark dark:text-white shadow-sm"
                : "text-dark-400"
            }`}
          >
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === "products" && (
        <div className="space-y-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${config.productLabel.toLowerCase()}s...`}
              className="input pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["", "active", "inactive"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`btn btn-sm flex-shrink-0 capitalize ${filterStatus === s ? "btn-primary" : "btn-ghost border border-dark-200 dark:border-gray-700"}`}
              >
                {s === "" ? "All" : s}
              </button>
            ))}
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setFilterCat(filterCat === c ? "" : c)}
                className={`btn btn-sm flex-shrink-0 ${filterCat === c ? "btn-primary" : "btn-ghost border border-dark-200 dark:border-gray-700"}`}
              >
                {c}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-48 rounded-2xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="card empty-state py-12">
              <Package size={48} className="text-dark-200" />
              <p className="font-semibold text-dark dark:text-white">
                No {config.productLabel.toLowerCase()}s yet
              </p>
              <p className="text-xs text-dark-400">
                Add your first {config.productLabel.toLowerCase()} to start
                selling
              </p>
              <button
                onClick={() => setShowAdd(true)}
                className="btn btn-primary btn-sm mt-2"
              >
                <Plus size={14} /> Add {config.productLabel}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {products.map((p) => (
                <div key={p._id} className="card p-0 overflow-hidden group">
                  <div className="relative aspect-square bg-gray-50 dark:bg-gray-800">
                    {p.images?.length > 0 ? (
                      <ProductImageCarousel images={p.images} name={p.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={32} className="text-dark-200" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {p.isFeatured && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-warning-light text-warning">
                          ⭐
                        </span>
                      )}
                      {p.isTrending && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary-light text-primary">
                          🔥
                        </span>
                      )}
                      {p.isBestSeller && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-success-light text-success">
                          🏆
                        </span>
                      )}
                    </div>
                    {!p.isActive && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white text-xs font-bold bg-black/60 px-2 py-1 rounded-full">
                          Inactive
                        </span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(p)}
                        className="w-7 h-7 bg-white dark:bg-surface rounded-lg flex items-center justify-center shadow-sm hover:bg-primary hover:text-white transition-colors"
                      >
                        <Edit3 size={12} />
                      </button>
                      <button
                        onClick={() => toggleProduct(p._id)}
                        className="w-7 h-7 bg-white dark:bg-surface rounded-lg flex items-center justify-center shadow-sm hover:bg-warning hover:text-white transition-colors"
                      >
                        {p.isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button
                        onClick={() =>
                          toast(
                            (t) => (
                              <div className="flex flex-col gap-2">
                                <p className="text-sm font-semibold">
                                  Delete {p.name}?
                                </p>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => {
                                      deleteProduct(p._id);
                                      toast.dismiss(t.id);
                                    }}
                                    className="px-3 py-1 bg-danger text-white text-xs font-bold rounded-lg"
                                  >
                                    Delete
                                  </button>
                                  <button
                                    onClick={() => toast.dismiss(t.id)}
                                    className="px-3 py-1 bg-gray-100 text-xs font-bold rounded-lg"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ),
                            { duration: 5000 },
                          )
                        }
                        className="w-7 h-7 bg-white dark:bg-surface rounded-lg flex items-center justify-center shadow-sm hover:bg-danger hover:text-white transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-bold text-dark dark:text-white truncate">
                      {p.name}
                    </p>
                    {p.stockCount !== null && (
                      <p className="text-xs text-dark-400 mt-0.5">
                        Stock:{" "}
                        <span
                          className={`font-bold ${p.stockCount <= 5 ? "text-danger" : "text-success"}`}
                        >
                          {p.stockCount}
                        </span>
                      </p>
                    )}
                    {p.category && (
                      <p className="text-xs text-dark-400">{p.category}</p>
                    )}
                    <div className="flex items-center justify-between mt-1.5">
                      <div>
                        <p className="text-sm font-black text-primary">
                          {fmt.naira(p.price)}
                        </p>
                        {p.comparePrice > p.price && (
                          <p className="text-xs text-dark-400 line-through">
                            {fmt.naira(p.comparePrice)}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.inStock ? "bg-success-light text-success" : "bg-danger-light text-danger"}`}
                      >
                        {p.inStock ? "✓" : "Out"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/*  ANALYTICS TAB  */}
      {activeTab === "analytics" && (
        <div className="space-y-5">
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card text-center py-4">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center mx-auto mb-2">
                <Eye size={18} className="text-primary" />
              </div>
              <p className="text-2xl font-black text-primary">{totalViews}</p>
              <p className="text-xs text-dark-400 mt-0.5">Total Views</p>
            </div>
            <div className="card text-center py-4">
              <div className="w-10 h-10 bg-success-light rounded-xl flex items-center justify-center mx-auto mb-2">
                <ShoppingBag size={18} className="text-success" />
              </div>
              <p className="text-2xl font-black text-success">{totalOrders}</p>
              <p className="text-xs text-dark-400 mt-0.5">
                {["beauty", "home_services", "freelance", "printing"].includes(
                  category,
                )
                  ? "WhatsApp Bookings"
                  : category === "pos"
                    ? "Service Requests"
                    : "WhatsApp Orders"}
              </p>
            </div>
          </div>

          {/* Most Viewed */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary-light rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-primary" />
              </div>
              <h2 className="font-bold text-dark dark:text-white">
                Most Viewed
              </h2>
            </div>
            {mostViewed.every((p) => !p.views) ? (
              <p className="text-sm text-dark-400 text-center py-4">
                No views yet — share your store link to get started!
              </p>
            ) : (
              <div className="space-y-3">
                {mostViewed.map((p, i) => (
                  <div key={p._id} className="flex items-center gap-3">
                    <span
                      className={`text-sm font-black w-5 text-center ${i === 0 ? "text-warning" : "text-dark-400"}`}
                    >
                      {i + 1}
                    </span>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-dark-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark dark:text-white truncate">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-primary h-1.5 rounded-full transition-all"
                            style={{
                              width: `${Math.max(4, ((p.views || 0) / maxViews) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-dark-400 flex-shrink-0">
                          {p.views || 0} views
                        </span>
                      </div>
                    </div>
                    {i === 0 && <span className="text-lg">👑</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Most Ordered */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-success-light rounded-lg flex items-center justify-center">
                <ShoppingBag size={16} className="text-success" />
              </div>
              <h2 className="font-bold text-dark dark:text-white">
                Most Ordered via WhatsApp
              </h2>
            </div>
            {mostOrdered.every((p) => !p.orderCount) ? (
              <p className="text-sm text-dark-400 text-center py-4">
                No orders tracked yet — orders are tracked when customers tap
                WhatsApp.
              </p>
            ) : (
              <div className="space-y-3">
                {mostOrdered.map((p, i) => (
                  <div key={p._id} className="flex items-center gap-3">
                    <span
                      className={`text-sm font-black w-5 text-center ${i === 0 ? "text-success" : "text-dark-400"}`}
                    >
                      {i + 1}
                    </span>
                    <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package size={16} className="text-dark-200" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark dark:text-white truncate">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-success h-1.5 rounded-full transition-all"
                            style={{
                              width: `${Math.max(4, ((p.orderCount || 0) / maxOrders) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-dark-400 flex-shrink-0">
                          {p.orderCount || 0} orders
                        </span>
                      </div>
                    </div>
                    {i === 0 && <span className="text-lg">🏆</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Low stock alert */}
          {products.filter(
            (p) => p.stockCount !== null && p.stockCount <= 3 && p.isActive,
          ).length > 0 && (
            <div className="card border border-danger/20 bg-danger-light/10">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">⚠️</span>
                <h2 className="font-bold text-danger">Low Stock Alert</h2>
              </div>
              <div className="space-y-2">
                {products
                  .filter(
                    (p) =>
                      p.stockCount !== null && p.stockCount <= 3 && p.isActive,
                  )
                  .map((p) => (
                    <div
                      key={p._id}
                      className="flex items-center justify-between"
                    >
                      <p className="text-sm text-dark dark:text-white truncate flex-1">
                        {p.name}
                      </p>
                      <span className="text-xs font-bold text-danger bg-danger-light px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                        {p.stockCount} left
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Catalogue summary */}
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-warning-light rounded-lg flex items-center justify-center">
                <Star size={16} className="text-warning" />
              </div>
              <h2 className="font-bold text-dark dark:text-white">
                Catalogue Summary
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(category === "food"
                ? [
                    {
                      label: "Chef's Special",
                      value: products.filter((p) => p.isFeatured).length,
                      emoji: "👨‍🍳",
                      color: "text-warning",
                    },
                    {
                      label: "Most Ordered",
                      value: products.filter((p) => p.isBestSeller).length,
                      emoji: "🔥",
                      color: "text-primary",
                    },
                    {
                      label: "New on Menu",
                      value: products.filter((p) => p.isNewArrival).length,
                      emoji: "🆕",
                      color: "text-success",
                    },
                    {
                      label: "Available",
                      value: products.filter((p) => p.inStock).length,
                      emoji: "✅",
                      color: "text-purple-500",
                    },
                  ]
                : category === "beauty" || category === "home_services"
                  ? [
                      {
                        label: "Featured",
                        value: products.filter((p) => p.isFeatured).length,
                        emoji: "⭐",
                        color: "text-warning",
                      },
                      {
                        label: "Most Popular",
                        value: products.filter((p) => p.isBestSeller).length,
                        emoji: "💅",
                        color: "text-primary",
                      },
                      {
                        label: "New Service",
                        value: products.filter((p) => p.isNewArrival).length,
                        emoji: "✨",
                        color: "text-success",
                      },
                      {
                        label: "Available",
                        value: products.filter((p) => p.inStock).length,
                        emoji: "✅",
                        color: "text-purple-500",
                      },
                    ]
                  : category === "freelance"
                    ? [
                        {
                          label: "Featured",
                          value: products.filter((p) => p.isFeatured).length,
                          emoji: "⭐",
                          color: "text-warning",
                        },
                        {
                          label: "Most Popular",
                          value: products.filter((p) => p.isBestSeller).length,
                          emoji: "💼",
                          color: "text-primary",
                        },
                        {
                          label: "Active",
                          value: products.filter((p) => p.inStock).length,
                          emoji: "✅",
                          color: "text-success",
                        },
                        {
                          label: "Total",
                          value: products.length,
                          emoji: "📦",
                          color: "text-purple-500",
                        },
                      ]
                    : [
                        {
                          label: "Featured",
                          value: products.filter((p) => p.isFeatured).length,
                          emoji: "⭐",
                          color: "text-warning",
                        },
                        {
                          label: "Trending",
                          value: products.filter((p) => p.isTrending).length,
                          emoji: "🔥",
                          color: "text-primary",
                        },
                        {
                          label: "Best Seller",
                          value: products.filter((p) => p.isBestSeller).length,
                          emoji: "🏆",
                          color: "text-success",
                        },
                        {
                          label: "New Arrival",
                          value: products.filter((p) => p.isNewArrival).length,
                          emoji: "✨",
                          color: "text-purple-500",
                        },
                      ]
              ).map((s, i) => (
                <div
                  key={i}
                  className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center"
                >
                  <p className="text-xl">{s.emoji}</p>
                  <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-dark-400">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-surface z-10">
              <h3 className="font-bold text-dark dark:text-white">
                {editProduct
                  ? `Edit ${config.productLabel}`
                  : `Add ${config.productLabel}`}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Images */}
              <div>
                <label className="label">
                  Photos{" "}
                  <span className="text-dark-400 font-normal">(max 5)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative aspect-square">
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button
                        onClick={() => {
                          setImages((p) => p.filter((_, idx) => idx !== i));
                          setImageFiles((p) => p.filter((_, idx) => idx !== i));
                        }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                  {images.length < 5 && (
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="aspect-square border-2 border-dashed border-dark-200 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center hover:border-primary transition-colors"
                    >
                      <ImageIcon size={18} className="text-dark-400" />
                      <span className="text-xs text-dark-400 mt-1">Add</span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              <div>
                <label className="label">{config.productLabel} Name *</label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder={config.namePlaceholder}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                  placeholder={config.descPlaceholder}
                  className="input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{config.priceLabel} *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, price: e.target.value }))
                    }
                    placeholder="0.00"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Original Price (₦)</label>
                  <input
                    type="number"
                    value={form.comparePrice}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, comparePrice: e.target.value }))
                    }
                    placeholder="For discount"
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Category</label>
                  <input
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    placeholder={config.categoryPlaceholder}
                    className="input"
                  />
                </div>
                {config.stockLabel && (
                  <div>
                    <label className="label">{config.stockLabel}</label>
                    <input
                      type="number"
                      value={form.stockCount}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, stockCount: e.target.value }))
                      }
                      placeholder="Empty = unlimited"
                      className="input"
                    />
                  </div>
                )}
              </div>

              {/* Category-specific fields */}
              {fields.length > 0 && (
                <div className="space-y-3 border-t border-dark-100 dark:border-gray-700 pt-3">
                  <p className="text-xs font-bold text-dark-400 uppercase tracking-wide">
                    Details
                  </p>
                  {fields.map((field) => (
                    <div key={field.key}>
                      <label className="label">{field.label}</label>
                      {(field.type === "text" || field.type === "tags") && (
                        <input
                          value={form.attributes[field.key] || ""}
                          onChange={(e) => setAttr(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="input"
                        />
                      )}
                      {field.type === "select" && (
                        <div className="flex gap-2 flex-wrap">
                          {field.options.map((opt) => (
                            <button
                              key={opt}
                              onClick={() => setAttr(field.key, opt)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all ${
                                form.attributes[field.key] === opt
                                  ? "bg-primary-light border-primary text-primary"
                                  : "border-dark-200 dark:border-gray-600 text-dark-400"
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                      {field.type === "toggle" && (
                        <button
                          onClick={() =>
                            setAttr(field.key, !form.attributes[field.key])
                          }
                          className={`w-12 h-6 rounded-full transition-all relative ${form.attributes[field.key] ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
                        >
                          <div
                            className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${form.attributes[field.key] ? "left-6" : "left-0.5"}`}
                          />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Variants — product categories only */}
              {VARIANT_CATEGORIES.includes(category) && (
                <div className="border-t border-dark-100 dark:border-gray-700 pt-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-dark-400 uppercase tracking-wide">
                      Variants
                    </p>
                    <button
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          variants: [...f.variants, { name: "", options: [] }],
                        }))
                      }
                      className="btn btn-secondary btn-sm"
                    >
                      <Plus size={13} /> Add Variant
                    </button>
                  </div>
                  <p className="text-xs text-dark-400">
                    e.g. Size: S, M, L, XL — Color: Red, Blue, Black
                  </p>
                  {form.variants.map((variant, vi) => (
                    <div
                      key={vi}
                      className="p-3 bg-gray-50 dark:bg-dark rounded-xl space-y-2"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          value={variant.name}
                          onChange={(e) => {
                            const updated = [...form.variants];
                            updated[vi] = {
                              ...updated[vi],
                              name: e.target.value,
                            };
                            setForm((f) => ({ ...f, variants: updated }));
                          }}
                          placeholder={
                            vi === 0
                              ? "e.g. Size"
                              : vi === 1
                                ? "e.g. Color"
                                : "e.g. Material"
                          }
                          className="input flex-1 py-2 text-sm"
                        />
                        <button
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              variants: f.variants.filter((_, i) => i !== vi),
                            }))
                          }
                          className="btn btn-ghost p-1.5 hover:text-danger flex-shrink-0"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      {/* Options */}
                      <div className="flex flex-wrap gap-2">
                        {variant.options.map((opt, oi) => (
                          <div
                            key={oi}
                            className="flex items-center gap-1 bg-white dark:bg-surface border border-dark-200 dark:border-gray-600 rounded-xl px-2.5 py-1"
                          >
                            <span className="text-xs font-semibold text-dark dark:text-white">
                              {opt}
                            </span>
                            <button
                              onClick={() => {
                                const updated = [...form.variants];
                                updated[vi] = {
                                  ...updated[vi],
                                  options: updated[vi].options.filter(
                                    (_, i) => i !== oi,
                                  ),
                                };
                                setForm((f) => ({ ...f, variants: updated }));
                              }}
                              className="text-dark-400 hover:text-danger transition-colors"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                        <VariantOptionInput
                          variantName={variant.name}
                          onAdd={(opt) => {
                            if (!opt.trim()) return;
                            const updated = [...form.variants];
                            updated[vi] = {
                              ...updated[vi],
                              options: [...updated[vi].options, opt.trim()],
                            };
                            setForm((f) => ({ ...f, variants: updated }));
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  {form.variants.length === 0 && (
                    <p className="text-xs text-dark-400 text-center py-2">
                      No variants added yet
                    </p>
                  )}
                </div>
              )}

              {/* Tags */}
              <div>
                <label className="label flex items-center gap-1">
                  <Tag size={13} /> Tags
                </label>
                <input
                  value={form.tags}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, tags: e.target.value }))
                  }
                  placeholder={config.tagsPlaceholder}
                  className="input"
                />
                <p className="text-xs text-dark-400 mt-1">
                  Tags help customers find you via WhatsApp
                </p>
              </div>

              {/* Category-specific visibility toggles */}
              <div className="border-t border-dark-100 dark:border-gray-700 pt-3 space-y-3">
                <p className="text-xs font-bold text-dark-400 uppercase tracking-wide">
                  Visibility
                </p>
                {toggles.map((toggle) => (
                  <div
                    key={toggle.key}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-semibold text-dark dark:text-white">
                        {toggle.label}
                      </p>
                      <p className="text-xs text-dark-400">{toggle.desc}</p>
                    </div>
                    <button
                      onClick={() =>
                        setForm((f) => ({ ...f, [toggle.key]: !f[toggle.key] }))
                      }
                      className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${form[toggle.key] ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${form[toggle.key] ? "left-6" : "left-0.5"}`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={creating || updating}
                className="btn btn-primary w-full py-3"
              >
                {creating || updating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Package size={16} />{" "}
                    {editProduct
                      ? `Update ${config.productLabel}`
                      : `Add ${config.productLabel}`}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {showQR && (
        <StoreQRModal
          storeName={storeName}
          businessName={user?.businessName}
          onClose={() => setShowQR(false)}
        />
      )}
    </div>
  );
}
