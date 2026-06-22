import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CreditCard, TrendingUp, ChevronDown, Check } from "lucide-react";
import { createPortal } from "react-dom";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { adminAPI } from "../../services/api.js";
import useAuthStore from "../../store/authStore.js";

const fmt = (n) => "₦" + (n || 0).toLocaleString("en-NG");
const BADGE = {
  business: "badge-paid",
  enterprise: "bg-purple-100 text-purple-800 badge",
  starter: "bg-primary-light text-primary badge",
  free: "badge-draft",
};
const STATUS_BADGE = {
  active: "badge-paid",
  expired: "badge-overdue",
  cancelled: "badge-draft",
  pending: "badge-pending",
};

const PLANS = [
  { value: "free", label: "Free" },
  { value: "starter", label: "Starter" },
  { value: "business", label: "Business" },
  { value: "enterprise", label: "Enterprise" },
];

function PlanSelect({ currentPlan, onChangePlan }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
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
      const dropdownW = 140;
      const viewportW = window.innerWidth;
      let left = rect.left + window.scrollX;
      if (left + dropdownW > viewportW - 8) left = viewportW - dropdownW - 8;
      setPos({ top: rect.bottom + window.scrollY + 4, left });
    }
    setOpen((prev) => !prev);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        className="flex items-center gap-1 text-xs font-semibold text-primary hover:bg-primary-light px-2 py-1 rounded-lg transition-all"
      >
        Upgrade{" "}
        <ChevronDown
          size={11}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
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
              className="fixed z-50 w-36 bg-white dark:bg-surface border border-dark-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden"
              style={{ top: pos.top, left: pos.left, zIndex: 9999 }}
            >
              <div className="px-3 py-2 border-b border-dark-100 dark:border-gray-700">
                <p className="text-[10px] font-bold text-dark-400 uppercase">
                  Set Plan
                </p>
              </div>
              {PLANS.map((plan) => (
                <button
                  key={plan.value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChangePlan(plan.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-primary-light dark:hover:bg-primary/10 hover:text-primary transition-all
                  ${currentPlan === plan.value ? "font-bold text-primary bg-primary-light dark:bg-primary/10" : "text-dark dark:text-gray-300"}`}
                >
                  <span>{plan.label}</span>
                  {currentPlan === plan.value && (
                    <Check size={12} className="text-primary" />
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

export default function AdminSubscriptions() {
  const { user: authUser } = useAuthStore();
  const isSuperAdmin = authUser?.role === "superadmin";
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-subs"],
    queryFn: () => adminAPI.getSubs().then((r) => r.data),
  });

  const { mutate: upgradePlan } = useMutation({
    mutationFn: ({ userId, plan }) => adminAPI.updateUser(userId, { plan }),
    onSuccess: () => {
      toast.success("Plan updated!");
      qc.invalidateQueries(["admin-subs"]);
      qc.invalidateQueries(["admin-users"]);
    },
    onError: () => toast.error("Failed to update plan"),
  });

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="page-title">Subscriptions</h1>
        <p className="text-xs text-gray-400">
          Manage all user subscriptions and billing
        </p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Monthly Revenue",
            value: fmt(data?.mrr || 0),
            icon: TrendingUp,
            color: "bg-success-light text-success",
          },
          {
            label: "Active Subs",
            value: data?.active || 0,
            icon: CreditCard,
            color: "bg-primary-light text-primary",
          },
          {
            label: "Churned",
            value: data?.churned || 0,
            icon: CreditCard,
            color: "bg-danger-light text-danger",
          },
        ].map((s) => (
          <div key={s.label} className="card text-center">
            <div
              className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}
            >
              <s.icon size={16} />
            </div>
            <p className="text-lg font-bold dark:text-white">
              {isLoading ? "—" : s.value}
            </p>
            <p className="text-xs text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>
      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-white/[0.02] border-b border-gray-100 dark:border-white/5">
              <tr>
                <th className="th">User</th>
                <th className="th">Business</th>
                <th className="th">Category</th>
                <th className="th">Plan</th>
                <th className="th">Status</th>
                <th className="th">Joined</th>
                {isSuperAdmin && <th className="th">Change Plan</th>}
              </tr>
            </thead>
            <tbody>
              {(data?.users || []).map((u) => (
                <tr key={u._id} className="tr">
                  <td className="td">
                    <div className="flex items-center gap-2">
                      <div className="avatar bg-primary-light text-primary text-xs w-8 h-8">
                        {u.firstName?.[0]}
                      </div>
                      <div>
                        <p className="text-sm font-semibold dark:text-white">
                          {u.firstName} {u.lastName}
                        </p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="td text-sm text-dark dark:text-white">
                    {u.businessName || "—"}
                  </td>
                  <td className="td">
                    <span className="badge-draft capitalize">
                      {u.businessCategory || "general"}
                    </span>
                  </td>
                  <td className="td">
                    <span className={BADGE[u.plan] || "badge-draft"}>
                      {u.plan || "free"}
                    </span>
                  </td>
                  <td className="td">
                    <span
                      className={
                        u.status === "suspended"
                          ? "badge-overdue"
                          : "badge-paid"
                      }
                    >
                      {u.status || "active"}
                    </span>
                  </td>
                  <td className="td text-gray-400">
                    {dayjs(u.createdAt).format("D MMM YY")}
                  </td>
                  {isSuperAdmin && (
                    <td className="td">
                      <PlanSelect
                        currentPlan={u.plan || "free"}
                        onChangePlan={(plan) =>
                          upgradePlan({ userId: u._id, plan })
                        }
                      />
                    </td>
                  )}
                </tr>
              ))}
              {(data?.users || []).length === 0 && (
                <tr>
                  <td colSpan={7} className="td text-center text-gray-400 py-8">
                    No users yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
