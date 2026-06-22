import WhatsAppSettings from "../models/WhatsAppSettings.js";
import WhatsAppLog from "../models/WhatsAppLog.js";
import dayjs from "dayjs";
import { exec } from "child_process";

const killChrome = () =>
  new Promise((resolve) => {
    exec("taskkill /F /IM chrome.exe /T", () => resolve());
  });

const clients = new Map();
const qrCodes = new Map();

//  Helpers
const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

const normalizePhone = (phone) => {
  const p = phone.replace(/[^0-9]/g, "");
  return p.startsWith("0") ? "234" + p.slice(1) : p;
};

const getWaId = (phone) => normalizePhone(phone) + "@c.us";

//  Conversation Memory (in-memory, TTL 24h)
const conversationMemory = new Map();

const getMemory = (userId, phone) => {
  const key = `${userId}:${phone}`;
  const mem = conversationMemory.get(key);
  if (!mem) return null;
  // Expire after 24 hours
  if (Date.now() - mem.updatedAt > 86400000) {
    conversationMemory.delete(key);
    return null;
  }
  return mem;
};

const setMemory = (userId, phone, data) => {
  const key = `${userId}:${phone}`;
  const existing = conversationMemory.get(key) || {};
  conversationMemory.set(key, {
    ...existing,
    ...data,
    updatedAt: Date.now(),
  });
};

const clearMemory = (userId, phone) => {
  conversationMemory.delete(`${userId}:${phone}`);
};

//  Product Search
const searchProducts = async (userId, query) => {
  const Product = (await import("../models/Product.js")).default;
  const keywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2);

  const products = await Product.find({
    user: userId,
    isActive: true,
    inStock: true,
    $or: [
      { name: { $regex: keywords.join("|"), $options: "i" } },
      { description: { $regex: keywords.join("|"), $options: "i" } },
      { tags: { $in: keywords.map((k) => new RegExp(k, "i")) } },
      { category: { $regex: keywords.join("|"), $options: "i" } },
    ],
  }).limit(5);

  return products;
};

//  Format product list for WhatsApp
const formatProductList = (products, storeName, bizName) => {
  if (!products.length) return null;

  const list = products
    .map(
      (p, i) =>
        `${i + 1}. *${p.name}*\n` +
        `   💰 ${fmtN(p.price)}` +
        (p.comparePrice > p.price ? ` ~~${fmtN(p.comparePrice)}~~` : "") +
        "\n" +
        (p.category ? `   📂 ${p.category}\n` : "") +
        (p.attributes?.size ? `   📏 Sizes: ${p.attributes.size}\n` : "") +
        (p.attributes?.color ? `   🎨 Color: ${p.attributes.color}\n` : "") +
        (p.attributes?.portion
          ? `   🍽️ Portion: ${p.attributes.portion}\n`
          : "") +
        (p.attributes?.duration
          ? `   ⏱️ Duration: ${p.attributes.duration}\n`
          : "") +
        (p.images?.length > 0
          ? `   🖼️ ${p.images
              .slice(0, 2)
              .map((img, i) => `Photo ${i + 1}: ${img}`)
              .join(" | ")}\n`
          : ""),
    )
    .join("\n");

  const storeLink = storeName
    ? `\n\n🛍️ *Browse our full store:*\ntracket.ng/store/${storeName}`
    : "";

  return (
    `Here's what I found:\n\n${list}` +
    `${storeLink}\n\n` +
    `To order, just reply with the item number or tap the WhatsApp button on our store.\n\n` +
    `_${bizName}_`
  );
};

//  WhatsApp Commerce Handler
const handleCommerceMessage = async (msg, userId, settings) => {
  const User = (await import("../models/User.js")).default;
  const Invoice = (await import("../models/Invoice.js")).default;
  const Customer = (await import("../models/Customer.js")).default;

  const owner = await User.findById(userId).select(
    "businessName bankName bankAccountNumber bankAccountName storeName businessCategory",
  );
  const bizName = owner?.businessName || "Trackeet";
  const storeName = owner?.storeName || "";

  const body = msg.body?.trim() || "";
  const bodyLow = body.toLowerCase();
  let phone = msg.from.replace("@c.us", "").replace("@lid", "");

  // Try to get real phone number from contact
  try {
    const contact = await msg.getContact();
    if (contact?.id?.user) {
      phone = contact.id.user;
    } else if (contact?.number) {
      phone = contact.number;
    }
    console.log(
      "Contact details:",
      JSON.stringify({
        number: contact?.number,
        id: contact?.id,
        name: contact?.name,
        pushname: contact?.pushname,
      }),
    );
  } catch (e) {
    console.log("Contact fetch failed:", e.message);
  }
  const memory = getMemory(userId, phone) || {};

  //  Human Handoff check
  if (memory.handedOff) {
    // Owner has taken over — don't auto-reply
    return null;
  }

  //  Handoff trigger
  if (
    bodyLow.match(
      /\b(human|agent|speak to someone|real person|owner|support|help me|talk to)\b/,
    )
  ) {
    setMemory(userId, phone, { handedOff: true, state: "support" });
    // Notify owner via socket
    try {
      const { emitToUser } = await import("../config/socket.js");
      console.log(`🔔 Emitting handoff to user ${userId} for phone ${phone}`);
      emitToUser(userId.toString(), "whatsapp_handoff", {
        phone,
        message: body,
        time: new Date(),
      });
      console.log(`✅ Handoff emitted`);
    } catch (e) {
      console.error(`❌ Handoff emit failed:`, e.message);
    }
    return (
      `Hello! 👋 I'm connecting you with a real person from *${bizName}* right now.\n\n` +
      `Please hold on — someone will respond to you shortly. ⏳\n\n` +
      `_${bizName}_`
    );
  }

  //  Order by number from previous search
  if (memory.lastProducts?.length && /^[1-5]$/.test(body.trim())) {
    const idx = parseInt(body.trim()) - 1;
    const product = memory.lastProducts[idx];
    if (product) {
      setMemory(userId, phone, { state: "ordering", lastProduct: product });
      return (
        `Great choice! 🎉\n\n` +
        `*${product.name}*\n` +
        `💰 ${fmtN(product.price)}\n\n` +
        `To complete your order, please send:\n` +
        `• Your full name\n` +
        `• Delivery address (if needed)\n` +
        `• Quantity\n\n` +
        `Or visit our store to order directly:\n` +
        `🛍️ trackeet.ng/store/${storeName}\n\n` +
        `_${bizName}_`
      );
    }
  }

  //  Store link
  if (
    bodyLow.match(
      /\b(browse store|view store|open store|store link|shop link|see store|visit store|your store|our store|catalogue|catalog|all products|full menu|see all)\b/,
    )
  ) {
    return (
      `Hello! 👋 Welcome to *${bizName}*! 🛍️\n\n` +
      `Browse all our products and services here:\n\n` +
      `🔗 *trackeet.ng/store/${storeName}*\n\n` +
      `You can also ask me:\n` +
      `• *"Do you have [item]?"* — search products\n` +
      `• *"My balance"* — check what you owe\n` +
      `• *"My order"* — track your order\n` +
      `• *"Payment details"* — get bank account\n\n` +
      `_${bizName}_`
    );
  }

  //  Product Discovery
  const productKeywords = [
    "do you have",
    "do you sell",
    "show me",
    "i need",
    "i want",
    "looking for",
    "got any",
    "any",
    "available",
    "buy",
    "price of",
    "how much is",
    "what about",
    "products",
    "items",
    "catalogue",
    "catalog",
    "menu",
    "services",
    "packages",
    "what do you sell",
    "what do you have",
  ];
  const isProductQuery =
    productKeywords.some((k) => bodyLow.includes(k)) ||
    bodyLow.match(
      /\b(shoe|bag|cloth|dress|shirt|trouser|jean|food|meal|rice|chicken|phone|laptop|drug|medicine|hair|nail|sofa|table|bed|print|logo|design|website)\b/,
    );

  if (isProductQuery) {
    const cleanQuery = bodyLow
      .replace(
        /do you have|do you sell|show me|i need|i want|looking for|got any|any|available|buy|price of|how much is|what about/g,
        "",
      )
      .trim()
      // Remove generic words that aren't product names
      .replace(
        /\b(product|products|item|items|something|anything|stuff)\b/g,
        "",
      )
      .trim();

    // If query is empty after cleaning — show featured/all products
    const Product = (await import("../models/Product.js")).default;
    const products =
      cleanQuery.length > 1
        ? await searchProducts(userId, cleanQuery)
        : await Product.find({ user: userId, isActive: true, inStock: true })
            .sort({ isFeatured: -1, isBestSeller: -1 })
            .limit(5);

    if (products.length > 0) {
      setMemory(userId, phone, {
        lastProducts: products,
        lastKeyword: cleanQuery || bodyLow,
        state: "browsing",
      });
      return `Hello! 👋\n\n${formatProductList(products, storeName, bizName)}`;
    } else {
      // No products found
      return (
        `Hello! 👋 Sorry, I couldn't find that in our catalogue.\n\n` +
        `🛍️ Browse all our products:\n` +
        `trackeet.ng/store/${storeName}\n\n` +
        `Or describe what you're looking for and I'll help!\n\n` +
        `_${bizName}_`
      );
    }
  }

  //  Follow-up on previous search context
  if (memory.lastProducts?.length && bodyLow.length > 2) {
    const followUps = [
      "size",
      "color",
      "available",
      "stock",
      "more",
      "other",
      "different",
      "colour",
    ];
    if (followUps.some((f) => bodyLow.includes(f))) {
      const products = await searchProducts(
        userId,
        `${memory.lastKeyword} ${bodyLow}`,
      );
      if (products.length > 0) {
        setMemory(userId, phone, { lastProducts: products });
        return `Here are more options:\n\n${formatProductList(products, storeName, bizName)}`;
      }
    }
  }

  // Balance / Invoice check
  if (
    bodyLow.match(
      /\b(balance|owe|debt|outstanding|how much|owing|my balance|my invoice)\b/,
    )
  ) {
    const customer = await Customer.findOne({
      user: userId,
      phone: { $regex: normalizePhone(phone), $options: "i" },
    });

    if (customer) {
      const invoices = await Invoice.find({
        user: userId,
        customer: customer._id,
        status: { $in: ["pending", "partial", "overdue"] },
      });

      if (invoices.length > 0) {
        const totalBalance = invoices.reduce((s, i) => s + (i.balance || 0), 0);
        const list = invoices
          .map(
            (i) => `• *${i.invoiceNumber}* — ${fmtN(i.balance)} (${i.status})`,
          )
          .join("\n");

        return (
          `Hello ${customer.name}! 👋\n\n` +
          `💰 *Your Outstanding Balance:*\n${list}\n\n` +
          `*Total Due:* ${fmtN(totalBalance)}\n\n` +
          `Please make payment at your earliest convenience.\n\n` +
          `_${bizName}_`
        );
      } else {
        return (
          `Hello ${customer.name}! 👋\n\n` +
          `✅ Great news! You have *no outstanding balance*.\n\n` +
          `All your invoices are settled. Thank you! 🙏\n\n` +
          `_${bizName}_`
        );
      }
    } else {
      return (
        `Hello! 👋 I couldn't find your account.\n\n` +
        `Please contact us directly so we can check your balance.\n\n` +
        `_${bizName}_`
      );
    }
  }

  //  Order/delivery tracking
  if (
    bodyLow.match(
      /\b(order|delivery|track|shipped|dispatch|where is|status|my order)\b/,
    )
  ) {
    const Order = (await import("../models/Order.js")).default;
    const orders = await Order.find({
      user: userId,
      customerPhone: { $regex: normalizePhone(phone), $options: "i" },
    })
      .sort({ createdAt: -1 })
      .limit(3);

    if (orders.length > 0) {
      const latest = orders[0];
      const statusEmoji = {
        pending: "⏳",
        confirmed: "✅",
        processing: "🔄",
        shipped: "🚚",
        delivered: "📦",
        cancelled: "❌",
      };

      return (
        `Hello! 👋 Here's your latest order update:\n\n` +
        `📦 *Order:* ${latest.orderNumber}\n` +
        `${statusEmoji[latest.status] || "📦"} *Status:* ${latest.status?.toUpperCase()}\n` +
        `💰 *Total:* ${fmtN(latest.totalAmount)}\n` +
        `📅 *Date:* ${dayjs(latest.createdAt).format("D MMM YYYY")}\n` +
        (latest.deliveryAddress
          ? `📍 *Address:* ${latest.deliveryAddress}\n`
          : "") +
        (latest.status === "shipped" && latest.shippedAt
          ? `🚚 *Shipped:* ${dayjs(latest.shippedAt).format("D MMM YYYY")}\n`
          : "") +
        (latest.status === "delivered"
          ? `\n✅ Your order has been delivered!`
          : `\nWe'll update you when the status changes.`) +
        `\n\n_${bizName}_`
      );
    } else {
      return (
        `Hello! 👋 I couldn't find any orders for your number.\n\n` +
        `If you placed an order recently, please contact us directly.\n\n` +
        `🛍️ Shop here: trackeet.ng/store/${storeName}\n\n` +
        `_${bizName}_`
      );
    }
  }

  //  Welcome / Navigation
  if (
    bodyLow.match(
      /\b(hello|hi|hey|good morning|good afternoon|good evening|start|menu|help|options)\b/,
    )
  ) {
    const examples = "";

    setMemory(userId, phone, { state: "browsing" });

    const category = owner?.businessCategory || "general";

    // Build menu based on business category
    const isService = [
      "beauty",
      "home_services",
      "freelance",
      "printing",
    ].includes(category);
    const isFood = category === "food";
    const isPOS = category === "pos";

    const menuItems = isPOS
      ? `💳 *Our Services* — "show me your services"\n` +
        `🏦 *Payment Info* — "account details"\n` +
        `🕗 *Business Hours* — "hours"\n` +
        `👤 *Talk to us* — "speak to agent"\n`
      : isService
        ? `📋 *Our Services* — "show me your services"\n` +
          `📅 *Book Appointment* — visit our store to book\n` +
          `💰 *Check Balance* — "my balance"\n` +
          `🏦 *Payment Info* — "account details"\n` +
          `🕗 *Business Hours* — "hours"\n` +
          `👤 *Talk to us* — "speak to agent"\n`
        : isFood
          ? `🍽️ *View Menu* — "show me your menu"\n` +
            `🛒 *Place Order* — visit our store to order\n` +
            `💰 *Check Balance* — "my balance"\n` +
            `🏦 *Payment Info* — "account details"\n` +
            `🕗 *Business Hours* — "hours"\n` +
            `👤 *Talk to us* — "speak to agent"\n`
          : `🛍️ *Search Products* — "do you have [item name]?"\n` +
            `🏪 *Browse Store* — "view store"\n` +
            `💰 *Check Balance* — "my balance"\n` +
            `📦 *Track Order* — "my order"\n` +
            `🏦 *Payment Info* — "account details"\n` +
            `🕗 *Business Hours* — "hours"\n` +
            `👤 *Talk to us* — "speak to agent"\n`;

    // Build examples based on category
    const exampleText = "";

    return (
      `Hello! 👋 Welcome to *${bizName}*!\n\n` +
      `How can I help you today?\n\n` +
      menuItems +
      exampleText +
      `\n\n` +
      (storeName ? `🔗 *Our store:* trackeet.ng/store/${storeName}\n\n` : "") +
      `_${bizName}_`
    );
  }

  return null; // Not handled by commerce — fall through to standard auto-reply
};

//  Standard auto-reply (existing)
const handleStandardAutoReply = async (msg, userId) => {
  const User = (await import("../models/User.js")).default;
  const owner = await User.findById(userId).select(
    "businessName bankName bankAccountNumber bankAccountName",
  );
  const bizName = owner?.businessName || "Trackeet";
  const bankName = owner?.bankName || "Contact us for bank details";
  const bankAccNum = owner?.bankAccountNumber || "—";
  const bankAccName = owner?.bankAccountName || bizName;

  const body = msg.body.toLowerCase().trim();
  let reply = null;

  if (body.match(/\b(invoice|receipt|billing|bill)\b/)) {
    reply = `Hello! 👋 Thank you for reaching out about your invoice.\n\nYour invoice has been sent to you. If you haven't received it, please let us know and we'll resend it immediately.\n\n📧 You can also request your invoice by providing your name or phone number.\n\n_${bizName}_`;
  } else if (body.match(/\b(payment|pay|paid|transfer|send money|bank)\b/)) {
    reply = `Hello! 👋 Thank you for your payment enquiry.\n\n💳 We accept the following payment methods:\n• Bank Transfer\n• Cash\n• POS\n• Crypto (Bitcoin, USDT)\n\nOnce payment is made, please send your proof of payment and we'll confirm immediately.\n\n_${bizName}_`;
  } else if (
    body.match(
      /\b(account|bank account|account number|account details|account info|pay to)\b/,
    )
  ) {
    reply = `Hello! 👋 Here are our payment account details:\n\n🏦 *Bank:* ${bankName}\n👤 *Account Name:* ${bankAccName}\n🔢 *Account Number:* ${bankAccNum}\n\nPlease use your name or invoice number as payment reference.\n\nAfter payment, kindly notify us on this WhatsApp. ✅\n\n_${bizName}_`;
  } else if (
    body.match(
      /\b(hours|open|closed|available|when|time|working hours|office hours)\b/,
    )
  ) {
    reply = `Hello! 👋 Here are our business hours:\n\n🕗 *Monday — Friday:* 8AM — 6PM\n🕗 *Saturday:* 9AM — 3PM\n❌ *Sunday:* Closed\n\nWe'll respond to all messages within our working hours.\n\n_${bizName}_`;
  } else if (
    body.match(
      /\b(contact|call|phone|number|address|location|where|find you)\b/,
    )
  ) {
    reply = `Hello! 👋 Here's how to reach us:\n\n📞 *Phone:* Available on this WhatsApp\n🌐 *Website:* trackeet.ng\n\nWe're happy to help! Feel free to send us a message anytime.\n\n_${bizName}_`;
  } else if (
    body.match(
      /\b(problem|issue|wrong|complaint|bad|error|mistake|not working|failed)\b/,
    )
  ) {
    reply = `Hello! 👋 We're sorry to hear you're experiencing an issue.\n\n🙏 We take all complaints seriously and will resolve this as quickly as possible.\n\nPlease describe the problem in detail and we'll get back to you within 24 hours.\n\n_${bizName}_`;
  } else if (
    body.match(
      /\b(thank|thanks|thank you|appreciated|great|awesome|excellent)\b/,
    )
  ) {
    reply = `You're welcome! 😊🙏\n\nWe truly appreciate your business and kind words.\n\nFeel free to reach out anytime — we're always here to help!\n\n_${bizName}_`;
  } else if (
    body.match(/\b(bye|goodbye|see you|later|take care|ok thanks|noted)\b/)
  ) {
    reply = `Goodbye! 👋😊\n\nThank you for reaching out. Have a wonderful day!\n\nWe look forward to serving you again.\n\n_${bizName}_`;
  }

  return reply;
};

export const initWhatsAppClient = async (userId) => {
  if (clients.has(userId)) return clients.get(userId);

  // Find Chrome executable dynamically
  const { execSync } = await import("child_process");
  let chromePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  if (!chromePath && process.platform !== "win32") {
    try {
      chromePath = execSync(
        "which google-chrome-stable || which google-chrome || which chromium-browser || which chromium",
      )
        .toString()
        .trim();
    } catch {
      // Fall back to puppeteer's own installed chrome
      try {
        const puppeteer = await import("puppeteer");
        chromePath = puppeteer.default.executablePath();
      } catch {
        chromePath = "/usr/bin/chromium";
      }
    }
  } else if (!chromePath) {
    chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  }
  console.log(`Using Chrome at: ${chromePath}`);

  try {
    const wwebjs = await import("whatsapp-web.js");
    const Client = wwebjs.Client || wwebjs.default?.Client;
    const LocalAuth = wwebjs.LocalAuth || wwebjs.default?.LocalAuth;

    if (!Client || !LocalAuth)
      throw new Error("whatsapp-web.js exports not found");

    const client = new Client({
      authStrategy: new LocalAuth({ clientId: userId }),
      puppeteer: {
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
        ],
        headless: true,
        executablePath: chromePath,
      },
    });

    client.on("qr", (qr) => {
      qrCodes.set(userId, qr);
      console.log(`QR ready for user ${userId}`);
    });

    client.on("ready", async () => {
      console.log(`WhatsApp ready for user ${userId}`);
      qrCodes.delete(userId);
      await WhatsAppSettings.findOneAndUpdate(
        { user: userId },
        { connected: true },
        { upsert: true },
      );
    });

    client.on("disconnected", async (reason) => {
      console.log(`WhatsApp disconnected for ${userId}: ${reason}`);
      clients.delete(userId);
      qrCodes.delete(userId);

      try {
        await WhatsAppSettings.findOneAndUpdate(
          { user: userId },
          { connected: false },
        );
      } catch (e) {
        console.error("Settings update error:", e.message);
      }

      // Don't auto-reconnect on LOGOUT — user intentionally disconnected
      if (reason === "LOGOUT") {
        console.log(`User ${userId} logged out — not auto-reconnecting`);
        return;
      }

      // Auto reconnect after 10 seconds for other disconnection reasons
      setTimeout(async () => {
        console.log(`Auto-reconnecting WhatsApp for ${userId}...`);
        await initWhatsAppClient(userId);
      }, 10000);
    });

    //  Message handler
    client.on("message", async (msg) => {
      try {
        // Ignore group messages
        if (msg.from.includes("@g.us")) return;

        const settings = await WhatsAppSettings.findOne({ user: userId });
        if (!settings?.connected) return;

        // Skip if message is from the business owner themselves
        const info = await client.info;
        if (msg.from === info?.wid?._serialized) return;

        let reply = null;

        // Skip auto-reply for storefront order messages
        const isStorefrontOrder =
          msg.body?.includes("I'd like to order") ||
          msg.body?.includes("I'd like to book") ||
          msg.body?.includes("confirm availability");

        if (!isStorefrontOrder && settings.autoReply) {
          reply = await handleCommerceMessage(msg, userId, settings);
        }

        // If storefront order — notify owner via socket + database notification
        if (isStorefrontOrder) {
          try {
            const { emitToUser } = await import("../config/socket.js");
            emitToUser(userId.toString(), "new_order", {
              from: msg.from,
              body: msg.body,
              time: new Date(),
            });
          } catch {}

          // Save to notifications database
          try {
            const { createNotification } =
              await import("../utils/createNotification.js");
            const phone = msg.from.replace("@c.us", "").replace("@lid", "");
            const preview = msg.body?.slice(0, 80) || "New order received";
            await createNotification({
              userId,
              type: "whatsapp",
              title: "🛍️ New Store Order",
              message: `New order from +${phone}: ${preview}...`,
              link: "/dashboard/whatsapp",
              meta: { phone, body: msg.body, time: new Date() },
            });
          } catch (e) {
            console.error("Order notification failed:", e.message);
          }
          // Send confirmation to customer
          const User = (await import("../models/User.js")).default;
          const owner = await User.findById(userId).select("businessName");
          const bizName = owner?.businessName || "Trackeet";
          reply = `Hello! 👋 Thank you for your order!\n\n✅ We have received your order and will confirm availability shortly.\n\nWe'll get back to you as soon as possible.\n\n_${bizName}_`;
        }

        //  Standard auto-reply fallback
        if (!reply && settings.autoReply) {
          reply = await handleStandardAutoReply(msg, userId);
        }

        if (reply) {
          await msg.reply(reply);
          console.log(`✅ Auto-replied to ${msg.from}`);
        }

        //  Emit incoming message to dashboard
        try {
          const { emitToUser } = await import("../config/socket.js");
          emitToUser(userId.toString(), "whatsapp_message", {
            from: msg.from,
            body: msg.body,
            time: new Date(),
            replied: !!reply,
          });
        } catch {}
      } catch (err) {
        console.error("Auto-reply error:", err.message);
      }
    });

    await client.initialize();
    clients.set(userId, client);
    return client;
  } catch (err) {
    console.error("WhatsApp init error:", err.message);
    return null;
  }
};

export const getWhatsAppStatus = async (userId) => {
  const settings = await WhatsAppSettings.findOne({ user: userId });
  return {
    connected: settings?.connected || false,
    phoneNumber: settings?.phoneNumber,
  };
};

export const restoreWhatsAppSessions = async () => {
  try {
    // Kill any stale Chrome processes first
    await killChrome();
    await new Promise((r) => setTimeout(r, 3000));

    const settings = await WhatsAppSettings.find({ connected: true });
    console.log(`Restoring ${settings.length} WhatsApp session(s)...`);

    for (const s of settings) {
      try {
        await initWhatsAppClient(s.user.toString());
        // Small delay between multiple sessions
        await new Promise((r) => setTimeout(r, 2000));
      } catch (e) {
        console.error(`Failed to restore session for ${s.user}:`, e.message);
        // Mark as disconnected if restore fails
        await WhatsAppSettings.findOneAndUpdate(
          { user: s.user },
          { connected: false },
        );
      }
    }
  } catch (err) {
    console.error("Failed to restore WhatsApp sessions:", err.message);
  }
};

export const getWhatsAppQR = async (userId) => {
  if (!clients.has(userId)) await initWhatsAppClient(userId);
  for (let i = 0; i < 30; i++) {
    if (qrCodes.has(userId)) {
      const QRCode = (await import("qrcode")).default;
      return await QRCode.toDataURL(qrCodes.get(userId));
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  return null;
};

export const sendRawWhatsAppMessage = async (userId, phone, message) => {
  let client = clients.get(userId);
  if (!client) throw new Error("Client not ready");

  const waPhone = getWaId(phone);

  try {
    await client.sendMessage(waPhone, message);
  } catch (err) {
    if (
      err.message.includes("detached Frame") ||
      err.message.includes("Target closed")
    ) {
      console.log("Detached frame — reinitializing...");
      clients.delete(userId);
      await initWhatsAppClient(userId);
      for (let i = 0; i < 30; i++) {
        if (clients.has(userId)) break;
        await new Promise((r) => setTimeout(r, 500));
      }
      client = clients.get(userId);
      if (!client) throw new Error("Client failed to reinitialize");
      await client.sendMessage(waPhone, message);
    } else {
      throw err;
    }
  }
};

//  Human Handoff — owner takes over
export const takeOverConversation = (userId, phone) => {
  setMemory(userId, phone, { handedOff: true });
  console.log(`Owner took over conversation with ${phone}`);
};

export const releaseConversation = (userId, phone) => {
  setMemory(userId, phone, { handedOff: false });
  console.log(`Bot restored for conversation with ${phone}`);
};

export const disconnectWhatsApp = async (userId) => {
  const client = clients.get(userId);
  clients.delete(userId);
  qrCodes.delete(userId);
  if (client) {
    try {
      await client.destroy();
    } catch (e) {
      console.log("Destroy error ignored:", e.message);
    }
  }
  await WhatsAppSettings.findOneAndUpdate(
    { user: userId },
    { connected: false },
  );
};

export const sendWhatsAppMessage = async ({
  userId,
  invoice,
  type = "invoice",
  businessName = "Trackeet",
}) => {
  const settings = await WhatsAppSettings.findOne({ user: userId });
  if (!settings?.connected) throw new Error("WhatsApp not connected");

  if (!clients.has(userId.toString())) {
    console.log("Client not in memory, re-initializing...");
    await initWhatsAppClient(userId.toString());
    for (let i = 0; i < 30; i++) {
      if (clients.has(userId.toString())) break;
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  let client = clients.get(userId.toString());
  if (!client) throw new Error("WhatsApp client not ready");

  const fmt = (n) => "\u20a6" + (n || 0).toLocaleString("en-NG");
  const customer = invoice.customer;
  const waPhone = getWaId(customer.phone);

  let msg = "";

  if (type === "invoice") {
    const itemsList = (invoice.items || [])
      .map(
        (item) =>
          `  • ${item.name} x${item.quantity} — ${fmt(item.total || item.quantity * item.unitPrice)}` +
          (item.description ? `\n    _${item.description}_` : ""),
      )
      .join("\n");

    msg =
      `Hello ${customer.name} 👋\n\n` +
      `Here is your invoice from *${businessName}*:\n\n` +
      `📄 *Invoice:* ${invoice.invoiceNumber}\n` +
      `📅 *Date:* ${dayjs(invoice.invoiceDate).format("D MMM YYYY")}\n` +
      (invoice.dueDate
        ? `⏰ *Due Date:* ${dayjs(invoice.dueDate).format("D MMM YYYY")}\n`
        : "") +
      `\n*Items:*\n${itemsList}\n\n` +
      `🧾 *Subtotal:* ${fmt(invoice.subtotal)}\n` +
      (invoice.discountPercent > 0
        ? `🏷️ *Discount (${invoice.discountPercent}%):* -${fmt(invoice.discountAmount)}\n`
        : "") +
      `💰 *Total:* ${fmt(invoice.totalAmount)}\n` +
      (invoice.amountPaid > 0
        ? `✅ *Paid:* ${fmt(invoice.amountPaid)}\n`
        : "") +
      (invoice.balance > 0
        ? `⚠️ *Balance Due:* ${fmt(invoice.balance)}\n`
        : `✅ *Status:* Fully Paid\n`) +
      (invoice.notes ? `\n📋 *Notes:* ${invoice.notes}\n` : "") +
      (invoice.delivery?.enabled
        ? `\n🚚 *Delivery:* Order created & being prepared\n` +
          (invoice.delivery.feeType === "fixed" && invoice.delivery.fee > 0
            ? `💰 *Delivery Fee:* ${fmt(invoice.delivery.fee)}\n`
            : invoice.delivery.feeType === "free"
              ? `🎉 *Delivery:* FREE\n`
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
      `\nThank you for your business! 🙏\n_Powered by ${businessName} · trackeet.ng_`;
  } else if (type === "reminder") {
    msg =
      `Hello ${customer.name} 👋\n\n` +
      `⏰ This is a friendly reminder that invoice *${invoice.invoiceNumber}* for *${fmt(invoice.totalAmount)}* is due soon.\n\n` +
      `📅 *Due Date:* ${invoice.dueDate ? dayjs(invoice.dueDate).format("D MMM YYYY") : "—"}\n` +
      `💰 *Balance Due:* ${fmt(invoice.balance || invoice.totalAmount)}\n\n` +
      `Please arrange payment at your earliest convenience.\n\n` +
      `_${businessName} · trackeet.ng_`;
  } else if (type === "overdue") {
    msg =
      `Hello ${customer.name} 👋\n\n` +
      `⚠️ Your invoice *${invoice.invoiceNumber}* is *OVERDUE*.\n\n` +
      `💰 *Amount Due:* ${fmt(invoice.balance || invoice.totalAmount)}\n` +
      `📅 *Was Due:* ${invoice.dueDate ? dayjs(invoice.dueDate).format("D MMM YYYY") : "—"}\n\n` +
      `Please make payment as soon as possible to avoid any issues.\n\n` +
      `_${businessName} · trackeet.ng_`;
  } else if (type === "receipt") {
    msg =
      `Hello ${customer.name} 👋\n\nPayment received! ✅\n\n` +
      `Invoice *${invoice.invoiceNumber}* has been marked as *PAID*.\n\n` +
      `💰 *Amount Paid:* ${fmt(invoice.amountPaid || invoice.totalAmount)}\n\n` +
      `Thank you for your business! 🙏\n\n_${businessName} · trackeet.ng_`;
  } else if (type === "refund") {
    msg =
      `Hello ${customer.name} 👋\n\n` +
      `↩️ *Refund Notification*\n\n` +
      `Invoice *${invoice.invoiceNumber}* has been *REFUNDED*.\n\n` +
      `💰 *Refund Amount:* ${fmt(invoice.totalAmount)}\n` +
      `📅 *Date:* ${dayjs().format("D MMM YYYY")}\n` +
      (invoice.refundReason ? `📋 *Reason:* ${invoice.refundReason}\n` : "") +
      `\nYour refund will be processed shortly. Please contact us if you have any questions.\n\n` +
      `_${businessName} · trackeet.ng_`;
  }

  try {
    await client.sendMessage(waPhone, msg);
  } catch (err) {
    if (
      err.message.includes("detached Frame") ||
      err.message.includes("Target closed")
    ) {
      console.log(
        "Detached frame detected — reinitializing WhatsApp client...",
      );
      clients.delete(userId.toString());
      qrCodes.delete(userId.toString());
      await killChrome();
      await new Promise((r) => setTimeout(r, 3000));
      await initWhatsAppClient(userId.toString());
      for (let i = 0; i < 30; i++) {
        if (clients.has(userId.toString())) break;
        await new Promise((r) => setTimeout(r, 500));
      }
      client = clients.get(userId.toString());
      if (!client) throw new Error("WhatsApp client failed to reinitialize");
      await client.sendMessage(waPhone, msg);
      console.log("✅ Resent after reinitialization");
    } else {
      throw err;
    }
  }

  await WhatsAppLog.create({
    user: userId,
    customer: customer._id,
    invoice: invoice._id,
    type,
    message: msg,
    status: "sent",
  });
};

export const sendWhatsAppImage = async (userId, phone, imageUrl, caption) => {
  if (!clients.has(userId)) {
    await initWhatsAppClient(userId);
    for (let i = 0; i < 30; i++) {
      if (clients.has(userId)) break;
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  if (!clients.get(userId)) throw new Error("Client not ready");

  const waPhone = getWaId(phone);

  const trySend = async () => {
    const currentClient = clients.get(userId);
    if (!currentClient) throw new Error("Client not ready");
    const wwebjs = await import("whatsapp-web.js");
    const MessageMedia = wwebjs.MessageMedia || wwebjs.default?.MessageMedia;
    if (!MessageMedia) throw new Error("MessageMedia not found");
    const media = await MessageMedia.fromUrl(imageUrl, { unsafeMime: true });
    await currentClient.sendMessage(waPhone, media, { caption });
  };

  const trySendText = async () => {
    const currentClient = clients.get(userId);
    if (currentClient) {
      await currentClient.sendMessage(
        waPhone,
        `${caption}\n\n📷 View photo: ${imageUrl}`,
      );
    }
  };

  try {
    await trySend();
    console.log(`✅ Image sent to ${phone}`);
  } catch (err) {
    if (
      err.message.includes("detached Frame") ||
      err.message.includes("Target closed")
    ) {
      console.log("Detached frame in image send — reinitializing...");
      clients.delete(userId);
      qrCodes.delete(userId);
      await killChrome();
      await new Promise((r) => setTimeout(r, 3000));
      await initWhatsAppClient(userId);
      for (let i = 0; i < 30; i++) {
        if (clients.has(userId)) break;
        await new Promise((r) => setTimeout(r, 500));
      }
      try {
        await trySend();
        console.log(`✅ Image resent after reinitialization`);
      } catch {
        await trySendText();
      }
    } else {
      console.error("Image send failed:", err.message);
      await trySendText();
    }
  }
};
