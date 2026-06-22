import Customer from "../models/Customer.js";
import Invoice from "../models/Invoice.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import { logActivity } from "../utils/activityLogger.js";

const PLAN_LIMITS = {
  free: { customers: 10 },
  starter: { customers: 100 },
  business: { customers: 1000 },
  enterprise: { customers: Infinity },
};

export const getCustomers = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const query = { user: req.user._id };
  if (search)
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { phone: { $regex: search } },
    ];
  const customers = await Customer.find(query).sort({ createdAt: -1 });
  res.json({ success: true, customers });
});

export const getCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!customer) throw new AppError("Customer not found", 404);
  const invoices = await Invoice.find({
    customer: customer._id,
    user: req.user._id,
  })
    .sort({ createdAt: -1 })
    .limit(20);
  res.json({ success: true, customer, invoices });
});

export const createCustomer = asyncHandler(async (req, res) => {
  // Plan limit check
  const plan = req.user.plan || "free";
  const PlatformSettings = (await import("../models/PlatformSettings.js"))
    .default;
  const platformSettings = await PlatformSettings.findOne();

  const PLAN_LIMITS = {
    free: { customers: platformSettings?.freeCustomerLimit ?? 10 },
    starter: { customers: 100 },
    business: { customers: 1000 },
    enterprise: { customers: Infinity },
  };

  const limit = PLAN_LIMITS[plan]?.customers ?? 10;
  if (limit !== Infinity) {
    const customerCount = await Customer.countDocuments({ user: req.user._id });
    if (customerCount >= limit) {
      throw new AppError(
        `You've reached the ${limit} customer limit on the ${plan} plan. Upgrade to add more customers.`,
        403,
      );
    }
  }

  const customer = await Customer.create({ ...req.body, user: req.user._id });

  await logActivity({
    userId: req.user._id,
    action: "Added customer",
    entity: "customer",
    entityId: customer._id,
    details: `${customer.name} — ${customer.phone}`,
    ip: req.ip,
    userName: `${req.user.firstName} ${req.user.lastName}`,
  });
  res.status(201).json({ success: true, customer });
});

export const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    req.body,
    { new: true, runValidators: true },
  );
  if (!customer) throw new AppError("Customer not found", 404);
  res.json({ success: true, customer });
});

export const deleteCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!customer) throw new AppError("Customer not found", 404);
  await logActivity({
    userId: req.user._id,
    action: "Deleted customer",
    entity: "customer",
    entityId: customer._id,
    details: customer.name,
    ip: req.ip,
    userName: `${req.user.firstName} ${req.user.lastName}`,
  });

  res.json({ success: true, message: "Customer deleted" });
});

export const importCustomers = asyncHandler(async (req, res) => {
  const { customers } = req.body;
  if (!customers?.length) throw new AppError("No customers provided", 400);

  // Plan limit check
  const plan = req.user.plan || "free";
  const limit = PLAN_LIMITS[plan]?.customers ?? 10;
  if (limit !== Infinity) {
    const currentCount = await Customer.countDocuments({ user: req.user._id });
    if (currentCount >= limit) {
      throw new AppError(
        `You've reached the ${limit} customer limit on the ${plan} plan. Upgrade to import more customers.`,
        403,
      );
    }
  }

  const results = { imported: 0, skipped: 0, errors: [] };

  for (const row of customers) {
    try {
      const name = row.name?.trim();
      const phone = row.phone?.toString().trim();
      const email = row.email?.trim() || "";

      if (!name || !phone) {
        results.skipped++;
        results.errors.push(
          `Skipped: missing name or phone — ${name || "unknown"}`,
        );
        continue;
      }

      // Skip if phone already exists
      const existing = await Customer.findOne({ user: req.user._id, phone });
      if (existing) {
        results.skipped++;
        results.errors.push(`Skipped: ${name} — phone already exists`);
        continue;
      }

      await Customer.create({
        user: req.user._id,
        name,
        phone,
        email,
        businessName: row.businessName?.trim() || "",
      });

      results.imported++;
    } catch (err) {
      results.skipped++;
      results.errors.push(`Failed: ${row.name || "unknown"} — ${err.message}`);
    }
  }

  res.json({ success: true, ...results });
});
