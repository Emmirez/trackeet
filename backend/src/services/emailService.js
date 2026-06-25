import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp-relay.brevo.com",
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    await transporter.sendMail({
      from: `"${process.env.FROM_NAME || "Trackeet"}" <${process.env.FROM_EMAIL}>`,
      to,
      subject,
      html,
      text: text || subject,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (err) {
    console.error("Email error:", err.message);
  }
};
