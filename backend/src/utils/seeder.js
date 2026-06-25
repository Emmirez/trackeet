import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const existing = await User.findOne({ role: "superadmin" });
    if (existing) {
      console.log("Superadmin already exists:", existing.email);
      process.exit(0);
    }

    const superadmin = await User.create({
      firstName: process.env.SUPERADMIN_FIRSTNAME || "Super",
      lastName: process.env.SUPERADMIN_LASTNAME || "Admin",
      email: process.env.SUPERADMIN_EMAIL || "superadmin@gettrackeet.com",
      phone: "+2340000000000",
      password: process.env.SUPERADMIN_PASSWORD || "SuperAdmin@123456",
      role: "superadmin",
      plan: "enterprise",
      businessName: "Trackeet",
    });

    console.log("✅ Superadmin created:", superadmin.email);
    console.log(
      "   Password:",
      process.env.SUPERADMIN_PASSWORD || "SuperAdmin@123456",
    );
    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  }
};

seed();
