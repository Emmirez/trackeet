import express from "express";
import { protect } from "../middleware/auth.js";
import {
  createBanner,
  getMyBanners,
  updateBanner,
  deleteBanner,
  getStoreBanners,
} from "../controllers/bannerController.js";

const r = express.Router();

// Public
r.get("/store/:storeName", getStoreBanners);

// Owner
r.use(protect);
r.get("/", getMyBanners);
r.post("/", createBanner);
r.patch("/:id", updateBanner);
r.delete("/:id", deleteBanner);

export default r;
