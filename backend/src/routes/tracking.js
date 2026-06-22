import express from "express";
import Invoice from "../models/Invoice.js";

const r = express.Router();

r.get("/:invoiceNumber", async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      invoiceNumber: req.params.invoiceNumber.toUpperCase(),
    })
      .populate("customer", "name phone")
      .populate("user", "businessName storeName");

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({
      success: true,
      order: {
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customer?.name,
        totalAmount: invoice.totalAmount,
        amountPaid: invoice.amountPaid,
        status: invoice.status,
        createdAt: invoice.createdAt,
        delivery: invoice.delivery,
        businessName: invoice.user?.businessName,
        storeName: invoice.user?.storeName,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default r;
