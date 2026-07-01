import cron from "node-cron";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";
import WhatsAppSettings from "../models/WhatsAppSettings.js";
import { sendWhatsAppMessage } from "./whatsappService.js";
import dayjs from "dayjs";
import { processRecurringInvoices } from "../controllers/recurringController.js";
import Subscription from "../models/Subscription.js";


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
  // Check expired subscriptions — every day at midnight
  cron.schedule("0 0 * * *", async () => {
    console.log("Checking expired subscriptions...");
    try {
      const expiredSubs = await Subscription.find({
        status: "active",
        endDate: { $lt: new Date() },
      });

      for (const sub of expiredSubs) {
        // Mark subscription as expired
        sub.status = "expired";
        await sub.save();

        // Downgrade user to free plan
        await User.findByIdAndUpdate(sub.user, { plan: "free" });

        // Notify user
        const { emitToUser } = await import("../config/socket.js");
        const Notification = (await import("../models/Notification.js"))
          .default;

        const notif = await Notification.create({
          user: sub.user,
          type: "subscription",
          title: "⚠️ Subscription Expired",
          message: `Your ${sub.plan} plan has expired. Upgrade to continue enjoying premium features.`,
          link: "/dashboard/subscription",
        });

        try {
          emitToUser(sub.user.toString(), "notification", notif);
          emitToUser(sub.user.toString(), "plan_upgraded", { plan: "free" });
        } catch {}

        // Send email notification
        try {
          const user = await User.findById(sub.user).select("email firstName");
          const { sendEmail } = await import("../services/emailService.js");
          await sendEmail({
            to: user.email,
            subject: "Your Trackeet subscription has expired",
            html: `
              <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
                <div style="background:linear-gradient(135deg,#7C3AED,#6366F1);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
                  <h1 style="color:#fff;margin:0;font-size:24px;">TRACKEET</h1>
                </div>
                <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                  <h2 style="color:#0f172a;margin:0 0 8px;">Your subscription has expired ⚠️</h2>
                  <p style="color:#64748b;line-height:1.6;">
                    Hi <strong>${user.firstName}</strong>, your <strong>${sub.plan}</strong> plan has expired.
                    Your account has been moved to the Free plan.
                  </p>
                  <p style="color:#64748b;line-height:1.6;">
                    You can still access your data, but some features are now limited.
                    Renew your subscription to restore full access.
                  </p>
                  <div style="text-align:center;margin:28px 0;">
                    <a href="https://gettrackeet.com/dashboard/subscription"
                       style="background:#7C3AED;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:700;display:inline-block;">
                      Renew Subscription →
                    </a>
                  </div>
                </div>
                <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px;">
                  © 2026 Trackeet · gettrackeet.com
                </p>
              </div>
            `,
          });
        } catch {}

        console.log(
          `✅ Subscription expired for user ${sub.user} — downgraded to free`,
        );
      }

      if (expiredSubs.length > 0) {
        console.log(
          `✅ Processed ${expiredSubs.length} expired subscription(s)`,
        );
      }
    } catch (err) {
      console.error("Subscription expiry check failed:", err.message);
    }
  });

  console.log("✅ Cron jobs started");
};
