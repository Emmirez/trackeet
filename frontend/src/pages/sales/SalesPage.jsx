import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Plus,
  X,
  Trash2,
  Search,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { saleAPI, customerAPI } from "../../services/api.js";
import { fmt } from "../../utils/helpers.js";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

dayjs.extend(relativeTime);

const PAYMENT_METHODS = [
  { value: "cash", label: "💵 Cash" },
  { value: "pos", label: "💳 POS" },
  { value: "bank_transfer", label: "🏦 Bank Transfer" },
  { value: "other", label: "📦 Other" },
];

const STATUS_BADGE = {
  paid: "bg-success-light text-success",
  partial: "bg-warning-light text-warning",
  pending: "bg-primary-light text-primary",
  refunded: "bg-gray-100 text-dark-400",
};

export default function SalesPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const now = dayjs();

  const [selectedDate, setSelectedDate] = useState(now);
  const [activeTab, setActiveTab] = useState("list");
  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustPicker, setShowCustPicker] = useState(false);
  const [custSearch, setCustSearch] = useState("");
  const [items, setItems] = useState([{ name: "", quantity: 1, unitPrice: 0 }]);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [notes, setNotes] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("full");
  const [amountPaid, setAmountPaid] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  // Detail state
  const [showPayModal, setShowPayModal] = useState(false);
  const [showRefund, setShowRefund] = useState(false);
  const [payAmt, setPayAmt] = useState("");
  const [payMethod, setPayMethod] = useState("cash");
  const [refundReason, setRefundReason] = useState("");
  const [sendingWA, setSendingWA] = useState(false);

  const isCurrentMonth = selectedDate.isSame(now, "month");

  const params = {
    month: selectedDate.month() + 1,
    year: selectedDate.year(),
    status: filterStatus !== "all" ? filterStatus : undefined,
    search: search || undefined,
  };

  const { data, isLoading } = useQuery({
    queryKey: ["sales", params],
    queryFn: () => saleAPI.getAll(params).then((r) => r.data),
  });

  const { data: custData } = useQuery({
    queryKey: ["customers-search", custSearch],
    queryFn: () =>
      customerAPI.getAll({ search: custSearch }).then((r) => r.data),
    enabled: showCustPicker,
  });

  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["sale", showDetail],
    queryFn: () => saleAPI.getOne(showDetail).then((r) => r.data),
    enabled: !!showDetail,
  });
  const sale = detailData?.sale;

  const { mutate: createSale, isPending: creating } = useMutation({
    mutationFn: saleAPI.create,
    onSuccess: (res) => {
      toast.success(`${res.data.sale.saleNumber} created!`);
      queryClient.invalidateQueries(["sales"]);
      queryClient.invalidateQueries(["dashboard"]);
      resetForm();
      setShowDetail(res.data.sale._id);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const { mutate: updateSale, isPending: updating } = useMutation({
    mutationFn: ({ id, data }) => saleAPI.update(id, data),
    onSuccess: () => {
      toast.success("Updated!");
      queryClient.invalidateQueries(["sale", showDetail]);
      queryClient.invalidateQueries(["sales"]);
      queryClient.invalidateQueries(["dashboard"]);
      setShowPayModal(false);
      setShowRefund(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed"),
  });

  const { mutate: deleteSale } = useMutation({
    mutationFn: saleAPI.delete,
    onSuccess: () => {
      toast.success("Deleted!");
      queryClient.invalidateQueries(["sales"]);
      setShowDetail(null);
    },
  });

  const resetForm = () => {
    setShowAdd(false);
    setCustomerName("");
    setSelectedCustomer(null);
    setItems([{ name: "", quantity: 1, unitPrice: 0 }]);
    setDiscountPercent(0);
    setNotes("");
    setPaymentStatus("full");
    setAmountPaid(0);
    setPaymentMethod("cash");
  };

  const subtotal = items.reduce(
    (s, i) => s + (parseFloat(i.unitPrice) || 0) * (parseInt(i.quantity) || 0),
    0,
  );
  const discountAmt = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmt;
  const finalPaid =
    paymentStatus === "full"
      ? total
      : paymentStatus === "none"
        ? 0
        : parseFloat(amountPaid) || 0;

  const addItem = () =>
    setItems([...items, { name: "", quantity: 1, unitPrice: 0 }]);
  const removeItem = (i) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i, k, v) => {
    const a = [...items];
    a[i][k] = v;
    setItems(a);
  };

  const handleCreate = () => {
    if (items.some((i) => !i.name.trim()))
      return toast.error("Fill in all item names");
    if (paymentStatus === "partial" && (finalPaid <= 0 || finalPaid >= total))
      return toast.error("Partial must be between ₦0 and total");
    createSale({
      customerName:
        customerName || selectedCustomer?.name || "Walk-in Customer",
      customer: selectedCustomer?._id || null,
      items,
      discountPercent,
      notes,
      amountPaid: finalPaid,
      paymentMethod: paymentStatus !== "none" ? paymentMethod : null,
      paymentDate: paymentStatus !== "none" ? new Date() : null,
    });
  };

  const handlePay = () => {
    if (!payAmt || parseFloat(payAmt) <= 0)
      return toast.error("Enter valid amount");
    updateSale({
      id: showDetail,
      data: {
        amountPaid: (sale.amountPaid || 0) + parseFloat(payAmt),
        paymentMethod: payMethod,
      },
    });
  };

  const handleRefund = () => {
    if (!refundReason.trim()) return toast.error("Enter refund reason");
    updateSale({ id: showDetail, data: { refundReason } });
  };

  const handleSendWA = async () => {
    if (!sale?.customer?.phone)
      return toast.error("No phone number for this customer");
    setSendingWA(true);
    try {
      await saleAPI.sendWhatsApp(showDetail, { phone: sale?.customer?.phone });
      toast.success("Receipt sent via WhatsApp!");
      queryClient.invalidateQueries(["sale", showDetail]);
    } catch {
      toast.error("WhatsApp not connected");
    } finally {
      setSendingWA(false);
    }
  };

  const sales = data?.sales || [];
  const totalRevenue = data?.totalRevenue || 0;
  const monthRevenue = data?.monthRevenue || 0;
  const prevRevenue = data?.prevRevenue || 0;
  const monthlyHistory = data?.monthlyHistory || [];
  const insight = data?.insight;

  const monthDiff =
    prevRevenue > 0
      ? Math.round(((monthRevenue - prevRevenue) / prevRevenue) * 100)
      : null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <h1 className="page-title">Quick Sales</h1>
        <button
          onClick={() => setShowAdd(true)}
          className="btn btn-primary btn-sm"
        >
          <Plus size={16} /> New Sale
        </button>
      </div>

      {/* Month Navigator */}
      <div className="card py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedDate((d) => d.subtract(1, "month"))}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft size={18} className="text-dark-400" />
          </button>
          <div className="text-center">
            <p className="font-bold text-dark dark:text-white text-lg">
              {selectedDate.format("MMMM YYYY")}
            </p>
            <p className="text-xs text-dark-400">
              {isCurrentMonth ? "Current month" : selectedDate.fromNow()}
            </p>
          </div>
          <button
            onClick={() => {
              if (!isCurrentMonth) setSelectedDate((d) => d.add(1, "month"));
            }}
            disabled={isCurrentMonth}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-30"
          >
            <ChevronRight size={18} className="text-dark-400" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card py-3 text-center">
          <p
            className="font-black text-primary truncate"
            style={{ fontSize: "clamp(11px,3.5vw,18px)" }}
          >
            {fmt.naira(monthRevenue)}
          </p>
          <p className="text-xs text-dark-400 mt-0.5">This Month</p>
        </div>
        <div className="card py-3 text-center">
          <p
            className="font-black text-dark-400 truncate"
            style={{ fontSize: "clamp(11px,3.5vw,18px)" }}
          >
            {fmt.naira(prevRevenue)}
          </p>
          <p className="text-xs text-dark-400 mt-0.5">Last Month</p>
        </div>
        <div className="card py-3 text-center">
          {monthDiff !== null ? (
            <>
              <p
                className={`font-black ${monthDiff > 0 ? "text-success" : "text-danger"}`}
                style={{ fontSize: "clamp(11px,3.5vw,18px)" }}
              >
                {monthDiff > 0 ? "+" : ""}
                {monthDiff}%
              </p>
              <p className="text-xs text-dark-400 mt-0.5">vs Last Month</p>
            </>
          ) : (
            <>
              <p
                className="font-black text-dark dark:text-white truncate"
                style={{ fontSize: "clamp(11px,3.5vw,18px)" }}
              >
                {fmt.naira(totalRevenue)}
              </p>
              <p className="text-xs text-dark-400 mt-0.5">All Time</p>
            </>
          )}
        </div>
      </div>

      {/* Insight */}
      {insight && (
        <div
          className={`card flex items-start gap-3 ${
            insight.type === "positive"
              ? "bg-success-light border border-success/20"
              : insight.type === "warning"
                ? "bg-warning-light border border-warning/20"
                : "bg-gray-50 dark:bg-dark border border-dark-100 dark:border-gray-700"
          }`}
        >
          <span className="text-xl flex-shrink-0">
            {insight.type === "positive"
              ? "📈"
              : insight.type === "warning"
                ? "📉"
                : "📊"}
          </span>
          <p
            className={`text-sm font-semibold ${
              insight.type === "positive"
                ? "text-success"
                : insight.type === "warning"
                  ? "text-warning"
                  : "text-dark dark:text-white"
            }`}
          >
            {insight.message}
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { key: "list", label: "🛍️ Sales" },
          { key: "history", label: "📊 History" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all
              ${activeTab === tab.key ? "bg-white dark:bg-surface text-dark dark:text-white shadow-sm" : "text-dark-400"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── HISTORY TAB ── */}
      {activeTab === "history" && (
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-dark dark:text-white mb-4">
              Last 12 Months
            </h2>
            {monthlyHistory.some((m) => m.amount > 0) ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyHistory}>
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10 }}
                    stroke="#94A3B8"
                  />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    stroke="#94A3B8"
                    tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => fmt.naira(v)}
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="amount" radius={[6, 6, 0, 0]}>
                    {monthlyHistory.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={
                          entry.year === selectedDate.year() &&
                          entry.monthNum === selectedDate.month() + 1
                            ? "#7C3AED"
                            : "#E2E8F0"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-dark-400 text-sm py-8">
                No sales history yet
              </p>
            )}
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="p-4 border-b border-dark-100 dark:border-gray-700">
              <h2 className="font-semibold text-dark dark:text-white">
                Monthly Breakdown
              </h2>
            </div>
            <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
              {monthlyHistory
                .filter((m) => m.amount > 0)
                .reverse()
                .map((m, i, arr) => {
                  const prevM = arr[i + 1];
                  const change =
                    prevM?.amount > 0
                      ? Math.round(
                          ((m.amount - prevM.amount) / prevM.amount) * 100,
                        )
                      : null;
                  const isSel =
                    m.year === selectedDate.year() &&
                    m.monthNum === selectedDate.month() + 1;
                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedDate(dayjs(`${m.year}-${m.monthNum}-01`));
                        setActiveTab("list");
                      }}
                      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors ${isSel ? "bg-primary-light dark:bg-primary/10" : ""}`}
                    >
                      <div>
                        <p
                          className={`text-sm font-semibold ${isSel ? "text-primary" : "text-dark dark:text-white"}`}
                        >
                          {m.month}
                        </p>
                        <p className="text-xs text-dark-400">
                          {m.count} sale{m.count !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        {change !== null && (
                          <span
                            className={`text-xs font-semibold ${change > 0 ? "text-success" : "text-danger"}`}
                          >
                            {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
                          </span>
                        )}
                        <p
                          className={`text-sm font-black ${isSel ? "text-primary" : "text-dark dark:text-white"}`}
                        >
                          {fmt.naira(m.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              {monthlyHistory.filter((m) => m.amount > 0).length === 0 && (
                <p className="text-center text-dark-400 text-sm p-8">
                  No sales history yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── LIST TAB ── */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sales or customer..."
              className="input pl-10"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["all", "pending", "partial", "paid", "refunded"].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all
                  ${filterStatus === s ? "bg-primary text-white" : "bg-gray-100 dark:bg-gray-800 text-dark-400"}`}
              >
                {s === "all" ? "All" : s}
              </button>
            ))}
          </div>

          {/* Sales list */}
          <div className="card p-0 overflow-hidden">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-16 rounded-xl" />
                ))}
              </div>
            ) : sales.length === 0 ? (
              <div className="empty-state p-10">
                <ShoppingBag size={48} className="text-dark-200" />
                <p className="font-semibold text-dark dark:text-white">
                  No sales in {selectedDate.format("MMMM YYYY")}
                </p>
                <button
                  onClick={() => setShowAdd(true)}
                  className="btn btn-primary btn-sm mt-2"
                >
                  <Plus size={14} /> Record Sale
                </button>
              </div>
            ) : (
              <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
                {sales.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => setShowDetail(s._id)}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors cursor-pointer group"
                  >
                    <div className="w-10 h-10 bg-primary-light rounded-xl flex items-center justify-center flex-shrink-0">
                      <ShoppingBag size={18} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-dark dark:text-white truncate">
                        {s.saleNumber}
                      </p>
                      <p className="text-xs text-dark-400">
                        {s.customerName} ·{" "}
                        {dayjs(s.createdAt).format("D MMM YYYY")}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-dark dark:text-white">
                        {fmt.naira(s.totalAmount)}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_BADGE[s.status] || STATUS_BADGE.pending}`}
                      >
                        {s.status}
                      </span>
                    </div>
                    <ArrowRight
                      size={14}
                      className="text-gray-300 group-hover:text-primary transition-colors flex-shrink-0"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Sale Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-surface">
              <h3 className="font-bold text-dark dark:text-white">New Sale</h3>
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
                <label className="label">
                  Customer{" "}
                  <span className="text-dark-400 font-normal">(optional)</span>
                </label>
                {selectedCustomer ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary-light dark:bg-primary/10">
                    <div className="avatar bg-primary text-white text-sm">
                      {selectedCustomer.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-dark dark:text-white">
                        {selectedCustomer.name}
                      </p>
                      <p className="text-xs text-dark-400">
                        {selectedCustomer.phone}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedCustomer(null)}
                      className="text-dark-400 hover:text-danger"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Walk-in Customer name (optional)"
                      className="input"
                    />
                    <button
                      onClick={() => setShowCustPicker(true)}
                      className="w-full flex items-center gap-2 p-2.5 rounded-xl border border-dashed border-dark-200 dark:border-gray-600 hover:border-primary text-xs text-dark-400 hover:text-primary transition-colors"
                    >
                      <Search size={14} /> Or select from customer list
                    </button>
                  </div>
                )}
              </div>

              {/* Customer Picker */}
              {showCustPicker && (
                <div className="fixed inset-0 bg-black/50 z-[60] flex items-end justify-center p-4">
                  <div className="bg-white dark:bg-surface rounded-3xl w-full max-w-md max-h-96 overflow-hidden">
                    <div className="p-4 border-b border-dark-100 dark:border-gray-700 flex items-center gap-3">
                      <Search size={16} className="text-dark-400" />
                      <input
                        autoFocus
                        value={custSearch}
                        onChange={(e) => setCustSearch(e.target.value)}
                        placeholder="Search customers..."
                        className="flex-1 outline-none bg-transparent text-sm dark:text-white"
                      />
                      <button onClick={() => setShowCustPicker(false)}>
                        <X size={18} className="text-dark-400" />
                      </button>
                    </div>
                    <div className="overflow-y-auto max-h-72 divide-y divide-dark-100 dark:divide-gray-700/30">
                      {(custData?.customers || []).map((c) => (
                        <button
                          key={c._id}
                          onClick={() => {
                            setSelectedCustomer(c);
                            setCustomerName(c.name);
                            setShowCustPicker(false);
                          }}
                          className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/20 text-left"
                        >
                          <div className="avatar bg-primary-light text-primary text-sm">
                            {c.name[0]}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-dark dark:text-white">
                              {c.name}
                            </p>
                            <p className="text-xs text-dark-400">{c.phone}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="label mb-0">Items *</label>
                  <button
                    onClick={addItem}
                    className="text-xs text-primary font-semibold flex items-center gap-1"
                  >
                    <Plus size={13} /> Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-3 space-y-2"
                    >
                      <div className="flex gap-2">
                        <input
                          value={item.name}
                          onChange={(e) =>
                            updateItem(i, "name", e.target.value)
                          }
                          placeholder="Item name *"
                          className="input flex-1 py-2"
                        />
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(i)}
                            className="p-2 text-danger hover:bg-danger-light rounded-lg"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
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
                          <label className="label text-[10px]">Price (₦)</label>
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
                          <div className="input py-2 bg-gray-100 dark:bg-white/5 text-sm font-semibold text-dark dark:text-white">
                            {fmt.naira(
                              (parseFloat(item.unitPrice) || 0) *
                                (parseInt(item.quantity) || 0),
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 space-y-1.5 text-sm border-t border-dark-100 dark:border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-dark-400">Subtotal</span>
                    <span className="font-semibold text-dark dark:text-white">
                      {fmt.naira(subtotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-dark-400">Discount (%)</span>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={discountPercent}
                      onChange={(e) =>
                        setDiscountPercent(Number(e.target.value))
                      }
                      className="input w-20 py-1 text-sm text-center"
                    />
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between">
                      <span className="text-dark-400">Discount</span>
                      <span className="text-danger">
                        -{fmt.naira(discountAmt)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-base pt-1 border-t border-dark-100 dark:border-gray-700">
                    <span className="text-dark dark:text-white">Total</span>
                    <span className="text-primary">{fmt.naira(total)}</span>
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div>
                <label className="label">Payment</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { value: "full", label: "✅ Full" },
                    { value: "partial", label: "⚡ Partial" },
                    { value: "none", label: "⏳ Unpaid" },
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPaymentStatus(p.value)}
                      className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all ${
                        paymentStatus === p.value
                          ? "bg-primary-light border-primary text-primary"
                          : "border-dark-200 dark:border-gray-600 text-dark-400"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                {paymentStatus === "partial" && (
                  <div className="mb-3">
                    <label className="label">Amount Paid (₦)</label>
                    <input
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="0.00"
                      className="input"
                    />
                  </div>
                )}
                {paymentStatus !== "none" && (
                  <div>
                    <label className="label">Payment Method</label>
                    <div className="grid grid-cols-2 gap-2">
                      {PAYMENT_METHODS.map((m) => (
                        <button
                          key={m.value}
                          onClick={() => setPaymentMethod(m.value)}
                          className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all text-left ${
                            paymentMethod === m.value
                              ? "bg-primary-light border-primary text-primary"
                              : "border-dark-200 dark:border-gray-600 text-dark-400"
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="label">
                  Notes{" "}
                  <span className="text-dark-400 font-normal">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Additional details..."
                  className="input resize-none"
                />
              </div>

              <button
                onClick={handleCreate}
                disabled={creating}
                className="btn btn-primary w-full py-3"
              >
                {creating ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingBag size={16} /> Record Sale
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Detail Modal */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-surface">
              <div>
                <h3 className="font-bold text-dark dark:text-white">
                  {sale?.saleNumber || "..."}
                </h3>
                <p className="text-xs text-dark-400">
                  {sale ? dayjs(sale.createdAt).format("D MMM YYYY") : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {sale && (
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-full capitalize ${STATUS_BADGE[sale.status] || STATUS_BADGE.pending}`}
                  >
                    {sale.status}
                  </span>
                )}
                <button
                  onClick={() => setShowDetail(null)}
                  className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={18} className="text-dark-400" />
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div className="p-5 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="skeleton h-12 rounded-xl" />
                ))}
              </div>
            ) : sale ? (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-dark-400">Customer</p>
                    <p className="font-bold text-dark dark:text-white">
                      {sale.customerName}
                    </p>
                    {sale.customer?.phone && (
                      <p className="text-xs text-dark-400">
                        {sale.customer.phone}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary">
                      {fmt.naira(sale.totalAmount)}
                    </p>
                    <p className="text-xs text-dark-400">
                      Paid:{" "}
                      <span className="text-success font-bold">
                        {fmt.naira(sale.amountPaid)}
                      </span>
                    </p>
                    {sale.balance > 0 && (
                      <p className="text-xs text-dark-400">
                        Balance:{" "}
                        <span className="text-danger font-bold">
                          {fmt.naira(sale.balance)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-dark rounded-xl p-3 space-y-2">
                  {sale.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium text-dark dark:text-white">
                          {item.name}
                        </p>
                        <p className="text-xs text-dark-400">
                          {item.quantity} × {fmt.naira(item.unitPrice)}
                        </p>
                      </div>
                      <p className="font-bold text-dark dark:text-white">
                        {fmt.naira(item.total)}
                      </p>
                    </div>
                  ))}
                  <div className="border-t border-dark-100 dark:border-gray-700 pt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-dark-400">Subtotal</span>
                      <span className="text-dark dark:text-white">
                        {fmt.naira(sale.subtotal)}
                      </span>
                    </div>
                    {sale.discountPercent > 0 && (
                      <div className="flex justify-between">
                        <span className="text-dark-400">
                          Discount ({sale.discountPercent}%)
                        </span>
                        <span className="text-success">
                          -{fmt.naira(sale.discountAmount)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold">
                      <span className="text-dark dark:text-white">Total</span>
                      <span className="text-primary">
                        {fmt.naira(sale.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {sale.notes && (
                  <div className="p-3 bg-gray-50 dark:bg-dark rounded-xl">
                    <p className="text-xs text-dark-400 mb-1">Notes</p>
                    <p className="text-sm text-dark dark:text-white">
                      {sale.notes}
                    </p>
                  </div>
                )}

                {sale.status === "refunded" && (
                  <div className="p-3 bg-danger-light rounded-xl">
                    <p className="text-xs font-bold text-danger">↩️ Refunded</p>
                    <p className="text-xs text-dark-500 mt-0.5">
                      {sale.refundReason}
                    </p>
                    <p className="text-xs text-dark-400 mt-0.5">
                      {dayjs(sale.refundedAt).format("D MMM YYYY")}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {sale.customer?.phone && sale.status !== "refunded" && (
                    <button
                      onClick={handleSendWA}
                      disabled={sendingWA}
                      className="whatsapp-btn col-span-2 disabled:opacity-70"
                    >
                      {sendingWA ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                          className="w-5 h-5"
                          alt="WA"
                        />
                      )}
                      {sendingWA ? "Sending..." : "Send Receipt"}
                    </button>
                  )}
                  {sale.status !== "paid" && sale.status !== "refunded" && (
                    <button
                      onClick={() => setShowPayModal(true)}
                      className="btn btn-success"
                    >
                      <CheckCircle size={15} /> Record Payment
                    </button>
                  )}
                  {sale.status !== "refunded" && (
                    <button
                      onClick={() => setShowRefund(true)}
                      className="btn border border-danger text-danger hover:bg-danger hover:text-white transition-colors"
                    >
                      <RefreshCw size={15} /> Refund
                    </button>
                  )}
                  <button
                    onClick={() => {
                      toast(
                        (t) => (
                          <div className="flex flex-col gap-2">
                            <p className="text-sm font-semibold">
                              Delete {sale.saleNumber}?
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  deleteSale(showDetail);
                                  toast.dismiss(t.id);
                                }}
                                className="px-3 py-1 bg-danger text-white text-xs font-bold rounded-lg"
                              >
                                Delete
                              </button>
                              <button
                                onClick={() => toast.dismiss(t.id)}
                                className="px-3 py-1 bg-gray-100 text-xs font-bold rounded-lg"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ),
                        { duration: 6000 },
                      );
                    }}
                    className="btn border border-dark-200 text-dark-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Pay Modal */}
      {showPayModal && sale && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700">
              <h3 className="font-bold text-dark dark:text-white">
                Record Payment
              </h3>
              <button
                onClick={() => setShowPayModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="p-3 bg-primary-light dark:bg-primary/10 rounded-xl space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-dark-400">Balance Due</span>
                  <span className="font-bold text-danger">
                    {fmt.naira(sale.balance)}
                  </span>
                </div>
              </div>
              <div>
                <label className="label">Amount Received (₦)</label>
                <input
                  type="number"
                  value={payAmt}
                  onChange={(e) => setPayAmt(e.target.value)}
                  placeholder={`Max: ${fmt.naira(sale.balance)}`}
                  className="input"
                />
              </div>
              <div>
                <label className="label">Method</label>
                <div className="grid grid-cols-2 gap-2">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setPayMethod(m.value)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border-2 transition-all ${
                        payMethod === m.value
                          ? "bg-primary-light border-primary text-primary"
                          : "border-dark-200 dark:border-gray-600 text-dark-400"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={handlePay}
                disabled={updating}
                className="btn btn-primary w-full py-3"
              >
                {updating ? (
                  "Recording..."
                ) : (
                  <>
                    <CheckCircle size={16} /> Record Payment
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefund && sale && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-end justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700">
              <h3 className="font-bold text-dark dark:text-white">
                Refund Sale
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
                  ⚠️ This will mark the sale as refunded
                </p>
                <p className="text-xs text-dark-500 mt-0.5">
                  Amount: {fmt.naira(sale.totalAmount)}
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
                onClick={handleRefund}
                disabled={updating}
                className="btn bg-danger text-white w-full py-3"
              >
                {updating ? (
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
