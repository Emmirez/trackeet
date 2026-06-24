import "dotenv/config";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import { initSocket } from "./config/socket.js";
import { initCrons } from "./services/cronService.js";

// Routes
import authRoutes from "./routes/auth.js";
import invoiceRoutes from "./routes/invoices.js";
import paymentRoutes from "./routes/payments.js";
import customerRoutes from "./routes/customers.js";
import whatsappRoutes from "./routes/whatsapp.js";
import reportRoutes from "./routes/reports.js";
import profileRoutes from "./routes/profile.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import notificationRoutes from "./routes/notifications.js";
import adminRoutes from "./routes/admin.js";

import ticketRoutes from "./routes/tickets.js";
import { sendSystemAlert } from "./utils/systemAlert.js";

import { restoreWhatsAppSessions } from "./services/whatsappService.js";
import teamRoutes from "./routes/team.js";
import activityRoutes from "./routes/activity.js";
import apiKeyRoutes from "./routes/apiKeys.js";
import webhookRoutes from "./routes/webhooks.js";
import recurringRoutes from "./routes/recurring.js";
import expenseRoutes from "./routes/expenses.js";
import saleRoutes from "./routes/sales.js";
import productRoutes from "./routes/products.js";

import reviewRoutes from "./routes/reviews.js";
import bannerRoutes from "./routes/banners.js";

import { maintenanceCheck } from "./middleware/maintenance.js";
import feedbackRoutes from "./routes/feedback.js";

import trackingRoutes from "./routes/tracking.js";
import subscriberRoutes from "./routes/subscribers.js";
import referralRoutes from "./routes/referral.js";

const app = express();
const server = http.createServer(app);

// Connect DB
connectDB().then(async () => {
  await restoreWhatsAppSessions();
  initCrons();
});

// Init Socket.io
initSocket(server);

// Security middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());
app.use(hpp());
app.use(compression());

// CORS
const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map(o => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Body parser — skip JSON parsing for Paystack webhook (needs raw body for signature verification)
app.use((req, res, next) => {
  if (req.originalUrl === "/api/subscriptions/webhook") {
    next();
  } else {
    express.json({ limit: "10mb" })(req, res, next);
  }
});
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// Global rate limit
app.use(
  "/api/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
      success: false,
      message: "Too many requests, please try again later.",
    },
  }),
);

// Auth rate limit (stricter)
app.use(
  "/api/auth/",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { success: false, message: "Too many login attempts." },
  }),
);

// Bot detection for SEO/social previews
app.get("/store/:storeName", async (req, res, next) => {
  const ua = req.headers["user-agent"] || "";
  const isBot =
    /whatsapp|facebookexternalhit|twitterbot|linkedinbot|googlebot|slackbot|telegrambot|discordbot|crawler|spider/i.test(
      ua,
    );

  if (!isBot) return next();

  try {
    const User = (await import("./models/User.js")).default;
    const owner = await User.findOne({
      storeName: req.params.storeName,
      storeActive: true,
    }).select("businessName businessLogo storeName");

    if (!owner) return next();

    const title = `${owner.businessName} — Shop on Trackeet`;
    const desc = `Browse products and services from ${owner.businessName}. Order via WhatsApp instantly.`;
    const image = owner.businessLogo || "https://trackeet.ng/og-default.png";
    const url = `https://trackeet.ng/store/${owner.storeName}`;

    return res.send(`<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Trackeet" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${image}" />
  <meta http-equiv="refresh" content="0; url=${url}" />
</head>
<body>Redirecting...</body>
</html>`);
  } catch {
    return next();
  }
});

// Product page bot detection
app.get("/store/:storeName/product/:productId", async (req, res, next) => {
  const ua = req.headers["user-agent"] || "";
  const isBot =
    /whatsapp|facebookexternalhit|twitterbot|linkedinbot|googlebot|slackbot|telegrambot|discordbot|crawler|spider/i.test(
      ua,
    );

  if (!isBot) return next();

  try {
    const User = (await import("./models/User.js")).default;
    const Product = (await import("./models/Product.js")).default;

    const owner = await User.findOne({
      storeName: req.params.storeName,
      storeActive: true,
    }).select("businessName storeName");
    if (!owner) return next();

    const product = await Product.findOne({
      _id: req.params.productId,
      user: owner._id,
      isActive: true,
    }).select("name description images price");
    if (!product) return next();

    const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");
    const title = `${product.name} — ${owner.businessName}`;
    const desc =
      product.description ||
      `Buy ${product.name} from ${owner.businessName} for ${fmtN(product.price)}. Order via WhatsApp.`;
    const image = product.images?.[0] || "https://trackeet.ng/og-default.png";
    const url = `https://trackeet.ng/store/${owner.storeName}/product/${product._id}`;

    return res.send(`<!DOCTYPE html>
<html>
<head>
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:image" content="${image}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:type" content="product" />
  <meta property="og:site_name" content="Trackeet" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="${image}" />
  <meta http-equiv="refresh" content="0; url=${url}" />
</head>
<body>Redirecting...</body>
</html>`);
  } catch {
    return next();
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/keys", apiKeyRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/products", productRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/track", trackingRoutes);
app.use("/api/subscribers", subscriberRoutes);
app.use("/api/referral", referralRoutes);
app.use(maintenanceCheck);

// Health check
app.get("/api/health", (_, res) =>
  res.json({ status: "ok", env: process.env.NODE_ENV }),
);

// 404 handler
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);

// Global error handler
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.message);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start cron jobs
// initCrons();
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(
    `🚀 Trackeet server running on port ${PORT} [${process.env.NODE_ENV}]`,
  );
  setTimeout(() => {
    sendSystemAlert(
      "Server Started",
      `Trackeet backend started on port ${PORT}`,
    );
  }, 3000);
});
