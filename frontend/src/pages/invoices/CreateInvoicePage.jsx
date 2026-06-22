import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Save,
  Send,
  ArrowLeft,
  Search,
  X,
  ChevronDown,
  Check,
  FileText,
  Zap,
  Truck,
  Camera,
} from "lucide-react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { invoiceAPI, customerAPI } from "../../services/api.js";

const fmt = (n) => "₦" + (n || 0).toLocaleString("en-NG");

const PAYMENT_STATUSES = [
  {
    value: "unpaid",
    label: "Not Paid Yet",
    desc: "Customer will pay later — due date required",
  },
  {
    value: "partial",
    label: "Partial Payment",
    desc: "Customer paid part of the total",
  },
  { value: "full", label: "Fully Paid", desc: "Customer paid everything" },
  {
    value: "transfer_pending",
    label: "Transfer Pending",
    desc: "Customer sent transfer — waiting to confirm",
  },
  {
    value: "declined",
    label: "Payment Declined",
    desc: "Bank declined or transfer failed",
  },
  {
    value: "pos",
    label: "POS Transaction",
    desc: "Record a POS/card machine payment",
  },
  {
    value: "cash",
    label: "Cash Received",
    desc: "Customer paid cash on the spot",
  },
];

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "paystack", label: "Paystack (Card)" },
  { value: "flutterwave", label: "Flutterwave" },
  { value: "pos", label: "POS" },
  { value: "crypto", label: "Crypto" },
  { value: "other", label: "Other" },
];

const QUICK_METHODS = [
  {
    value: "pos",
    label: "💳 POS Card",
    desc: "Card machine payment",
    color: "bg-warning-light text-warning border-warning/30",
  },
  {
    value: "bank_transfer",
    label: "🏦 Transfer",
    desc: "Customer sent bank transfer",
    color: "bg-primary-light text-primary border-primary/30",
  },
  {
    value: "cash",
    label: "💵 Cash",
    desc: "Physical cash payment",
    color: "bg-success-light text-success border-success/30",
  },
  {
    value: "paystack",
    label: "💙 Paystack",
    desc: "Online card via Paystack",
    color: "bg-[#e0f7fa] text-[#00C3F7] border-[#00C3F7]/30",
  },
  {
    value: "flutterwave",
    label: "🟠 Flutterwave",
    desc: "Online payment via FLW",
    color: "bg-[#fff3e0] text-[#F5A623] border-[#F5A623]/30",
  },
  {
    value: "other",
    label: "📦 Other",
    desc: "Any other payment method",
    color: "bg-gray-100 text-dark-400 border-gray-200",
  },
];

const TRANSACTION_STATUSES = [
  {
    value: "successful",
    label: "✅ Successful",
    desc: "Transaction completed",
    color: "bg-success-light text-success border-success/30",
  },
  {
    value: "pending",
    label: "⏳ Pending",
    desc: "Processing — not confirmed yet",
    color: "bg-warning-light text-warning border-warning/30",
  },
  {
    value: "failed",
    label: "❌ Failed",
    desc: "Transaction failed or declined",
    color: "bg-danger-light text-danger border-danger/30",
  },
  {
    value: "reversed",
    label: "↩️ Reversed",
    desc: "Transaction was reversed/refunded",
    color: "bg-purple-100 text-purple-600 border-purple-200",
  },
];

function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-left flex items-center justify-between transition-all bg-white dark:bg-surface
          ${open ? "border-primary ring-2 ring-primary/20" : "border-dark-200 dark:border-gray-600"}`}
      >
        <div>
          <span className="font-medium text-dark dark:text-white">
            {selected?.label || placeholder}
          </span>
          {selected?.desc && (
            <p className="text-xs text-dark-400 mt-0.5">{selected.desc}</p>
          )}
        </div>
        <ChevronDown
          size={15}
          className={`text-dark-400 transition-transform flex-shrink-0 ml-2 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface border border-dark-200 dark:border-gray-700 rounded-2xl shadow-xl z-20 overflow-hidden max-h-72 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-start justify-between px-4 py-3 text-sm text-left transition-all hover:bg-primary-light dark:hover:bg-primary/10
                  ${value === opt.value ? "bg-primary-light dark:bg-primary/10" : ""}`}
              >
                <div>
                  <span
                    className={`font-medium ${value === opt.value ? "text-primary" : "text-dark dark:text-white"}`}
                  >
                    {opt.label}
                  </span>
                  {opt.desc && (
                    <p className="text-xs text-dark-400 mt-0.5">{opt.desc}</p>
                  )}
                </div>
                {value === opt.value && (
                  <Check
                    size={14}
                    className="text-primary flex-shrink-0 mt-0.5"
                  />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function QuickRecordForm({ navigate, qc }) {
  const [customer, setCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [addingCustomer, setAddingCustomer] = useState(false);

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("pos");
  const [txStatus, setTxStatus] = useState("successful");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));

  const { data: customersData, refetch: refetchCustomers } = useQuery({
    queryKey: ["customers-search", customerSearch],
    queryFn: () =>
      customerAPI.getAll({ search: customerSearch }).then((r) => r.data),
    enabled: showPicker,
  });

  const { mutate: create, isPending } = useMutation({
    mutationFn: (d) => invoiceAPI.create(d),
    onSuccess: (res) => {
      qc.invalidateQueries(["invoices"]);
      qc.invalidateQueries(["dashboard"]);
      qc.invalidateQueries(["payments"]);
      toast.success(`Record ${res.data.invoice?.invoiceNumber} saved!`);
      navigate(`/dashboard/invoices/${res.data.invoice?._id}`);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to save"),
  });

  // Add new customer inline
  const handleAddCustomer = async () => {
    if (!newName.trim()) return toast.error("Enter customer name");
    if (!newPhone.trim()) return toast.error("Enter phone number");
    setAddingCustomer(true);
    try {
      const res = await customerAPI.create({
        name: newName.trim(),
        phone: newPhone.trim(),
      });
      const newCust = res.data?.customer;
      setCustomer(newCust);
      setShowAddCustomer(false);
      setShowPicker(false);
      setNewName("");
      setNewPhone("");
      toast.success(`${newCust.name} added!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add customer");
    } finally {
      setAddingCustomer(false);
    }
  };

  const submit = () => {
    if (!customer) return toast.error("Please select a customer");
    if (!amount || parseFloat(amount) <= 0)
      return toast.error("Enter a valid amount");

    const isSuccess = txStatus === "successful";
    const isPending_ = txStatus === "pending";
    const isFailed = txStatus === "failed" || txStatus === "reversed";

    const statusMap = {
      successful: "paid",
      pending: "pending",
      failed: "pending",
      reversed: "pending",
    };

    const methodLabel =
      QUICK_METHODS.find((m) => m.value === method)
        ?.label?.replace(/^.{2}/, "")
        .trim() || "Payment";
    const statusLabel =
      TRANSACTION_STATUSES.find((s) => s.value === txStatus)
        ?.label?.replace(/^.{2}/, "")
        .trim() || "";

    const noteparts = [
      reference ? `Ref: ${reference}` : "",
      note,
      isFailed ? `[${statusLabel} — transaction did not complete]` : "",
      isPending_ ? `[Pending — awaiting confirmation]` : "",
      txStatus === "reversed" ? `[Reversed — amount returned to customer]` : "",
    ].filter(Boolean);

    create({
      customer: customer._id,
      items: [
        {
          name: `${
            QUICK_METHODS.find((m) => m.value === method)
              ?.label?.replace(/^.{2}/, "")
              .trim() || "Payment"
          } Transaction`,
          quantity: 1,
          unitPrice: parseFloat(amount),
        },
      ],
      type: "quick",
      txStatus: txStatus,
      status: statusMap[txStatus],
      amountPaid: isSuccess ? parseFloat(amount) : 0,
      paymentMethod: method,
      paymentDate: isSuccess ? new Date(date) : null,
      invoiceDate: date,
      notes: noteparts.join(" · "),
      discountPercent: 0,
    });
  };

  return (
    <div className="space-y-4">
      {/* Customer */}
      <div className="card space-y-2">
        <label className="label">Customer *</label>
        {customer ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary-light dark:bg-primary/10">
            <div className="avatar bg-primary text-white text-sm">
              {customer.name[0]}
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-dark dark:text-white">
                {customer.name}
              </p>
              <p className="text-xs text-gray-400">{customer.phone}</p>
            </div>
            <button
              onClick={() => setCustomer(null)}
              className="text-gray-400 hover:text-danger"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowPicker(true)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 dark:border-white/10 hover:border-primary hover:bg-primary-light dark:hover:bg-primary/10 transition-colors text-left"
          >
            <Search size={16} className="text-gray-400" />
            <span className="text-sm text-gray-400">
              Select or add customer...
            </span>
          </button>
        )}
      </div>

      {/* Customer Picker Modal */}
      {showPicker && (
        <div
          className="modal-overlay"
          onClick={() => {
            setShowPicker(false);
            setShowAddCustomer(false);
          }}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            {showAddCustomer ? (
              // Add new customer form
              <>
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
                  <button
                    onClick={() => setShowAddCustomer(false)}
                    className="text-dark-400 hover:text-dark"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <p className="font-semibold text-dark dark:text-white">
                    Add New Customer
                  </p>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <label className="label">Name *</label>
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="e.g. Amaka Johnson"
                      className="input"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="label">Phone Number *</label>
                    <input
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      placeholder="e.g. 08012345678"
                      className="input"
                      type="tel"
                    />
                  </div>
                  <button
                    onClick={handleAddCustomer}
                    disabled={addingCustomer}
                    className="btn btn-primary w-full"
                  >
                    {addingCustomer ? (
                      "Adding..."
                    ) : (
                      <>
                        <Plus size={15} /> Add Customer
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              // Search customers
              <>
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
                  <Search size={16} className="text-gray-400" />
                  <input
                    autoFocus
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customers..."
                    className="flex-1 outline-none bg-transparent text-sm dark:text-white"
                  />
                  <button onClick={() => setShowPicker(false)}>
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                  {(customersData?.customers || []).map((c) => (
                    <button
                      key={c._id}
                      onClick={() => {
                        setCustomer(c);
                        setShowPicker(false);
                      }}
                      className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-colors"
                    >
                      <div className="avatar bg-primary-light text-primary text-sm">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold dark:text-white">
                          {c.name}
                        </p>
                        <p className="text-xs text-gray-400">{c.phone}</p>
                      </div>
                    </button>
                  ))}
                  {(customersData?.customers || []).length === 0 && (
                    <div className="p-6 text-center text-sm text-gray-400">
                      No customers found
                    </div>
                  )}
                </div>
                {/* Add new customer button */}
                <div className="p-4 border-t border-gray-100 dark:border-white/5">
                  <button
                    onClick={() => setShowAddCustomer(true)}
                    className="btn btn-primary w-full text-sm"
                  >
                    <Plus size={14} /> Add New Customer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Amount */}
      <div className="card space-y-2">
        <label className="label">Amount (₦) *</label>
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="input text-xl font-bold"
        />
        {amount && parseFloat(amount) > 0 && (
          <p className="text-sm text-primary font-semibold">
            {fmt(parseFloat(amount))}
          </p>
        )}
      </div>

      {/* Payment Method */}
      <div className="card space-y-3">
        <label className="label mb-0">Payment Method *</label>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_METHODS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMethod(m.value)}
              className={`py-3 px-3 rounded-xl text-sm font-semibold border transition-all text-left
                ${method === m.value ? m.color + " border-2" : "border-dark-200 dark:border-gray-600 text-dark-400 hover:border-primary/30"}`}
            >
              <p>{m.label}</p>
              <p className="text-[10px] font-normal opacity-70 mt-0.5">
                {m.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Status */}
      <div className="card space-y-3">
        <label className="label mb-0">Transaction Status *</label>
        <div className="grid grid-cols-2 gap-2">
          {TRANSACTION_STATUSES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setTxStatus(s.value)}
              className={`py-3 px-3 rounded-xl text-sm font-semibold border transition-all text-left
                ${txStatus === s.value ? s.color + " border-2" : "border-dark-200 dark:border-gray-600 text-dark-400 hover:border-primary/30"}`}
            >
              <p>{s.label}</p>
              <p className="text-[10px] font-normal opacity-70 mt-0.5">
                {s.desc}
              </p>
            </button>
          ))}
        </div>

        {/* Status info banners */}
        {txStatus === "pending" && (
          <div className="p-3 bg-warning-light rounded-xl">
            <p className="text-xs font-semibold text-warning">
              ⏳ Transaction Pending
            </p>
            <p className="text-xs text-dark-500 mt-0.5">
              Record will be saved as pending. Update to successful once
              confirmed in your bank app.
            </p>
          </div>
        )}
        {txStatus === "failed" && (
          <div className="p-3 bg-danger-light rounded-xl">
            <p className="text-xs font-semibold text-danger">
              ❌ Transaction Failed
            </p>
            <p className="text-xs text-dark-500 mt-0.5">
              Recorded for your log. No payment will be counted. Customer needs
              to retry.
            </p>
          </div>
        )}
        {txStatus === "reversed" && (
          <div className="p-3 bg-purple-100 rounded-xl">
            <p className="text-xs font-semibold text-purple-600">
              ↩️ Transaction Reversed
            </p>
            <p className="text-xs text-dark-500 mt-0.5">
              Recorded for your log. Amount was returned to the customer.
            </p>
          </div>
        )}
      </div>

      {/* Date + Reference + Note */}
      <div className="card space-y-4">
        <div>
          <label className="label">Transaction Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={dayjs().format("YYYY-MM-DD")}
            className="input"
          />
        </div>
        <div>
          <label className="label">
            Reference / Transaction ID
            <span className="text-dark-400 font-normal ml-1">(optional)</span>
          </label>
          <input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. TXN123456789 or RRN"
            className="input"
          />
        </div>
        <div>
          <label className="label">
            Note
            <span className="text-dark-400 font-normal ml-1">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Customer bought airtime, paid for fuel..."
            rows={2}
            className="input resize-none"
          />
        </div>
      </div>

      {/* Summary before submit */}
      {customer && amount && parseFloat(amount) > 0 && (
        <div className="card bg-gray-50 dark:bg-dark space-y-2">
          <p className="text-xs font-bold text-dark-400 uppercase tracking-wider">
            Summary
          </p>
          <div className="flex justify-between text-sm">
            <span className="text-dark-500">Customer</span>
            <span className="font-semibold text-dark dark:text-white">
              {customer.name}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dark-500">Amount</span>
            <span className="font-bold text-primary">
              {fmt(parseFloat(amount))}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dark-500">Method</span>
            <span className="font-semibold text-dark dark:text-white">
              {QUICK_METHODS.find((m) => m.value === method)?.label}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-dark-500">Status</span>
            <span
              className={`font-semibold ${
                txStatus === "successful"
                  ? "text-success"
                  : txStatus === "pending"
                    ? "text-warning"
                    : txStatus === "reversed"
                      ? "text-purple-600"
                      : "text-danger"
              }`}
            >
              {TRANSACTION_STATUSES.find((s) => s.value === txStatus)?.label}
            </span>
          </div>
        </div>
      )}

      {/* Submit */}
      <div className="pb-6">
        <button
          onClick={submit}
          disabled={isPending}
          className="btn btn-primary w-full py-3 text-base"
        >
          {isPending ? (
            "Saving..."
          ) : (
            <>
              <Zap size={16} /> Save Record
            </>
          )}
        </button>
      </div>
    </div>
  );
}

//  MAIN PAGE
export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [mode, setMode] = useState("standard"); // 'standard' | 'quick'

  // Standard invoice state
  const [customer, setCustomer] = useState(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [invoiceDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [dueDate, setDueDate] = useState(
    dayjs().add(7, "day").format("YYYY-MM-DD"),
  );
  const [items, setItems] = useState([
    { name: "", description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("unpaid");
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");

  const [deliveryEnabled, setDeliveryEnabled] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [deliveryFeeType, setDeliveryFeeType] = useState("none");
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [productPhotos, setProductPhotos] = useState([]);

  const compressImage = (file) =>
    new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const MAX = 800;
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
          (blob) =>
            resolve(new File([blob], file.name, { type: "image/jpeg" })),
          "image/jpeg",
          0.7,
        );
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });

  const { data: customersData } = useQuery({
    queryKey: ["customers-search", customerSearch],
    queryFn: () =>
      customerAPI.getAll({ search: customerSearch }).then((r) => r.data),
    enabled: showCustomerPicker,
  });

  const { mutate: createInvoice, isPending } = useMutation({
    mutationFn: (d) => invoiceAPI.create(d),
    onSuccess: async (res) => {
      const invoiceId = res.data.invoice?._id;

      // Upload photos first if any
      if (productPhotos.length > 0) {
        toast.loading("Uploading photos...", { id: "photo-upload" });
        try {
          const compressed = await Promise.all(
            productPhotos.map(compressImage),
          );
          const formData = new FormData();
          compressed.forEach((p) => formData.append("photos", p));
          await invoiceAPI.uploadPhotos(invoiceId, formData);
          toast.dismiss("photo-upload");
        } catch (err) {
          toast.error(`Photo upload failed: ${err.message}`, {
            id: "photo-upload",
          });
        }
      }

      // Send WhatsApp after everything is ready
      try {
        await invoiceAPI.sendWhatsApp(invoiceId);
      } catch (err) {
        // Silent — WhatsApp may not be connected
      }

      qc.invalidateQueries(["invoices"]);
      qc.invalidateQueries(["dashboard"]);
      toast.success(`Invoice ${res.data.invoice?.invoiceNumber} created!`);
      navigate(`/dashboard/invoices/${invoiceId}`);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to create invoice"),
  });

  const subtotal = items.reduce(
    (s, i) => s + (parseFloat(i.unitPrice) || 0) * (parseInt(i.quantity) || 0),
    0,
  );
  const discountAmt = (subtotal * discountPercent) / 100;
  const deliveryFeeAmount =
    deliveryEnabled && deliveryFeeType === "fixed" ? deliveryFee || 0 : 0;
  const total = subtotal - discountAmt + deliveryFeeAmount;

  const isPaid = paymentStatus === "full";
  const isPartial = paymentStatus === "partial";
  const isTransferPending = paymentStatus === "transfer_pending";
  const isDeclined = paymentStatus === "declined";
  const isPOS = paymentStatus === "pos";
  const isCash = paymentStatus === "cash";
  const isInstantPaid = isPaid || isPOS || isCash;

  const finalAmountPaid = isInstantPaid
    ? total
    : isPartial
      ? parseFloat(amountPaid) || 0
      : 0;
  const balance = total - finalAmountPaid;

  const handlePaymentStatusChange = (val) => {
    setPaymentStatus(val);
    if (val === "full" || val === "pos" || val === "cash") setAmountPaid(total);
    if (val === "unpaid" || val === "transfer_pending" || val === "declined")
      setAmountPaid(0);
    if (val === "pos") setPaymentMethod("pos");
    if (val === "cash") setPaymentMethod("cash");
  };

  useEffect(() => {
    if (isInstantPaid) setAmountPaid(total);
  }, [total, isInstantPaid]);

  const addItem = () =>
    setItems([
      ...items,
      { name: "", description: "", quantity: 1, unitPrice: 0 },
    ]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, k, v) => {
    const a = [...items];
    a[i][k] = v;
    setItems(a);
  };

  const submit = (isDraft = false) => {
    if (!customer) return toast.error("Please select a customer");
    if (items.some((i) => !i.name.trim()))
      return toast.error("Fill in all item names");
    if (isPartial && (finalAmountPaid <= 0 || finalAmountPaid >= total)) {
      return toast.error("Partial payment must be between ₦0 and the total");
    }

    const statusMap = {
      unpaid: "pending",
      partial: "partial",
      full: "paid",
      transfer_pending: "pending",
      declined: "pending",
      pos: "paid",
      cash: "paid",
    };

    const status = isDraft ? "draft" : statusMap[paymentStatus] || "pending";

    let finalNotes = notes;
    if (isTransferPending)
      finalNotes +=
        (notes ? "\n" : "") + "[Transfer pending — awaiting bank confirmation]";
    if (isDeclined)
      finalNotes +=
        (notes ? "\n" : "") + "[Payment declined — customer needs to retry]";

    createInvoice({
      customer: customer._id,
      items,
      invoiceDate,
      dueDate:
        isInstantPaid || isTransferPending || isDeclined ? undefined : dueDate,
      discountPercent,
      notes: finalNotes,
      status,
      amountPaid: finalAmountPaid,
      paymentMethod: isInstantPaid || isPartial ? paymentMethod : undefined,
      paymentDate: isInstantPaid || isPartial ? new Date() : undefined,
      txStatus: isTransferPending ? "pending" : isDeclined ? "failed" : null,
      delivery: deliveryEnabled
        ? {
            enabled: true,
            address: deliveryAddress,
            estimatedDate: deliveryDate || null,
            notes: deliveryNotes,
            feeType: deliveryFeeType,
            fee: deliveryFeeType === "fixed" ? deliveryFee : 0,
            status: "pending",
          }
        : { enabled: false },
    });
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="page-title">Create Invoice</h1>
          <p className="text-xs text-gray-400">Fill in the details below</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
        <button
          onClick={() => setMode("standard")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
            ${mode === "standard" ? "bg-white dark:bg-surface text-dark dark:text-white shadow-sm" : "text-dark-400"}`}
        >
          <FileText size={15} />
          Standard Invoice
        </button>
        <button
          onClick={() => setMode("quick")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all
            ${mode === "quick" ? "bg-white dark:bg-surface text-dark dark:text-white shadow-sm" : "text-dark-400"}`}
        >
          <Zap size={15} />
          Quick Record
        </button>
      </div>

      {/* Mode description */}
      {mode === "quick" && (
        <div className="px-4 py-3 bg-warning-light rounded-2xl">
          <p className="text-xs font-semibold text-warning mb-0.5">
            ⚡ Quick Record Mode
          </p>
          <p className="text-xs text-dark-500 dark:text-gray-400">
            For POS agents, transfer recording, and simple cash transactions. No
            items needed — just amount, method and customer.
          </p>
        </div>
      )}

      {/* Form */}
      {mode === "quick" ? (
        <QuickRecordForm navigate={navigate} qc={qc} />
      ) : (
        <>
          {/* Customer */}
          <div className="card space-y-2">
            <label className="label">Customer *</label>
            {customer ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary-light dark:bg-primary/10">
                <div className="avatar bg-primary text-white text-sm">
                  {customer.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-dark dark:text-white">
                    {customer.name}
                  </p>
                  <p className="text-xs text-gray-400">{customer.phone}</p>
                </div>
                <button
                  onClick={() => setCustomer(null)}
                  className="text-gray-400 hover:text-danger"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowCustomerPicker(true)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-200 dark:border-white/10 hover:border-primary hover:bg-primary-light dark:hover:bg-primary/10 transition-colors text-left"
              >
                <Search size={16} className="text-gray-400" />
                <span className="text-sm text-gray-400">
                  Select customer...
                </span>
              </button>
            )}
          </div>

          {/* Customer Picker Modal */}
          {showCustomerPicker && (
            <div
              className="modal-overlay"
              onClick={() => setShowCustomerPicker(false)}
            >
              <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center gap-3">
                  <Search size={16} className="text-gray-400" />
                  <input
                    autoFocus
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    placeholder="Search customers..."
                    className="flex-1 outline-none bg-transparent text-sm dark:text-white"
                  />
                  <button onClick={() => setShowCustomerPicker(false)}>
                    <X size={18} className="text-gray-400" />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
                  {(customersData?.customers || []).map((c) => (
                    <button
                      key={c._id}
                      onClick={() => {
                        setCustomer(c);
                        setShowCustomerPicker(false);
                      }}
                      className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-white/5 text-left transition-colors"
                    >
                      <div className="avatar bg-primary-light text-primary text-sm">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold dark:text-white">
                          {c.name}
                        </p>
                        <p className="text-xs text-gray-400">{c.phone}</p>
                      </div>
                    </button>
                  ))}
                  {(customersData?.customers || []).length === 0 && (
                    <div className="p-6 text-center text-sm text-gray-400">
                      No customers found
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-gray-100 dark:border-white/5">
                  <button
                    onClick={() => {
                      setShowCustomerPicker(false);
                      navigate("/dashboard/customers");
                    }}
                    className="btn-secondary w-full text-sm py-2"
                  >
                    <Plus size={14} /> Add New Customer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Items */}
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <label className="label mb-0">Items *</label>
              <button
                onClick={addItem}
                className="text-xs text-primary font-semibold flex items-center gap-1 hover:gap-2 transition-all"
              >
                <Plus size={13} /> Add Item
              </button>
            </div>
            {items.map((item, i) => (
              <div
                key={i}
                className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3 space-y-2"
              >
                <div className="flex gap-2">
                  <input
                    value={item.name}
                    onChange={(e) => updateItem(i, "name", e.target.value)}
                    placeholder="Item name *"
                    className="input flex-1 py-2"
                  />
                  {items.length > 1 && (
                    <button
                      onClick={() => removeItem(i)}
                      className="p-2 text-danger hover:bg-danger-light rounded-lg transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
                <input
                  value={item.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                  placeholder="Description (optional)"
                  className="input py-2 text-xs"
                />
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="label text-[10px]">Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(i, "quantity", e.target.value)
                      }
                      className="input py-2 text-center"
                    />
                  </div>
                  <div>
                    <label className="label text-[10px]">Unit Price (₦)</label>
                    <input
                      type="number"
                      min="0"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(i, "unitPrice", e.target.value)
                      }
                      className="input py-2"
                    />
                  </div>
                  <div>
                    <label className="label text-[10px]">Total</label>
                    <div className="input py-2 bg-gray-100 dark:bg-white/5 text-sm font-semibold text-dark dark:text-white cursor-not-allowed">
                      {fmt(
                        (parseFloat(item.unitPrice) || 0) *
                          (parseInt(item.quantity) || 0),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="border-t border-gray-100 dark:border-white/10 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Subtotal
                </span>
                <span className="font-semibold dark:text-white">
                  {fmt(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Discount (%)
                </span>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(Number(e.target.value))}
                  className="input w-20 py-1.5 text-sm text-center"
                />
              </div>
              {discountPercent > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Discount Amount</span>
                  <span className="text-danger font-medium">
                    -{fmt(discountAmt)}
                  </span>
                </div>
              )}
              {deliveryEnabled &&
                deliveryFeeType === "fixed" &&
                deliveryFeeAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">
                      🚚 Delivery Fee
                    </span>
                    <span className="font-semibold text-dark dark:text-white">
                      +{fmt(deliveryFeeAmount)}
                    </span>
                  </div>
                )}
              {deliveryEnabled && deliveryFeeType === "free" && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    🚚 Delivery
                  </span>
                  <span className="font-semibold text-success">FREE</span>
                </div>
              )}
              {deliveryEnabled && deliveryFeeType === "pay_on_delivery" && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    🚚 Delivery
                  </span>
                  <span className="font-semibold text-warning">
                    Pay on Delivery
                  </span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold border-t border-gray-100 dark:border-white/10 pt-2">
                <span className="dark:text-white">Total Amount</span>
                <span className="text-primary text-lg">{fmt(total)}</span>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="card space-y-4">
            <div>
              <label className="label">Payment Status *</label>
              <CustomSelect
                value={paymentStatus}
                onChange={handlePaymentStatusChange}
                options={PAYMENT_STATUSES}
                placeholder="Select payment status"
              />
            </div>

            {isPartial && (
              <div>
                <label className="label">Amount Paid (₦)</label>
                <input
                  type="number"
                  min="1"
                  max={total - 1}
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="input"
                  placeholder="Enter amount paid"
                />
                {finalAmountPaid > 0 && (
                  <div className="mt-3 p-3 bg-warning-light rounded-xl space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-500 dark:text-gray-400">
                        Amount Paid
                      </span>
                      <span className="font-bold text-success">
                        {fmt(finalAmountPaid)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-500 dark:text-gray-400">
                        Balance Remaining
                      </span>
                      <span className="font-bold text-danger">
                        {fmt(balance)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {isPaid && (
              <div className="p-3 bg-success-light rounded-xl space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500 dark:text-gray-400">
                    Amount Paid
                  </span>
                  <span className="font-bold text-success">{fmt(total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500 dark:text-gray-400">
                    Balance
                  </span>
                  <span className="font-bold text-success">
                    ₦0 — Fully Settled ✓
                  </span>
                </div>
              </div>
            )}

            {isPOS && (
              <div className="p-3 bg-success-light rounded-xl space-y-1">
                <p className="text-sm font-semibold text-success">
                  💳 POS Payment Recorded
                </p>
                <p className="text-xs text-dark-500 dark:text-gray-400">
                  Full amount of {fmt(total)} recorded as a POS transaction.
                </p>
              </div>
            )}

            {isCash && (
              <div className="p-3 bg-success-light rounded-xl space-y-1">
                <p className="text-sm font-semibold text-success">
                  💵 Cash Payment Recorded
                </p>
                <p className="text-xs text-dark-500 dark:text-gray-400">
                  Full amount of {fmt(total)} received as cash.
                </p>
              </div>
            )}

            {isTransferPending && (
              <div className="p-3 bg-warning-light rounded-xl space-y-1">
                <p className="text-sm font-semibold text-warning">
                  ⏳ Awaiting Transfer Confirmation
                </p>
                <p className="text-xs text-dark-500 dark:text-gray-400">
                  Check your bank app and mark as paid once confirmed.
                </p>
              </div>
            )}

            {isDeclined && (
              <div className="p-3 bg-danger-light rounded-xl space-y-1">
                <p className="text-sm font-semibold text-danger">
                  ❌ Payment Declined / Failed
                </p>
                <p className="text-xs text-dark-500 dark:text-gray-400">
                  Payment was declined. Use Update Transaction to retry or mark
                  as resolved.
                </p>
              </div>
            )}

            {(isInstantPaid || isPartial) && (
              <div>
                <label className="label">Payment Method</label>
                <CustomSelect
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                  options={PAYMENT_METHODS}
                  placeholder="Select payment method"
                />
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="card grid grid-cols-2 gap-4">
            <div>
              <label className="label">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                readOnly
                className="input bg-gray-50 dark:bg-white/5 cursor-not-allowed"
              />
            </div>
            {!isInstantPaid && !isTransferPending && !isDeclined ? (
              <div>
                <label className="label">Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  min={invoiceDate}
                  className="input"
                />
              </div>
            ) : (
              <div className="flex items-end pb-1">
                <p className="text-xs text-dark-400 font-medium">
                  {isInstantPaid
                    ? "✓ No due date — already paid"
                    : isTransferPending
                      ? "⏳ No due date — awaiting transfer"
                      : "❌ No due date — payment declined"}
                </p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="card">
            <label className="label">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add a note for this invoice..."
              className="input resize-none"
            />
          </div>

          {/* Delivery Toggle */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                  <Truck size={18} className="text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-dark dark:text-white">
                    Add Delivery
                  </p>
                  <p className="text-xs text-dark-400">
                    Optional — for orders that need shipping
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeliveryEnabled(!deliveryEnabled)}
                className={`w-12 h-6 rounded-full transition-all relative ${deliveryEnabled ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow ${deliveryEnabled ? "left-6" : "left-0.5"}`}
                />
              </button>
            </div>

            {deliveryEnabled && (
              <div className="mt-4 space-y-3 pt-4 border-t border-dark-100 dark:border-gray-700">
                <div>
                  <label className="label">Delivery Address</label>
                  <textarea
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    rows={2}
                    placeholder="Enter delivery address..."
                    className="input resize-none"
                  />
                </div>
                <div>
                  <label className="label">Estimated Delivery Date</label>
                  <input
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Delivery Fee</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "none", label: "No Fee", desc: "Not specified" },
                      {
                        value: "free",
                        label: "🚚 Free Delivery",
                        desc: "Show free delivery",
                      },
                      {
                        value: "fixed",
                        label: "💰 Fixed Amount",
                        desc: "Add fee to total",
                      },
                      {
                        value: "pay_on_delivery",
                        label: "🚗 Pay Rider",
                        desc: "Customer pays delivery fee to rider",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setDeliveryFeeType(opt.value)}
                        className={`p-3 rounded-xl border-2 text-left text-sm font-semibold transition-all ${
                          deliveryFeeType === opt.value
                            ? "border-primary bg-primary-light text-primary"
                            : "border-dark-200 dark:border-gray-700 text-dark-400"
                        }`}
                      >
                        <p>{opt.label}</p>
                        <p className="text-[10px] font-normal opacity-70 mt-0.5">
                          {opt.desc}
                        </p>
                      </button>
                    ))}
                  </div>
                  {deliveryFeeType === "fixed" && (
                    <div className="mt-2">
                      <label className="label">Fee Amount (₦)</label>
                      <input
                        type="number"
                        min="0"
                        value={deliveryFee}
                        onChange={(e) =>
                          setDeliveryFee(parseFloat(e.target.value) || 0)
                        }
                        placeholder="e.g. 2000"
                        className="input"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="label">
                    Delivery Notes{" "}
                    <span className="text-dark-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    placeholder="Special instructions..."
                    className="input"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Product Photos */}
          <div className="card">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-warning-light rounded-xl flex items-center justify-center">
                <Camera size={18} className="text-warning" />
              </div>
              <div>
                <p className="font-semibold text-dark dark:text-white">
                  Product Photos
                </p>
                <p className="text-xs text-dark-400">
                  Optional — attach photos of the items
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {productPhotos.map((photo, i) => (
                <div key={i} className="relative aspect-square">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt=""
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <button
                    onClick={() =>
                      setProductPhotos((p) => p.filter((_, idx) => idx !== i))
                    }
                    className="absolute -top-1 -right-1 w-5 h-5 bg-danger text-white rounded-full flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
              {productPhotos.length < 5 && (
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById("product-photos").click()
                  }
                  className="aspect-square border-2 border-dashed border-dark-200 dark:border-gray-600 rounded-xl flex flex-col items-center justify-center hover:border-primary transition-colors"
                >
                  <Camera size={20} className="text-dark-400" />
                  <p className="text-xs text-dark-400 mt-1">Add Photo</p>
                </button>
              )}
            </div>
            <input
              id="product-photos"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files).slice(
                  0,
                  5 - productPhotos.length,
                );
                setProductPhotos((p) => [...p, ...files]);
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pb-6">
            <button
              onClick={() => submit(true)}
              disabled={isPending}
              className="btn btn-secondary flex-1 py-3"
            >
              <Save size={16} /> Save Draft
            </button>
            <button
              onClick={() => submit(false)}
              disabled={isPending}
              className="btn btn-primary flex-1 py-3"
            >
              {isPending ? (
                "Creating..."
              ) : (
                <>
                  <Send size={16} /> Create Invoice
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
