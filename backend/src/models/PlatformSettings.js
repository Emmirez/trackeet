import mongoose from "mongoose";

const platformSettingsSchema = new mongoose.Schema(
  {
    maintenanceMode: { type: Boolean, default: false },
    allowRegistrations: { type: Boolean, default: true },
    emailNotifications: { type: Boolean, default: true },
    freeInvoiceLimit: { type: Number, default: 5 },
    freeCustomerLimit: { type: Number, default: 10 },
    gateways: {
      paystack: { type: Boolean, default: true },
      flutterwave: { type: Boolean, default: true },
      bankTransfer: { type: Boolean, default: true },
    },
    supportEmail: { type: String, default: "support@gettrackeet.com" },
    smtpHost: { type: String, default: "" },
    smtpPort: { type: String, default: "587" },
    smtpUser: { type: String, default: "" },
  },
  { timestamps: true },
);

export default mongoose.model("PlatformSettings", platformSettingsSchema);
