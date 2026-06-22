import express from "express";
import {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification,
  setup2FA,
  verify2FA,
  disable2FA,
  validate2FA,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
const r = express.Router();
r.post("/register", register);
r.post("/login", login);
r.get("/me", protect, getMe);
r.post("/forgot-password", forgotPassword);
r.post("/reset-password", resetPassword);
r.get("/verify-email", verifyEmail);
r.post("/resend-verification", resendVerification);
r.post("/2fa/setup", protect, setup2FA);
r.post("/2fa/verify", protect, verify2FA);
r.post("/2fa/disable", protect, disable2FA);
r.post("/2fa/validate", validate2FA); // public
export default r;
