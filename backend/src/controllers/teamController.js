import crypto from "crypto";
import TeamMember from "../models/TeamMember.js";
import User from "../models/User.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import { createNotification } from "../utils/createNotification.js";
import { logActivity } from "../utils/activityLogger.js";

const PLAN_LIMITS = {
  free: 0,
  starter: 2,
  business: 5,
  enterprise: Infinity,
};

export const getTeam = asyncHandler(async (req, res) => {
  const members = await TeamMember.find({ owner: req.user._id })
    .populate("user", "firstName lastName email phone")
    .sort({ createdAt: -1 });
  res.json({ success: true, members });
});

export const inviteMember = asyncHandler(async (req, res) => {
  const { email, name, role = "staff" } = req.body;
  const owner = req.user;
  // Fetch full owner details for email
  const ownerDetails = await User.findById(owner._id).select(
    "firstName lastName businessName",
  );

  // Plan check
  const limit = PLAN_LIMITS[owner.plan] ?? 0;
  if (limit === 0)
    throw new AppError(
      "Team members are only available on Business or Enterprise plan",
      403,
    );

  const currentCount = await TeamMember.countDocuments({
    owner: owner._id,
    status: { $ne: "suspended" },
  });
  if (currentCount >= limit)
    throw new AppError(
      `Your ${owner.plan} plan allows up to ${limit} team members`,
      403,
    );

  // Check if already invited
  const existing = await TeamMember.findOne({ owner: owner._id, email });
  if (existing) throw new AppError("This email has already been invited", 400);

  // Check if email is already a registered user
  const existingUser = await User.findOne({ email });

  // Generate invite token
  const inviteToken = crypto.randomBytes(32).toString("hex");
  const inviteExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const member = await TeamMember.create({
    owner: owner._id,
    user: existingUser?._id || null,
    email,
    name,
    role,
    status: existingUser ? "active" : "pending",
    inviteToken,
    inviteExpires,
  });

  // TODO: Send invite email
  const inviteLink = `${process.env.FRONTEND_URL || "http://localhost:5173"}/team/accept?token=${inviteToken}`;
  console.log(`📧 Invite link for ${email}: ${inviteLink}`);

  // Send invite email
  const { sendEmail } = await import("../services/emailService.js");

  const ownerFullName = `${ownerDetails.firstName} ${ownerDetails.lastName}`;
  const bizName =
    ownerDetails.businessName || `${ownerDetails.firstName}'s Business`;

  await sendEmail({
    to: email,
    subject: `${ownerFullName} invited you to join ${bizName} on Trackeet`,
    html: `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,#7C3AED,#6366F1);padding:32px;border-radius:16px 16px 0 0;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:24px;">TRACKEET</h1>
        <p style="color:rgba(255,255,255,0.8);margin:4px 0 0;font-size:13px;">Smart Invoice Management</p>
      </div>
      <div style="background:#fff;padding:32px;border-radius:0 0 16px 16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <h2 style="color:#0f172a;margin:0 0 8px;">You're invited! 🎉</h2>
        <p style="color:#64748b;line-height:1.6;">
          <strong style="color:#0f172a;">${ownerFullName}</strong> has invited you to join
          <strong style="color:#7C3AED;">${bizName}</strong> as a
          <strong style="color:#0f172a;text-transform:capitalize;">${role}</strong>.
        </p>
        <div style="background:#f8fafc;border-radius:12px;padding:16px;margin:20px 0;border-left:4px solid #7C3AED;">
          <p style="margin:0;color:#64748b;font-size:12px;font-weight:600;text-transform:uppercase;">Your Role</p>
          <p style="margin:4px 0 0;color:#0f172a;font-size:16px;font-weight:700;text-transform:capitalize;">${role}</p>
          <p style="margin:4px 0 0;color:#64748b;font-size:13px;">
            ${role === "manager" ? "Full access to invoices, customers and reports" : "Can create invoices and manage customers"}
          </p>
        </div>
        <div style="text-align:center;margin:28px 0;">
          <a href="${inviteLink}" style="background:#7C3AED;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:16px;font-weight:700;display:inline-block;">
            Accept Invitation →
          </a>
        </div>
        <p style="color:#94a3b8;font-size:12px;text-align:center;">
          Or copy: <a href="${inviteLink}" style="color:#7C3AED;">${inviteLink}</a>
        </p>
        <div style="background:#fef3c7;border-radius:8px;padding:12px;margin-top:20px;">
          <p style="margin:0;color:#92400e;font-size:12px;">⚠️ This invitation expires in <strong>7 days</strong>.</p>
        </div>
      </div>
      <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px;">
        © 2026 Trackeet · gettrackeet.com · If you didn't expect this, ignore this email.
      </p>
    </div>
  `,
  }).catch((err) => console.error("Invite email failed:", err.message));

  await createNotification({
    userId: owner._id,
    type: "system",
    title: "Team Member Invited",
    message: `Invitation sent to ${name} (${email}) as ${role}.`,
    link: "/dashboard/settings",
  });

  await logActivity({
    userId: owner._id,
    action: "Invited team member",
    entity: "team",
    entityId: member._id,
    details: `${name} (${email}) as ${role}`,
    ip: req.ip,
    userName: `${owner.firstName} ${owner.lastName}`,
  });

  res.status(201).json({ success: true, member, inviteLink });
});

export const acceptInvite = asyncHandler(async (req, res) => {
  const { token, password, firstName, lastName } = req.body;

  const member = await TeamMember.findOne({
    inviteToken: token,
    inviteExpires: { $gt: new Date() },
  });
  if (!member) throw new AppError("Invalid or expired invite link", 400);

  // Check if user already exists
  let user = await User.findOne({ email: member.email });

  if (!user) {
    // Create new user account for the staff member
    if (!password || !firstName || !lastName) {
      throw new AppError(
        "Please provide your name and password to complete registration",
        400,
      );
    }
    user = await User.create({
      firstName,
      lastName,
      email: member.email,
      phone: "00000000000", // placeholder
      password,
      role: "user",
      plan: "free",
    });
  }

  // Update member record
  member.user = user._id;
  member.status = "active";
  member.inviteToken = undefined;
  member.inviteExpires = undefined;
  await member.save();

  res.json({
    success: true,
    message: "Invite accepted successfully. You can now log in.",
  });
});

export const updateMember = asyncHandler(async (req, res) => {
  const { role, status } = req.body;
  const member = await TeamMember.findOne({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!member) throw new AppError("Team member not found", 404);

  if (role) member.role = role;
  if (status) member.status = status;
  await member.save();

  res.json({ success: true, member });
});

export const removeMember = asyncHandler(async (req, res) => {
  const member = await TeamMember.findOneAndDelete({
    _id: req.params.id,
    owner: req.user._id,
  });
  if (!member) throw new AppError("Team member not found", 404);

  await logActivity({
    userId: req.user._id,
    action: "Removed team member",
    entity: "team",
    entityId: member._id,
    details: `${member.name} (${member.email})`,
    ip: req.ip,
    userName: `${req.user.firstName} ${req.user.lastName}`,
  });
  res.json({ success: true, message: "Team member removed" });
});

export const getMyTeamContext = asyncHandler(async (req, res) => {
  // For staff members — get their owner's context
  const membership = await TeamMember.findOne({
    user: req.user._id,
    status: "active",
  });
  if (!membership) return res.json({ success: true, isTeamMember: false });

  const owner = await User.findById(membership.owner).select("-password");
  res.json({ success: true, isTeamMember: true, owner, role: membership.role });
});
