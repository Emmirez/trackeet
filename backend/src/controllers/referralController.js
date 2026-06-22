import Referral from "../models/Referral.js";
import User from "../models/User.js";
import { asyncHandler, AppError } from "../utils/appError.js";

// Get current user's referral stats
export const getReferralStats = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "referralCode freeMonthsBalance firstName",
  );

  const referrals = await Referral.find({ referrer: req.user._id })
    .populate("referred", "firstName lastName email plan createdAt")
    .sort({ createdAt: -1 });

  const total = referrals.length;
  const converted = referrals.filter((r) => r.status === "converted").length;
  const pending = referrals.filter((r) => r.status === "pending").length;

  res.json({
    success: true,
    referralCode: user.referralCode,
    referralLink: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`,
    freeMonthsBalance: user.freeMonthsBalance,
    stats: { total, converted, pending },
    referrals,
  });
});
