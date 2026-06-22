import express from "express";
import {
  getApiKeys,
  generateApiKey,
  revokeApiKey,
  deleteApiKey,
} from "../controllers/apiKeyController.js";
import { protect } from "../middleware/auth.js";

const r = express.Router();
r.use(protect);

r.get("/", getApiKeys);
r.post("/", generateApiKey);
r.put("/:id/revoke", revokeApiKey);
r.delete("/:id", deleteApiKey);

export default r;
