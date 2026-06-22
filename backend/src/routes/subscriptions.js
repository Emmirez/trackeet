import express from "express";
import {
  getPlans,
  getCurrentSubscription,
  initiateSubscription,
  verifySubscription,
  paystackWebhook,
} from "../controllers/subscriptionController.js";
import { protect } from "../middleware/auth.js";
const r = express.Router();
r.get("/plans", getPlans);
r.post("/webhook", express.raw({ type: "application/json" }), paystackWebhook);
r.use(protect);
r.get("/current", getCurrentSubscription);
r.post("/initiate", initiateSubscription);
r.post("/verify", verifySubscription);

export default r;
