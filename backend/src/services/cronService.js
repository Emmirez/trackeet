import cron from "node-cron";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";
import WhatsAppSettings from "../models/WhatsAppSettings.js";
import { sendWhatsAppMessage } from "./whatsappService.js";
import dayjs from "dayjs";
import { processRecurringInvoices } from "../controllers/recurringController.js";

const markOverdue = async () => {
  const result = await Invoice.updateMany(
    {
      status: { $in: ["pending", "partial"] },
      dueDate: { $lt: new Date() },
    },
    { status: "overdue" },
  );
  if (result.modifiedCount > 0) {
    console.log(`✅ Marked ${result.modifiedCount} invoice(s) as overdue`);
  }
};

export const initCrons = () => {
  // Run immediately on server start
  // Run immediately on server start — delay to allow DB connection
  setTimeout(
    () =>
      markOverdue().catch((err) =>
        console.error("Initial overdue check failed:", err.message),
      ),
    5000,
  );

  // Mark overdue invoices — every day at 8 AM
  cron.schedule("0 8 * * *", async () => {
    console.log("Running overdue check...");
    await markOverdue();
  });

  // Payment reminders — every day at 9 AM
  cron.schedule("0 9 * * *", async () => {
    console.log("Running payment reminders...");

    const tomorrow = dayjs().add(1, "day").toDate();
    const in2days = dayjs().add(2, "day").toDate();

    // 1 — Due soon (pending/partial due in next 2 days)
    const dueSoon = await Invoice.find({
      status: { $in: ["pending", "partial"] },
      dueDate: { $gte: tomorrow, $lte: in2days },
    })
      .populate("customer", "name phone")
      .populate("user");

    // 2 — Overdue invoices
    const overdue = await Invoice.find({
      status: "overdue",
    })
      .populate("customer", "name phone")
      .populate("user");

    // 3 — Partial balance remaining
    const partial = await Invoice.find({
      status: "partial",
      balance: { $gt: 0 },
    })
      .populate("customer", "name phone")
      .populate("user");

    const allInvoices = [...dueSoon, ...overdue, ...partial];

    // Deduplicate by invoice ID
    const unique = [
      ...new Map(allInvoices.map((i) => [i._id.toString(), i])).values(),
    ];

    for (const invoice of unique) {
      try {
        const settings = await WhatsAppSettings.findOne({
          user: invoice.user._id,
        });
        if (settings?.connected && settings?.paymentReminder) {
          const type = invoice.status === "overdue" ? "overdue" : "reminder";
          const owner = await User.findById(invoice.user._id).select(
            "businessName",
          );
          await sendWhatsAppMessage({
            userId: invoice.user._id.toString(),
            invoice,
            type,
            businessName: owner?.businessName || "Trackeet",
          });
          console.log(
            `✅ Reminder sent: ${invoice.invoiceNumber} — ${invoice.status}`,
          );
        }
      } catch (err) {
        console.error(
          `❌ Reminder failed ${invoice.invoiceNumber}:`,
          err.message,
        );
      }
    }
  });

  // Daily at 8:30AM
  cron.schedule("30 8 * * *", async () => {
    await processRecurringInvoices();
  });

  // Run once on server start
  // Delay startup operations to allow DB connection
  setTimeout(
    () =>
      processRecurringInvoices().catch((err) =>
        console.error("Recurring check failed:", err.message),
      ),
    10000,
  );

  // Daily business summary — every day at 9 PM
  cron.schedule("0 21 * * *", async () => {
    console.log("Running daily summaries...");
    const users = await User.find({ status: "active" });
    for (const user of users) {
      try {
        const settings = await WhatsAppSettings.findOne({ user: user._id });
        if (!settings?.connected || !settings?.dailySummary) continue;

        const today = dayjs().startOf("day").toDate();
        const todayInvoices = await Invoice.find({
          user: user._id,
          createdAt: { $gte: today },
        });
        const todayPaid = await Invoice.find({
          user: user._id,
          paymentDate: { $gte: today },
          status: "paid",
        });
        const totalOwed = await Invoice.find({
          user: user._id,
          status: { $in: ["pending", "partial", "overdue"] },
        });
        const overdueCount = await Invoice.countDocuments({
          user: user._id,
          status: "overdue",
        });

        const owing = totalOwed.reduce((s, i) => s + (i.balance || 0), 0);
        const todayRevenue = todayPaid.reduce(
          (s, i) => s + (i.amountPaid || 0),
          0,
        );

        const fmt = (n) => "₦" + (n || 0).toLocaleString("en-NG");

        const Sale = (await import("../models/Sale.js")).default;
        const todaySales = await Sale.find({
          user: user._id,
          createdAt: { $gte: today },
          status: { $ne: "refunded" },
        });
        const salesRevenue = todaySales.reduce(
          (s, sale) => s + (sale.amountPaid || 0),
          0,
        );

        const msg =
          `*📊 Daily Business Summary*\n` +
          `_${user.businessName || "Your Business"} · ${dayjs().format("D MMM YYYY")}_\n\n` +
          `*💰 Revenue Today*\n` +
          `  Invoices: *${fmt(todayRevenue)}*\n` +
          `  Quick Sales: *${fmt(salesRevenue)}*\n` +
          `  Total: *${fmt(todayRevenue + salesRevenue)}*\n\n` +
          `*📄 Activity*\n` +
          `  Invoices created: *${todayInvoices.length}*\n` +
          `  Payments received: *${todayPaid.length}*\n` +
          `  Sales recorded: *${todaySales.length}*\n\n` +
          `*⚠️ Needs Attention*\n` +
          `  Overdue invoices: *${overdueCount}*\n` +
          `  Total outstanding: *${fmt(owing)}*\n\n` +
          `_Powered by Trackeet · gettrackeet.com_ 🚀`;

        const ownerPhone = user.phone || settings.phoneNumber;
        if (!ownerPhone) {
          console.log(`No phone for ${user.email} — skipping summary`);
          continue;
        }

        const { sendRawWhatsAppMessage } = await import("./whatsappService.js");
        try {
          await sendRawWhatsAppMessage(user._id.toString(), ownerPhone, msg);
          console.log(`✅ Daily summary sent to ${user.email}`);
        } catch (err) {
          if (
            err.message?.includes("Protocol error") ||
            err.message?.includes("Promise was collected")
          ) {
            console.log(
              `⚠️ WhatsApp session expired for ${user.email} — skipping`,
            );
            continue;
          }
          console.error(`Summary failed for ${user.email}:`, err.message);
        }
      } catch (err) {
        console.error(`Summary failed for ${user.email}:`, err.message);
      }
    }
  });
  console.log("✅ Cron jobs started");
};
