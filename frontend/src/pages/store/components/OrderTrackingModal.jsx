import { useState } from "react";
import {
  X,
  Search,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { trackingAPI } from "../../../services/api.js";
import dayjs from "dayjs";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

const STEPS = [
  {
    key: "created",
    label: "Order Created",
    icon: Package,
    color: "text-purple-600",
    bg: "bg-purple-100",
  },
  {
    key: "paid",
    label: "Payment Confirmed",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  {
    key: "shipped",
    label: "Shipped",
    icon: Truck,
    color: "text-blue-600",
    bg: "bg-blue-100",
  },
  {
    key: "delivered",
    label: "Delivered",
    icon: CheckCircle,
    color: "text-green-600",
    bg: "bg-green-100",
  },
];

export default function OrderTrackingModal({ open, onClose, storeName }) {
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTrack = async () => {
    if (!invoiceNumber.trim()) return setError("Enter your order number");
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await trackingAPI.track(invoiceNumber.trim());
      setOrder(res.data.order);
    } catch (err) {
      setError(err.response?.data?.message || "Order not found");
    } finally {
      setLoading(false);
    }
  };

  const getStepStatus = (step, order) => {
    if (!order) return "pending";
    const deliveryStatus = order.delivery?.status;

    switch (step) {
      case "created":
        return "done";
      case "paid":
        return ["paid", "partial"].includes(order.status) || deliveryStatus
          ? "done"
          : "pending";
      case "shipped":
        return ["shipped", "delivered"].includes(deliveryStatus)
          ? "done"
          : deliveryStatus === "pending" && order.delivery?.enabled
            ? "active"
            : "pending";
      case "delivered":
        return deliveryStatus === "delivered" ? "done" : "pending";
      default:
        return "pending";
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="font-black text-gray-800 text-lg">Track Order</h3>
            <p className="text-xs text-gray-400">Enter your invoice number</p>
          </div>
          <button
            onClick={() => {
              onClose();
              setOrder(null);
              setInvoiceNumber("");
              setError("");
            }}
            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Search input */}
          <div className="flex gap-2">
            <input
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleTrack()}
              placeholder="e.g. INV-2026-0001"
              className="flex-1 border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm font-mono font-bold outline-none focus:border-purple-400 transition-colors"
            />
            <button
              onClick={handleTrack}
              disabled={loading}
              className="bg-purple-600 text-white px-4 py-3 rounded-2xl font-bold hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Search size={16} />
              )}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-2xl">
              <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {/* Order result */}
          {order && (
            <div className="space-y-4">
              {/* Order info */}
              <div className="p-4 bg-gray-50 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">Order Number</p>
                  <p className="text-sm font-black text-gray-800 font-mono">
                    {order.invoiceNumber}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">Customer</p>
                  <p className="text-sm font-bold text-gray-800">
                    {order.customerName}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">Amount</p>
                  <p className="text-sm font-black text-purple-600">
                    {fmtN(order.totalAmount)}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {dayjs(order.createdAt).format("D MMM YYYY")}
                  </p>
                </div>
                {order.delivery?.address && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">Delivery Address</p>
                    <p className="text-sm font-semibold text-gray-800 text-right max-w-[60%]">
                      {order.delivery.address}
                    </p>
                  </div>
                )}
              </div>

              {/* Tracking steps */}
              {order.delivery?.enabled ? (
                <div className="space-y-3">
                  <p className="text-xs font-bold text-gray-500 uppercase">
                    Delivery Status
                  </p>
                  {STEPS.map((step, i) => {
                    const status = getStepStatus(step.key, order);
                    const isDone = status === "done";
                    const isActive = status === "active";
                    const Icon = step.icon;

                    return (
                      <div key={step.key} className="flex items-start gap-3">
                        {/* Line */}
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDone ? step.bg : isActive ? "bg-blue-100" : "bg-gray-100"}`}
                          >
                            <Icon
                              size={16}
                              className={
                                isDone
                                  ? step.color
                                  : isActive
                                    ? "text-blue-500"
                                    : "text-gray-300"
                              }
                            />
                          </div>
                          {i < STEPS.length - 1 && (
                            <div
                              className={`w-0.5 h-6 mt-1 ${isDone ? "bg-green-300" : "bg-gray-200"}`}
                            />
                          )}
                        </div>
                        <div className="flex-1 pt-1.5">
                          <p
                            className={`text-sm font-bold ${isDone ? "text-gray-800" : "text-gray-400"}`}
                          >
                            {step.label}
                          </p>
                          {step.key === "shipped" &&
                            order.delivery?.shippedAt && (
                              <p className="text-xs text-gray-400">
                                {dayjs(order.delivery.shippedAt).format(
                                  "D MMM YYYY h:mm A",
                                )}
                              </p>
                            )}
                          {step.key === "shipped" &&
                            order.delivery?.shippedNote && (
                              <p className="text-xs text-blue-600 font-semibold mt-0.5">
                                "{order.delivery.shippedNote}"
                              </p>
                            )}
                          {step.key === "delivered" &&
                            order.delivery?.deliveredAt && (
                              <p className="text-xs text-gray-400">
                                {dayjs(order.delivery.deliveredAt).format(
                                  "D MMM YYYY h:mm A",
                                )}
                              </p>
                            )}
                          {step.key === "delivered" &&
                            order.delivery?.deliveredNote && (
                              <p className="text-xs text-green-600 font-semibold mt-0.5">
                                "{order.delivery.deliveredNote}"
                              </p>
                            )}
                          {step.key === "shipped" &&
                            order.delivery?.estimatedDate &&
                            !order.delivery?.deliveredAt && (
                              <p className="text-xs text-orange-500 font-semibold mt-0.5">
                                Est. delivery:{" "}
                                {dayjs(order.delivery.estimatedDate).format(
                                  "D MMM YYYY",
                                )}
                              </p>
                            )}
                          {step.key === "created" && (
                            <p className="text-xs text-gray-400">
                              {dayjs(order.createdAt).format(
                                "D MMM YYYY h:mm A",
                              )}
                            </p>
                          )}
                        </div>
                        {isDone && (
                          <CheckCircle
                            size={16}
                            className="text-green-500 flex-shrink-0 mt-1.5"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-blue-50 rounded-2xl flex items-center gap-3">
                  <Package size={20} className="text-blue-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-blue-800">
                      Order Received
                    </p>
                    <p className="text-xs text-blue-600">
                      Your order has been received and is being processed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
