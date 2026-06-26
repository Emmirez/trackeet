import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Tag,
  Plus,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  X,
} from "lucide-react";
import api from "../../services/api.js";
import toast from "react-hot-toast";

const fmtN = (n) => "₦" + (n || 0).toLocaleString("en-NG");

const couponAPI = {
  getAll: () => api.get("/store-coupons"),
  create: (d) => api.post("/store-coupons", d),
  update: (id, d) => api.put(`/store-coupons/${id}`, d),
  delete: (id) => api.delete(`/store-coupons/${id}`),
};

const EMPTY_FORM = {
  code: "",
  description: "",
  discountType: "percent",
  discountValue: "",
  minOrderAmount: "",
  maxUses: "",
  expiresAt: "",
};

export default function StoreCouponsPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = useQuery({
    queryKey: ["store-coupons"],
    queryFn: () => couponAPI.getAll().then((r) => r.data),
  });

  const coupons = data?.coupons || [];

  const createMutation = useMutation({
    mutationFn: (d) => couponAPI.create(d),
    onSuccess: () => {
      qc.invalidateQueries(["store-coupons"]);
      toast.success("Coupon created!");
      setShowModal(false);
      setForm(EMPTY_FORM);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to create coupon"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }) => couponAPI.update(id, { isActive }),
    onSuccess: () => qc.invalidateQueries(["store-coupons"]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => couponAPI.delete(id),
    onSuccess: () => {
      qc.invalidateQueries(["store-coupons"]);
      toast.success("Coupon deleted");
    },
  });

  const handleSubmit = () => {
    if (!form.code.trim()) return toast.error("Coupon code is required");
    if (!form.discountValue) return toast.error("Discount value is required");
    createMutation.mutate({
      ...form,
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount) || 0,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
    });
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success("Copied!");
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black text-dark dark:text-white flex items-center gap-2">
            <Tag size={24} className="text-primary " /> Store Coupons
          </h1>
          <p className="text-dark-600 text-sm mt-1">
            Create discount codes for your store customers
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary flex-shrink-0">
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {/* Coupons list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card animate-pulse h-20" />
          ))}
        </div>
      ) : coupons.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-primary-light rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Tag size={28} className="text-primary" />
          </div>
          <h3 className="font-bold text-dark dark:text-white mb-2">
            No coupons yet
          </h3>
          <p className="text-dark-400 text-sm mb-4">
            Create discount codes to attract more customers to your store
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary mx-auto"
          >
            <Plus size={16} /> Create First Coupon
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="card flex items-center gap-4">
              <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                <Tag size={18} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-black text-dark dark:text-white font-mono text-lg">
                    {coupon.code}
                  </span>
                  <button
                    onClick={() => copyCode(coupon.code)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                  >
                    <Copy size={12} className="text-dark-400" />
                  </button>
                  <span
                    className={`badge text-xs px-2 py-0.5 rounded-full font-bold ${coupon.isActive ? "bg-success-light text-success" : "bg-dark-100 text-dark-400"}`}
                  >
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="text-sm font-bold text-primary">
                    {coupon.discountType === "percent"
                      ? `${coupon.discountValue}% off`
                      : `${fmtN(coupon.discountValue)} off`}
                  </span>
                  {coupon.minOrderAmount > 0 && (
                    <span className="text-xs text-dark-400">
                      Min: {fmtN(coupon.minOrderAmount)}
                    </span>
                  )}
                  {coupon.maxUses && (
                    <span className="text-xs text-dark-400">
                      {coupon.usedCount}/{coupon.maxUses} uses
                    </span>
                  )}
                  {coupon.expiresAt && (
                    <span className="text-xs text-dark-400">
                      Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                  {coupon.description && (
                    <span className="text-xs text-dark-400 italic">
                      {coupon.description}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() =>
                    toggleMutation.mutate({
                      id: coupon._id,
                      isActive: !coupon.isActive,
                    })
                  }
                  className="text-dark-400 hover:text-primary transition-colors"
                >
                  {coupon.isActive ? (
                    <ToggleRight size={24} className="text-success" />
                  ) : (
                    <ToggleLeft size={24} />
                  )}
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this coupon?"))
                      deleteMutation.mutate(coupon._id);
                  }}
                  className="w-8 h-8 bg-danger-light rounded-lg flex items-center justify-center hover:bg-danger hover:text-white transition-colors"
                >
                  <Trash2 size={14} className="text-danger" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-5 border-b border-dark-100 dark:border-gray-700">
              <h2 className="font-bold text-dark dark:text-white">
                Create Coupon
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="input-label">Coupon Code *</label>
                <input
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  placeholder="e.g. SAVE20"
                  className="input font-mono font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Discount Type *</label>
                  <select
                    value={form.discountType}
                    onChange={(e) =>
                      setForm({ ...form, discountType: e.target.value })
                    }
                    className="input"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₦)</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">
                    {form.discountType === "percent"
                      ? "Percentage *"
                      : "Amount (₦) *"}
                  </label>
                  <input
                    type="number"
                    value={form.discountValue}
                    onChange={(e) =>
                      setForm({ ...form, discountValue: e.target.value })
                    }
                    placeholder={
                      form.discountType === "percent" ? "e.g. 20" : "e.g. 1000"
                    }
                    className="input"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Min Order Amount (₦)</label>
                  <input
                    type="number"
                    value={form.minOrderAmount}
                    onChange={(e) =>
                      setForm({ ...form, minOrderAmount: e.target.value })
                    }
                    placeholder="0 = no minimum"
                    className="input"
                  />
                </div>
                <div>
                  <label className="input-label">Max Uses</label>
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={(e) =>
                      setForm({ ...form, maxUses: e.target.value })
                    }
                    placeholder="Leave empty = unlimited"
                    className="input"
                  />
                </div>
              </div>
              <div>
                <label className="input-label">Expiry Date (optional)</label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                  className="input"
                />
              </div>
              <div>
                <label className="input-label">Description (optional)</label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="e.g. New customer discount"
                  className="input"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending}
                  className="btn btn-primary flex-shrink-0"
                >
                  {createMutation.isPending ? "Creating..." : "Create Coupon"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
