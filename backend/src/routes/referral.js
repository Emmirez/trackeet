import express from "express";
import { getReferralStats } from "../controllers/referralController.js";
import { protect } from "../middleware/auth.js";

const r = express.Router();

r.get("/", protect, getReferralStats);

export default r;
