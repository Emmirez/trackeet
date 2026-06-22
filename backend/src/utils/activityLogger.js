import ActivityLog from "../models/ActivityLog.js";
import TeamMember from "../models/TeamMember.js";

export const logActivity = async ({
  userId,
  ownerId,
  action,
  entity,
  entityId,
  details,
  ip,
  userName,
  role,
}) => {
  try {
    // If ownerId not passed, check if user is a team member
    let resolvedOwner = ownerId || userId;
    let resolvedRole = role || "owner";
    let resolvedName = userName;

    if (!ownerId) {
      const membership = await TeamMember.findOne({
        user: userId,
        status: "active",
      });
      if (membership) {
        resolvedOwner = membership.owner;
        resolvedRole = membership.role;
      }
    }

    await ActivityLog.create({
      owner: resolvedOwner,
      user: userId,
      userName: resolvedName,
      role: resolvedRole,
      action,
      entity,
      entityId,
      details,
      ip,
    });
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
};
