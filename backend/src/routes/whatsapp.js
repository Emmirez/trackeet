import express from "express";
import {
  getStatus,
  getQR,
  disconnect,
  getSettings,
  updateSettings,
  getCampaigns,
  createCampaign,
  getLogs,
  deleteCampaign,
  uploadCampaignImage,
  takeOver,
  releaseChat,
} from "../controllers/whatsappController.js";
import { protect } from "../middleware/auth.js";
import multer from "multer";

const r = express.Router();

const upload = multer({ dest: "uploads/" });

r.use(protect);
r.get("/status", getStatus);
r.get("/qr", getQR);
r.post("/disconnect", disconnect);
r.get("/settings", getSettings);
r.put("/settings", updateSettings);
r.get("/campaigns", getCampaigns);
r.post("/campaigns", createCampaign);
r.delete("/campaigns/:id", deleteCampaign);
r.get("/logs", getLogs);
r.post("/campaign-image", upload.single("image"), uploadCampaignImage);
r.post("/takeover", protect, takeOver);
r.post("/release", protect, releaseChat);
export default r;
