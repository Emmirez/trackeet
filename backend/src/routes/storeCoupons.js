import express from "express";
import { protect } from "../middleware/auth.js";
import {
  getCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  useCoupon,
} from "../controllers/storeCouponController.js";

const r = express.Router();

// Public routes
r.post("/validate", validateCoupon);
r.post("/use", useCoupon);

// Protected routes
r.use(protect);
r.get("/", getCoupons);
r.post("/", createCoupon);
r.put("/:id", updateCoupon);
r.delete("/:id", deleteCoupon);

export default r;