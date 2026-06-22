import User from "../models/User.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import { uploadImage } from "../config/cloudinary.js";
import fs from "fs";
import Invoice from "../models/Invoice.js";
import Customer from "../models/Customer.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";
import TeamMember from "../models/TeamMember.js";
import ActivityLog from "../models/ActivityLog.js";
import ApiKey from "../models/ApiKey.js";
import Webhook from "../models/Webhook.js";

export const getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

export const updateNotificationPrefs = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { notificationPrefs: req.body },
    { new: true },
  );
  res.json({ success: true, notificationPrefs: user.notificationPrefs });
});

export const updateProfile = asyncHandler(async (req, res) => {
  // Normalize and check phone
  if (req.body.phone) {
    const normalizePhone = (p) => {
      if (!p) return null;
      let digits = p.replace(/\D/g, "");
      if (digits.startsWith("0")) digits = "234" + digits.slice(1);
      return "+" + digits;
    };
    req.body.phone = normalizePhone(req.body.phone);
    const existing = await User.findOne({
      phone: req.body.phone,
      _id: { $ne: req.user._id },
    });
    if (existing)
      throw new AppError("Phone number already in use by another account", 400);
  }

  const fields = [
    "firstName",
    "lastName",
    "phone",
    "businessName",
    "businessAddress",
    "invoicePrefix",
    "bankName",
    "bankAccountNumber",
    "bankAccountName",
    "storeName",
    "businessCategory",
    "storePrimaryColor",
    "storeFont",
    "storeBannerImage",
    "businessHours",
    "socialLinks",
    "alwaysOpen",
    "aboutUs",
    "termsAndConditions",
    "refundPolicy",
    "contactEmail",
    "contactPhones",
  ];
  const updates = {};
  fields.forEach((f) => {
    if (req.body[f] !== undefined) updates[f] = req.body[f];
  });

  // Auto-generate storeName if businessName changed and no storeName provided
  if (req.body.businessName && !req.body.storeName) {
    updates.storeName = req.body.businessName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 30);
  }

  // Auto-generate storeName if user doesn't have one
  if (!req.user.storeName && !updates.storeName) {
    const bName = req.body.businessName || req.user.businessName;
    if (bName) {
      updates.storeName = bName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .slice(0, 30);
    }
  }

  // Check storeName uniqueness
  if (updates.storeName) {
    const storeExists = await User.findOne({
      storeName: updates.storeName,
      _id: { $ne: req.user._id },
    });
    if (storeExists)
      throw new AppError(
        `Store name "${updates.storeName}" is already taken. Try a different business name.`,
        400,
      );
  }

  if (req.body.password) {
    req.user.password = req.body.password;
    await req.user.save();
  }

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  await ActivityLog.create({
    owner: req.user._id,
    user: req.user._id,
    userName: `${req.user.firstName} ${req.user.lastName}`,
    role: "owner",
    action: "Updated profile/settings",
    entity: "settings",
    details: `Updated: ${Object.keys(updates).join(", ")}`,
    ip: req.ip,
  }).catch(() => {});

  res.json({ success: true, user });
});

export const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file)
    return res
      .status(400)
      .json({ success: false, message: "No file uploaded" });
  const url = await uploadImage(req.file.path, "trackeet/logos");
  fs.unlink(req.file.path, () => {});
  const user = await User.findByIdAndUpdate(
    req.user._id,
    { businessLogo: url },
    { new: true },
  );

  await ActivityLog.create({
    owner: req.user._id,
    user: req.user._id,
    userName: `${req.user.firstName} ${req.user.lastName}`,
    role: "owner",
    action: "Updated business logo",
    entity: "settings",
    details: "Logo uploaded",
    ip: req.ip,
  }).catch(() => {});

  res.json({ success: true, businessLogo: url, user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    throw new AppError("Please provide current and new password", 400);
  if (newPassword.length < 6)
    throw new AppError("New password must be at least 6 characters", 400);
  if (currentPassword === newPassword)
    throw new AppError(
      "New password must be different from current password",
      400,
    );

  // Get user with password
  const user = await User.findById(req.user._id).select("+password");
  if (!user) throw new AppError("User not found", 404);

  // Check current password
  const isMatch = await user.matchPassword(currentPassword);
  if (!isMatch) throw new AppError("Current password is incorrect", 400);

  // Update password
  user.password = newPassword;
  await user.save();

  await ActivityLog.create({
    owner: req.user._id,
    user: req.user._id,
    userName: `${req.user.firstName} ${req.user.lastName}`,
    role: "owner",
    action: "Changed password",
    entity: "settings",
    details: "Password updated",
    ip: req.ip,
  }).catch(() => {});

  res.json({ success: true, message: "Password changed successfully" });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const user = await User.findById(req.user._id).select("+password");

  // Verify password before deleting
  if (!password)
    throw new AppError("Please provide your password to confirm deletion", 400);
  const isMatch = await user.matchPassword(password);
  if (!isMatch) throw new AppError("Incorrect password", 401);

  // Delete all user data
  await Promise.all([
    Invoice.deleteMany({ user: req.user._id }),
    Customer.deleteMany({ user: req.user._id }),
    Payment.deleteMany({ user: req.user._id }),
    Notification.deleteMany({ user: req.user._id }),
    TeamMember.deleteMany({ owner: req.user._id }),
    ActivityLog.deleteMany({ owner: req.user._id }),
    ApiKey.deleteMany({ user: req.user._id }),
    Webhook.deleteMany({ user: req.user._id }),
    User.findByIdAndDelete(req.user._id),
  ]);

  res.json({ success: true, message: "Account deleted successfully" });
});

export const uploadBanner = asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("No file uploaded", 400);
  const url = await uploadImage(
    req.file.path.replace(/\\/g, "/"),
    "trackeet/banners",
  );
  await User.findByIdAndUpdate(req.user._id, { storeBannerImage: url });
  res.json({ success: true, storeBannerImage: url });
});
