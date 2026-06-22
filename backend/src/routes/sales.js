import express from "express";
import {
  getSales,
  getSale,
  createSale,
  updateSale,
  deleteSale,
  sendSaleWhatsApp,
} from "../controllers/saleController.js";
import { protect } from "../middleware/auth.js";

const r = express.Router();
r.use(protect);

r.get("/", getSales);
r.post("/", createSale);
r.get("/:id", getSale);
r.put("/:id", updateSale);
r.delete("/:id", deleteSale);
r.post("/:id/whatsapp", sendSaleWhatsApp);

export default r;
