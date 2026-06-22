import express from "express";
import {
  getProfile,
  updateProfile,
  uploadLogo,
  changePassword,
  deleteAccount,
  updateNotificationPrefs,
  uploadBanner,
} from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";


const r = express.Router();
r.use(protect);
r.get("/", getProfile);
r.put("/", updateProfile);
r.post("/logo", upload.single("logo"), uploadLogo);
r.put("/password", changePassword);
r.delete("/delete-account", deleteAccount);
r.put("/notifications", updateNotificationPrefs);
r.post("/upload-banner", upload.single("banner"), uploadBanner);
export default r;
