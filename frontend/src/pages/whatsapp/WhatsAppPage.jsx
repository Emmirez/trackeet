import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MessageSquare,
  Zap,
  Bell,
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  BarChart3,
  Send,
  X,
  Trash2,
  Check,
  Image as ImageIcon,
  Clock,
  Smile,
  UserX,
  PhoneCall,
  Bot,
  Copy,
  MessageCircle,
} from "lucide-react";
import { whatsappAPI, customerAPI } from "../../services/api.js";
import { fmt, getInitials, avatarColor } from "../../utils/helpers.js";
import useAuthStore from "../../store/authStore.js";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const compressImage = (file) =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 1200;
      let w = img.width,
        h = img.height;
      if (w > MAX) {
        h = (h * MAX) / w;
        w = MAX;
      }
      if (h > MAX) {
        w = (w * MAX) / h;
        h = MAX;
      }
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Compression failed"));
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.75,
      );
      URL.revokeObjectURL(url);
    };
    img.onerror = () => reject(new Error("Image load failed"));
    img.src = url;
  });

const AUTOMATIONS = [
  {
    key: "invoiceAuto",
    icon: MessageSquare,
    color: "text-primary",
    bg: "bg-primary-light",
    title: "Invoice Automation",
    desc: "Auto-send invoice when created",
  },
  {
    key: "paymentConfirm",
    icon: CheckCircle,
    color: "text-success",
    bg: "bg-success-light",
    title: "Payment Confirmation",
    desc: "Send receipt on payment received",
  },
  {
    key: "paymentReminder",
    icon: Bell,
    color: "text-warning",
    bg: "bg-warning-light",
    title: "Payment Reminder",
    desc: "Remind customers before due date",
  },
  {
    key: "autoReply",
    icon: Zap,
    color: "text-info",
    bg: "bg-info-light",
    title: "Auto Reply",
    desc: "Reply to customer keywords",
  },
  {
    key: "dailySummary",
    icon: BarChart3,
    color: "text-purple-500",
    bg: "bg-purple-50",
    title: "Daily Business Summary",
    desc: "Get your daily report via WhatsApp",
  },
];

const CAMPAIGN_TARGETS = [
  { value: "all", label: "All Customers", desc: "Send to every customer" },
  {
    value: "pending",
    label: "Pending Customers",
    desc: "Customers with unpaid invoices",
  },
  {
    value: "overdue",
    label: "Overdue Customers",
    desc: "Customers with overdue invoices",
  },
  { value: "paid", label: "Paid Customers", desc: "Customers who have paid" },
  {
    value: "recent",
    label: "Recent Customers",
    desc: "Customers added in the last 30 days",
  },
  {
    value: "specific",
    label: "Specific Customers",
    desc: "Hand-pick who receives this",
  },
];

const VARIABLES = [
  { label: "{name}", desc: "Customer name" },
  { label: "{business}", desc: "Your business" },
  { label: "{phone}", desc: "Customer phone" },
];

const EMOJIS = [
  "👋",
  "😊",
  "🙏",
  "✅",
  "⚠️",
  "💰",
  "📄",
  "🎉",
  "🔔",
  "💳",
  "📦",
  "🚀",
  "⭐",
  "🏷️",
  "📅",
  "💡",
  "🤝",
  "❤️",
  "👍",
  "🎁",
];

const QUICK_REPLIES = (
  bizName = "Business",
  bankName = "",
  bankAccNum = "",
  bankAccName = "",
) => [
  {
    id: "available",
    emoji: "✅",
    label: "Item Available",
    color: "text-success",
    bg: "bg-success-light",
    message: `Hello! 👋\n\nGreat news! The item you ordered is *available* and ready for you. 🎉\n\nTo complete your order, please make payment to:\n\n🏦 *Bank:* ${bankName || "—"}\n👤 *Account Name:* ${bankAccName || "—"}\n🔢 *Account Number:* ${bankAccNum || "—"}\n\nPlease use your name as payment reference and send proof of payment once done.\n\nThank you! 🙏\n_${bizName}_`,
  },
  {
    id: "not_available",
    emoji: "❌",
    label: "Item Not Available",
    color: "text-danger",
    bg: "bg-danger-light",
    message: `Hello! 👋\n\nWe're sorry, the item you requested is currently *not available* or out of stock. 😔\n\nWe will notify you as soon as it's back in stock.\n\nMeanwhile, feel free to browse our store for similar items:\n🛍️ gettrackeet.com/store\n\nThank you for your patience! 🙏\n_${bizName}_`,
  },
  {
    id: "payment_request",
    emoji: "💳",
    label: "Payment Request",
    color: "text-primary",
    bg: "bg-primary-light",
    message: `Hello! 👋\n\nThank you for your order! 🎉\n\nKindly make payment to complete your order:\n\n🏦 *Bank:* ${bankName || "—"}\n👤 *Account Name:* ${bankAccName || "—"}\n🔢 *Account Number:* ${bankAccNum || "—"}\n\nPlease use your name as reference and send proof of payment once done. ✅\n\n_${bizName}_`,
  },
  {
    id: "payment_received",
    emoji: "💰",
    label: "Payment Received",
    color: "text-success",
    bg: "bg-success-light",
    message: `Hello! 👋\n\n✅ We have received your payment! Thank you so much! 🙏\n\nYour order is now being processed and we will update you shortly on delivery.\n\nThank you for choosing *${bizName}*! 😊`,
  },
  {
    id: "processing",
    emoji: "🔄",
    label: "Order Processing",
    color: "text-info",
    bg: "bg-info-light",
    message: `Hello! 👋\n\n🔄 Your order is currently being *processed*.\n\nWe will notify you as soon as it's ready for delivery/pickup.\n\nThank you for your patience! 🙏\n_${bizName}_`,
  },
  {
    id: "shipped",
    emoji: "🚚",
    label: "Order Shipped",
    color: "text-warning",
    bg: "bg-warning-light",
    message: `Hello! 👋\n\n🚚 Great news! Your order has been *shipped* and is on its way to you!\n\nPlease ensure someone is available to receive it.\n\nIf you have any questions, feel free to reach out. 😊\n\n_${bizName}_`,
  },
  {
    id: "delivered",
    emoji: "📦",
    label: "Order Delivered",
    color: "text-success",
    bg: "bg-success-light",
    message: `Hello! 👋\n\n📦 Your order has been *delivered*! We hope you love it! 🎉\n\nPlease let us know if everything is okay or if you need any assistance.\n\nThank you for shopping with *${bizName}*! 🙏`,
  },
  {
    id: "delay",
    emoji: "⏳",
    label: "Order Delay",
    color: "text-warning",
    bg: "bg-warning-light",
    message: `Hello! 👋\n\nWe sincerely apologize for the delay with your order. ⏳\n\nWe are working hard to get it to you as soon as possible and will keep you updated.\n\nThank you for your understanding and patience! 🙏\n_${bizName}_`,
  },
];

export default function WhatsAppPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const textareaRef = useRef(null);

  const [showCampaign, setShowCampaign] = useState(false);
  const [campName, setCampName] = useState("");
  const [campMessage, setCampMessage] = useState("");
  const [campTarget, setCampTarget] = useState("all");
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [campImage, setCampImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef(null);

  const { data: status, refetch } = useQuery({
    queryKey: ["wa-status"],
    queryFn: () => whatsappAPI.getStatus().then((r) => r.data),
    refetchInterval: 30000,
  });
  const { data: settingsData } = useQuery({
    queryKey: ["wa-settings"],
    queryFn: () => whatsappAPI.getSettings().then((r) => r.data.settings),
  });
  const { data: campaigns } = useQuery({
    queryKey: ["wa-campaigns"],
    queryFn: () => whatsappAPI.getCampaigns().then((r) => r.data),
  });
  const { data: qr } = useQuery({
    queryKey: ["wa-qr"],
    queryFn: () => whatsappAPI.getQR().then((r) => r.data),
    enabled: !status?.connected,
  });
  const { data: customersData } = useQuery({
    queryKey: ["customers-search", customerSearch],
    queryFn: () =>
      customerAPI.getAll({ search: customerSearch }).then((r) => r.data),
    enabled: campTarget === "specific",
  });

  const { mutate: updateSettings } = useMutation({
    mutationFn: whatsappAPI.updateSettings,
    onSuccess: () => qc.invalidateQueries(["wa-settings"]),
  });

  const { mutate: createCampaign, isPending: sending } = useMutation({
    mutationFn: (d) => whatsappAPI.createCampaign(d),
    onSuccess: (res) => {
      if (res.data.success === false) {
        toast.error(res.data.message);
        return;
      }
      toast.success(scheduleEnabled ? "Campaign scheduled!" : "Campaign sent!");
      qc.invalidateQueries(["wa-campaigns"]);
      resetCampaign();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const { mutate: deleteCampaign } = useMutation({
    mutationFn: (id) => whatsappAPI.deleteCampaign(id),
    onSuccess: () => {
      toast.success("Campaign deleted");
      qc.invalidateQueries(["wa-campaigns"]);
    },
  });

  const resetCampaign = () => {
    setShowCampaign(false);
    setCampName("");
    setCampMessage("");
    setCampTarget("all");
    setSelectedCustomers([]);
    setScheduleEnabled(false);
    setScheduledAt("");
    setCampImage(null);
    setImagePreview(null);
  };

  const insertAtCursor = (text) => {
    const el = textareaRef.current;
    if (!el) {
      setCampMessage((m) => m + text);
      return;
    }
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const newMsg = campMessage.slice(0, start) + text + campMessage.slice(end);
    setCampMessage(newMsg);
    setTimeout(() => {
      el.selectionStart = el.selectionEnd = start + text.length;
      el.focus();
    }, 0);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024)
      return toast.error("Image must be under 50MB");
    setCampImage(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleCreateCampaign = async () => {
    if (!campName.trim()) return toast.error("Enter a campaign name");
    if (!campMessage.trim()) return toast.error("Enter a message");
    if (campTarget === "specific" && selectedCustomers.length === 0)
      return toast.error("Select at least one customer");
    if (scheduleEnabled && !scheduledAt)
      return toast.error("Select a schedule date and time");

    // Upload image if provided
    let imageUrl = null;
    if (campImage) {
      try {
        toast.loading("Compressing image...", { id: "img-upload" });
        const compressed = await compressImage(campImage);

        const formData = new FormData();
        formData.append("image", compressed);

        const res = await whatsappAPI.uploadCampaignImage(formData);

        imageUrl = res.data.imageUrl;
        toast.dismiss("img-upload");
      } catch (err) {
        console.error("Upload error:", err);
        toast.dismiss("img-upload");
        toast.error(err.response?.data?.message || "Failed to upload image");
        return;
      }
    }

    createCampaign({
      name: campName,
      message: campMessage,
      audience: campTarget,
      specificIds:
        campTarget === "specific" ? selectedCustomers.map((c) => c._id) : [],
      scheduledAt: scheduleEnabled ? scheduledAt : null,
      imageUrl,
    });
  };

  const toggleCustomer = (c) => {
    setSelectedCustomers((prev) =>
      prev.find((p) => p._id === c._id)
        ? prev.filter((p) => p._id !== c._id)
        : [...prev, c],
    );
  };

  const previewMessage = campMessage
    .replace(/{name}/g, selectedCustomers[0]?.name || "John")
    .replace(/{business}/g, user?.businessName || "Your Business")
    .replace(/{phone}/g, selectedCustomers[0]?.phone || "08012345678");

  const [handoffs, setHandoffs] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("wa_handoffs") || "[]");
    } catch {
      return [];
    }
  });

  // Listen for handoff events via socket
  useEffect(() => {
    const handleHandoff = (e) => {
      const data = e.detail;
      setHandoffs((prev) => {
        const exists = prev.find((h) => h.phone === data.phone);
        if (exists) return prev;
        const updated = [...prev, { ...data, id: Date.now() }];
        localStorage.setItem("wa_handoffs", JSON.stringify(updated));
        return updated;
      });
      toast(`📞 Customer ${data.phone} requested an agent!`, {
        duration: 6000,
      });
    };
    window.addEventListener("whatsapp_handoff", handleHandoff);
    return () => window.removeEventListener("whatsapp_handoff", handleHandoff);
  }, []);

  const releaseBot = async (phone) => {
    try {
      await whatsappAPI.releaseChat({ phone });
      setHandoffs((prev) => {
        const updated = prev.filter((h) => h.phone !== phone);
        localStorage.setItem("wa_handoffs", JSON.stringify(updated));
        return updated;
      });
      toast.success("Bot restored for this customer");
    } catch {
      toast.error("Failed to release");
    }
  };

  const connected = status?.connected;

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="page-title">WhatsApp Automation</h1>

      {/* Connection card */}
      <div
        className={`card bg-gradient-to-br ${connected ? "from-success/10 to-success/5 border-success/20" : "from-primary-light to-purple-50 dark:from-primary/10 dark:to-purple-900/10"} border`}
      >
        <div className="flex flex-col items-center text-center gap-4 py-4">
          <div className="relative">
            <div className="w-20 h-20 bg-[#25D366] rounded-3xl flex items-center justify-center shadow-lg">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                className="w-12 h-12"
                alt="WhatsApp"
              />
            </div>
            <div
              className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center ${connected ? "bg-success" : "bg-danger"}`}
            >
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark dark:text-white">
              Automate & Grow
            </h2>
            <p className="text-dark-400 text-sm max-w-sm">
              Send payment reminders, follow-ups and updates to customers
              automatically.
            </p>
          </div>
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${connected ? "bg-success text-white" : "bg-danger/10 text-danger"}`}
          >
            <div className="w-2 h-2 rounded-full bg-current" />
            {connected ? "Connected" : "Disconnected"}
          </div>
          {!connected && (
            <div className="flex flex-col items-center gap-3">
              {qr?.qr && (
                <img
                  src={qr.qr}
                  alt="QR Code"
                  className="w-48 h-48 rounded-2xl border-4 border-white shadow-lg"
                />
              )}
              <p className="text-xs text-dark-400">
                Open WhatsApp → More → Linked Devices → Link a Device → Scan QR
              </p>
              <button onClick={refetch} className="btn btn-primary btn-sm">
                Refresh QR Code
              </button>
            </div>
          )}
          {connected && (
            <button
              onClick={() =>
                whatsappAPI.disconnect().then(() => {
                  toast.success("Disconnected");
                  qc.invalidateQueries(["wa-status"]);
                })
              }
              className="btn btn-ghost btn-sm text-danger"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Active Handoffs */}
      {handoffs.length > 0 && (
        <div className="card border border-warning/30 bg-warning-light/20">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-warning-light rounded-lg flex items-center justify-center">
              <UserX size={16} className="text-warning" />
            </div>
            <div>
              <h2 className="font-bold text-dark dark:text-white">
                Active Handoffs
              </h2>
              <p className="text-xs text-dark-400">
                Customers waiting for your reply
              </p>
            </div>
            <span className="ml-auto bg-warning text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {handoffs.length}
            </span>
          </div>
          <div className="space-y-2">
            {handoffs.map((h) => (
              <div
                key={h.id}
                className="flex items-center gap-3 p-3 bg-white dark:bg-surface rounded-xl"
              >
                <div className="w-10 h-10 bg-warning-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <PhoneCall size={16} className="text-warning" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-dark dark:text-white">
                    +{h.phone}
                  </p>
                  <p className="text-xs text-dark-400 truncate">{h.message}</p>
                  <p className="text-xs text-dark-300">
                    {dayjs(h.time).format("h:mm A")}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <a
                    href={`https://wa.me/${h.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary btn-sm text-xs py-1"
                  >
                    Reply
                  </a>
                  <button
                    onClick={() => releaseBot(h.phone)}
                    className="btn btn-ghost btn-sm text-xs py-1 border border-dark-200 flex items-center gap-1"
                  >
                    <Bot size={11} /> Release Bot
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Automation settings */}
      <div className="card space-y-3">
        <h2 className="font-semibold text-dark dark:text-white mb-2">
          Automation Settings
        </h2>
        {AUTOMATIONS.map((a) => (
          <div
            key={a.key}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
          >
            <div
              className={`w-10 h-10 ${a.bg} rounded-xl flex items-center justify-center flex-shrink-0`}
            >
              <a.icon size={18} className={a.color} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark dark:text-white">
                {a.title}
              </p>
              <p className="text-xs text-dark-400">{a.desc}</p>
            </div>
            <button
              onClick={() =>
                updateSettings({ [a.key]: !settingsData?.[a.key] })
              }
              disabled={!connected}
              className={`flex-shrink-0 ${!connected ? "opacity-40 cursor-not-allowed" : ""}`}
            >
              {settingsData?.[a.key] ? (
                <ToggleRight size={28} className="text-primary" />
              ) : (
                <ToggleLeft size={28} className="text-dark-300" />
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Auto Reply Guide */}
      {/* {settingsData?.autoReply && (
        <div className="card border border-primary/20 bg-primary-light/30 dark:bg-primary/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
              <Zap size={18} className="text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-dark dark:text-white">
                Auto Reply is Active ✅
              </h2>
              <p className="text-xs text-dark-400">
                Customers will get instant replies for these keywords
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              {
                emoji: "👋",
                keyword: "hello / hi / hey",
                reply: "Welcome greeting + menu",
              },
              {
                emoji: "📄",
                keyword: "invoice / receipt",
                reply: "Invoice information",
              },
              {
                emoji: "💳",
                keyword: "payment / pay / bank",
                reply: "Payment methods",
              },
              {
                emoji: "⏳",
                keyword: "balance / owe / debt",
                reply: "Balance enquiry",
              },
              {
                emoji: "💰",
                keyword: "price / cost / rate",
                reply: "Pricing enquiry",
              },
              {
                emoji: "📦",
                keyword: "order / delivery / track",
                reply: "Order status",
              },
              {
                emoji: "🏦",
                keyword: "account number",
                reply: "Bank account details",
              },
              {
                emoji: "🕗",
                keyword: "hours / open / closed",
                reply: "Business hours",
              },
              {
                emoji: "📞",
                keyword: "contact / call / location",
                reply: "Contact info",
              },
              {
                emoji: "😤",
                keyword: "problem / issue / wrong",
                reply: "Complaint handler",
              },
              {
                emoji: "🙏",
                keyword: "thank / thanks",
                reply: "Appreciation reply",
              },
              {
                emoji: "👋",
                keyword: "bye / goodbye / noted",
                reply: "Farewell message",
              },
            ].map((item, i) => (
              <div key={i} className="p-3 bg-white dark:bg-surface rounded-xl">
                <p className="text-sm font-semibold text-dark dark:text-white">
                  {item.emoji}{" "}
                  <span className="font-mono text-primary text-xs">
                    {item.keyword}
                  </span>
                </p>
                <p className="text-xs text-dark-400 mt-0.5">{item.reply}</p>
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* Quick Replies */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
            <MessageCircle size={18} className="text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-dark dark:text-white">
              Quick Replies
            </h2>
            <p className="text-xs text-dark-400">
              Tap to copy — paste directly into WhatsApp
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {QUICK_REPLIES(
            user?.businessName,
            user?.bankName,
            user?.bankAccountNumber,
            user?.bankAccountName,
          ).map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark rounded-xl"
            >
              <div
                className={`w-9 h-9 ${r.bg} rounded-xl flex items-center justify-center flex-shrink-0 text-base`}
              >
                {r.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${r.color}`}>{r.label}</p>
                <p className="text-xs text-dark-400 truncate">
                  {r.message.slice(0, 50)}...
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(r.message);
                  toast.success(`"${r.label}" copied!`);
                }}
                className="w-8 h-8 bg-white dark:bg-surface border border-dark-200 dark:border-gray-700 rounded-lg flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-colors flex-shrink-0"
              >
                <Copy size={13} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Campaigns */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-semibold text-dark dark:text-white">
              Recent Campaigns
            </h2>
            <p className="text-xs text-dark-400">
              Bulk WhatsApp messages to customers
            </p>
          </div>
          <button
            onClick={() => {
              if (!connected) return toast.error("Connect WhatsApp first");
              setShowCampaign(true);
            }}
            className="btn btn-primary btn-sm"
          >
            <Send size={14} /> New Campaign
          </button>
        </div>

        {(campaigns?.campaigns || []).length === 0 ? (
          <div className="empty-state py-8">
            <MessageSquare size={40} className="text-dark-200" />
            <p className="text-dark-400 text-sm">No campaigns yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(campaigns?.campaigns || []).map((c, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark rounded-xl group"
              >
                <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <Send size={14} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark dark:text-white">
                    {c.name}
                  </p>
                  <p className="text-xs text-dark-400">
                    {CAMPAIGN_TARGETS.find((t) => t.value === c.audience)
                      ?.label || "All customers"}{" "}
                    · {c.sentCount || 0} sent
                    {c.failedCount > 0 && ` · ${c.failedCount} failed`}
                  </p>
                  {c.message && (
                    <p className="text-xs text-dark-300 truncate mt-0.5">
                      {c.message.slice(0, 60)}...
                    </p>
                  )}
                  {c.scheduledAt && !c.sentAt && (
                    <p className="text-xs text-warning mt-0.5">
                      ⏰ Scheduled:{" "}
                      {dayjs(c.scheduledAt).format("D MMM · h:mm A")}
                    </p>
                  )}
                  {c.sentAt && (
                    <p className="text-xs text-dark-300 mt-0.5">
                      {dayjs(c.sentAt).format("D MMM YYYY · h:mm A")}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full ${
                      c.status === "Completed"
                        ? "bg-success-light text-success"
                        : c.status === "Scheduled"
                          ? "bg-warning-light text-warning"
                          : c.status === "In Progress"
                            ? "bg-primary-light text-primary"
                            : c.status === "Failed"
                              ? "bg-danger-light text-danger"
                              : "bg-gray-100 text-dark-400"
                    }`}
                  >
                    {c.status || "Draft"}
                  </span>
                  <button
                    onClick={() =>
                      toast(
                        (t) => (
                          <div className="flex items-center gap-3">
                            <p className="text-sm font-semibold">
                              Delete campaign?
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  deleteCampaign(c._id);
                                  toast.dismiss(t.id);
                                }}
                                className="px-3 py-1 bg-danger text-white text-xs font-bold rounded-lg"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => toast.dismiss(t.id)}
                                className="px-3 py-1 bg-gray-100 text-dark text-xs font-bold rounded-lg"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ),
                        { duration: 5000 },
                      )
                    }
                    className="p-1.5 rounded-lg hover:bg-danger-light text-dark-300 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Campaign Modal */}
      {showCampaign && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-surface z-10">
              <div>
                <h3 className="font-bold text-dark dark:text-white">
                  New Campaign
                </h3>
                <p className="text-xs text-dark-400">
                  {user?.businessName || "Your Business"}
                </p>
              </div>
              <button
                onClick={resetCampaign}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Campaign name */}
              <div>
                <label className="label">Campaign Name *</label>
                <input
                  value={campName}
                  onChange={(e) => setCampName(e.target.value)}
                  placeholder="e.g. Thank You Message, Promo Blast"
                  className="input"
                />
              </div>

              {/* Target audience */}
              <div>
                <label className="label">Audience *</label>
                <div className="grid grid-cols-2 gap-2">
                  {CAMPAIGN_TARGETS.map((t) => (
                    <button
                      key={t.value}
                      onClick={() => {
                        setCampTarget(t.value);
                        setSelectedCustomers([]);
                      }}
                      className={`py-3 px-3 rounded-xl text-sm font-semibold border-2 transition-all text-left
                        ${campTarget === t.value ? "bg-primary-light text-primary border-primary/30" : "border-dark-200 dark:border-gray-600 text-dark-400"}`}
                    >
                      <p>{t.label}</p>
                      <p className="text-[10px] font-normal opacity-70 mt-0.5">
                        {t.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific customer picker */}
              {campTarget === "specific" && (
                <div>
                  <label className="label">Select Customers *</label>
                  <input
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customers..."
                    className="input mb-2"
                  />
                  <div className="border border-dark-200 dark:border-gray-600 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
                    {(customersData?.customers || []).map((c) => {
                      const isSelected = selectedCustomers.find(
                        (s) => s._id === c._id,
                      );
                      return (
                        <button
                          key={c._id}
                          onClick={() => toggleCustomer(c)}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800
                            ${isSelected ? "bg-primary-light dark:bg-primary/10" : ""}`}
                        >
                          <div
                            className={`avatar w-8 h-8 text-xs ${avatarColor(c.name)}`}
                          >
                            {getInitials(c.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-dark dark:text-white truncate">
                              {c.name}
                            </p>
                            <p className="text-xs text-dark-400">{c.phone}</p>
                          </div>
                          {isSelected && (
                            <Check
                              size={14}
                              className="text-primary flex-shrink-0"
                            />
                          )}
                        </button>
                      );
                    })}
                    {(customersData?.customers || []).length === 0 && (
                      <p className="text-center text-dark-400 text-sm py-4">
                        No customers found
                      </p>
                    )}
                  </div>
                  {selectedCustomers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedCustomers.map((c) => (
                        <span
                          key={c._id}
                          className="flex items-center gap-1 text-xs bg-primary-light text-primary px-2 py-1 rounded-full"
                        >
                          {c.name}
                          <button
                            onClick={() => toggleCustomer(c)}
                            className="hover:text-danger"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Message composer */}
              <div>
                <label className="label">Message *</label>

                {/* Variables toolbar */}
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {VARIABLES.map((v) => (
                    <button
                      key={v.label}
                      onClick={() => insertAtCursor(v.label)}
                      className="text-xs px-2 py-1 bg-primary-light text-primary font-mono rounded-lg hover:bg-primary hover:text-white transition-colors"
                      title={v.desc}
                    >
                      {v.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="text-xs px-2 py-1 bg-warning-light text-warning rounded-lg hover:bg-warning hover:text-white transition-colors flex items-center gap-1"
                  >
                    <Smile size={12} /> Emoji
                  </button>
                </div>

                {/* Emoji picker */}
                {showEmojiPicker && (
                  <div className="grid grid-cols-10 gap-1 p-3 bg-gray-50 dark:bg-dark rounded-xl mb-2">
                    {EMOJIS.map((e) => (
                      <button
                        key={e}
                        onClick={() => {
                          insertAtCursor(e);
                          setShowEmojiPicker(false);
                        }}
                        className="text-xl hover:scale-125 transition-transform p-0.5"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}

                <textarea
                  ref={textareaRef}
                  value={campMessage}
                  onChange={(e) => setCampMessage(e.target.value)}
                  rows={4}
                  placeholder={`Hello {name} 👋\n\nThank you for choosing {business}! We appreciate your business. 🙏`}
                  className="input resize-none font-mono text-sm"
                />
                <p className="text-xs text-dark-400 mt-1">
                  {campMessage.length} characters · Variables are auto-replaced
                  per customer
                </p>
              </div>

              {/* Image upload */}
              <div>
                <label className="label">
                  Image{" "}
                  <span className="text-dark-400 font-normal">(optional)</span>
                </label>
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt=""
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <button
                      onClick={() => {
                        setCampImage(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 bg-danger text-white rounded-full flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-dark-200 dark:border-gray-600 rounded-xl p-4 flex items-center gap-3 hover:border-primary transition-colors text-dark-400"
                  >
                    <ImageIcon size={20} />
                    <div className="text-left">
                      <p className="text-sm font-semibold">
                        Add Campaign Image
                      </p>
                      <p className="text-xs">PNG, JPG up to 5MB</p>
                    </div>
                  </button>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* Schedule */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0 flex items-center gap-2">
                    <Clock size={14} /> Schedule Campaign
                  </label>
                  <button
                    onClick={() => setScheduleEnabled(!scheduleEnabled)}
                    className={`w-10 h-5 rounded-full transition-all relative ${scheduleEnabled ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
                  >
                    <div
                      className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow ${scheduleEnabled ? "left-5" : "left-0.5"}`}
                    />
                  </button>
                </div>
                {scheduleEnabled && (
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    min={dayjs().format("YYYY-MM-DDTHH:mm")}
                    className="input"
                  />
                )}
              </div>

              {/* WhatsApp-style preview */}
              {campMessage && (
                <div>
                  <p className="label mb-2">📱 Preview</p>
                  <div className="bg-[#E5DDD5] dark:bg-gray-700 rounded-2xl p-4">
                    {imagePreview && (
                      <div className="mb-2 flex justify-end">
                        <img
                          src={imagePreview}
                          alt=""
                          className="max-w-[200px] rounded-xl"
                        />
                      </div>
                    )}
                    <div className="flex justify-end">
                      <div className="bg-[#DCF8C6] dark:bg-green-800 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%] shadow-sm">
                        <p className="text-sm text-dark dark:text-white whitespace-pre-wrap">
                          {previewMessage}
                        </p>
                        <p className="text-[10px] text-dark-400 text-right mt-1">
                          {dayjs().format("h:mm A")} ✓✓
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleCreateCampaign}
                disabled={sending}
                className="btn btn-primary w-full py-3"
              >
                {sending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : scheduleEnabled ? (
                  <>
                    <Clock size={16} /> Schedule Campaign
                  </>
                ) : (
                  <>
                    <Send size={16} /> Send Campaign
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
