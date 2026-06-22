import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCard,
  Search,
  TrendingUp,
  Banknote,
  Smartphone,
  Building2,
  DollarSign,
  Zap,
  ShoppingBag,
} from "lucide-react";
import { paymentAPI } from "../../services/api.js";
import { fmt, getInitials, avatarColor } from "../../utils/helpers.js";
import dayjs from "dayjs";

const METHOD_CONFIG = {
  bank_transfer: {
    label: "Bank Transfer",
    icon: Building2,
    color: "bg-primary-light text-primary",
  },
  cash: {
    label: "Cash",
    icon: Banknote,
    color: "bg-success-light text-success",
  },
  pos: {
    label: "POS",
    icon: CreditCard,
    color: "bg-warning-light text-warning",
  },
  paystack: {
    label: "Paystack",
    icon: Smartphone,
    color: "bg-[#e0f7fa] text-[#00C3F7]",
  },
  flutterwave: {
    label: "Flutterwave",
    icon: Smartphone,
    color: "bg-[#fff3e0] text-[#F5A623]",
  },
  crypto: {
    label: "Crypto",
    icon: DollarSign,
    color: "bg-purple-100 text-purple-600",
  },
  other: {
    label: "Other",
    icon: CreditCard,
    color: "bg-gray-100 text-dark-400",
  },
};

export default function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["payments"],
    queryFn: () => paymentAPI.getAll().then((r) => r.data),
  });

  const allPayments = data?.payments || [];

  const filtered = allPayments.filter((p) => {
    const name = p.customer?.name || p.saleNumber || "";
    const invNum = p.invoice?.invoiceNumber || p.saleNumber || "";
    const matchSearch =
      !search ||
      name.toLowerCase().includes(search.toLowerCase()) ||
      invNum.toLowerCase().includes(search.toLowerCase());
    const matchMethod = !methodFilter || p.method === methodFilter;
    const matchType = !typeFilter
      ? true
      : typeFilter === "sale"
        ? p.type === "sale"
        : typeFilter === "standard"
          ? p.type === "invoice" && !p.isQuick
          : typeFilter === "quick"
            ? p.type === "invoice" &&
              p.isQuick &&
              !["failed", "reversed"].includes(p.txStatus)
            : typeFilter === "failed"
              ? ["failed", "reversed"].includes(p.txStatus)
              : true;
    return matchSearch && matchMethod && matchType;
  });

  const totalReceived = allPayments
    .filter((p) => !["failed", "reversed"].includes(p.txStatus))
    .reduce((s, p) => s + (p.amount || 0), 0);

  const thisMonth = allPayments
    .filter(
      (p) =>
        dayjs(p.createdAt).isSame(dayjs(), "month") &&
        !["failed", "reversed"].includes(p.txStatus),
    )
    .reduce((s, p) => s + (p.amount || 0), 0);

  const STATS = [
    {
      label: "Total Received",
      value: fmt.naira(totalReceived),
      icon: TrendingUp,
      color: "bg-primary-light",
      iconColor: "text-primary",
    },
    {
      label: "This Month",
      value: fmt.naira(thisMonth),
      icon: CreditCard,
      color: "bg-success-light",
      iconColor: "text-success",
    },
    {
      label: "Total Transactions",
      value: String(allPayments.length),
      icon: Banknote,
      color: "bg-warning-light",
      iconColor: "text-warning",
    },
  ];

  const methods = [
    ...new Set(allPayments.map((p) => p.method).filter(Boolean)),
  ];

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="section-header">
        <h1 className="page-title">Payments</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {STATS.map((s, i) => (
          <div
            key={i}
            className="card rounded-3xl flex flex-col items-center text-center py-5"
          >
            <div
              className={`w-12 h-12 ${s.color} rounded-2xl flex items-center justify-center mb-3`}
            >
              <s.icon size={20} className={s.iconColor} />
            </div>
            <p className="text-base font-bold text-dark dark:text-white">
              {s.value}
            </p>
            <p className="text-xs text-dark-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer, invoice or sale..."
          className="input pl-10"
        />
      </div>

      {/* Type filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: "", label: "All" },
          { value: "standard", label: "📄 Standard" },
          { value: "quick", label: "⚡ Quick Record" },
          { value: "sale", label: "🛍️ Sales" },
          { value: "failed", label: "❌ Failed/Reversed" },
        ].map((t) => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`btn btn-sm flex-shrink-0 ${typeFilter === t.value ? "btn-primary" : "btn-ghost border border-dark-200 dark:border-gray-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Method filter */}
      {methods.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setMethodFilter("")}
            className={`btn btn-sm flex-shrink-0 ${!methodFilter ? "btn-primary" : "btn-ghost border border-dark-200 dark:border-gray-700"}`}
          >
            All Methods
          </button>
          {methods.map((m) => {
            const config = METHOD_CONFIG[m] || METHOD_CONFIG.other;
            return (
              <button
                key={m}
                onClick={() => setMethodFilter(m)}
                className={`btn btn-sm flex-shrink-0 capitalize ${methodFilter === m ? "btn-primary" : "btn-ghost border border-dark-200 dark:border-gray-700"}`}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Payments list */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-dark-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="font-semibold text-dark dark:text-white">
            Payment History
          </h2>
          {filtered.length > 0 && (
            <span className="text-xs text-dark-400">
              {filtered.length} transactions
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state py-12">
            <CreditCard size={48} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No payments found
            </p>
            <p className="text-dark-400 text-sm">
              Payments will appear here once recorded
            </p>
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {filtered.map((p) => {
              const config = METHOD_CONFIG[p.method] || METHOD_CONFIG.other;
              const MethodIcon = config.icon;
              const isSale = p.type === "sale";
              const customerName =
                p.customer?.name || (isSale ? "Walk-in" : "?");

              return (
                <div
                  key={p._id}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/20 transition-colors"
                >
                  {/* Avatar */}
                  <div
                    className={`avatar w-10 h-10 text-sm flex-shrink-0 ${avatarColor(customerName)}`}
                  >
                    {getInitials(customerName)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-sm font-semibold text-dark dark:text-white truncate">
                        {customerName}
                      </p>
                      {isSale && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary-light text-primary flex-shrink-0">
                          <ShoppingBag size={8} /> Sale
                        </span>
                      )}
                      {!isSale && p.isQuick && (
                        <span className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-warning-light text-warning flex-shrink-0">
                          <Zap size={8} /> Quick
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-dark-400 truncate">
                      {isSale && p.saleNumber && (
                        <span className="mr-1">{p.saleNumber} ·</span>
                      )}
                      {!isSale && p.invoice?.invoiceNumber && (
                        <span className="mr-1">
                          {p.invoice.invoiceNumber} ·
                        </span>
                      )}
                      {fmt.date(p.createdAt || p.paidAt)}
                    </p>
                  </div>

                  {/* Method badge */}
                  <div
                    className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${config.color}`}
                  >
                    <MethodIcon size={11} />
                    {config.label}
                  </div>

                  {/* Amount + status */}
                  <div className="text-right flex-shrink-0">
                    <p
                      className={`font-bold ${
                        p.txStatus === "failed"
                          ? "text-danger line-through"
                          : p.txStatus === "reversed"
                            ? "text-purple-600 line-through"
                            : "text-dark dark:text-white"
                      }`}
                    >
                      {fmt.naira(p.amount)}
                    </p>
                    {p.txStatus === "failed" ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-danger-light text-danger">
                        ❌ Failed
                      </span>
                    ) : p.txStatus === "reversed" ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-600">
                        ↩️ Reversed
                      </span>
                    ) : p.txStatus === "pending" ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-warning-light text-warning">
                        ⏳ Pending
                      </span>
                    ) : isSale ? (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          p.status === "paid"
                            ? "bg-success-light text-success"
                            : p.status === "partial"
                              ? "bg-warning-light text-warning"
                              : "bg-gray-100 text-dark-400"
                        }`}
                      >
                        {p.status}
                      </span>
                    ) : p.isQuick ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-warning-light text-warning">
                        ⚡ Quick
                      </span>
                    ) : (
                      <span className="badge-paid text-[10px]">Received</span>
                    )}
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
