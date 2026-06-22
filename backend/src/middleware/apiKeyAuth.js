import ApiKey from "../models/ApiKey.js";
import User from "../models/User.js";

export const apiKeyAuth = async (req, res, next) => {
  try {
    const key = req.headers["x-api-key"];
    if (!key)
      return res
        .status(401)
        .json({ success: false, message: "API key required" });

    const apiKey = await ApiKey.findOne({ key, status: "active" });
    if (!apiKey)
      return res
        .status(401)
        .json({ success: false, message: "Invalid or revoked API key" });

    // Update usage
    apiKey.lastUsed = new Date();
    apiKey.usageCount = (apiKey.usageCount || 0) + 1;
    await apiKey.save();

    // Attach user to request
    const user = await User.findById(apiKey.user);
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });

    req.user = user;
    req.apiKey = apiKey;
    req.permissions = apiKey.permissions;

    next();
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "API key authentication failed" });
  }
};
