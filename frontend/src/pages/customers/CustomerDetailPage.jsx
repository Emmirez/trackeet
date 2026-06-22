import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  FileText,
  Phone,
  Mail,
  Edit2,
  Trash2,
  X,
  Check,
} from "lucide-react";
import { customerAPI } from "../../services/api.js";
import {
  fmt,
  statusBadge,
  getInitials,
  avatarColor,
} from "../../utils/helpers.js";
import toast from "react-hot-toast";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => customerAPI.getOne(id).then((r) => r.data),
  });
  const c = data?.customer;

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: (d) => customerAPI.update(id, d),
    onSuccess: () => {
      toast.success("Customer updated!");
      qc.invalidateQueries(["customer", id]);
      qc.invalidateQueries(["customers"]);
      setShowEdit(false);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update"),
  });

  const { mutate: remove, isPending: deleting } = useMutation({
    mutationFn: () => customerAPI.delete(id),
    onSuccess: () => {
      toast.success("Customer deleted!");
      qc.invalidateQueries(["customers"]);
      navigate("/dashboard/customers");
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to delete"),
  });

  const openEdit = () => {
    setEditName(c.name || "");
    setEditPhone(c.phone || "");
    setEditEmail(c.email || "");
    setShowEdit(true);
  };

  const handleDelete = () => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Delete {c.name}?</p>
          <p className="text-xs text-dark-400">
            This will not delete their invoices.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                remove();
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
      { duration: 6000 },
    );
  };

  if (isLoading)
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="skeleton h-32 rounded-2xl" />
        ))}
      </div>
    );
  if (!c)
    return (
      <p className="text-center text-dark-400 py-10">Customer not found</p>
    );

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn btn-ghost p-2">
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title">Customer Profile</h1>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={openEdit} className="btn btn-ghost p-2 text-primary">
            <Edit2 size={18} />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn btn-ghost p-2 text-danger"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Profile card */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6">
          <div
            className={`avatar w-16 h-16 text-2xl ${avatarColor(c.name || "")}`}
          >
            {getInitials(c.name || "?")}
          </div>
          <div>
            <h2 className="text-xl font-bold text-dark dark:text-white">
              {c.name}
            </h2>
            {c.businessName && (
              <p className="text-dark-400 text-sm">{c.businessName}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {c.phone && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark rounded-xl">
              <Phone size={16} className="text-primary" />
              <div>
                <p className="text-xs text-dark-400">Phone</p>
                <p className="font-medium text-dark dark:text-white text-sm">
                  {c.phone}
                </p>
              </div>
            </div>
          )}
          {c.email && (
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark rounded-xl">
              <Mail size={16} className="text-primary" />
              <div>
                <p className="text-xs text-dark-400">Email</p>
                <p className="font-medium text-dark dark:text-white text-sm">
                  {c.email}
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { l: "Total Spent", v: fmt.naira(c.totalSpent) },
            { l: "Invoices", v: c.totalInvoices || 0 },
            { l: "Outstanding", v: fmt.naira(c.outstandingBalance) },
          ].map((s, i) => (
            <div
              key={i}
              className="text-center p-3 bg-gray-50 dark:bg-dark rounded-xl"
            >
              <p className="text-lg font-bold text-dark dark:text-white">
                {s.v}
              </p>
              <p className="text-xs text-dark-400">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice history */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-dark-200 dark:border-gray-700">
          <h2 className="font-semibold text-dark dark:text-white">
            Invoice History
          </h2>
        </div>
        {(data?.invoices || []).length === 0 ? (
          <div className="empty-state p-8">
            <FileText size={40} className="text-dark-200" />
            <p className="text-dark-400">No invoices yet</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {(data?.invoices || []).map((inv) => (
              <div
                key={inv._id}
                className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/20 cursor-pointer transition-colors"
                onClick={() => navigate(`/dashboard/invoices/${inv._id}`)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark dark:text-white">
                    {inv.invoiceNumber}
                  </p>
                  <p className="text-xs text-dark-400">
                    {fmt.date(inv.createdAt)}
                  </p>
                </div>
                <span className={statusBadge(inv.status)}>{inv.status}</span>
                <p className="font-bold text-dark dark:text-white text-sm">
                  {fmt.naira(inv.totalAmount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700">
              <h3 className="font-bold text-dark dark:text-white">
                Edit Customer
              </h3>
              <button
                onClick={() => setShowEdit(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Name *</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="label">Phone *</label>
                <input
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="input"
                  placeholder="Phone number"
                  type="tel"
                />
              </div>
              <div>
                <label className="label">
                  Email{" "}
                  <span className="text-dark-400 font-normal">(optional)</span>
                </label>
                <input
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="input"
                  placeholder="Email address"
                  type="email"
                />
              </div>
              <button
                onClick={() => {
                  if (!editName.trim()) return toast.error("Name is required");
                  if (!editPhone.trim())
                    return toast.error("Phone is required");
                  update({
                    name: editName.trim(),
                    phone: editPhone.trim(),
                    email: editEmail.trim(),
                  });
                }}
                disabled={updating}
                className="btn btn-primary w-full py-3"
              >
                {updating ? (
                  "Saving..."
                ) : (
                  <>
                    <Check size={16} /> Save Changes
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
