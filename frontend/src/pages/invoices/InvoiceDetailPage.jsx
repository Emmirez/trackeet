import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Download,
  CheckCircle,
  ChevronDown,
  Check,
  X,
  Zap,
  Truck,
  Package,
  Camera,
  RefreshCw,
} from "lucide-react";
import { invoiceAPI } from "../../services/api.js";
import { fmt, statusBadge } from "../../utils/helpers.js";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import useAuthStore from "../../store/authStore.js";
import { generatePDF } from "../../utils/pdfTemplates.js";

const PAYMENT_METHODS = [
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cash", label: "Cash" },
  { value: "paystack", label: "Paystack (Card)" },
  { value: "flutterwave", label: "Flutterwave" },
  { value: "pos", label: "POS" },
  { value: "crypto", label: "Crypto" },
  { value: "other", label: "Other" },
];

const STATUS_COLORS = {
  paid: "bg-success-light text-success",
  partial: "bg-warning-light text-warning",
  pending: "bg-primary-light text-primary",
  overdue: "bg-danger-light text-danger",
  draft: "bg-gray-100 text-dark-400",
  refunded: "bg-gray-100 text-dark-400",
};

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
        <span className="font-medium text-dark dark:text-white">
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={15}
          className={`text-dark-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-surface border border-dark-200 dark:border-gray-700 rounded-2xl shadow-xl z-20 overflow-hidden max-h-72 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-all hover:bg-primary-light dark:hover:bg-primary/10
                  ${value === opt.value ? "bg-primary-light dark:bg-primary/10" : ""}`}
              >
                <span
                  className={`font-medium ${value === opt.value ? "text-primary" : "text-dark dark:text-white"}`}
                >
                  {opt.label}
                </span>
                {value === opt.value && (
                  <Check size={14} className="text-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user: authUser } = useAuthStore();

  const [showMarkPaid, setShowMarkPaid] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("bank_transfer");
  const [payType, setPayType] = useState("full");
  const [showUpdateTx, setShowUpdateTx] = useState(false);
  const [newTxStatus, setNewTxStatus] = useState("successful");
  const [localTxStatus, setLocalTxStatus] = useState(null);
  const [showDeliveryUpdate, setShowDeliveryUpdate] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [deliveryUpdateNote, setDeliveryUpdateNote] = useState("");
  const [deliveryPhoto, setDeliveryPhoto] = useState(null);

  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [updatingDelivery, setUpdatingDelivery] = useState(false);

  const [showRefund, setShowRefund] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => invoiceAPI.getOne(id).then((r) => r.data),
  });
  const inv = data?.invoice;

  const { mutate: markPaid, isPending: paying } = useMutation({
    mutationFn: (d) => invoiceAPI.markPaid(id, d),
    onSuccess: () => {
      toast.success("Payment recorded!");
      qc.invalidateQueries(["invoice", id]);
      qc.invalidateQueries(["invoices"]);
      qc.invalidateQueries(["dashboard"]);
      setShowMarkPaid(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to record payment"),
  });

  const { mutate: updateTx, isPending: updating } = useMutation({
    mutationFn: (d) => invoiceAPI.update(id, d),
    onSuccess: (res) => {
      toast.success("Transaction updated!");

      // Directly patch cache with exact response data
      qc.setQueryData(["invoice", id], res.data);

      qc.invalidateQueries(["invoices"]);
      qc.invalidateQueries(["payments"]);
      qc.invalidateQueries(["dashboard"]);
      setShowUpdateTx(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update"),
  });

  const { mutate: refundInvoice, isPending: refunding } = useMutation({
    mutationFn: (d) => invoiceAPI.update(id, d),
    onSuccess: () => {
      toast.success("Invoice refunded!");
      qc.invalidateQueries(["invoice", id]);
      qc.invalidateQueries(["invoices"]);
      qc.invalidateQueries(["dashboard"]);
      setShowRefund(false);
      setRefundReason("");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to refund"),
  });

  const handleUpdateTx = () => {
    const isPaid = newTxStatus === "successful";
    updateTx({
      txStatus: newTxStatus,
      status: isPaid ? "paid" : "pending",
      amountPaid: isPaid ? inv.totalAmount : 0,
      paymentDate: isPaid ? new Date() : null,
    });
  };

  const [generatingPDF, setGeneratingPDF] = useState(false);

  const downloadPDF = async () => {
    if (!inv) return;
    setGeneratingPDF(true);
    try {
      const template = authUser?.invoiceTemplate || "classic";
      const bizName = authUser?.businessName || "TRACKEET";
      const bizAddr = authUser?.businessAddress || "gettrackeet.com";
      const doc = await generatePDF(inv, template, bizName, bizAddr);
      doc.save(`${inv.invoiceNumber || "invoice"}.pdf`);
    } catch (err) {
      toast.error("Failed to generate PDF");
      console.error(err);
    } finally {
      setGeneratingPDF(false);
    }
  };

  const handleMarkPaid = () => {
    const amount =
      payType === "full" ? inv?.balance || 0 : parseFloat(payAmount);
    if (!amount || amount <= 0) return toast.error("Enter a valid amount");
    if (payType === "partial" && amount >= inv?.balance) {
      return toast.error("Partial amount must be less than the balance");
    }
    markPaid({ amount, method: payMethod });
  };

  if (isLoading)
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    );
  if (!inv)
    return <p className="text-center text-dark-400 py-10">Invoice not found</p>;

  const amountPaid = inv.amountPaid || 0;
  const balance = inv.balance ?? inv.totalAmount - amountPaid;
  const isFullyPaid = inv.status === "paid";
  const isPartial = inv.status === "partial";

  return (
    <div className="space-y-4 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn btn-ghost p-2">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-dark dark:text-white">
            {inv.invoiceNumber}
          </h1>
          <p className="text-dark-400 text-sm">{fmt.date(inv.createdAt)}</p>
        </div>

        {/* REPLACE the old <span> with this */}
        <div className="ml-auto flex items-center gap-2">
          <span
            className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${
              inv.txStatus === "failed"
                ? "bg-danger-light text-danger"
                : inv.txStatus === "reversed"
                  ? "bg-purple-100 text-purple-600"
                  : inv.txStatus === "pending"
                    ? "bg-warning-light text-warning"
                    : inv.txStatus === "successful"
                      ? "bg-success-light text-success"
                      : STATUS_COLORS[inv.status] || STATUS_COLORS.draft
            }`}
          >
            {inv.txStatus === "failed"
              ? "❌ Failed"
              : inv.txStatus === "reversed"
                ? "↩️ Reversed"
                : inv.txStatus === "pending"
                  ? "⏳ Pending"
                  : inv.txStatus === "successful"
                    ? "✅ Successful"
                    : inv.status}
          </span>
        </div>
      </div>

      {/* Billing + payment summary */}
      <div className="card">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-xs text-dark-400 mb-1">Billed to</p>
            <p className="font-bold text-dark dark:text-white text-lg">
              {inv.customer?.name}
            </p>
            <p className="text-sm text-dark-400">{inv.customer?.phone}</p>
            {inv.customer?.email && (
              <p className="text-sm text-dark-400">{inv.customer?.email}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-3xl font-black text-primary">
              {fmt.naira(inv.totalAmount)}
            </p>
            <p className="text-sm font-semibold mt-1">
              <span className="text-dark-400">Paid: </span>
              <span className="text-success">{fmt.naira(amountPaid)}</span>
            </p>
            <p className="text-sm font-semibold">
              <span className="text-dark-400">Balance: </span>
              <span className={balance > 0 ? "text-danger" : "text-success"}>
                {fmt.naira(balance)}
              </span>
            </p>
          </div>
        </div>

        {/* Progress bar for partial */}
        {isPartial && inv.totalAmount > 0 && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-dark-400 mb-1">
              <span>Payment progress</span>
              <span>{Math.round((amountPaid / inv.totalAmount) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all"
                style={{
                  width: `${Math.min((amountPaid / inv.totalAmount) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Date + method grid */}
        <div className="grid grid-cols-2 gap-4 text-sm border-t border-dark-200 dark:border-gray-700 pt-4">
          {[
            {
              label: "Invoice Date",
              val: inv.invoiceDate ? fmt.date(inv.invoiceDate) : "—",
            },
            {
              label: "Due Date",
              val: inv.dueDate ? fmt.date(inv.dueDate) : "—",
            },
            {
              label: "Payment Date",
              val: inv.paymentDate ? fmt.date(inv.paymentDate) : "—",
            },
            {
              label: "Method",
              val: inv.paymentMethod
                ? inv.paymentMethod
                    .replace(/_/g, " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())
                : "—",
            },
          ].map((r, i) => (
            <div key={i}>
              <p className="text-dark-400 text-xs mb-0.5">{r.label}</p>
              <p className="font-medium text-dark dark:text-white capitalize">
                {r.val}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Items */}
      <div className="card">
        <h2 className="font-semibold text-dark dark:text-white mb-4">Items</h2>
        <div className="space-y-3">
          {inv.items?.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium text-dark dark:text-white">
                  {item.name}
                </p>
                <p className="text-dark-400 text-xs">
                  {item.quantity} × {fmt.naira(item.unitPrice)}
                </p>
                {item.description && (
                  <p className="text-dark-400 text-xs">{item.description}</p>
                )}
              </div>
              <p className="font-bold text-dark dark:text-white">
                {fmt.naira(item.total || item.quantity * item.unitPrice)}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-dark-200 dark:border-gray-700 mt-4 pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-dark-400">Subtotal</span>
            <span className="text-dark dark:text-white">
              {fmt.naira(inv.subtotal)}
            </span>
          </div>
          {inv.discountPercent > 0 && (
            <div className="flex justify-between">
              <span className="text-dark-400">
                Discount ({inv.discountPercent}%)
              </span>
              <span className="text-success">
                -{fmt.naira(inv.discountAmount)}
              </span>
            </div>
          )}
          <div className="flex justify-between font-bold text-base pt-2 border-t border-dark-200 dark:border-gray-700">
            <span className="text-dark dark:text-white">Total</span>
            <span className="text-primary">{fmt.naira(inv.totalAmount)}</span>
          </div>
          {amountPaid > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-dark-400">Amount Paid</span>
              <span className="font-semibold text-success">
                {fmt.naira(amountPaid)}
              </span>
            </div>
          )}
          {balance > 0 && (
            <div className="flex justify-between text-sm font-bold">
              <span className="text-dark-400">Balance Due</span>
              <span className="text-danger">{fmt.naira(balance)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {inv.notes && (
        <div className="card">
          <p className="text-xs text-dark-400 mb-1">Notes</p>
          <p className="text-sm text-dark dark:text-white">{inv.notes}</p>
        </div>
      )}

      {/* Product Photos */}
      {inv?.productPhotos?.length > 0 && (
        <div className="card">
          <h3 className="font-bold text-dark dark:text-white mb-3">
            Product Photos
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {inv.productPhotos.map((photo, i) => (
              <img
                key={i}
                src={photo}
                alt=""
                className="w-full aspect-square object-cover rounded-xl cursor-pointer"
                onClick={() => window.open(photo, "_blank")}
              />
            ))}
          </div>
        </div>
      )}

      {/* Delivery Section */}
      {inv?.delivery?.enabled && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center">
                <Truck size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-dark dark:text-white">
                  Delivery Status
                </h3>
                {inv.delivery.address && (
                  <p className="text-xs text-dark-400">
                    {inv.delivery.address}
                  </p>
                )}
                {inv.delivery.estimatedDate && (
                  <p className="text-xs text-dark-400">
                    Est:{" "}
                    {dayjs(inv.delivery.estimatedDate).format("D MMM YYYY")}
                  </p>
                )}
              </div>
            </div>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${
                inv.delivery.status === "delivered"
                  ? "bg-success-light text-success"
                  : inv.delivery.status === "shipped"
                    ? "bg-primary-light text-primary"
                    : "bg-warning-light text-warning"
              }`}
            >
              {inv.delivery.status}
            </span>
          </div>

          {/* Progress tracker */}
          <div className="flex items-center mb-4">
            {[
              { key: "pending", label: "Order Created", icon: Package },
              { key: "shipped", label: "Shipped", icon: Truck },
              { key: "delivered", label: "Delivered", icon: CheckCircle },
            ].map((step, i, arr) => {
              const statuses = ["pending", "shipped", "delivered"];
              const current = statuses.indexOf(inv.delivery.status);
              const stepIndex = statuses.indexOf(step.key);
              const done = stepIndex <= current;
              return (
                <div key={step.key} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        done
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-dark-400"
                      }`}
                    >
                      <step.icon size={16} />
                    </div>
                    <p
                      className={`text-[10px] mt-1 font-semibold text-center ${done ? "text-primary" : "text-dark-400"}`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {i < arr.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-1 mb-4 ${stepIndex < current ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Delivery photos */}
          {(inv.delivery.shippedPhoto || inv.delivery.deliveredPhoto) && (
            <div className="flex gap-2 mb-4">
              {inv.delivery.shippedPhoto && (
                <div className="flex-1">
                  <p className="text-xs text-dark-400 mb-1">📦 Shipped Photo</p>
                  <img
                    src={inv.delivery.shippedPhoto}
                    alt="Shipped"
                    className="w-full h-32 object-cover rounded-xl cursor-pointer"
                    onClick={() =>
                      window.open(inv.delivery.shippedPhoto, "_blank")
                    }
                  />
                  {inv.delivery.shippedNote && (
                    <p className="text-xs text-dark-400 mt-1">
                      {inv.delivery.shippedNote}
                    </p>
                  )}
                </div>
              )}
              {inv.delivery.deliveredPhoto && (
                <div className="flex-1">
                  <p className="text-xs text-dark-400 mb-1">
                    ✅ Delivered Photo
                  </p>
                  <img
                    src={inv.delivery.deliveredPhoto}
                    alt="Delivered"
                    className="w-full h-32 object-cover rounded-xl cursor-pointer"
                    onClick={() =>
                      window.open(inv.delivery.deliveredPhoto, "_blank")
                    }
                  />
                  {inv.delivery.deliveredNote && (
                    <p className="text-xs text-dark-400 mt-1">
                      {inv.delivery.deliveredNote}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Update button */}
          {inv.delivery.status !== "delivered" && (
            <button
              onClick={() => setShowDeliveryUpdate(true)}
              className="btn btn-primary w-full btn-sm"
            >
              <Truck size={14} /> Update Delivery Status
            </button>
          )}
        </div>
      )}

      {/* Delivery Update Modal */}
      {showDeliveryUpdate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700">
              <h3 className="font-bold text-dark dark:text-white">
                Update Delivery Status
              </h3>
              <button
                onClick={() => {
                  setShowDeliveryUpdate(false);
                  setDeliveryPhoto(null);
                  setDeliveryUpdateNote("");
                  setDeliveryStatus("");
                }}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">New Status *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      value: "shipped",
                      label: "🚚 Shipped",
                      desc: "Order is on the way",
                    },
                    {
                      value: "delivered",
                      label: "✅ Delivered",
                      desc: "Order arrived",
                    },
                  ]
                    .filter((s) => {
                      if (inv.delivery.status === "pending") return true;
                      if (inv.delivery.status === "shipped")
                        return s.value === "delivered";
                      return false;
                    })
                    .map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setDeliveryStatus(s.value)}
                        className={`py-3 px-3 rounded-xl text-left border-2 transition-all ${
                          deliveryStatus === s.value
                            ? "bg-primary-light border-primary/30 text-primary"
                            : "border-dark-200 dark:border-gray-600 text-dark-400"
                        }`}
                      >
                        <p className="text-sm font-semibold">{s.label}</p>
                        <p className="text-xs opacity-70 mt-0.5">{s.desc}</p>
                      </button>
                    ))}
                </div>
              </div>

              <div>
                <label className="label">
                  Note{" "}
                  <span className="text-dark-400 font-normal">(optional)</span>
                </label>
                <input
                  value={deliveryUpdateNote}
                  onChange={(e) => setDeliveryUpdateNote(e.target.value)}
                  placeholder="e.g. Left with security, Delivered to gate..."
                  className="input"
                />
              </div>

              <div>
                <label className="label">
                  Photo{" "}
                  <span className="text-dark-400 font-normal">(optional)</span>
                </label>
                <div
                  onClick={() =>
                    document.getElementById("delivery-photo").click()
                  }
                  className="border-2 border-dashed border-dark-200 dark:border-gray-600 rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  {deliveryPhoto ? (
                    <img
                      src={URL.createObjectURL(deliveryPhoto)}
                      alt=""
                      className="w-full h-32 object-cover rounded-xl"
                    />
                  ) : (
                    <>
                      <Camera
                        size={24}
                        className="text-dark-400 mx-auto mb-1"
                      />
                      <p className="text-xs text-dark-400">
                        Click to upload photo
                      </p>
                    </>
                  )}
                  <input
                    id="delivery-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setDeliveryPhoto(e.target.files[0])}
                  />
                </div>
              </div>

              <button
                onClick={async () => {
                  if (!deliveryStatus) return toast.error("Select a status");
                  if (updatingDelivery) return;
                  setUpdatingDelivery(true);
                  try {
                    const formData = new FormData();
                    formData.append("status", deliveryStatus);
                    if (deliveryUpdateNote)
                      formData.append(
                        deliveryStatus === "shipped"
                          ? "shippedNote"
                          : "deliveredNote",
                        deliveryUpdateNote,
                      );
                    if (deliveryPhoto) formData.append("photo", deliveryPhoto);
                    await invoiceAPI.updateDelivery(inv._id, formData);
                    toast.success(`Order marked as ${deliveryStatus}!`);
                    setShowDeliveryUpdate(false);
                    setDeliveryStatus("");
                    setDeliveryUpdateNote("");
                    setDeliveryPhoto(null);
                    qc.invalidateQueries(["invoice", id]);
                  } catch (err) {
                    toast.error(
                      err.response?.data?.message || "Failed to update",
                    );
                  } finally {
                    setUpdatingDelivery(false);
                  }
                }}
                disabled={!deliveryStatus || updatingDelivery}
                className="btn btn-primary w-full py-3"
              >
                {updatingDelivery ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Truck size={16} />
                )}
                {updatingDelivery ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Paid modal */}
      {showMarkPaid && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700">
              <h3 className="font-bold text-dark dark:text-white">
                Record Payment
              </h3>
              <button
                onClick={() => setShowMarkPaid(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-primary-light dark:bg-primary/10 rounded-xl">
                <div className="flex justify-between text-sm">
                  <span className="text-dark-500 dark:text-gray-400">
                    Invoice Total
                  </span>
                  <span className="font-bold text-dark dark:text-white">
                    {fmt.naira(inv.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-dark-500 dark:text-gray-400">
                    Already Paid
                  </span>
                  <span className="font-bold text-success">
                    {fmt.naira(amountPaid)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-dark-500 dark:text-gray-400">
                    Balance Remaining
                  </span>
                  <span className="font-bold text-danger">
                    {fmt.naira(balance)}
                  </span>
                </div>
              </div>

              <div>
                <label className="label">Payment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPayType("full")}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all
                      ${payType === "full" ? "bg-primary text-white border-primary" : "border-dark-200 dark:border-gray-600 text-dark-400"}`}
                  >
                    Full ({fmt.naira(balance)})
                  </button>
                  <button
                    onClick={() => setPayType("partial")}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all
                      ${payType === "partial" ? "bg-primary text-white border-primary" : "border-dark-200 dark:border-gray-600 text-dark-400"}`}
                  >
                    Partial Amount
                  </button>
                </div>
              </div>

              {payType === "partial" && (
                <div>
                  <label className="label">Amount Received (₦)</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="input"
                    placeholder={`Max: ${fmt.naira(balance - 1)}`}
                    min="1"
                    max={balance - 1}
                  />
                </div>
              )}

              <div>
                <label className="label">Payment Method</label>
                <CustomSelect
                  value={payMethod}
                  onChange={setPayMethod}
                  options={PAYMENT_METHODS}
                  placeholder="Select method"
                />
              </div>

              <button
                onClick={handleMarkPaid}
                disabled={paying}
                className="btn btn-primary w-full py-3"
              >
                {paying ? (
                  "Recording..."
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Record{" "}
                    {payType === "full"
                      ? fmt.naira(balance)
                      : fmt.naira(parseFloat(payAmount) || 0)}{" "}
                    Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Transaction modal — for quick records */}
      {showUpdateTx && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700">
              <h3 className="font-bold text-dark dark:text-white">
                Update Transaction
              </h3>
              <button
                onClick={() => setShowUpdateTx(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Current status */}
              <div className="p-3 bg-gray-50 dark:bg-dark rounded-xl">
                <p className="text-xs text-dark-400 mb-1">Current Status</p>
                <p className="text-sm font-semibold text-dark dark:text-white capitalize">
                  {inv.txStatus || inv.status}
                </p>
              </div>

              {/* New status options */}
              <div>
                <label className="label">Update to</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      value: "successful",
                      label: "✅ Successful",
                      desc: "Transaction confirmed",
                      color: "bg-success-light text-success border-success/30",
                    },
                    {
                      value: "failed",
                      label: "❌ Failed",
                      desc: "Transaction did not go through",
                      color: "bg-danger-light text-danger border-danger/30",
                    },
                    {
                      value: "reversed",
                      label: "↩️ Reversed",
                      desc: "Amount returned to customer",
                      color: "bg-purple-100 text-purple-600 border-purple-200",
                    },
                    {
                      value: "pending",
                      label: "⏳ Still Pending",
                      desc: "Still awaiting confirmation",
                      color: "bg-warning-light text-warning border-warning/30",
                    },
                  ].map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setNewTxStatus(s.value)}
                      className={`py-3 px-3 rounded-xl text-sm font-semibold border-2 transition-all text-left
                  ${newTxStatus === s.value ? s.color : "border-dark-200 dark:border-gray-600 text-dark-400"}`}
                    >
                      <p>{s.label}</p>
                      <p className="text-[10px] font-normal opacity-70 mt-0.5">
                        {s.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Info banners */}
              {newTxStatus === "successful" && (
                <div className="p-3 bg-success-light rounded-xl">
                  <p className="text-xs font-semibold text-success">
                    ✅ Marking as Successful
                  </p>
                  <p className="text-xs text-dark-500 mt-0.5">
                    Invoice will be marked as <strong>Paid</strong> and{" "}
                    {fmt.naira(inv.totalAmount)} will be recorded as received.
                  </p>
                </div>
              )}
              {(newTxStatus === "failed" || newTxStatus === "reversed") && (
                <div className="p-3 bg-danger-light rounded-xl">
                  <p className="text-xs font-semibold text-danger">
                    {newTxStatus === "failed"
                      ? "❌ Marking as Failed"
                      : "↩️ Marking as Reversed"}
                  </p>
                  <p className="text-xs text-dark-500 mt-0.5">
                    Invoice stays as pending. No payment will be counted.
                  </p>
                </div>
              )}

              <button
                onClick={handleUpdateTx}
                disabled={updating}
                className="btn btn-primary w-full py-3"
              >
                {updating ? "Updating..." : "Update Transaction"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="grid grid-cols-2 gap-3 pb-6 ">
        <button
          onClick={async () => {
            if (sendingWhatsApp) return;
            setSendingWhatsApp(true);
            try {
              await invoiceAPI.sendWhatsApp(id);
              toast.success("Sent via WhatsApp!");
            } catch {
              toast.error(
                "WhatsApp not connected. Go to WhatsApp page to connect first.",
              );
            } finally {
              setSendingWhatsApp(false);
            }
          }}
          disabled={sendingWhatsApp}
          className="whatsapp-btn disabled:opacity-70 "
        >
          {sendingWhatsApp ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
              className="w-5 h-5"
              alt="WA"
            />
          )}
          {sendingWhatsApp ? "Sending..." : "Send Receipt"}
        </button>

        <button
          onClick={downloadPDF}
          disabled={generatingPDF}
          className="btn btn-secondary  "
        >
          <Download size={16} />{" "}
          {generatingPDF ? "Generating..." : "Download PDF"}
        </button>

        {/* Quick record — Update Transaction */}
        {(inv.type === "quick" || inv.txStatus) && !isFullyPaid && (
          <button
            onClick={() => setShowUpdateTx(true)}
            className="btn btn-primary col-span-2"
          >
            <Zap size={16} /> Update Transaction
          </button>
        )}

        {/* Standard invoice — Mark as Paid */}
        {inv.type !== "quick" && !isFullyPaid && (
          <button
            onClick={() => setShowMarkPaid(true)}
            className="btn btn-success col-span-2"
          >
            <CheckCircle size={16} />
            {isPartial ? "Record Balance" : "Mark as Paid"}
          </button>
        )}

        {/* Refund — show for paid or partial invoices */}
        {(isFullyPaid || isPartial) && inv.status !== "refunded" && (
          <button
            onClick={() => setShowRefund(true)}
            className="col-span-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-danger hover:text-danger/70 transition-colors py-1"
          >
            <RefreshCw size={14} /> Refund Invoice
          </button>
        )}
      </div>

      {/* Refund Modal */}
      {showRefund && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700">
              <h3 className="font-bold text-dark dark:text-white">
                Refund Invoice
              </h3>
              <button
                onClick={() => setShowRefund(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-danger-light rounded-xl">
                <p className="text-xs font-semibold text-danger">
                  ⚠️ This will mark the invoice as refunded
                </p>
                <p className="text-xs text-dark-500 mt-0.5">
                  Amount: {fmt.naira(inv.totalAmount)} · Customer:{" "}
                  {inv.customer?.name}
                </p>
              </div>
              <div>
                <label className="label">Reason *</label>
                <textarea
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  rows={3}
                  placeholder="Why is this being refunded?"
                  className="input resize-none"
                />
              </div>
              <button
                onClick={() => {
                  if (!refundReason.trim())
                    return toast.error("Enter a refund reason");
                  refundInvoice({
                    status: "refunded",
                    refundReason,
                    refundedAt: new Date(),
                  });
                }}
                disabled={refunding}
                className="btn bg-danger text-white w-full py-3"
              >
                {refunding ? (
                  "Processing..."
                ) : (
                  <>
                    <RefreshCw size={16} /> Confirm Refund
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
