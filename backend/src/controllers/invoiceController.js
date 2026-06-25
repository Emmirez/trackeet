import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import { generateInvoiceNumber } from "../utils/generateInvoiceNumber.js";
import { createNotification } from "../utils/createNotification.js";
import { sendWhatsAppMessage } from "../services/whatsappService.js";
import { generateInvoicePDF } from "../services/pdfService.js";
import WhatsAppSettings from "../models/WhatsAppSettings.js";
import User from "../models/User.js";
import { logActivity } from "../utils/activityLogger.js";
import { triggerWebhook } from "../services/webhookService.js";
import { uploadImage } from "../config/cloudinary.js";
import multer from "multer";
import dayjs from "dayjs";

const PLAN_LIMITS = {
  free: { invoices: 5 },
  starter: { invoices: 50 },
  business: { invoices: 500 },
  enterprise: { invoices: Infinity },
};

// Update delivery status
export const updateDelivery = asyncHandler(async (req, res) => {
  const { status, address, estimatedDate, notes, shippedNote, deliveredNote } =
    req.body;
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("customer", "name phone email");
  if (!invoice) throw new AppError("Invoice not found", 404);
  if (!invoice.delivery?.enabled)
    throw new AppError("Delivery not enabled for this invoice", 400);

  // Upload photo if provided
  let photoUrl = null;
  if (req.file) {
    photoUrl = await uploadImage(req.file.path, "trackeet/delivery");
  }

  // Update delivery fields
  if (address) invoice.delivery.address = address;
  if (estimatedDate) invoice.delivery.estimatedDate = new Date(estimatedDate);
  if (notes) invoice.delivery.notes = notes;

  if (status === "shipped") {
    invoice.delivery.status = "shipped";
    invoice.delivery.shippedAt = new Date();
    if (shippedNote) invoice.delivery.shippedNote = shippedNote;
    if (photoUrl) invoice.delivery.shippedPhoto = photoUrl;
  } else if (status === "delivered") {
    invoice.delivery.status = "delivered";
    invoice.delivery.deliveredAt = new Date();
    if (deliveredNote) invoice.delivery.deliveredNote = deliveredNote;
    if (photoUrl) invoice.delivery.deliveredPhoto = photoUrl;
  }

  await invoice.save({ validateBeforeSave: false });

  // Send WhatsApp notification
  try {
    const waSettings = await WhatsAppSettings.findOne({ user: req.user._id });
    if (waSettings?.connected) {
      const owner = await User.findById(req.user._id).select("businessName");
      const bizName = owner?.businessName || "Trackeet";
      const fmt = (n) => "₦" + (n || 0).toLocaleString("en-NG");

      let msg = "";
      if (status === "shipped") {
        msg =
          `Hello ${invoice.customer.name} 👋\n\n` +
          `📦 Your order has been *SHIPPED!*\n\n` +
          `🧾 *Invoice:* ${invoice.invoiceNumber}\n` +
          `💰 *Amount:* ${fmt(invoice.totalAmount)}\n` +
          (invoice.delivery.estimatedDate
            ? `📅 *Est. Delivery:* ${dayjs(invoice.delivery.estimatedDate).format("D MMM YYYY")}\n`
            : "") +
          (shippedNote ? `📝 *Note:* ${shippedNote}\n` : "") +
          `\nWe'll notify you when it's delivered! 🚚\n\n_${bizName}_`;
      } else if (status === "delivered") {
        msg =
          `Hello ${invoice.customer.name} 👋\n\n` +
          `✅ Your order has been *DELIVERED!*\n\n` +
          `🧾 *Invoice:* ${invoice.invoiceNumber}\n` +
          `💰 *Amount:* ${fmt(invoice.totalAmount)}\n` +
          (deliveredNote ? `📝 *Note:* ${deliveredNote}\n` : "") +
          `\nThank you for your business! 🙏\n\n_${bizName}_`;
      }

      if (msg) {
        const { sendRawWhatsAppMessage, sendWhatsAppImage } =
          await import("../services/whatsappService.js");

        // Send delivery photo with message as caption if photo exists
        if (photoUrl) {
          await sendWhatsAppImage(
            req.user._id.toString(),
            invoice.customer.phone,
            photoUrl,
            msg,
          );
        } else {
          await sendRawWhatsAppMessage(
            req.user._id.toString(),
            invoice.customer.phone,
            msg,
          );
        }
      }
    }
  } catch (err) {
    console.error("Delivery WhatsApp failed:", err.message);
  }

  res.json({ success: true, invoice });
});

// Upload product photos
export const uploadProductPhotos = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!invoice) throw new AppError("Invoice not found", 404);
  if (!req.files?.length) throw new AppError("No photos uploaded", 400);

  const urls = await Promise.all(
    req.files.map((f) => uploadImage(f.path, "trackeet/products")),
  );

  invoice.productPhotos = [...(invoice.productPhotos || []), ...urls];
  await invoice.save({ validateBeforeSave: false });

  res.json({ success: true, productPhotos: invoice.productPhotos });
});

export const getInvoices = asyncHandler(async (req, res) => {
  const { status, search, month, year, page = 1, limit = 50 } = req.query;
  const query = { user: req.user._id };
  if (status) query.status = status;

  // Filter by month/year
  if (month && year) {
    const start = dayjs(`${year}-${month}-01`).startOf("month").toDate();
    const end = dayjs(`${year}-${month}-01`).endOf("month").toDate();
    query.createdAt = { $gte: start, $lte: end };
  }

  // Auto-mark overdue
  try {
    await Invoice.updateMany(
      { user: req.user._id, status: "pending", dueDate: { $lt: new Date() } },
      { status: "overdue" },
    );
  } catch (err) {
    console.error("updateMany timeout:", err.message);
  }

  const invoices = await Invoice.find(query)
    .populate("customer", "name phone email")
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  // Filter by customer name or invoice number if search provided
  const filtered = search
    ? invoices.filter(
        (i) =>
          i.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) ||
          i.customer?.name?.toLowerCase().includes(search.toLowerCase()),
      )
    : invoices;

  const total = await Invoice.countDocuments(query);

  // All invoices for history stats
  const allInvoices = await Invoice.find({ user: req.user._id });

  // Selected month stats
  const selectedDate = month && year ? dayjs(`${year}-${month}-01`) : dayjs();
  const selStart = selectedDate.startOf("month").toDate();
  const selEnd = selectedDate.endOf("month").toDate();
  const selectedInvs = allInvoices.filter(
    (i) => new Date(i.createdAt) >= selStart && new Date(i.createdAt) <= selEnd,
  );
  const monthRevenue = selectedInvs
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + (i.amountPaid || 0), 0);

  // Previous month
  const prevStart = selectedDate.subtract(1, "month").startOf("month").toDate();
  const prevEnd = selectedDate.subtract(1, "month").endOf("month").toDate();
  const prevInvs = allInvoices.filter(
    (i) =>
      new Date(i.createdAt) >= prevStart && new Date(i.createdAt) <= prevEnd,
  );
  const prevRevenue = prevInvs
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + (i.amountPaid || 0), 0);

  // Monthly history — last 12 months
  const monthlyHistory = [];
  for (let i = 11; i >= 0; i--) {
    const m = dayjs().subtract(i, "month");
    const mStart = m.startOf("month").toDate();
    const mEnd = m.endOf("month").toDate();
    const mInvs = allInvoices.filter(
      (inv) =>
        new Date(inv.createdAt) >= mStart && new Date(inv.createdAt) <= mEnd,
    );
    monthlyHistory.push({
      month: m.format("MMM YY"),
      year: m.year(),
      monthNum: m.month() + 1,
      count: mInvs.length,
      revenue: mInvs
        .filter((i) => i.status === "paid")
        .reduce((s, i) => s + (i.amountPaid || 0), 0),
      amount: mInvs.reduce((s, i) => s + (i.totalAmount || 0), 0),
    });
  }

  // Insight
  let insight = null;
  if (prevRevenue > 0) {
    const diff = monthRevenue - prevRevenue;
    const percent = Math.abs(Math.round((diff / prevRevenue) * 100));
    const prevLabel = selectedDate.subtract(1, "month").format("MMMM");
    const curLabel = selectedDate.format("MMMM");
    insight =
      diff > 0
        ? {
            type: "positive",
            message: `Revenue in ${curLabel} was ${percent}% higher than ${prevLabel}. Great job!`,
          }
        : diff < 0
          ? {
              type: "warning",
              message: `Revenue in ${curLabel} was ${percent}% lower than ${prevLabel}.`,
            }
          : {
              type: "neutral",
              message: `Revenue in ${curLabel} is the same as ${prevLabel}.`,
            };
  }

  res.json({
    success: true,
    invoices: filtered,
    total,
    page: Number(page),
    monthRevenue,
    prevRevenue,
    monthlyHistory,
    insight,
  });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    user: req.user._id,
  }).populate("customer", "name phone email address businessName");
  if (!invoice) throw new AppError("Invoice not found", 404);

  // Auto-update overdue status on fetch
  if (
    invoice.status === "pending" &&
    invoice.dueDate &&
    new Date(invoice.dueDate) < new Date()
  ) {
    invoice.status = "overdue";
    await invoice.save();
  }

  res.json({ success: true, invoice });
});

export const createInvoice = asyncHandler(async (req, res) => {
  const {
    customer,
    items,
    dueDate,
    discountPercent,
    notes,
    status,
    amountPaid,
    paymentMethod,
    paymentDate,
    type,
    txStatus,
    delivery,
  } = req.body;

  const cust = await Customer.findOne({ _id: customer, user: req.user._id });
  if (!cust) throw new AppError("Customer not found", 404);

  // Plan limit check
  const plan = req.user.plan || "free";
  const PlatformSettings = (await import("../models/PlatformSettings.js"))
    .default;
  const platformSettings = await PlatformSettings.findOne();

  const PLAN_LIMITS = {
    free: { invoices: platformSettings?.freeInvoiceLimit ?? 5 },
    starter: { invoices: 50 },
    business: { invoices: 500 },
    enterprise: { invoices: Infinity },
  };

  const limit = PLAN_LIMITS[plan]?.invoices ?? 5;
  if (limit !== Infinity) {
    const invoiceCount = await Invoice.countDocuments({ user: req.user._id });
    if (invoiceCount >= limit) {
      throw new AppError(
        `You've reached the ${limit} invoice limit on the ${plan} plan. Upgrade to create more invoices.`,
        403,
      );
    }
  }

  const invoiceNumber = await generateInvoiceNumber(req.user);

  const invoice = await Invoice.create({
    user: req.user._id,
    customer,
    invoiceNumber,
    items,
    dueDate,
    discountPercent: discountPercent || 0,
    notes,
    status: status || "pending",
    amountPaid: amountPaid || 0,
    paymentMethod: paymentMethod || null,
    paymentDate: paymentDate || null,
    type: type || "standard",
    txStatus: txStatus || null,
    delivery: req.body.delivery || { enabled: false, status: "pending" },
  });

  await invoice.populate("customer", "name phone email");

  // Save payment record if money was received at creation
  if (amountPaid && amountPaid > 0) {
    await Payment.create({
      user: req.user._id,
      invoice: invoice._id,
      customer,
      amount: amountPaid,
      method: paymentMethod || "bank_transfer",
      note: `Payment recorded on invoice creation`,
      createdAt: paymentDate || new Date(),
    });
  }

  await Customer.findByIdAndUpdate(customer, {
    $inc: {
      totalInvoices: 1,
      outstandingBalance: invoice.balance,
      totalSpent: amountPaid || 0,
    },
  });

  req.user.invoiceCount = (req.user.invoiceCount || 0) + 1;
  await req.user.save();

  await createNotification({
    userId: req.user._id,
    type: "invoice",
    title: "Invoice Created",
    message: `Invoice ${invoiceNumber} for ${cust.name} created.`,
    link: `/dashboard/invoices/${invoice._id}`,
  });

  await logActivity({
    userId: req.user._id,
    action: "Created invoice",
    entity: "invoice",
    entityId: invoice._id,
    details: `${invoiceNumber} for ${cust.name} — ₦${invoice.totalAmount?.toLocaleString()}`,
    ip: req.ip,
    userName: `${req.user.firstName} ${req.user.lastName}`,
  });

  triggerWebhook({
    userId: req.user._id,
    event: "invoice.created",
    data: invoice,
  }).catch(() => {});

  // // Feature 1 — Invoice Automation
  // try {
  //   const waSettings = await WhatsAppSettings.findOne({ user: req.user._id });
  //   if (waSettings?.connected && waSettings?.invoiceAuto) {
  //     const owner = await User.findById(req.user._id).select("businessName");
  //     await sendWhatsAppMessage({
  //       userId: req.user._id.toString(),
  //       invoice: { ...invoice.toObject(), customer: invoice.customer },
  //       type: "invoice",
  //       businessName: owner?.businessName || "Trackeet",
  //     });

  //     // Send product photos
  //     if (invoice.productPhotos?.length > 0) {
  //       const { sendWhatsAppImage } =
  //         await import("../services/whatsappService.js");
  //       for (const photoUrl of invoice.productPhotos) {
  //         await sendWhatsAppImage(
  //           req.user._id.toString(),
  //           invoice.customer.phone,
  //           photoUrl,
  //           `📦 Product photo — ${invoice.invoiceNumber}`,
  //         );
  //         await new Promise((r) => setTimeout(r, 1000));
  //       }
  //     }
  //   }
  // } catch (err) {
  //   console.error("❌ WhatsApp auto-send failed:", err.message);
  // }

  res.status(201).json({ success: true, invoice });
});

export const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!invoice) throw new AppError("Invoice not found", 404);

  const { txStatus, amountPaid, paymentDate, status, ...rest } = req.body;

  // Handle refund
  if (req.body.status === "refunded") {
    const updated = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        $set: {
          status: "refunded",
          refundReason: req.body.refundReason,
          refundedAt: new Date(),
          amountPaid: 0,
          balance: invoice.totalAmount,
        },
      },
      { new: true, runValidators: false },
    ).populate("customer", "name phone email");

    // Reverse customer stats
    await Customer.findByIdAndUpdate(invoice.customer, {
      $inc: {
        totalSpent: -(invoice.amountPaid || 0),
        outstandingBalance: invoice.amountPaid || 0,
      },
    }).catch(() => {});

    await logActivity({
      userId: req.user._id,
      action: "Refunded invoice",
      entity: "invoice",
      entityId: invoice._id,
      details: `${invoice.invoiceNumber} — ${req.body.refundReason}`,
      ip: req.ip,
      userName: `${req.user.firstName} ${req.user.lastName}`,
    }).catch(() => {});

    // Send WhatsApp refund notification
    try {
      const waSettings = await WhatsAppSettings.findOne({ user: req.user._id });
      if (waSettings?.connected && updated.customer?.phone) {
        const owner = await User.findById(req.user._id).select("businessName");
        await sendWhatsAppMessage({
          userId: req.user._id.toString(),
          invoice: updated,
          type: "refund",
          businessName: owner?.businessName || "Trackeet",
        });
      }
    } catch (err) {
      console.error("Refund WhatsApp failed:", err.message);
    }

    return res.json({ success: true, invoice: updated });
  }

  // For failed/reversed — bypass pre-save hook completely
  if (txStatus === "failed" || txStatus === "reversed") {
    const updated = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      {
        $set: {
          txStatus,
          status: "pending",
          amountPaid: 0,
          balance: invoice.totalAmount,
          paymentDate: null,
        },
      },
      { new: true, runValidators: false },
    ).populate("customer", "name phone email");

    return res.json({ success: true, invoice: updated });
  }

  // For successful — update normally
  if (txStatus === "successful") {
    const paid = Number(amountPaid) || invoice.totalAmount;
    const updated = await Invoice.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          txStatus,
          status: "paid",
          amountPaid: paid,
          balance: 0,
          paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        },
      },
      { new: true, runValidators: false },
    ).populate("customer", "name phone email");

    // Create Payment record
    await Payment.create({
      user: invoice.user,
      invoice: invoice._id,
      customer: invoice.customer,
      amount: paid,
      method: invoice.paymentMethod || "other",
      note: "Quick record marked as successful",
    }).catch(() => {});

    await Customer.findByIdAndUpdate(invoice.customer, {
      $inc: { totalSpent: paid, outstandingBalance: -paid },
    }).catch(() => {});

    return res.json({ success: true, invoice: updated });
  }

  // For anything else — normal update
  const updated = await Invoice.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { $set: req.body },
    { new: true, runValidators: false },
  ).populate("customer", "name phone email");

  res.json({ success: true, invoice: updated });
});

export const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!invoice) throw new AppError("Invoice not found", 404);
  await logActivity({
    userId: req.user._id,
    action: "Deleted invoice",
    entity: "invoice",
    entityId: invoice._id,
    details: `${invoice.invoiceNumber}`,
    ip: req.ip,
    userName: `${req.user.firstName} ${req.user.lastName}`,
  });

  triggerWebhook({
    userId: req.user._id,
    event: "invoice.deleted",
    data: { invoiceNumber: invoice.invoiceNumber },
  }).catch(() => {});

  res.json({ success: true, message: "Invoice deleted" });
});

export const markPaid = asyncHandler(async (req, res) => {
  const { amount, method, note } = req.body;
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!invoice) throw new AppError("Invoice not found", 404);

  const payAmt = amount || invoice.balance;
  invoice.amountPaid = (invoice.amountPaid || 0) + payAmt;
  invoice.paymentMethod = method || "bank_transfer";
  invoice.paymentDate = new Date();

  // Only clear txStatus and notes for standard invoices
  if (invoice.type !== "quick") {
    invoice.txStatus = null;
    if (invoice.notes) {
      invoice.notes = invoice.notes
        .replace("[Transfer pending — awaiting bank confirmation]", "")
        .replace("[Payment declined — customer needs to retry]", "")
        .replace("[Payment declined — do not retry on this invoice]", "")
        .replace(" · ", "")
        .trim();
      if (!invoice.notes) invoice.notes = null;
    }
  }

  await invoice.save();

  await Payment.create({
    user: req.user._id,
    invoice: invoice._id,
    customer: invoice.customer,
    amount: payAmt,
    method: method || "bank_transfer",
    note,
  });

  await Customer.findByIdAndUpdate(invoice.customer, {
    $inc: { totalSpent: payAmt, outstandingBalance: -payAmt },
  });

  await createNotification({
    userId: req.user._id,
    type: "payment",
    title: "Payment Recorded",
    message: `Payment of ₦${payAmt.toLocaleString()} recorded on ${invoice.invoiceNumber}.`,
    link: `/dashboard/invoices/${invoice._id}`,
  });

  await logActivity({
    userId: req.user._id,
    action: "Marked invoice paid",
    entity: "invoice",
    entityId: invoice._id,
    details: `${invoice.invoiceNumber} — ₦${payAmt?.toLocaleString()} via ${method}`,
    ip: req.ip,
    userName: `${req.user.firstName} ${req.user.lastName}`,
  });

  triggerWebhook({
    userId: req.user._id,
    event: "payment.received",
    data: invoice,
  }).catch(() => {});

  // Feature 2 — Payment Confirmation
  try {
    const waSettings = await WhatsAppSettings.findOne({ user: req.user._id });
    if (waSettings?.connected && waSettings?.paymentConfirm) {
      const owner = await User.findById(req.user._id).select("businessName");
      const populatedInvoice = await Invoice.findById(invoice._id).populate(
        "customer",
        "name phone email",
      );
      await sendWhatsAppMessage({
        userId: req.user._id.toString(),
        invoice: populatedInvoice,
        type: "receipt",
        businessName: owner?.businessName || "Trackeet",
      });
      console.log(`✅ Auto WhatsApp receipt sent: ${invoice.invoiceNumber}`);
    }
  } catch (err) {
    console.error("❌ WhatsApp receipt send failed:", err.message);
  }

  await invoice.populate("customer", "name phone email");
  res.json({ success: true, invoice });
});

export const sendWhatsApp = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate("customer", "name phone email")
    .populate("user", "firstName lastName businessName");
  if (!invoice) throw new AppError("Invoice not found", 404);

  const owner = await User.findById(req.user._id).select("businessName");
  const bizName = owner?.businessName || "Trackeet";
  const phone = invoice.customer.phone;

  if (invoice.productPhotos?.length > 0) {
    try {
      const { sendWhatsAppImage } =
        await import("../services/whatsappService.js");

      if (invoice.productPhotos.length === 1) {
        // 1 photo — send with full invoice as caption
        const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");
        const itemsList = (invoice.items || [])
          .map(
            (item) =>
              `  • ${item.name} x${item.quantity} — ${fmtN(item.total || item.quantity * item.unitPrice)}` +
              (item.description ? `\n    _${item.description}_` : ""),
          )
          .join("\n");

        const caption =
          `Hello ${invoice.customer.name} 👋\n\n` +
          `Here is your invoice from *${bizName}*:\n\n` +
          `📄 *Invoice:* ${invoice.invoiceNumber}\n` +
          `📅 *Date:* ${dayjs(invoice.invoiceDate).format("D MMM YYYY")}\n` +
          (invoice.dueDate
            ? `⏰ *Due Date:* ${dayjs(invoice.dueDate).format("D MMM YYYY")}\n`
            : "") +
          `\n*Items:*\n${itemsList}\n\n` +
          `🧾 *Subtotal:* ${fmtN(invoice.subtotal)}\n` +
          (invoice.discountPercent > 0
            ? `🏷️ *Discount (${invoice.discountPercent}%):* -${fmtN(invoice.discountAmount)}\n`
            : "") +
          `💰 *Total:* ${fmtN(invoice.totalAmount)}\n` +
          (invoice.amountPaid > 0
            ? `✅ *Paid:* ${fmtN(invoice.amountPaid)}\n`
            : "") +
          (invoice.balance > 0
            ? `⚠️ *Balance Due:* ${fmtN(invoice.balance)}\n`
            : `✅ *Fully Paid*\n`) +
          (invoice.notes ? `\n📋 *Notes:* ${invoice.notes}\n` : "") +
          (invoice.delivery?.enabled
            ? `\n🚚 *Delivery:* Order created & being prepared\n` +
              (invoice.delivery.feeType === "fixed" && invoice.delivery.fee > 0
                ? `💰 *Delivery Fee:* ${fmtN(invoice.delivery.fee)}\n`
                : invoice.delivery.feeType === "free"
                  ? `🎉 *Delivery Fee:* FREE\n`
                  : invoice.delivery.feeType === "pay_on_delivery"
                    ? `🚗 *Delivery Fee:* Pay rider on delivery\n`
                    : "") +
              (invoice.delivery.address
                ? `📍 *Address:* ${invoice.delivery.address}\n`
                : "") +
              (invoice.delivery.estimatedDate
                ? `📅 *Est. Delivery:* ${dayjs(invoice.delivery.estimatedDate).format("D MMM YYYY")}\n`
                : "") +
              (invoice.delivery.notes
                ? `📝 *Notes:* ${invoice.delivery.notes}\n`
                : "")
            : "") +
          `\nThank you for your business! 🙏\n_${bizName} · gettrackeet.com_`;

        await sendWhatsAppImage(
          req.user._id.toString(),
          phone,
          invoice.productPhotos[0],
          caption,
        );
      } else {
        // Multiple photos — images first, then invoice text
        for (let i = 0; i < invoice.productPhotos.length; i++) {
          await sendWhatsAppImage(
            req.user._id.toString(),
            phone,
            invoice.productPhotos[i],
            `📦 ${i + 1}/${invoice.productPhotos.length} — ${invoice.invoiceNumber}`,
          );
          await new Promise((r) => setTimeout(r, 800));
        }

        await sendWhatsAppMessage({
          userId: req.user._id,
          invoice,
          type: "invoice",
          businessName: bizName,
        });
      }
    } catch (err) {
      console.error("Product photo send failed:", err.message);
      await sendWhatsAppMessage({
        userId: req.user._id,
        invoice,
        type: "invoice",
        businessName: bizName,
      });
    }
  } else {
    await sendWhatsAppMessage({
      userId: req.user._id,
      invoice,
      type: "invoice",
      businessName: bizName,
    });
  }

  invoice.whatsappSent = true;
  invoice.whatsappSentAt = new Date();
  await invoice.save();
  res.json({ success: true, message: "Invoice sent via WhatsApp" });
});

export const getInvoicePDF = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findOne({
    _id: req.params.id,
    user: req.user._id,
  })
    .populate("customer")
    .populate("user");
  if (!invoice) throw new AppError("Invoice not found", 404);
  const pdfBuffer = await generateInvoicePDF(invoice);
  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `attachment; filename="${invoice.invoiceNumber}.pdf"`,
  });
  res.send(pdfBuffer);
});

export const getDeliveries = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = { user: req.user._id, "delivery.enabled": true };
  if (status) query["delivery.status"] = status;

  const invoices = await Invoice.find(query)
    .populate("customer", "name phone")
    .sort({ createdAt: -1 });

  res.json({ success: true, invoices });
});
