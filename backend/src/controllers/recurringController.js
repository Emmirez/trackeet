import RecurringInvoice from "../models/RecurringInvoice.js";
import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import { generateInvoiceNumber } from "../utils/generateInvoiceNumber.js";
import { createNotification } from "../utils/createNotification.js";
import dayjs from "dayjs";

const PLAN_LIMITS = {
  free: { recurring: 0 },
  starter: { recurring: 5 },
  business: { recurring: 50 },
  enterprise: { recurring: Infinity },
};

export const getRecurring = asyncHandler(async (req, res) => {
  const recurring = await RecurringInvoice.find({ user: req.user._id })
    .populate("customer", "name phone email")
    .sort({ createdAt: -1 });
  res.json({ success: true, recurring });
});

export const createRecurring = asyncHandler(async (req, res) => {
  const {
    customer,
    items,
    discountPercent,
    notes,
    frequency,
    startDate,
    endDate,
    daysDueAfter,
  } = req.body;

  const cust = await Customer.findOne({ _id: customer, user: req.user._id });
  if (!cust) throw new AppError("Customer not found", 404);

  // Plan limit check
  const plan = req.user.plan || "free";
  const limit = PLAN_LIMITS[plan]?.recurring ?? 0;
  if (limit === 0) {
    throw new AppError(
      "Recurring invoices are not available on the free plan. Upgrade to Starter or higher.",
      403,
    );
  }
  if (limit !== Infinity) {
    const recurringCount = await RecurringInvoice.countDocuments({
      user: req.user._id,
    });
    if (recurringCount >= limit) {
      throw new AppError(
        `You've reached the ${limit} recurring invoice limit on the ${plan} plan. Upgrade for more.`,
        403,
      );
    }
  }

  const start = dayjs(startDate || new Date());

  const recurring = await RecurringInvoice.create({
    user: req.user._id,
    customer,
    items,
    discountPercent: discountPercent || 0,
    notes,
    frequency: frequency || "monthly",
    startDate: start.toDate(),
    endDate: endDate || null,
    nextDueDate: start.toDate(),
    daysDueAfter: daysDueAfter || 7,
    status: "active",
  });

  await recurring.populate("customer", "name phone email");
  res.status(201).json({ success: true, recurring });
});

export const updateRecurring = asyncHandler(async (req, res) => {
  const { status, endDate, daysDueAfter, notes } = req.body;
  const recurring = await RecurringInvoice.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!recurring) throw new AppError("Recurring invoice not found", 404);

  if (status) recurring.status = status;
  if (endDate) recurring.endDate = endDate;
  if (daysDueAfter) recurring.daysDueAfter = daysDueAfter;
  if (notes) recurring.notes = notes;
  await recurring.save();

  res.json({ success: true, recurring });
});

export const deleteRecurring = asyncHandler(async (req, res) => {
  await RecurringInvoice.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });
  res.json({ success: true, message: "Recurring invoice deleted" });
});

// Called by cron — generate due invoices
export const processRecurringInvoices = async () => {
  const now = dayjs();
  console.log("Processing recurring invoices...");

  const due = await RecurringInvoice.find({
    status: "active",
    nextDueDate: { $lte: now.toDate() },
    $or: [{ endDate: null }, { endDate: { $gte: now.toDate() } }],
  })
    .populate("user")
    .populate("customer", "name phone email");

  console.log(`Found ${due.length} recurring invoices due`);

  for (const recurring of due) {
    try {
      const user = recurring.user;

      // Calculate subtotal and total
      const items = recurring.items.map((item) => ({
        ...item.toObject(),
        total: item.quantity * item.unitPrice,
      }));
      const subtotal = items.reduce((s, i) => s + i.total, 0);
      const discountAmt = subtotal * (recurring.discountPercent / 100);
      const totalAmount = subtotal - discountAmt;
      const dueDate = now.add(recurring.daysDueAfter, "day").toDate();

      const invoiceNumber = await generateInvoiceNumber(user);

      const invoice = await Invoice.create({
        user: user._id,
        customer: recurring.customer._id,
        invoiceNumber,
        items,
        subtotal,
        discountPercent: recurring.discountPercent,
        discountAmount: discountAmt,
        totalAmount,
        balance: totalAmount,
        dueDate,
        notes: recurring.notes,
        status: "pending",
        invoiceDate: now.toDate(),
      });

      // Update customer stats
      await Customer.findByIdAndUpdate(recurring.customer._id, {
        $inc: { totalInvoices: 1, outstandingBalance: totalAmount },
      });

      // Update recurring record
      const nextDate = calculateNextDate(now, recurring.frequency);
      recurring.lastGenerated = now.toDate();
      recurring.nextDueDate = nextDate.toDate();
      recurring.totalGenerated = (recurring.totalGenerated || 0) + 1;

      // Check if end date passed
      if (recurring.endDate && nextDate.isAfter(dayjs(recurring.endDate))) {
        recurring.status = "completed";
      }

      await recurring.save();

      // Notify owner
      await createNotification({
        userId: user._id,
        type: "invoice",
        title: "Recurring Invoice Generated",
        message: `Invoice ${invoiceNumber} generated for ${recurring.customer.name} (recurring).`,
        link: `/dashboard/invoices/${invoice._id}`,
      });

      console.log(
        `✅ Recurring invoice generated: ${invoiceNumber} for ${recurring.customer.name}`,
      );
    } catch (err) {
      console.error(`❌ Recurring invoice failed:`, err.message);
    }
  }
};

const calculateNextDate = (from, frequency) => {
  switch (frequency) {
    case "weekly":
      return from.add(1, "week");
    case "monthly":
      return from.add(1, "month");
    case "quarterly":
      return from.add(3, "month");
    case "yearly":
      return from.add(1, "year");
    default:
      return from.add(1, "month");
  }
};
