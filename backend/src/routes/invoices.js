import express from "express";
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  markPaid,
  sendWhatsApp,
  getInvoicePDF,
  updateDelivery,
  uploadProductPhotos,
  getDeliveries,
} from "../controllers/invoiceController.js";
import { protect } from "../middleware/auth.js";
import { checkInvoiceLimit } from "../middleware/planLimit.js";
import multer from "multer";
const upload = multer({ dest: "uploads/" });

const r = express.Router();
r.use(protect);
r.get("/", getInvoices);
r.post("/", checkInvoiceLimit, createInvoice);
r.get('/deliveries', getDeliveries)
r.get("/:id", getInvoice);
r.put("/:id", updateInvoice);
r.delete("/:id", deleteInvoice);
r.patch("/:id/mark-paid", markPaid);
r.post("/:id/whatsapp", sendWhatsApp);
r.get("/:id/pdf", getInvoicePDF);
r.put("/:id/delivery", upload.single("photo"), updateDelivery);
r.post("/:id/photos", upload.array("photos", 5), uploadProductPhotos);
export default r;
