import { BrevoClient } from "@getbrevo/brevo";

const client = new BrevoClient({
  apiKey: process.env.BREVO_API_KEY,
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    await client.transactionalEmails.sendTransacEmail({
      sender: {
        name: process.env.FROM_NAME || "Trackeet",
        email: process.env.FROM_EMAIL || "hello@gettrackeet.com",
      },
      to: [{ email: to }],
      subject,
      htmlContent: html,
      textContent: text || subject,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error("Email error:", err.message);
  }
};