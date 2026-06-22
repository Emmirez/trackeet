import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  User,
  Building2,
  CreditCard,
  Shield,
  Sun,
  Moon,
  Upload,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Bell,
  Palette,
  Store,
  Plus,
} from "lucide-react";
import { profileAPI } from "../../services/api.js";
import useThemeStore from "../../store/themeStore.js";
import useAuthStore from "../../store/authStore.js";
import toast from "react-hot-toast";
import { authAPI } from "../../services/api.js";

function BusinessTab({
  user,
  isPending,
  register,
  handleSubmit,
  updateProfile,
  qc,
  updateUser,
  watch,
  setValue,
}) {
  const fileRef = useRef(null);
  const [logo, setLogo] = useState(user?.businessLogo || null);
  const [preview, setPreview] = useState(user?.businessLogo || null);
  const [uploading, setUploading] = useState(false);

  const handleLogoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024)
      return toast.error("File must be under 10MB");
    if (!file.type.startsWith("image/"))
      return toast.error("Please upload an image file");

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("logo", file);
      const res = await profileAPI.uploadLogo(formData);
      setLogo(res.data.businessLogo);
      updateUser({ ...user, businessLogo: res.data.businessLogo });
      toast.success("Logo uploaded!");
      qc.invalidateQueries(["profile"]);
    } catch (err) {
      toast.error("Failed to upload logo");
      setPreview(user?.businessLogo || null);
    } finally {
      setUploading(false);
    }
  };

  const removeLogo = async () => {
    setPreview(null);
    setLogo(null);
    updateUser({ ...user, businessLogo: null });
    await profileAPI.update({ businessLogo: null });
    qc.invalidateQueries(["profile"]);
    toast.success("Logo removed");
  };

  return (
    <div className="card space-y-4">
      <h2 className="font-semibold text-dark dark:text-white">
        Business Details
      </h2>

      {/* Logo upload */}
      <div>
        <label className="label">Business Logo</label>
        <div className="flex items-center gap-4">
          {/* Preview */}
          <div className="relative flex-shrink-0">
            {preview ? (
              <div className="relative">
                <img
                  src={preview}
                  alt="Logo"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-dark-200 dark:border-gray-600"
                />
                <button
                  onClick={removeLogo}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-danger text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-primary-light flex items-center justify-center border-2 border-dashed border-primary/30">
                <Building2 size={28} className="text-primary" />
              </div>
            )}
          </div>

          {/* Upload button */}
          <div className="flex-1">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="btn btn-secondary w-full"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-dark-300 border-t-primary rounded-full animate-spin" />{" "}
                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={16} /> {preview ? "Change Logo" : "Upload Logo"}
                </>
              )}
            </button>
            <p className="text-xs text-dark-400 mt-1">
              PNG, JPG up to 10MB. Recommended: 500×500px
            </p>
          </div>
        </div>
      </div>

      <div>
        <label className="label">Business Name</label>
        <input
          {...register("businessName")}
          className="input"
          placeholder="e.g. Obaro Ventures"
        />
      </div>
      <div>
        <label className="label">Business Address</label>
        <input
          {...register("businessAddress")}
          className="input"
          placeholder="e.g. 15 Allen Avenue, Ikeja, Lagos"
        />
      </div>
      <div>
        <label className="label">Invoice Prefix</label>
        <input
          {...register("invoicePrefix")}
          placeholder="INV"
          className="input"
        />
        <p className="text-xs text-dark-400 mt-1">
          Your invoices will be numbered e.g. INV-2026-0001
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="label">Bank Name</label>
          <input
            {...register("bankName")}
            className="input"
            placeholder="e.g. GTBank"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Account Number</label>
          <input
            {...register("bankAccountNumber")}
            className="input"
            placeholder="0123456789"
          />
        </div>
      </div>
      <div>
        <label className="label">Account Name</label>
        <input
          {...register("bankAccountName")}
          className="input"
          placeholder="e.g. Obaro Ventures Ltd"
        />
      </div>

      {/* Business Hours */}
      <div>
        <label className="label">Business Hours</label>

        {/* 24/7 toggle */}
        <div className="flex items-center justify-between bg-gray-50 dark:bg-dark rounded-xl px-4 py-3 mb-3">
          <div>
            <p className="text-sm font-bold text-dark dark:text-white">
              Always Open 24/7
            </p>
            <p className="text-xs text-dark-400">Store is always available</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const current = watch("alwaysOpen");
              setValue("alwaysOpen", !current);
            }}
            className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${watch("alwaysOpen") ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${watch("alwaysOpen") ? "left-6" : "left-0.5"}`}
            />
          </button>
        </div>

        {/* Hours per day — hidden when 24/7 */}
        {!watch("alwaysOpen") && (
          <div className="space-y-2">
            {[
              "monday",
              "tuesday",
              "wednesday",
              "thursday",
              "friday",
              "saturday",
              "sunday",
            ].map((day) => (
              <div key={day} className="flex items-center gap-2">
                <p className="text-xs font-bold text-dark dark:text-white w-8 capitalize flex-shrink-0">
                  {day.slice(0, 3)}
                </p>
                <div className="flex flex-1 items-center gap-1 min-w-0">
                  <input
                    {...register(`businessHours.${day}.open`)}
                    type="time"
                    className="input py-1.5 text-xs w-full min-w-0 px-1"
                    defaultValue="08:00"
                  />
                  <span className="text-xs text-dark-400 flex-shrink-0">–</span>
                  <input
                    {...register(`businessHours.${day}.close`)}
                    type="time"
                    className="input py-1.5 text-xs w-full min-w-0 px-1"
                    defaultValue="18:00"
                  />
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <input
                    type="checkbox"
                    {...register(`businessHours.${day}.closed`)}
                    className="w-4 h-4"
                    title="Closed this day"
                  />
                  <span className="text-xs text-dark-400">Off</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-dark-400 mt-1">
          Check "Off" for days you're closed
        </p>
      </div>

      {/* Social Links */}
      <div className="space-y-3">
        <label className="label">Social Media & Website</label>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xl w-7 flex-shrink-0">📘</span>
            <input
              {...register("socialLinks.facebook")}
              className="input flex-1"
              placeholder="https://facebook.com/yourpage"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl w-7 flex-shrink-0">📸</span>
            <input
              {...register("socialLinks.instagram")}
              className="input flex-1"
              placeholder="https://instagram.com/yourhandle"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl w-7 flex-shrink-0">🎵</span>
            <input
              {...register("socialLinks.tiktok")}
              className="input flex-1"
              placeholder="https://tiktok.com/@yourhandle"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl w-7 flex-shrink-0">🔗</span>
            <input
              {...register("socialLinks.website")}
              className="input flex-1"
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit(updateProfile)}
        disabled={isPending}
        className="btn btn-primary"
      >
        {isPending ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Save size={16} /> Save Business Info
          </>
        )}
      </button>
    </div>
  );
}

function NotificationsTab({ user, updateUser, qc }) {
  const defaultPrefs = {
    invoiceCreated: true,
    paymentReceived: true,
    invoiceOverdue: true,
    whatsappReceipt: true,
    weeklyReport: false,
    newTeamMember: true,
  };

  const [prefs, setPrefs] = useState({
    ...defaultPrefs,
    ...(user?.notificationPrefs || {}),
  });
  const [saving, setSaving] = useState(false);

  const toggle = (key) => setPrefs((p) => ({ ...p, [key]: !p[key] }));

  const save = async () => {
    setSaving(true);
    try {
      await profileAPI.updateNotifications(prefs);
      updateUser({ ...user, notificationPrefs: prefs });
      toast.success("Notification preferences saved!");
      qc.invalidateQueries(["profile"]);
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const SECTIONS = [
    {
      title: "Invoice Notifications",
      items: [
        {
          key: "invoiceCreated",
          label: "Invoice Created",
          desc: "Get notified when a new invoice is created",
        },
        {
          key: "paymentReceived",
          label: "Payment Received",
          desc: "Get notified when a customer makes a payment",
        },
        {
          key: "invoiceOverdue",
          label: "Overdue Invoices",
          desc: "Get notified when an invoice becomes overdue",
        },
      ],
    },
    {
      title: "WhatsApp Notifications",
      items: [
        {
          key: "whatsappReceipt",
          label: "Payment Receipts",
          desc: "Auto-send WhatsApp receipt when payment is marked",
        },
      ],
    },
    {
      title: "Team & Reports",
      items: [
        {
          key: "newTeamMember",
          label: "New Team Member",
          desc: "Get notified when someone joins your team",
        },
        {
          key: "weeklyReport",
          label: "Weekly Report",
          desc: "Receive a weekly summary of your business",
        },
      ],
    },
  ];

  return (
    <div className="space-y-4">
      {SECTIONS.map((section, si) => (
        <div key={si} className="card space-y-4">
          <h2 className="font-semibold text-dark dark:text-white">
            {section.title}
          </h2>
          <div className="space-y-3">
            {section.items.map(({ key, label, desc }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-dark dark:text-white">
                    {label}
                  </p>
                  <p className="text-xs text-dark-400">{desc}</p>
                </div>
                <button
                  onClick={() => toggle(key)}
                  className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 ${prefs[key] ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${prefs[key] ? "left-6" : "left-0.5"}`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={save}
        disabled={saving}
        className="btn btn-primary w-full"
      >
        {saving ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Save size={16} /> Save Preferences
          </>
        )}
      </button>
    </div>
  );
}

function StoreBrandingTab({ user, updateUser, qc }) {
  const bannerRef = useRef(null);
  const [primaryColor, setPrimaryColor] = useState(
    user?.storePrimaryColor || "#7C3AED",
  );
  const [font, setFont] = useState(user?.storeFont || "Inter");
  const [bannerPreview, setBannerPreview] = useState(
    user?.storeBannerImage || null,
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const FONT_OPTIONS = [
    { value: "Inter", label: "Inter", style: "font-sans" },
    { value: "Georgia", label: "Georgia", style: "font-serif" },
    { value: "Courier New", label: "Courier New", style: "font-mono" },
    { value: "Poppins", label: "Poppins", style: "font-sans" },
    {
      value: "Playfair Display",
      label: "Playfair Display",
      style: "font-serif",
    },
    { value: "Montserrat", label: "Montserrat", style: "font-sans" },
  ];

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024)
      return toast.error("File must be under 10MB");

    const reader = new FileReader();
    reader.onload = (e) => setBannerPreview(e.target.result);
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("banner", file);
      const res = await profileAPI.uploadBanner(formData);
      updateUser({ ...user, storeBannerImage: res.data.storeBannerImage });
      toast.success("Banner uploaded!");
      qc.invalidateQueries(["profile"]);
    } catch {
      toast.error("Failed to upload banner");
      setBannerPreview(user?.storeBannerImage || null);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileAPI.update({
        storePrimaryColor: primaryColor,
        storeFont: font,
      });
      updateUser({ ...user, storePrimaryColor: primaryColor, storeFont: font });
      toast.success("Store branding saved!");
      qc.invalidateQueries(["profile"]);
    } catch {
      toast.error("Failed to save branding");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Color picker */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-dark dark:text-white">
          Store Colors
        </h2>
        <div>
          <label className="label">Primary Color</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-14 h-14 rounded-2xl border-2 border-dark-200 cursor-pointer p-1"
            />
            <div className="flex-1">
              <p className="text-sm font-bold text-dark dark:text-white">
                {primaryColor}
              </p>
              <p className="text-xs text-dark-400">
                Used for buttons, accents and highlights
              </p>
            </div>
            {/* Preview */}
            <div className="flex gap-2">
              <div
                className="w-8 h-8 rounded-xl shadow-sm"
                style={{ backgroundColor: primaryColor }}
              />
              <div
                className="w-8 h-8 rounded-xl shadow-sm opacity-30"
                style={{ backgroundColor: primaryColor }}
              />
            </div>
          </div>
        </div>

        {/* Preset colors */}
        <div>
          <label className="label">Quick Presets</label>
          <div className="flex flex-wrap gap-2">
            {[
              "#7C3AED",
              "#EC4899",
              "#EF4444",
              "#F97316",
              "#EAB308",
              "#22C55E",
              "#06B6D4",
              "#3B82F6",
              "#8B5CF6",
              "#64748B",
              "#1F2937",
              "#000000",
            ].map((color) => (
              <button
                key={color}
                onClick={() => setPrimaryColor(color)}
                className={`w-8 h-8 rounded-xl shadow-sm transition-all hover:scale-110 ${primaryColor === color ? "ring-2 ring-offset-2 ring-dark" : ""}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Font picker */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-dark dark:text-white">Store Font</h2>
        <div className="space-y-2">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFont(f.value)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                font === f.value
                  ? "border-primary bg-primary-light"
                  : "border-dark-200 dark:border-gray-700"
              }`}
            >
              <span
                className="text-sm font-semibold text-dark dark:text-white"
                style={{ fontFamily: f.value }}
              >
                {f.label} — The quick brown fox
              </span>
              {font === f.value && (
                <span className="text-xs font-bold text-primary">Selected</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Banner image */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-dark dark:text-white">
          Store Banner
        </h2>
        <p className="text-xs text-dark-400">
          This image appears as the hero background on your storefront
        </p>
        {bannerPreview ? (
          <div className="relative">
            <img
              src={bannerPreview}
              alt="Banner"
              className="w-full h-40 object-cover rounded-2xl"
            />
            <button
              onClick={async () => {
                setBannerPreview(null);
                await profileAPI.update({ storeBannerImage: null });
                updateUser({ ...user, storeBannerImage: null });
                qc.invalidateQueries(["profile"]);
                toast.success("Banner removed");
              }}
              className="absolute top-2 right-2 w-7 h-7 bg-danger text-white rounded-full flex items-center justify-center"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => bannerRef.current?.click()}
            className="w-full border-2 border-dashed border-dark-200 dark:border-gray-600 rounded-2xl p-8 flex flex-col items-center gap-2 hover:border-primary transition-colors text-dark-400"
          >
            <Upload size={24} />
            <p className="text-sm font-semibold">Upload Banner Image</p>
            <p className="text-xs">Recommended: 1200×400px, PNG or JPG</p>
          </button>
        )}
        <input
          ref={bannerRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleBannerChange}
        />
        {uploading && (
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            Uploading banner...
          </div>
        )}
      </div>

      {/* Live preview */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-dark dark:text-white">Preview</h2>
        <div
          className="rounded-2xl overflow-hidden border border-dark-200"
          style={{ fontFamily: font }}
        >
          <div
            className="h-20 flex items-center justify-center"
            style={{
              background: bannerPreview
                ? `url(${bannerPreview}) center/cover`
                : primaryColor,
            }}
          >
            <p className="text-white font-black text-lg drop-shadow">
              {user?.businessName || "Your Store"}
            </p>
          </div>
          <div className="p-3 bg-white flex items-center justify-between">
            <p className="text-sm font-bold text-gray-800">Sample Product</p>
            <button
              className="text-xs font-bold text-white px-3 py-1.5 rounded-xl"
              style={{ backgroundColor: primaryColor }}
            >
              Order Now
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary w-full"
      >
        {saving ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Save size={16} /> Save Branding
          </>
        )}
      </button>
    </div>
  );
}

function StoreInfoTab({ user, updateUser, qc }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    aboutUs: user?.aboutUs || "",
    termsAndConditions: user?.termsAndConditions || "",
    refundPolicy: user?.refundPolicy || "",
    contactEmail: user?.contactEmail || "",
    contactPhones: user?.contactPhones?.length ? user.contactPhones : [""],
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await profileAPI.update({
        aboutUs: form.aboutUs,
        termsAndConditions: form.termsAndConditions,
        refundPolicy: form.refundPolicy,
        contactEmail: form.contactEmail,
        contactPhones: form.contactPhones.filter((p) => p.trim()),
      });
      updateUser(res.data.user);
      toast.success("Store info saved!");
      qc.invalidateQueries(["profile"]);
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* About Us */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-dark dark:text-white">About Us</h2>
        <p className="text-xs text-dark-400">
          Tell customers about your business — shown on your storefront footer
        </p>
        <textarea
          value={form.aboutUs}
          onChange={(e) => setForm((p) => ({ ...p, aboutUs: e.target.value }))}
          placeholder="We are a Nigerian business dedicated to providing quality products..."
          rows={4}
          className="input resize-none"
        />
      </div>

      {/* Contact Info */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-dark dark:text-white">Contact Us</h2>
        <p className="text-xs text-dark-400">
          Additional contact details shown on your storefront
        </p>
        <div>
          <label className="label">Contact Email</label>
          <input
            type="email"
            value={form.contactEmail}
            onChange={(e) =>
              setForm((p) => ({ ...p, contactEmail: e.target.value }))
            }
            placeholder="hello@yourbusiness.com"
            className="input"
          />
        </div>
        <div>
          <label className="label">Phone Numbers</label>
          <div className="space-y-2">
            {form.contactPhones.map((phone, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={phone}
                  onChange={(e) => {
                    const updated = [...form.contactPhones];
                    updated[i] = e.target.value;
                    setForm((p) => ({ ...p, contactPhones: updated }));
                  }}
                  placeholder="+2348012345678"
                  className="input flex-1"
                />
                {form.contactPhones.length > 1 && (
                  <button
                    onClick={() => {
                      const updated = form.contactPhones.filter(
                        (_, idx) => idx !== i,
                      );
                      setForm((p) => ({ ...p, contactPhones: updated }));
                    }}
                    className="btn btn-ghost p-2 hover:text-danger"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  contactPhones: [...p.contactPhones, ""],
                }))
              }
              className="btn btn-secondary btn-sm w-full"
            >
              <Plus size={14} /> Add Phone Number
            </button>
          </div>
        </div>
      </div>

      {/* Terms & Conditions */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-dark dark:text-white">
          Terms & Conditions
        </h2>
        <p className="text-xs text-dark-400">
          Your store terms — shown as a link on your storefront footer
        </p>
        <textarea
          value={form.termsAndConditions}
          onChange={(e) =>
            setForm((p) => ({ ...p, termsAndConditions: e.target.value }))
          }
          placeholder="By placing an order, you agree to our terms..."
          rows={5}
          className="input resize-none"
        />
      </div>

      {/* Refund Policy */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-dark dark:text-white">
          Refund Policy
        </h2>
        <p className="text-xs text-dark-400">
          Your return and refund policy — shown as a link on your storefront
          footer
        </p>
        <textarea
          value={form.refundPolicy}
          onChange={(e) =>
            setForm((p) => ({ ...p, refundPolicy: e.target.value }))
          }
          placeholder="We accept returns within 7 days of delivery..."
          rows={5}
          className="input resize-none"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn btn-primary w-full"
      >
        {saving ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Save size={16} /> Save Store Info
          </>
        )}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { isDark, toggle } = useThemeStore();
  const { user, updateUser, logout } = useAuthStore();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState("profile");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePass, setShowDeletePass] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [backupSecret, setBackupSecret] = useState("");
  const [twoFAVerifyCode, setTwoFAVerifyCode] = useState("");
  const [twoFADisableCode, setTwoFADisableCode] = useState("");

  const { mutate: deleteAccountMutation, isPending: deletingAccount } =
    useMutation({
      mutationFn: profileAPI.deleteAccount,
      onSuccess: () => {
        toast.success("Account deleted");
        logout();
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Failed to delete account"),
    });

  const { mutate: changePasswordMutation, isPending: changingPassword } =
    useMutation({
      mutationFn: profileAPI.changePassword,
      onSuccess: () => {
        toast.success("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      },
      onError: (err) =>
        toast.error(err.response?.data?.message || "Failed to change password"),
    });

  const { data } = useQuery({
    queryKey: ["profile"],
    queryFn: () => profileAPI.get().then((r) => r.data),
  });
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: data?.user || user,
  });

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: profileAPI.update,
    onSuccess: (res) => {
      toast.success("Profile updated!");
      updateUser(res.data.user);
      qc.invalidateQueries(["profile"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update"),
  });

  const TABS = [
    { id: "profile", icon: User, label: "Profile" },
    { id: "business", icon: Building2, label: "Business" },
    { id: "branding", icon: Palette, label: "Branding" },
    { id: "store", icon: Store, label: "Store Info" },
    { id: "security", icon: Shield, label: "Security" },
    { id: "notifications", icon: Bell, label: "Notifications" },
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="page-title">Settings</h1>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${activeTab === t.id ? "bg-primary text-white" : "btn-ghost border border-dark-200 dark:border-gray-700"}`}
          >
            <t.icon size={15} />
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-dark dark:text-white">
            Personal Information
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="input-label">First Name</label>
              <input {...register("firstName")} className="input" />
            </div>
            <div>
              <label className="input-label">Last Name</label>
              <input {...register("lastName")} className="input" />
            </div>
          </div>
          <div>
            <label className="input-label">Email</label>
            <input
              {...register("email")}
              type="email"
              className="input"
              disabled
            />
          </div>
          <div>
            <label className="input-label">Phone</label>
            <input {...register("phone")} className="input" />
          </div>
          <button
            onClick={handleSubmit(updateProfile)}
            disabled={isPending}
            className="btn btn-primary"
          >
            {isPending ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}

      {activeTab === "business" && (
        <BusinessTab
          user={data?.user || user}
          isPending={isPending}
          register={register}
          handleSubmit={handleSubmit}
          updateProfile={updateProfile}
          qc={qc}
          updateUser={updateUser}
          watch={watch}
          setValue={setValue}
        />
      )}

      {activeTab === "security" && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-dark dark:text-white">
            Change Password
          </h2>

          <div>
            <label className="label">Current Password</label>
            <div className="relative">
              <input
                type={showCurrentPass ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input pr-12"
                placeholder="Enter current password"
              />
              <button
                onClick={() => setShowCurrentPass(!showCurrentPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400"
              >
                {showCurrentPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <input
                type={showNewPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input pr-12"
                placeholder="Min 6 characters"
              />
              <button
                onClick={() => setShowNewPass(!showNewPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400"
              >
                {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="label">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirmPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input pr-12"
                placeholder="Repeat new password"
              />
              <button
                onClick={() => setShowConfirmPass(!showConfirmPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400"
              >
                {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Password strength */}
          {newPassword && (
            <div>
              <div className="flex gap-1 mb-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1.5 flex-1 rounded-full ${
                      i <=
                      (newPassword.length >= 12
                        ? 4
                        : newPassword.length >= 8
                          ? 3
                          : newPassword.length >= 6
                            ? 2
                            : 1)
                        ? newPassword.length >= 12
                          ? "bg-success"
                          : newPassword.length >= 8
                            ? "bg-warning"
                            : "bg-danger"
                        : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-dark-400">
                {newPassword.length >= 12
                  ? "💪 Strong password"
                  : newPassword.length >= 8
                    ? "👍 Good password"
                    : "⚠️ Weak — use 8+ characters"}
              </p>
            </div>
          )}

          <button
            onClick={() => {
              if (!currentPassword)
                return toast.error("Enter your current password");
              if (!newPassword) return toast.error("Enter a new password");
              if (newPassword !== confirmPassword)
                return toast.error("Passwords do not match");
              if (newPassword.length < 6)
                return toast.error("Password must be at least 6 characters");
              changePasswordMutation({ currentPassword, newPassword });
            }}
            disabled={changingPassword}
            className="btn btn-primary w-full"
          >
            {changingPassword ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Lock size={16} /> Change Password
              </>
            )}
          </button>
          {/* 2FA Section */}
          <div className="card">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                <Shield size={18} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-dark dark:text-white">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-dark-400">
                  Add an extra layer of security to your account
                </p>
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded-full ${
                  user?.twoFactorEnabled
                    ? "bg-success-light text-success"
                    : "bg-gray-100 text-dark-400"
                }`}
              >
                {user?.twoFactorEnabled ? "✅ Enabled" : "Disabled"}
              </span>
            </div>

            {!user?.twoFactorEnabled ? (
              !qrCode ? (
                <button
                  onClick={async () => {
                    const res = await authAPI.setup2FA();
                    setQrCode(res.data.qrCode);
                    setBackupSecret(res.data.secret);
                  }}
                  className="btn btn-primary w-full"
                >
                  <Shield size={16} /> Enable 2FA
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-dark-400">
                    Scan this QR code with <strong>Google Authenticator</strong>{" "}
                    or <strong>Authy</strong>:
                  </p>
                  <div className="flex justify-center">
                    <img
                      src={qrCode}
                      alt="2FA QR Code"
                      className="w-48 h-48 rounded-xl border border-dark-200"
                    />
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-dark rounded-xl">
                    <p className="text-xs text-dark-400 mb-1">
                      Or enter this code manually:
                    </p>
                    <p className="font-mono text-xs text-dark dark:text-white break-all">
                      {backupSecret}
                    </p>
                  </div>
                  <div>
                    <label className="label">
                      Enter 6-digit code to confirm *
                    </label>
                    <input
                      value={twoFAVerifyCode}
                      onChange={(e) =>
                        setTwoFAVerifyCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        )
                      }
                      placeholder="000000"
                      className="input text-center font-mono tracking-widest text-xl"
                      maxLength={6}
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (twoFAVerifyCode.length !== 6)
                        return toast.error("Enter 6-digit code");
                      try {
                        await authAPI.verify2FA({ code: twoFAVerifyCode });
                        toast.success("2FA enabled successfully!");
                        updateUser({ ...user, twoFactorEnabled: true });
                        setQrCode(null);
                        setTwoFAVerifyCode("");
                      } catch (err) {
                        toast.error(
                          err.response?.data?.message || "Invalid code",
                        );
                      }
                    }}
                    disabled={twoFAVerifyCode.length !== 6}
                    className="btn btn-primary w-full"
                  >
                    Confirm & Enable 2FA
                  </button>
                </div>
              )
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-success-light rounded-xl">
                  <p className="text-sm font-semibold text-success">
                    ✅ 2FA is active on your account
                  </p>
                  <p className="text-xs text-dark-500 mt-0.5">
                    Your account is protected with Google Authenticator
                  </p>
                </div>
                <div>
                  <label className="label">Enter 2FA code to disable</label>
                  <input
                    value={twoFADisableCode}
                    onChange={(e) =>
                      setTwoFADisableCode(
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    placeholder="000000"
                    className="input text-center font-mono tracking-widest text-xl"
                    maxLength={6}
                  />
                </div>
                <button
                  onClick={async () => {
                    if (twoFADisableCode.length !== 6)
                      return toast.error("Enter 6-digit code");
                    try {
                      await authAPI.disable2FA({ code: twoFADisableCode });
                      toast.success("2FA disabled");
                      updateUser({ ...user, twoFactorEnabled: false });
                      setTwoFADisableCode("");
                    } catch (err) {
                      toast.error(
                        err.response?.data?.message || "Invalid code",
                      );
                    }
                  }}
                  disabled={twoFADisableCode.length !== 6}
                  className="btn border border-danger text-danger hover:bg-danger hover:text-white w-full transition-colors"
                >
                  Disable 2FA
                </button>
              </div>
            )}
          </div>

          {/* Delete Account */}
          <div className="card border border-danger/20 bg-danger-light/10">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 bg-danger-light rounded-xl flex items-center justify-center flex-shrink-0">
                <Trash2 size={18} className="text-danger" />
              </div>
              <div>
                <h3 className="font-bold text-dark dark:text-white">
                  Delete Account
                </h3>
                <p className="text-sm text-dark-400">
                  Permanently delete your account and all data. This cannot be
                  undone.
                </p>
              </div>
            </div>

            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn border border-danger text-danger hover:bg-danger hover:text-white transition-colors w-full"
              >
                <Trash2 size={16} /> Delete My Account
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-danger-light rounded-xl">
                  <p className="text-xs font-semibold text-danger">
                    ⚠️ This will permanently delete:
                  </p>
                  <ul className="text-xs text-dark-500 mt-1 space-y-0.5">
                    <li>• All your invoices and payments</li>
                    <li>• All your customers</li>
                    <li>• All team members</li>
                    <li>• All activity logs</li>
                    <li>• Your account and profile</li>
                  </ul>
                </div>
                <div>
                  <label className="label">
                    Enter your password to confirm
                  </label>
                  <div className="relative">
                    <input
                      type={showDeletePass ? "text" : "password"}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your password"
                      className="input pr-10"
                    />
                    <button
                      onClick={() => setShowDeletePass(!showDeletePass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400"
                    >
                      {showDeletePass ? (
                        <EyeOff size={16} />
                      ) : (
                        <Eye size={16} />
                      )}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeletePassword("");
                    }}
                    className="btn btn-ghost border border-dark-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (!deletePassword)
                        return toast.error("Enter your password");
                      deleteAccountMutation({ password: deletePassword });
                    }}
                    disabled={deletingAccount}
                    className="btn bg-danger text-white hover:bg-red-600"
                  >
                    {deletingAccount ? "Deleting..." : "Delete Forever"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {activeTab === "branding" && (
        <StoreBrandingTab
          user={data?.user || user}
          updateUser={updateUser}
          qc={qc}
        />
      )}
      {activeTab === "store" && (
        <StoreInfoTab
          user={data?.user || user}
          updateUser={updateUser}
          qc={qc}
        />
      )}
      {activeTab === "notifications" && (
        <NotificationsTab
          user={data?.user || user}
          updateUser={updateUser}
          qc={qc}
        />
      )}
    </div>
  );
}
