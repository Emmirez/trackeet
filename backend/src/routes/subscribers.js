import express from "express";
import {
  subscribe,
  unsubscribe,
  getSubscribers,
  sendNewsletter,
  deleteSubscriber,
} from "../controllers/subscriberController.js";
import { protect } from "../middleware/auth.js";

const r = express.Router();

// Public
r.post("/subscribe/:storeName", subscribe);
r.get("/unsubscribe/:token", unsubscribe);

// Owner only
r.get("/", protect, getSubscribers);
r.post("/newsletter", protect, sendNewsletter);
r.delete("/:id", protect, deleteSubscriber);

export default r;
