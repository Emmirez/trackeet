import express from "express";
import {
  getWebhooks,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
} from "../controllers/webhookController.js";
import { protect } from "../middleware/auth.js";

const r = express.Router();
r.use(protect);

r.get("/", getWebhooks);
r.post("/", createWebhook);
r.put("/:id", updateWebhook);
r.delete("/:id", deleteWebhook);
r.post("/:id/test", testWebhook);

export default r;
