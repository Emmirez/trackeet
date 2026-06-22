import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  Plus,
  Trash2,
  Pause,
  Play,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import { recurringAPI, customerAPI } from "../../services/api.js";
import { fmt, getInitials, avatarColor } from "../../utils/helpers.js";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const FREQUENCY_OPTIONS = [
  { value: "weekly", label: "Weekly", desc: "Every 7 days" },
  { value: "monthly", label: "Monthly", desc: "Every month" },
  { value: "quarterly", label: "Quarterly", desc: "Every 3 months" },
  { value: "yearly", label: "Yearly", desc: "Every 12 months" },
];

const FREQ_COLORS = {
  weekly: "bg-primary-light text-primary",
  monthly: "bg-success-light text-success",
  quarterly: "bg-warning-light text-warning",
  yearly: "bg-purple-100 text-purple-600",
};

const STATUS_COLORS = {
  active: "bg-success-light text-success",
  paused: "bg-warning-light text-warning",
  completed: "bg-gray-100 text-dark-400",
};

export default function RecurringPage() {
  const qc = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomers, setShowCustomers] = useState(false);
  const [frequency, setFrequency] = useState("monthly");
  const [startDate, setStartDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState("");
  const [daysDueAfter, setDaysDueAfter] = useState(7);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState([
    { name: "", quantity: 1, unitPrice: "", total: 0 },
  ]);
  const [discountPercent, setDiscountPercent] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ["recurring"],
    queryFn: () => recurringAPI.getAll().then((r) => r.data),
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers-recurring", customerSearch],
    queryFn: () =>
      customerAPI.getAll({ search: customerSearch }).then((r) => r.data),
    enabled: showCustomers,
  });

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: recurringAPI.create,
    onSuccess: () => {
      toast.success("Recurring invoice created!");
      qc.invalidateQueries(["recurring"]);
      resetForm();
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to create"),
  });

  const { mutate: update } = useMutation({
    mutationFn: ({ id, data }) => recurringAPI.update(id, data),
    onSuccess: () => {
      toast.success("Updated!");
      qc.invalidateQueries(["recurring"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update"),
  });

  const { mutate: remove } = useMutation({
    mutationFn: recurringAPI.delete,
    onSuccess: () => {
      toast.success("Deleted!");
      qc.invalidateQueries(["recurring"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to delete"),
  });

  const resetForm = () => {
    setShowCreate(false);
    setSelectedCustomer(null);
    setFrequency("monthly");
    setStartDate(dayjs().format("YYYY-MM-DD"));
    setEndDate("");
    setDaysDueAfter(7);
    setNotes("");
    setItems([{ name: "", quantity: 1, unitPrice: "", total: 0 }]);
    setDiscountPercent(0);
    setCustomerSearch("");
  };

  const updateItem = (i, field, value) => {
    const updated = [...items];
    updated[i][field] = value;
    if (field === "quantity" || field === "unitPrice") {
      updated[i].total =
        (parseFloat(updated[i].quantity) || 0) *
        (parseFloat(updated[i].unitPrice) || 0);
    }
    setItems(updated);
  };

  const addItem = () =>
    setItems([...items, { name: "", quantity: 1, unitPrice: "", total: 0 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));

  const subtotal = items.reduce((s, i) => s + (i.total || 0), 0);
  const discountAmt = subtotal * (discountPercent / 100);
  const total = subtotal - discountAmt;

  const handleCreate = () => {
    if (!selectedCustomer) return toast.error("Select a customer");
    if (items.some((i) => !i.name || !i.unitPrice))
      return toast.error("Fill all item details");
    create({
      customer: selectedCustomer._id,
      items: items.map((i) => ({
        ...i,
        quantity: parseFloat(i.quantity),
        unitPrice: parseFloat(i.unitPrice),
        total: i.total,
      })),
      discountPercent: parseFloat(discountPercent) || 0,
      notes,
      frequency,
      startDate,
      endDate: endDate || null,
      daysDueAfter: parseInt(daysDueAfter) || 7,
    });
  };

  const handleDelete = (r) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Delete recurring invoice?</p>
          <p className="text-xs text-dark-400">
            Future invoices won't be generated.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                remove(r._id);
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

  const recurring = data?.recurring || [];

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      <div className="section-header">
        <div>
          <h1 className="page-title"></h1>
          <p className="text-dark-800 text-sm">
            Auto-generate invoices on a schedule
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="btn btn-primary flex-shrink-0 btn-sm"
        >
          <Plus size={16} /> New Recurring
        </button>
      </div>

      {/* How it works */}
      <div className="card bg-primary-light dark:bg-primary/10 border border-primary/20">
        <div className="flex items-start gap-3">
          <RefreshCw size={18} className="text-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-dark dark:text-white">
              How recurring invoices work
            </p>
            <p className="text-xs text-dark-400 mt-0.5">
              Set up a recurring invoice once — Trackeet automatically generates
              a new invoice for the customer every week, month, quarter or year.
              You get notified each time.
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : recurring.length === 0 ? (
          <div className="empty-state p-10">
            <RefreshCw size={48} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No recurring invoices yet
            </p>
            <p className="text-dark-400 text-sm">
              Set up auto-billing for your regular customers
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="btn btn-primary btn-sm mt-2"
            >
              <Plus size={14} /> Create First Recurring Invoice
            </button>
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {recurring.map((r, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors group"
              >
                <div
                  className={`avatar w-10 h-10 text-sm flex-shrink-0 ${avatarColor(r.customer?.name || "")}`}
                >
                  {getInitials(r.customer?.name || "?")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-dark dark:text-white">
                      {r.customer?.name}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${FREQ_COLORS[r.frequency]}`}
                    >
                      {r.frequency}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[r.status]}`}
                    >
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs text-dark-400 mt-0.5">
                    {fmt.naira(r.items?.reduce((s, i) => s + i.total, 0) || 0)}{" "}
                    per {r.frequency.replace("ly", "")}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-dark-400">
                    <span>
                      Next: {dayjs(r.nextDueDate).format("D MMM YYYY")}
                    </span>
                    <span>Generated: {r.totalGenerated || 0} invoices</span>
                    {r.endDate && (
                      <span>Ends: {dayjs(r.endDate).format("D MMM YYYY")}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() =>
                      update({
                        id: r._id,
                        data: {
                          status: r.status === "active" ? "paused" : "active",
                        },
                      })
                    }
                    className="p-1.5 rounded-lg hover:bg-warning-light text-dark-300 hover:text-warning transition-colors"
                    title={r.status === "active" ? "Pause" : "Resume"}
                  >
                    {r.status === "active" ? (
                      <Pause size={14} />
                    ) : (
                      <Play size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(r)}
                    className="p-1.5 rounded-lg hover:bg-danger-light text-dark-300 hover:text-danger transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-surface">
              <div>
                <h3 className="font-bold text-dark dark:text-white">
                  New Recurring Invoice
                </h3>
                <p className="text-xs text-dark-400">
                  Auto-generate invoices on a schedule
                </p>
              </div>
              <button
                onClick={resetForm}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Customer */}
              <div>
                <label className="label">Customer *</label>
                <div className="relative">
                  <button
                    onClick={() => setShowCustomers(!showCustomers)}
                    className="input flex items-center justify-between w-full text-left"
                  >
                    {selectedCustomer ? (
                      <div className="flex items-center gap-2">
                        <div
                          className={`avatar w-6 h-6 text-xs ${avatarColor(selectedCustomer.name)}`}
                        >
                          {getInitials(selectedCustomer.name)}
                        </div>
                        <span className="text-dark dark:text-white">
                          {selectedCustomer.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-dark-400">Select customer...</span>
                    )}
                    <ChevronDown size={15} className="text-dark-400" />
                  </button>
                  {showCustomers && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-surface border border-dark-200 dark:border-gray-700 rounded-2xl shadow-xl z-20 overflow-hidden max-h-48 overflow-y-auto">
                      <div className="p-2 border-b border-dark-100 dark:border-gray-700">
                        <input
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          placeholder="Search..."
                          className="input py-2 text-sm"
                          autoFocus
                        />
                      </div>
                      {(customersData?.customers || []).map((c) => (
                        <button
                          key={c._id}
                          onClick={() => {
                            setSelectedCustomer(c);
                            setShowCustomers(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary-light dark:hover:bg-primary/10 transition-colors"
                        >
                          <div
                            className={`avatar w-7 h-7 text-xs ${avatarColor(c.name)}`}
                          >
                            {getInitials(c.name)}
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-dark dark:text-white">
                              {c.name}
                            </p>
                            <p className="text-xs text-dark-400">{c.phone}</p>
                          </div>
                          {selectedCustomer?._id === c._id && (
                            <Check size={14} className="text-primary ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Frequency */}
              <div>
                <label className="label">Frequency *</label>
                <div className="grid grid-cols-2 gap-2">
                  {FREQUENCY_OPTIONS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFrequency(f.value)}
                      className={`py-3 px-3 rounded-xl text-sm font-semibold border-2 transition-all text-left
                        ${frequency === f.value ? "bg-primary-light text-primary border-primary/30" : "border-dark-200 dark:border-gray-600 text-dark-400"}`}
                    >
                      <p>{f.label}</p>
                      <p className="text-[10px] font-normal opacity-70 mt-0.5">
                        {f.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Start Date *</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">
                    End Date{" "}
                    <span className="text-dark-400 font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input"
                  />
                </div>
              </div>

              {/* Due days */}
              <div>
                <label className="label">Invoice Due After</label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={daysDueAfter}
                    onChange={(e) => setDaysDueAfter(e.target.value)}
                    className="input w-24"
                    min="1"
                    max="90"
                  />
                  <span className="text-dark-400 text-sm">
                    days after generation
                  </span>
                </div>
              </div>

              {/* Items */}
              <div>
                <label className="label">Items *</label>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 gap-2 items-center"
                    >
                      <input
                        value={item.name}
                        onChange={(e) => updateItem(i, "name", e.target.value)}
                        placeholder="Item name"
                        className="input col-span-5 text-sm py-2"
                      />
                      <input
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(i, "quantity", e.target.value)
                        }
                        type="number"
                        placeholder="Qty"
                        className="input col-span-2 text-sm py-2"
                        min="1"
                      />
                      <input
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(i, "unitPrice", e.target.value)
                        }
                        type="number"
                        placeholder="Price"
                        className="input col-span-3 text-sm py-2"
                      />
                      <div className="col-span-1 text-right text-xs text-dark-400 font-semibold">
                        {fmt.naira(item.total || 0)}
                      </div>
                      {items.length > 1 && (
                        <button
                          onClick={() => removeItem(i)}
                          className="col-span-1 text-danger"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addItem}
                  className="btn btn-ghost btn-sm mt-2 text-primary"
                >
                  <Plus size={14} /> Add Item
                </button>
              </div>

              {/* Discount */}
              <div>
                <label className="label">Discount %</label>
                <input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  className="input"
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="label">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Payment terms, instructions..."
                  className="input resize-none"
                />
              </div>

              {/* Summary */}
              <div className="p-3 bg-gray-50 dark:bg-dark rounded-xl">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-dark-400">Subtotal</span>
                  <span className="text-dark dark:text-white">
                    {fmt.naira(subtotal)}
                  </span>
                </div>
                {discountPercent > 0 && (
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-dark-400">
                      Discount ({discountPercent}%)
                    </span>
                    <span className="text-success">
                      -{fmt.naira(discountAmt)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 border-t border-dark-100 dark:border-gray-700">
                  <span className="text-dark dark:text-white">
                    Total per {frequency.replace("ly", "")}
                  </span>
                  <span className="text-primary">{fmt.naira(total)}</span>
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={creating}
                className="btn btn-primary w-full py-3"
              >
                {creating ? (
                  "Creating..."
                ) : (
                  <>
                    <RefreshCw size={16} /> Create Recurring Invoice
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
