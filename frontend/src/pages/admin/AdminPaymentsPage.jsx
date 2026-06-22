import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CreditCard,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  AlertCircle,
  ChevronDown,
  Check,
} from "lucide-react";
import { adminAPI } from "../../services/api.js";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";

const fmt = (n) => "₦" + (n || 0).toLocaleString("en-NG");

const STATUS_BADGE = {
  active: "badge-paid",
  pending: "badge-pending",
  expired: "badge-overdue",
  cancelled: "badge-draft",
};

const PLAN_BADGE = {
  starter: "bg-primary-light text-primary badge",
  business: "badge-paid",
  enterprise: "bg-purple-100 text-purple-700 badge",
};

function CustomSelect({ value, onChange, options, placeholder }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 4,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setOpen((prev) => !prev);
  };

  const selected = options.find((o) => o.value === value);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-left flex items-center justify-between transition-all bg-white dark:bg-surface dark:text-gray-100
          ${open ? "border-primary ring-2 ring-primary/20" : "border-dark-200 dark:border-gray-600"}`}
      >
        <span className="font-medium text-dark dark:text-white">
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          size={15}
          className={`text-dark-400 transition-transform flex-shrink-0 ml-2 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <div
              className="fixed z-50 bg-white dark:bg-surface border border-dark-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden"
              style={{ top: pos.top, left: pos.left, width: pos.width }}
            >
              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-all hover:bg-primary-light dark:hover:bg-primary/10 hover:text-primary
                  ${value === opt.value ? "bg-primary-light dark:bg-primary/10 text-primary font-semibold" : "text-dark dark:text-gray-300"}`}
                >
                  <span>{opt.label}</span>
                  {value === opt.value && (
                    <Check size={14} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}

export default function AdminPaymentsPage() {
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-payments", status, plan, page],
    queryFn: () =>
      adminAPI
        .getPayments({ status, plan, page, limit: 20 })
        .then((r) => r.data),
  });

  const { mutate: verify } = useMutation({
    mutationFn: (id) => adminAPI.verifyPayment(id),
    onSuccess: () => {
      toast.success("Payment verified! User plan upgraded.");
      qc.invalidateQueries(["admin-payments"]);
      qc.invalidateQueries(["admin-subs"]);
    },
    onError: () => toast.error("Failed to verify payment"),
  });

  const { mutate: reject } = useMutation({
    mutationFn: ({ id, reason }) => adminAPI.rejectPayment(id, { reason }),
    onSuccess: () => {
      toast.success("Payment rejected. User notified.");
      qc.invalidateQueries(["admin-payments"]);
      setRejectModal(null);
      setRejectReason("");
    },
    onError: () => toast.error("Failed to reject payment"),
  });

  const payments = data?.payments || [];
  const total = data?.total || 0;
  const totalPages = Math.ceil(total / 20);

  const filtered = search
    ? payments.filter(
        (p) =>
          p.user?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
          p.user?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
          p.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
          p.paystackRef?.toLowerCase().includes(search.toLowerCase()),
      )
    : payments;

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="page-title">Payments</h1>
        <p className="text-sm text-dark-400">
          Manage subscriptions and verify bank transfers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Total Revenue",
            value: fmt(data?.totalRevenue || 0),
            icon: TrendingUp,
            color: "text-success",
            bg: "bg-success-light",
          },
          {
            label: "This Month",
            value: fmt(data?.thisMonth || 0),
            icon: CreditCard,
            color: "text-primary",
            bg: "bg-primary-light",
          },
          {
            label: "Pending Verification",
            value: data?.pendingVerification || 0,
            icon: Clock,
            color: "text-warning",
            bg: "bg-warning-light",
          },
          {
            label: "Total Payments",
            value: total,
            icon: CheckCircle,
            color: "text-dark-400",
            bg: "bg-gray-100",
          },
        ].map((s, i) => (
          <div key={i} className="card text-center py-4">
            <div
              className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}
            >
              <s.icon size={16} className={s.color} />
            </div>
            <p className={`text-lg font-black ${s.color}`}>
              {isLoading ? "—" : s.value}
            </p>
            <p className="text-xs text-dark-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending transfers alert */}
      {data?.pendingVerification > 0 && (
        <div className="card bg-warning-light border border-warning/20 flex items-center gap-3">
          <AlertCircle size={20} className="text-warning flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-bold text-warning">
              {data.pendingVerification} bank transfer
              {data.pendingVerification > 1 ? "s" : ""} awaiting verification
            </p>
            <p className="text-xs text-dark-500">
              Filter by "Pending" to see transfers that need manual verification
            </p>
          </div>
          <button
            onClick={() => setStatus("pending")}
            className="btn btn-sm bg-warning text-white hover:bg-warning/90"
          >
            View
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or reference..."
            className="input pl-10"
          />
        </div>
        <div className="w-40">
          <CustomSelect
            value={status}
            onChange={(v) => {
              setStatus(v);
              setPage(1);
            }}
            placeholder="All Status"
            options={[
              { value: "", label: "All Status" },
              { value: "pending", label: "Pending" },
              { value: "active", label: "Active" },
              { value: "expired", label: "Expired" },
              { value: "cancelled", label: "Cancelled" },
            ]}
          />
        </div>
        <div className="w-40">
          <CustomSelect
            value={plan}
            onChange={(v) => {
              setPlan(v);
              setPage(1);
            }}
            placeholder="All Plans"
            options={[
              { value: "", label: "All Plans" },
              { value: "starter", label: "Starter" },
              { value: "business", label: "Business" },
              { value: "enterprise", label: "Enterprise" },
            ]}
          />
        </div>
      </div>

      {/* Payments table */}
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-white/5 border-b border-dark-200 dark:border-gray-700">
              <tr>
                <th className="th">User</th>
                <th className="th">Plan</th>
                <th className="th">Amount</th>
                <th className="th">Method</th>
                <th className="th">Status</th>
                <th className="th">Date</th>
                <th className="th">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="td text-center py-10">
                    <div className="flex justify-center">
                      <div className="skeleton h-8 w-48 rounded-xl" />
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="td text-center text-dark-400 py-10"
                  >
                    No payments found
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p._id} className="tr">
                    <td className="td">
                      <div className="flex items-center gap-2">
                        <div className="avatar bg-primary-light text-primary text-xs w-8 h-8 flex-shrink-0">
                          {p.user?.firstName?.[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-dark dark:text-white truncate">
                            {p.user?.firstName} {p.user?.lastName}
                          </p>
                          <p className="text-xs text-dark-400 truncate">
                            {p.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="td">
                      <span className={PLAN_BADGE[p.plan] || "badge-draft"}>
                        {p.plan} {p.annual ? "· Annual" : "· Monthly"}
                      </span>
                    </td>
                    <td className="td font-bold text-dark dark:text-white">
                      {fmt(p.amount)}
                    </td>
                    <td className="td">
                      <span
                        className={`text-xs font-semibold capitalize px-2 py-0.5 rounded-full ${
                          p.paymentMethod === "paystack"
                            ? "bg-[#e0f7fa] text-[#00C3F7]"
                            : p.paymentMethod === "bank_transfer"
                              ? "bg-primary-light text-primary"
                              : "bg-gray-100 text-dark-400"
                        }`}
                      >
                        {p.paymentMethod === "bank_transfer"
                          ? "Bank Transfer"
                          : p.paymentMethod}
                      </span>
                      {p.paystackRef && (
                        <p className="text-[10px] text-dark-400 mt-0.5 truncate max-w-24">
                          {p.paystackRef}
                        </p>
                      )}
                    </td>
                    <td className="td">
                      <div className="flex flex-col gap-1">
                        <span
                          className={STATUS_BADGE[p.status] || "badge-draft"}
                        >
                          {p.status}
                        </span>
                        {p.paymentMethod === "bank_transfer" &&
                          !p.paymentVerified &&
                          p.status === "pending" && (
                            <span className="text-[10px] font-bold text-warning">
                              ⏳ Needs verification
                            </span>
                          )}
                        {p.paymentVerified && (
                          <span className="text-[10px] font-bold text-success">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="td text-dark-400 text-xs">
                      {dayjs(p.createdAt).format("D MMM YYYY")}
                      <p className="text-[10px]">
                        {dayjs(p.createdAt).format("h:mm A")}
                      </p>
                    </td>
                    <td className="td">
                      {p.paymentMethod === "bank_transfer" &&
                        !p.paymentVerified &&
                        p.status === "pending" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() => verify(p._id)}
                              title="Verify payment"
                              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-success-light text-success text-xs font-bold hover:bg-success hover:text-white transition-all"
                            >
                              <CheckCircle size={12} /> Verify
                            </button>
                            <button
                              onClick={() => setRejectModal(p)}
                              title="Reject payment"
                              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-danger-light text-danger text-xs font-bold hover:bg-danger hover:text-white transition-all"
                            >
                              <XCircle size={12} /> Reject
                            </button>
                          </div>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary btn-sm"
          >
            Previous
          </button>
          <span className="text-sm text-dark-400">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-secondary btn-sm"
          >
            Next
          </button>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="modal-overlay" onClick={() => setRejectModal(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-dark-100 dark:border-gray-700">
              <h3 className="font-bold text-dark dark:text-white">
                Reject Payment
              </h3>
              <p className="text-xs text-dark-400 mt-1">
                Rejecting payment from {rejectModal.user?.firstName}{" "}
                {rejectModal.user?.lastName} — {fmt(rejectModal.amount)}
              </p>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="label">
                  Reason{" "}
                  <span className="text-dark-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Payment proof not received, wrong amount..."
                  rows={3}
                  className="input resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setRejectModal(null)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    reject({ id: rejectModal._id, reason: rejectReason })
                  }
                  className="btn bg-danger text-white hover:bg-danger/90 flex-1"
                >
                  <XCircle size={14} /> Reject Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
