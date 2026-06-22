import crypto from "crypto";
import Webhook from "../models/Webhook.js";

export const triggerWebhook = async ({ userId, event, data }) => {
  try {
    const webhooks = await Webhook.find({
      user: userId,
      status: "active",
      events: event,
    });

    for (const webhook of webhooks) {
      try {
        const payload = JSON.stringify({
          event,
          data,
          timestamp: new Date().toISOString(),
        });
        const signature = webhook.secret
          ? crypto
              .createHmac("sha256", webhook.secret)
              .update(payload)
              .digest("hex")
          : null;

        const headers = {
          "Content-Type": "application/json",
          "X-Trackeet-Event": event,
          "X-Trackeet-Time": new Date().toISOString(),
        };
        if (signature) headers["X-Trackeet-Signature"] = `sha256=${signature}`;

        const response = await fetch(webhook.url, {
          method: "POST",
          headers,
          body: payload,
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (response.ok) {
          webhook.successCount = (webhook.successCount || 0) + 1;
          webhook.lastTriggered = new Date();
          webhook.failCount = 0;
        } else {
          webhook.failCount = (webhook.failCount || 0) + 1;
        }

        // Auto-disable after 10 consecutive failures
        if (webhook.failCount >= 10) {
          webhook.status = "disabled";
          console.log(`⚠️ Webhook ${webhook.name} disabled after 10 failures`);
        }

        await webhook.save();
        console.log(`✅ Webhook triggered: ${event} → ${webhook.url}`);
      } catch (err) {
        webhook.failCount = (webhook.failCount || 0) + 1;
        await webhook.save();
        console.error(`❌ Webhook failed: ${webhook.url} — ${err.message}`);
      }
    }
  } catch (err) {
    console.error("Webhook trigger error:", err.message);
  }
};
