import crypto from "crypto";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { generateToken } from "../utils/generateToken.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import { sendEmail } from "../services/emailService.js";
import { emitToUser } from "../config/socket.js";
import speakeasy from "speakeasy";
import QRCode from "qrcode";
import Referral from "../models/Referral.js";

export const register = asyncHandler(async (req, res) => {
  const PlatformSettings = (await import("../models/PlatformSettings.js"))
    .default;
  const platformSettings = await PlatformSettings.findOne();
  if (platformSettings && !platformSettings.allowRegistrations) {
    throw new AppError(
      "New registrations are currently disabled. Please try again later.",
      403,
    );
  }
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    businessName,
    businessCategory,
    ref, // referral code from query params
  } = req.body;
  if (await User.findOne({ email }))
    throw new AppError("Email already registered", 400);

  // Normalize and check phone
  const normalizePhone = (p) => {
    if (!p) return null;
    let digits = p.replace(/\D/g, "");
    if (digits.startsWith("0")) digits = "234" + digits.slice(1);
    return "+" + digits;
  };
  const normalizedPhone = normalizePhone(phone);
  if (normalizedPhone) {
    const phoneExists = await User.findOne({ phone: normalizedPhone });
    if (phoneExists) throw new AppError("Phone number already registered", 400);
  }
  // Auto-generate storeName from business name
  const storeName = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 30);

  // Check if storeName already taken
  const storeExists = await User.findOne({ storeName });
  if (storeExists) {
    // Generate alternative suggestions
    const suggestion1 = storeName + "ng";
    const suggestion2 = storeName + "store";
    const suggestion3 = storeName + Math.floor(Math.random() * 99 + 1);
    throw new AppError(
      `Business name "${businessName}" is already taken. Try adding something unique like your city or a number — e.g. "${suggestion1}", "${suggestion2}" or "${suggestion3}".`,
      400,
    );
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone: normalizedPhone || phone,
    password,
    businessName,
    businessCategory: req.body.businessCategory || "general",
    storeName,
    referralCode: crypto.randomBytes(4).toString("hex").toUpperCase(),
  });

  // After creating user, check for referral code
  if (ref) {
    try {
      const referrer = await User.findOne({ referralCode: ref.toUpperCase() });
      if (referrer && referrer._id.toString() !== user._id.toString()) {
        const existingReferral = await Referral.findOne({ referred: user._id });
        if (!existingReferral) {
          await Referral.create({
            referrer: referrer._id,
            referred: user._id,
          });
          await User.findByIdAndUpdate(user._id, { referredBy: referrer._id });
        }
      }
    } catch (e) {
      console.error("Referral tracking failed:", e.message);
    }
  }

  // Mark user as verified since we removed email verification requirement
  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  // Generate verification token
  // const verificationToken = crypto.randomBytes(32).toString("hex");
  // const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // user.verificationToken = verificationToken;
  // user.verificationExpires = verificationExpires;
  // await user.save({ validateBeforeSave: false });

  // // Send verification email
  // const verifyLink = `${(process.env.FRONTEND_URL || "http://localhost:3000").split(",")[0].trim()}/verify-email?token=${verificationToken}`;

  // await Promise.race([
  //   sendEmail({
  //     to: user.email,
  //     subject: "Verify your Trackeet account",
  //     html: `
  //   <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
  //     <div style="background:linear-gradient(135deg,#7C3AED,#6366F1);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
  //       <h1 style="color:#fff;margin:0;font-size:24px;">TRACKEET</h1>
  //       <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">Smart Invoice Management</p>
  //     </div>
  //     <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
  //       <h2 style="color:#0f172a;margin:0 0 8px;">Verify your email 📧</h2>
  //       <p style="color:#64748b;line-height:1.6;">
  //         Hi <strong style="color:#0f172a;">${user.firstName}</strong>, welcome to Trackeet!
  //         Please verify your email address to activate your account.
  //       </p>
  //       <div style="text-align:center;margin:28px 0;">
  //         <a href="${verifyLink}"
  //            style="background:#7C3AED;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:700;display:inline-block;">
  //           Verify My Email →
  //         </a>
  //       </div>
  //       <p style="color:#94a3b8;font-size:12px;text-align:center;">
  //         Or copy this link:<br/>
  //         <a href="${verifyLink}" style="color:#7C3AED;word-break:break-all;font-size:11px;">${verifyLink}</a>
  //       </p>
  //       <div style="background:#fef3c7;border-radius:8px;padding:12px;margin-top:20px;">
  //         <p style="margin:0;color:#92400e;font-size:12px;">
  //           ⚠️ This link expires in <strong>24 hours</strong>.<br/>
  //           📬 Can't find the email? Check your <strong>spam/junk folder</strong> and mark as "Not Spam".
  //         </p>
  //       </div>
  //     </div>
  //     <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px;">
  //       © 2026 Trackeet · trackeet.ng · If you didn't create this account, ignore this email.
  //     </p>
  //   </div>
  // `,
  //   }),
  //   new Promise((_, reject) =>
  //     setTimeout(() => reject(new Error("Email timeout")), 5000),
  //   ),
  // ]).catch((err) => console.error("Verification email failed:", err.message));

  // Send welcome email non-blocking

  sendEmail({
    to: user.email,
    subject: "Welcome to Trackeet! 🎉",
    html: `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#7C3AED,#6366F1);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TRACKEET</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">Smart Invoicing & WhatsApp Commerce</p>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <h2 style="color:#0f172a;margin:0 0 8px;">Welcome aboard, ${user.firstName}! 🚀</h2>
        <p style="color:#64748b;line-height:1.6;">
          Your Trackeet account is ready. Here's what you can do right now:
        </p>
        <div style="margin:20px 0;">
          <div style="display:flex;align-items:center;margin-bottom:12px;">
            <span style="font-size:20px;margin-right:12px;">📄</span>
            <p style="margin:0;color:#0f172a;font-size:14px;"><strong>Create invoices</strong> — professional PDFs in seconds</p>
          </div>
          <div style="display:flex;align-items:center;margin-bottom:12px;">
            <span style="font-size:20px;margin-right:12px;">💬</span>
            <p style="margin:0;color:#0f172a;font-size:14px;"><strong>Connect WhatsApp</strong> — auto-send invoices & receipts</p>
          </div>
          <div style="display:flex;align-items:center;margin-bottom:12px;">
            <span style="font-size:20px;margin-right:12px;">🛍️</span>
            <p style="margin:0;color:#0f172a;font-size:14px;"><strong>Launch your store</strong> — free storefront at gettrackeet.com/store/${user.storeName}</p>
          </div>
          <div style="display:flex;align-items:center;">
            <span style="font-size:20px;margin-right:12px;">💰</span>
            <p style="margin:0;color:#0f172a;font-size:14px;"><strong>Track payments</strong> — know who paid and who owes you</p>
          </div>
        </div>
        <div style="text-align:center;margin:28px 0;">
          <a href="https://gettrackeet.com/dashboard"
             style="background:#7C3AED;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:700;display:inline-block;">
            Go to Dashboard →
          </a>
        </div>
        <div style="background:#f0fdf4;border-radius:8px;padding:12px;margin-top:20px;border:1px solid #bbf7d0;">
          <p style="margin:0;color:#166534;font-size:12px;">
            🎁 <strong>Free plan includes:</strong> 5 invoices/month, free online store, WhatsApp automation & more.
          </p>
        </div>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px;">
        © 2026 Trackeet · gettrackeet.com · Need help? Email us at hello@gettrackeet.com
      </p>
    </div>
    `,
  }).catch((err) => console.error("Welcome email failed:", err.message));

  const token = generateToken(user._id);

  // Notify admins
  try {
    const admins = await User.find({
      role: { $in: ["admin", "superadmin"] },
    }).select("_id");
    for (const admin of admins) {
      const notif = await Notification.create({
        user: admin._id,
        type: "registration",
        title: "New User Registered",
        message: `${firstName} ${lastName} just created a free account.`,
        link: "/admin/users",
        meta: { userId: user._id, email, businessName },
      });
      emitToUser(admin._id.toString(), "notification", notif);
    }
  } catch (e) {
    /* non-blocking */
  }

  res.status(201).json({
    success: true,
    message: "Account created successfully! Welcome to Trackeet.",
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      plan: user.plan,
      role: user.role,
      businessName: user.businessName,
      businessCategory: user.businessCategory,
      storeName: user.storeName,
      storeActive: user.storeActive,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError("Email and password required");
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password)))
    throw new AppError("Invalid credentials", 401);
  if (user.status === "suspended")
    throw new AppError("Account suspended. Contact support.", 403);
  // if (!user.isVerified && user.role !== "superadmin") {
  //   throw new AppError(
  //     "Please verify your email before logging in. Check your inbox or spam folder.",
  //     401,
  //   );
  // }
  if (user.twoFactorEnabled) {
    return res.json({
      success: true,
      requires2FA: true,
      userId: user._id,
      message: "Enter your 2FA code to continue",
    });
  }
  const token = generateToken(user._id);
  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      plan: user.plan,
      role: user.role,
      businessName: user.businessName,
      businessLogo: user.businessLogo,
      businessAddress: user.businessAddress,
      businessCategory: user.businessCategory,
      storeName: user.storeName,
      storeActive: user.storeActive,
      invoicePrefix: user.invoicePrefix,
      invoiceTemplate: user.invoiceTemplate,
      twoFactorEnabled: user.twoFactorEnabled,
      notificationPrefs: user.notificationPrefs,
    },
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.json({
      success: true,
      message: "If that email exists, a reset link was sent.",
    });
  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  await user.save();
  const url = `${(process.env.FRONTEND_URL || "http://localhost:3000").split(",")[0].trim()}/reset-password/${token}`;
  await sendEmail({
    to: user.email,
    subject: "Reset your Trackeet password",
    html: `<p>Click <a href="${url}">here</a> to reset your password. Link expires in 1 hour.</p>`,
  });
  res.json({ success: true, message: "Reset link sent to your email." });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto
    .createHash("sha256")
    .update(req.body.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashed,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) throw new AppError("Invalid or expired reset token", 400);
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ success: true, message: "Password reset successful." });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({
    verificationToken: token,
    verificationExpires: { $gt: new Date() },
  }).select("+verificationToken +verificationExpires");

  if (!user) throw new AppError("Invalid or expired verification link", 400);

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({
    success: true,
    message: "Email verified successfully! You can now log in.",
  });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email }).select(
    "+verificationToken +verificationExpires",
  );
  if (!user) throw new AppError("No account found with this email", 404);
  if (user.isVerified) throw new AppError("Email already verified", 400);

  const verificationToken = crypto.randomBytes(32).toString("hex");
  const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  user.verificationToken = verificationToken;
  user.verificationExpires = verificationExpires;
  await user.save({ validateBeforeSave: false });

  const verifyLink = `${(process.env.FRONTEND_URL || "http://localhost:3000").split(",")[0].trim()}/verify-email?token=${verificationToken}`;

  await sendEmail({
    to: email,
    subject: "Verify your Trackeet account",
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
        <div style="background:linear-gradient(135deg,#7C3AED,#6366F1);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
          <h1 style="color:#fff;margin:0;font-size:24px;">TRACKEET</h1>
        </div>
        <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;">
          <h2 style="color:#0f172a;">New verification link 🔗</h2>
          <p style="color:#64748b;">Here's your new verification link:</p>
          <div style="text-align:center;margin:28px 0;">
            <a href="${verifyLink}"
               style="background:#7C3AED;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:700;display:inline-block;">
              Verify My Email →
            </a>
          </div>
          <div style="background:#fef3c7;border-radius:8px;padding:12px;margin-top:20px;">
            <p style="margin:0;color:#92400e;font-size:12px;">
              ⚠️ Expires in <strong>24 hours</strong>.<br/>
              📬 Check <strong>spam/junk folder</strong> if you don't see it in inbox.
            </p>
          </div>
        </div>
      </div>
    `,
  });

  res.json({
    success: true,
    message: "Verification email sent! Check your inbox and spam folder.",
  });
});

// Step 1 — Generate secret and QR code
export const setup2FA = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  const secret = speakeasy.generateSecret({
    name: `Trackeet (${user.email})`,
    issuer: "Trackeet",
    length: 20,
  });

  // Save secret temporarily (not enabled yet)
  user.twoFactorSecret = secret.base32;
  await user.save({ validateBeforeSave: false });

  // Generate QR code
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  res.json({
    success: true,
    qrCode: qrCodeUrl,
    secret: secret.base32, // show to user as backup
  });
});

// Step 2 — Verify code and enable 2FA
export const verify2FA = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const user = await User.findById(req.user._id).select("+twoFactorSecret");

  if (!user.twoFactorSecret) throw new AppError("2FA setup not initiated", 400);

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 6,
  });

  if (!verified) throw new AppError("Invalid code. Please try again.", 400);

  user.twoFactorEnabled = true;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: "2FA enabled successfully!" });
});

// Step 3 — Disable 2FA
export const disable2FA = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const user = await User.findById(req.user._id).select("+twoFactorSecret");

  if (!user.twoFactorEnabled) throw new AppError("2FA is not enabled", 400);

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: code,
    window: 6,
  });

  if (!verified) throw new AppError("Invalid code", 400);

  user.twoFactorEnabled = false;
  user.twoFactorSecret = undefined;
  await user.save({ validateBeforeSave: false });

  res.json({ success: true, message: "2FA disabled" });
});

// Step 4 — Validate 2FA on login
export const validate2FA = asyncHandler(async (req, res) => {
  const { userId, code } = req.body;

  // Fetch fresh with secret
  const user = await User.findById(userId).select(
    "+twoFactorSecret +twoFactorEnabled",
  );
  if (!user) throw new AppError("User not found", 404);
  if (!user.twoFactorEnabled) throw new AppError("2FA not enabled", 400);
  if (!user.twoFactorSecret) throw new AppError("2FA secret not found", 400);

  // Generate what the server expects right now
  const expected = speakeasy.totp({
    secret: user.twoFactorSecret,
    encoding: "base32",
  });
  console.log("Expected:", expected, "Received:", code);

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token: String(code), // ← ensure string
    window: 6,
  });

  if (!verified) throw new AppError("Invalid 2FA code", 401);

  const token = generateToken(user._id);
  res.json({
    success: true,
    token,
    user: {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      plan: user.plan,
      role: user.role,
      businessName: user.businessName,
      businessLogo: user.businessLogo,
      twoFactorEnabled: user.twoFactorEnabled,
    },
  });
});
