import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Edit,
  Tag,
  ToggleLeft,
  ToggleRight,
  Copy,
  Check,
  X,
  Percent,
  DollarSign,
} from "lucide-react";
import { adminAPI } from "../../services/api.js";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const fmt = (n) => "₦" + (n || 0).toLocaleString("en-NG");

const PLANS = ["all", "starter", "business", "enterprise"];

export default function AdminPromoCodesPage() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [copied, setCopied] = useState(null);

  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("percent");
  const [discountValue, setDiscountValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [applicablePlans, setApplicablePlans] = useState(["all"]);
  const [expiresAt, setExpiresAt] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-promo-codes"],
    queryFn: () => adminAPI.getPromoCodes().then((r) => r.data),
  });

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: (d) => adminAPI.createPromoCode(d),
    onSuccess: () => {
      toast.success("Promo code created!");
      qc.invalidateQueries(["admin-promo-codes"]);
      resetForm();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: ({ id, data }) => adminAPI.updatePromoCode(id, data),
    onSuccess: () => {
      toast.success("Promo code updated!");
      qc.invalidateQueries(["admin-promo-codes"]);
      resetForm();
    },
    onError: () => toast.error("Failed to update"),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id) => adminAPI.deletePromoCode(id),
    onSuccess: () => {
      toast.success("Promo code deleted");
      qc.invalidateQueries(["admin-promo-codes"]);
    },
  });

  const { mutate: toggle } = useMutation({
    mutationFn: ({ id, isActive }) =>
      adminAPI.updatePromoCode(id, { isActive }),
    onSuccess: () => qc.invalidateQueries(["admin-promo-codes"]),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditing(null);
    setCode("");
    setDescription("");
    setDiscountType("percent");
    setDiscountValue("");
    setMaxUses("");
    setMinAmount("");
    setApplicablePlans(["all"]);
    setExpiresAt("");
  };

  const handleEdit = (p) => {
    setEditing(p);
    setCode(p.code);
    setDescription(p.description || "");
    setDiscountType(p.discountType);
    setDiscountValue(String(p.discountValue));
    setMaxUses(p.maxUses ? String(p.maxUses) : "");
    setMinAmount(p.minAmount ? String(p.minAmount) : "");
    setApplicablePlans(p.applicablePlans || ["all"]);
    setExpiresAt(p.expiresAt ? dayjs(p.expiresAt).format("YYYY-MM-DD") : "");
    setShowForm(true);
  };

  const handleSubmit = () => {
    if (!code.trim()) return toast.error("Code is required");
    if (!discountValue || parseFloat(discountValue) <= 0)
      return toast.error("Valid discount value is required");

    const payload = {
      code,
      description,
      discountType,
      discountValue: parseFloat(discountValue),
      maxUses: maxUses ? parseInt(maxUses) : null,
      minAmount: minAmount ? parseFloat(minAmount) : 0,
      applicablePlans,
      expiresAt: expiresAt || null,
    };

    if (editing) {
      update({ id: editing._id, data: payload });
    } else {
      create(payload);
    }
  };

  const copyCode = (c) => {
    navigator.clipboard.writeText(c);
    setCopied(c);
    toast.success("Copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const togglePlan = (plan) => {
    if (plan === "all") {
      setApplicablePlans(["all"]);
      return;
    }
    setApplicablePlans((prev) => {
      const without = prev.filter((p) => p !== "all");
      if (without.includes(plan)) {
        const next = without.filter((p) => p !== plan);
        return next.length === 0 ? ["all"] : next;
      }
      return [...without, plan];
    });
  };

  const codes = data?.codes || [];

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const random = Array.from(
      { length: 8 },
      () => chars[Math.floor(Math.random() * chars.length)],
    ).join("");
    setCode(`TRK${random}`);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="section-header">
        <div>
          <h1 className="page-title"></h1>
          <p className="text-sm text-dark-600">
            Create discount codes for subscription plans
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn btn-primary"
        >
          <Plus size={16} /> Create
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total Codes", value: codes.length },
          { label: "Active", value: codes.filter((c) => c.isActive).length },
          {
            label: "Total Uses",
            value: codes.reduce((s, c) => s + c.usedCount, 0),
          },
        ].map((s, i) => (
          <div key={i} className="card text-center py-3">
            <p className="text-xl font-black text-primary">{s.value}</p>
            <p className="text-xs text-dark-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Form */}
      {showForm && (
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-dark dark:text-white">
              {editing ? "Edit Promo Code" : "Create Promo Code"}
            </h2>
            <button onClick={resetForm} className="btn btn-ghost p-1.5">
              <X size={16} />
            </button>
          </div>

          {/* Code */}
          <div>
            <label className="label">Code *</label>
            <div className="flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. LAUNCH50"
                className="input flex-1 font-mono font-bold tracking-widest"
              />
              <button
                onClick={generateCode}
                className="btn btn-secondary px-3 text-xs"
              >
                Generate
              </button>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">
              Description{" "}
              <span className="text-dark-400 font-normal">(optional)</span>
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Launch discount for early users"
              className="input"
            />
          </div>

          {/* Discount type + value */}
          <div>
            <label className="label">Discount *</label>
            <div className="flex gap-3">
              <div className="flex gap-2">
                {[
                  { value: "percent", label: "% Percent", icon: Percent },
                  { value: "fixed", label: "₦ Fixed", icon: DollarSign },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setDiscountType(t.value)}
                    className={`px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all flex items-center gap-1.5 ${
                      discountType === t.value
                        ? "border-primary bg-primary-light text-primary"
                        : "border-dark-200 dark:border-gray-700 text-dark-400"
                    }`}
                  >
                    <t.icon size={14} />
                    {t.label}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(e.target.value)}
                placeholder={
                  discountType === "percent" ? "e.g. 20" : "e.g. 1000"
                }
                className="input flex-1"
              />
            </div>
            {discountValue && (
              <p className="text-xs text-primary mt-1 font-semibold">
                {discountType === "percent"
                  ? `${discountValue}% off`
                  : `₦${parseFloat(discountValue || 0).toLocaleString()} off`}
              </p>
            )}
          </div>

          {/* Applicable plans */}
          <div>
            <label className="label">Applicable Plans</label>
            <div className="flex gap-2 flex-wrap">
              {PLANS.map((p) => (
                <button
                  key={p}
                  onClick={() => togglePlan(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all capitalize ${
                    applicablePlans.includes(p)
                      ? "bg-primary text-white border-primary"
                      : "bg-white dark:bg-surface text-dark-400 border-dark-200 dark:border-gray-700"
                  }`}
                >
                  {p === "all" ? "All Plans" : p}
                </button>
              ))}
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">
                Max Uses{" "}
                <span className="text-dark-400 font-normal">(optional)</span>
              </label>
              <input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
                className="input"
              />
            </div>
            <div>
              <label className="label">
                Min Amount (₦){" "}
                <span className="text-dark-400 font-normal">(optional)</span>
              </label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="No minimum"
                className="input"
              />
            </div>
          </div>

          {/* Expiry */}
          <div>
            <label className="label">
              Expiry Date{" "}
              <span className="text-dark-400 font-normal">(optional)</span>
            </label>
            <input
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              min={dayjs().format("YYYY-MM-DD")}
              className="input"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={resetForm} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={creating || updating}
              className="btn btn-primary flex-1"
            >
              {creating || updating
                ? "Saving..."
                : editing
                  ? "Update Code"
                  : "Create Code"}
            </button>
          </div>
        </div>
      )}

      {/* Codes list */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : codes.length === 0 ? (
          <div className="empty-state py-16">
            <Tag size={40} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No promo codes yet
            </p>
            <p className="text-dark-400 text-sm">
              Create your first discount code
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {codes.map((c) => {
              const isExpired =
                c.expiresAt && new Date(c.expiresAt) < new Date();
              const isMaxed = c.maxUses && c.usedCount >= c.maxUses;

              return (
                <div key={c._id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                      <Tag size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => copyCode(c.code)}
                          className="flex items-center gap-1.5 font-mono font-black text-dark dark:text-white text-lg hover:text-primary transition-colors"
                        >
                          {c.code}
                          {copied === c.code ? (
                            <Check size={14} className="text-success" />
                          ) : (
                            <Copy size={12} className="text-dark-400" />
                          )}
                        </button>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            c.discountType === "percent"
                              ? "bg-primary-light text-primary"
                              : "bg-success-light text-success"
                          }`}
                        >
                          {c.discountType === "percent"
                            ? `${c.discountValue}% OFF`
                            : `₦${c.discountValue.toLocaleString()} OFF`}
                        </span>
                        {!c.isActive && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gray-100 text-dark-400">
                            Inactive
                          </span>
                        )}
                        {isExpired && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-danger-light text-danger">
                            Expired
                          </span>
                        )}
                        {isMaxed && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-warning-light text-warning">
                            Max Uses Reached
                          </span>
                        )}
                      </div>
                      {c.description && (
                        <p className="text-xs text-dark-400 mt-0.5">
                          {c.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap text-[10px] text-dark-400">
                        <span>
                          Used: {c.usedCount}
                          {c.maxUses ? `/${c.maxUses}` : ""}
                        </span>
                        {c.minAmount > 0 && (
                          <span>Min: {fmt(c.minAmount)}</span>
                        )}
                        <span className="capitalize">
                          Plans: {c.applicablePlans.join(", ")}
                        </span>
                        {c.expiresAt && (
                          <span>
                            Expires: {dayjs(c.expiresAt).format("D MMM YYYY")}
                          </span>
                        )}
                        <span>Created by {c.createdBy?.firstName}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() =>
                          toggle({ id: c._id, isActive: !c.isActive })
                        }
                        title={c.isActive ? "Deactivate" : "Activate"}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        {c.isActive ? (
                          <ToggleRight size={18} className="text-success" />
                        ) : (
                          <ToggleLeft size={18} className="text-dark-400" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(c)}
                        className="p-1.5 rounded-lg hover:bg-primary-light text-dark-400 hover:text-primary transition-colors"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        onClick={() => remove(c._id)}
                        className="p-1.5 rounded-lg hover:bg-danger-light text-dark-400 hover:text-danger transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
