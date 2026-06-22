import express from "express";
import {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  deleteAllRead,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/auth.js";

const r = express.Router();
r.use(protect);
r.get("/", getNotifications);
r.patch("/read-all", markAllRead);
r.delete("/read", deleteAllRead);
r.patch("/:id/read", markRead);
r.delete("/:id", deleteNotification);
export default r;
