import PlatformSettings from "../models/PlatformSettings.js";

export const maintenanceCheck = async (req, res, next) => {
  // Skip for admin routes and auth routes
  if (
    req.path.startsWith("/api/admin") ||
    req.path.startsWith("/api/auth/login") ||
    req.path.startsWith("/api/auth/forgot") ||
    req.path.startsWith("/api/auth/reset")
  )
    return next();

  try {
    const settings = await PlatformSettings.findOne();
    if (settings?.maintenanceMode) {
      return res.status(503).json({
        success: false,
        message: "Platform is under maintenance. Please check back later.",
        maintenance: true,
      });
    }
  } catch {}

  next();
};
