import express from "express";
import multer from "multer";
import { protect } from "../middleware/auth.js";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  removeProductImage,
  toggleProductStatus,
  getStorefront,
  getStoreProduct,
  trackProductOrder,
  trackProductView,
} from "../controllers/productController.js";

const r = express.Router();
const upload = multer({ dest: "uploads/" });

// Public storefront routes (no auth)
r.get("/store/:storeName", getStorefront);
r.get("/store/:storeName/:productId", getStoreProduct);
r.post("/store/track/:productId", trackProductOrder);
r.post("/store/view/:productId", trackProductView);

// Protected dashboard routes
r.use(protect);
r.get("/", getProducts);
r.get("/:id", getProduct);
r.post("/", createProduct);
r.put("/:id", updateProduct);
r.delete("/:id", deleteProduct);
r.post("/:id/images", upload.array("images", 5), uploadProductImages);
r.delete("/:id/images", removeProductImage);
r.patch("/:id/toggle", toggleProductStatus);

export default r;
