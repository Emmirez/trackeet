import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Truck,
  Package,
  CheckCircle,
  MapPin,
  Phone,
  Clock,
  Camera,
  X,
} from "lucide-react";
import { invoiceAPI } from "../../services/api.js";
import { fmt } from "../../utils/helpers.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import toast from "react-hot-toast";

dayjs.extend(relativeTime);

const STATUS_TABS = [
  { key: "", label: "All", icon: Package },
  { key: "pending", label: "Pending", icon: Clock },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

const STATUS_CONFIG = {
  pending: { color: "bg-warning-light text-warning", label: "⏳ Pending" },
  shipped: { color: "bg-primary-light text-primary", label: "🚚 Shipped" },
  delivered: { color: "bg-success-light text-success", label: "✅ Delivered" },
};

export default function DeliveriesPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [updateModal, setUpdateModal] = useState(null);
  const [deliveryStatus, setDeliveryStatus] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState(null);
  const [updating, setUpdating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["deliveries", status],
    queryFn: () => invoiceAPI.getDeliveries({ status }).then((r) => r.data),
  });

  const invoices = data?.invoices || [];

  const counts = {
    pending: invoices.filter((i) => i.delivery?.status === "pending").length,
    shipped: invoices.filter((i) => i.delivery?.status === "shipped").length,
    delivered: invoices.filter((i) => i.delivery?.status === "delivered")
      .length,
  };

  const handleUpdate = async () => {
    if (!deliveryStatus) return toast.error("Select a status");
    if (updating) return;
    setUpdating(true);
    try {
      const formData = new FormData();
      formData.append("status", deliveryStatus);
      if (note)
        formData.append(
          deliveryStatus === "shipped" ? "shippedNote" : "deliveredNote",
          note,
        );
      if (photo) formData.append("photo", photo);
      await invoiceAPI.updateDelivery(updateModal._id, formData);
      toast.success(`Order marked as ${deliveryStatus}!`);
      qc.invalidateQueries(["deliveries"]);
      qc.invalidateQueries(["invoice", updateModal._id]);
      setUpdateModal(null);
      setDeliveryStatus("");
      setNote("");
      setPhoto(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title"></h1>
        <p className="text-sm text-dark-600">
          Track and update all order deliveries
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Pending",
            value: counts.pending,
            color: "text-warning",
            bg: "bg-warning-light",
          },
          {
            label: "Shipped",
            value: counts.shipped,
            color: "text-primary",
            bg: "bg-primary-light",
          },
          {
            label: "Delivered",
            value: counts.delivered,
            color: "text-success",
            bg: "bg-success-light",
          },
        ].map((s, i) => (
          <div key={i} className="card text-center py-3">
            <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-dark-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatus(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all ${
              status === tab.key
                ? "bg-primary text-white"
                : "btn-ghost border border-dark-200 dark:border-gray-700"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
            {tab.key && counts[tab.key] > 0 && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                  status === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-primary-light text-primary"
                }`}
              >
                {counts[tab.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Deliveries list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton h-32 rounded-2xl" />
          ))}
        </div>
      ) : invoices.length === 0 ? (
        <div className="card empty-state py-16">
          <Truck size={40} className="text-dark-200" />
          <p className="font-semibold text-dark dark:text-white">
            No deliveries found
          </p>
          <p className="text-dark-400 text-sm">
            {status
              ? `No ${status} deliveries`
              : "Enable delivery on invoices to track them here"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <div key={inv._id} className="card space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-dark dark:text-white">
                    {inv.invoiceNumber}
                  </p>
                  <p className="text-xs text-dark-400">
                    {dayjs(inv.createdAt).fromNow()}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_CONFIG[inv.delivery?.status]?.color}`}
                >
                  {STATUS_CONFIG[inv.delivery?.status]?.label}
                </span>
              </div>

              {/* Customer */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark rounded-xl">
                <div className="w-9 h-9 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-black text-sm">
                    {inv.customer?.name?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-dark dark:text-white truncate">
                    {inv.customer?.name}
                  </p>
                  <p className="text-xs text-dark-400">{inv.customer?.phone}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-black text-primary">
                    {fmt.naira(inv.totalAmount)}
                  </p>
                  <p
                    className={`text-xs font-semibold capitalize ${inv.status === "paid" ? "text-success" : "text-warning"}`}
                  >
                    {inv.status}
                  </p>
                </div>
              </div>

              {/* Delivery details */}
              <div className="space-y-1.5">
                {inv.delivery?.address && (
                  <div className="flex items-start gap-2 text-xs text-dark-400">
                    <MapPin
                      size={12}
                      className="flex-shrink-0 mt-0.5 text-primary"
                    />
                    <span>{inv.delivery.address}</span>
                  </div>
                )}
                {inv.delivery?.estimatedDate && (
                  <div className="flex items-center gap-2 text-xs text-dark-400">
                    <Clock size={12} className="flex-shrink-0 text-warning" />
                    <span>
                      Est.{" "}
                      {dayjs(inv.delivery.estimatedDate).format("D MMM YYYY")}
                    </span>
                  </div>
                )}
                {inv.delivery?.shippedAt && (
                  <div className="flex items-center gap-2 text-xs text-dark-400">
                    <Truck size={12} className="flex-shrink-0 text-primary" />
                    <span>
                      Shipped{" "}
                      {dayjs(inv.delivery.shippedAt).format(
                        "D MMM YYYY h:mm A",
                      )}
                    </span>
                  </div>
                )}
                {inv.delivery?.deliveredAt && (
                  <div className="flex items-center gap-2 text-xs text-dark-400">
                    <CheckCircle
                      size={12}
                      className="flex-shrink-0 text-success"
                    />
                    <span>
                      Delivered{" "}
                      {dayjs(inv.delivery.deliveredAt).format(
                        "D MMM YYYY h:mm A",
                      )}
                    </span>
                  </div>
                )}
                {inv.delivery?.shippedNote && (
                  <p className="text-xs text-primary italic">
                    "{inv.delivery.shippedNote}"
                  </p>
                )}
                {inv.delivery?.deliveredNote && (
                  <p className="text-xs text-success italic">
                    "{inv.delivery.deliveredNote}"
                  </p>
                )}
              </div>

              {/* Progress bar */}
              <div className="flex items-center gap-2">
                {["pending", "shipped", "delivered"].map((s, i, arr) => {
                  const current = arr.indexOf(inv.delivery?.status);
                  const stepIndex = i;
                  const done = stepIndex <= current;
                  return (
                    <div key={s} className="flex items-center flex-1">
                      <div
                        className={`h-2 flex-1 rounded-full ${done ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"}`}
                      />
                      {i < arr.length - 1 && <div className="w-1" />}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-dark-400 -mt-2">
                <span>Created</span>
                <span>Shipped</span>
                <span>Delivered</span>
              </div>

              {/* Action button */}
              {inv.delivery?.status !== "delivered" && (
                <button
                  onClick={() => {
                    setUpdateModal(inv);
                    setDeliveryStatus("");
                    setNote("");
                    setPhoto(null);
                  }}
                  className="btn btn-primary w-full btn-sm"
                >
                  <Truck size={14} />
                  {inv.delivery?.status === "pending"
                    ? "Mark as Shipped"
                    : "Mark as Delivered"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Update modal */}
      {updateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700">
              <div>
                <h3 className="font-bold text-dark dark:text-white">
                  Update Delivery
                </h3>
                <p className="text-xs text-dark-400">
                  {updateModal.invoiceNumber} · {updateModal.customer?.name}
                </p>
              </div>
              <button
                onClick={() => setUpdateModal(null)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              {/* Status options */}
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
                      if (updateModal.delivery?.status === "pending")
                        return true;
                      if (updateModal.delivery?.status === "shipped")
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

              {/* Note */}
              <div>
                <label className="label">
                  Note{" "}
                  <span className="text-dark-400 font-normal">(optional)</span>
                </label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Left with security, Delivered to gate..."
                  className="input"
                />
              </div>

              {/* Photo */}
              <div>
                <label className="label">
                  Photo{" "}
                  <span className="text-dark-400 font-normal">(optional)</span>
                </label>
                <div
                  onClick={() => document.getElementById("del-photo").click()}
                  className="border-2 border-dashed border-dark-200 dark:border-gray-600 rounded-xl p-4 text-center cursor-pointer hover:border-primary transition-colors"
                >
                  {photo ? (
                    <img
                      src={URL.createObjectURL(photo)}
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
                    id="del-photo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setPhoto(e.target.files[0])}
                  />
                </div>
              </div>

              <button
                onClick={handleUpdate}
                disabled={!deliveryStatus || updating}
                className="btn btn-primary w-full py-3"
              >
                {updating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Truck size={16} />
                )}
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
