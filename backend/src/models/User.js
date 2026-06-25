import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: {
      type: String,
      enum: ["user", "support", "admin", "superadmin"],
      default: "user",
    },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
    plan: {
      type: String,
      enum: ["free", "starter", "business", "enterprise"],
      default: "free",
    },
    businessName: { type: String },
    businessAddress: { type: String },
    businessLogo: { type: String },
    invoicePrefix: { type: String, default: "INV" },
    bankName: { type: String },
    bankAccountNumber: { type: String },
    bankAccountName: { type: String },
    invoiceCount: { type: Number, default: 0 },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String, select: false },
    verificationExpires: { type: Date, select: false },
    invoiceTemplate: {
      type: String,
      enum: ["classic", "minimal", "bold", "professional", "warm"],
      default: "classic",
    },
    twoFactorSecret: { type: String, select: false },
    twoFactorEnabled: { type: Boolean, default: false },
    notificationPrefs: {
      invoiceCreated: { type: Boolean, default: true },
      paymentReceived: { type: Boolean, default: true },
      invoiceOverdue: { type: Boolean, default: true },
      whatsappReceipt: { type: Boolean, default: true },
      weeklyReport: { type: Boolean, default: false },
      newTeamMember: { type: Boolean, default: true },
      newOrder: { type: Boolean, default: true },
    },
    businessCategory: {
      type: String,
      enum: [
        "fashion",
        "food",
        "beauty",
        "pharmacy",
        "electronics",
        "pos",
        "grocery",
        "furniture",
        "home_services",
        "printing",
        "freelance",
        "general",
      ],
      default: "general",
    },
    storeName: { type: String, unique: true, sparse: true }, // for gettrackeet.com/store/storeName
    storeActive: { type: Boolean, default: true },
    storeTheme: { type: String, default: "default" },
    // Store branding
    storePrimaryColor: { type: String, default: null },
    storeFont: { type: String, default: null },
    storeBannerImage: { type: String, default: null },
    businessHours: {
      monday: { open: String, close: String, closed: Boolean },
      tuesday: { open: String, close: String, closed: Boolean },
      wednesday: { open: String, close: String, closed: Boolean },
      thursday: { open: String, close: String, closed: Boolean },
      friday: { open: String, close: String, closed: Boolean },
      saturday: { open: String, close: String, closed: Boolean },
      sunday: { open: String, close: String, closed: Boolean },
    },
    socialLinks: {
      facebook: { type: String, default: null },
      instagram: { type: String, default: null },
      tiktok: { type: String, default: null },
      website: { type: String, default: null },
    },
    alwaysOpen: { type: Boolean, default: false },
    aboutUs: { type: String, default: null },
    termsAndConditions: { type: String, default: null },
    refundPolicy: { type: String, default: null },
    contactEmail: { type: String, default: null },
    contactPhones: { type: [String], default: [] },
    referralCode: { type: String, unique: true, sparse: true },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    freeMonthsBalance: { type: Number, default: 0 },
  },

  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (entered) {
  return bcrypt.compare(entered, this.password);
};

export default mongoose.model("User", userSchema);
