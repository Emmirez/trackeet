import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Calendar,
  FileText,
  ShoppingBag,
  Shield,
  Ban,
  UserCheck,
  ExternalLink,
  Store,
  Wifi,
  WifiOff,
  TrendingUp,
  Users,
  Package,
} from "lucide-react";
import { adminAPI } from "../../services/api.js";
import dayjs from "dayjs";
import toast from "react-hot-toast";

const fmt = (n) => "₦" + (n || 0).toLocaleString("en-NG");

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-user", id],
    queryFn: () => adminAPI.getUser(id).then((r) => r.data),
  });

  const { mutate: updateUser } = useMutation({
    mutationFn: (updates) => adminAPI.updateUser(id, updates),
    onSuccess: () => {
      toast.success("User updated");
      qc.invalidateQueries(["admin-user", id]);
      qc.invalidateQueries(["admin-users"]);
    },
    onError: () => toast.error("Failed to update"),
  });

  const u = data?.user;
  const invoices = data?.invoices || [];
  const sales = data?.sales || [];

  const planBadge = (plan) => {
    if (plan === "enterprise") return "bg-purple-100 text-purple-700 badge";
    if (plan === "business") return "badge-paid";
    if (plan === "starter") return "bg-primary-light text-primary badge";
    return "badge-draft";
  };

  const roleBadge = (role) => {
    if (role === "superadmin") return "badge-overdue";
    if (role === "admin") return "badge-pending";
    if (role === "support") return "badge-partial";
    return "badge-draft";
  };

  if (isLoading)
    return (
      <div className="space-y-4 animate-fade-in">
        <div className="skeleton h-10 w-40 rounded-xl" />
        <div className="skeleton h-48 rounded-2xl" />
        <div className="skeleton h-48 rounded-2xl" />
      </div>
    );

  if (!u)
    return (
      <div className="text-center py-20">
        <p className="text-dark-400">User not found</p>
      </div>
    );

  return (
    <div className="space-y-5 animate-fade-in max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn btn-ghost p-2">
          <ArrowLeft size={18} />
        </button>
        <h1 className="page-title">User Details</h1>
      </div>

      {/* Profile card */}
      <div className="card">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="w-16 h-16 rounded-2xl bg-primary text-white text-2xl font-black flex items-center justify-center flex-shrink-0">
            {u.firstName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-black text-dark dark:text-white">
                {u.firstName} {u.lastName}
              </h2>
              <span className={planBadge(u.plan)}>{u.plan || "free"}</span>
              <span className={roleBadge(u.role)}>{u.role}</span>
              {u.status === "suspended" && (
                <span className="badge-overdue">Suspended</span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <Mail size={14} /> {u.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <Phone size={14} /> {u.phone || "—"}
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <Building size={14} /> {u.businessName || "—"}
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <Calendar size={14} /> Joined{" "}
                {dayjs(u.createdAt).format("D MMM YYYY")}
              </div>
              {u.storeName && (
                <div className="flex items-center gap-2 text-sm text-primary">
                  <Store size={14} />

                  <a
                    href={`/store/${u.storeName}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline flex items-center gap-1"
                  >
                    gettrackeet.com/store/{u.storeName}
                    <ExternalLink size={10} />
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <Wifi
                  size={14}
                  className={data?.waConnected ? "text-success" : "text-danger"}
                />
                WhatsApp: {data?.waConnected ? "Connected" : "Not connected"}
              </div>
              <div className="flex items-center gap-2 text-sm text-dark-400">
                <TrendingUp size={14} />
                Revenue: {fmt(data?.totalRevenue || 0)}
              </div>
            </div>
          </div>

          {/* Actions */}
          {u.role !== "superadmin" && (
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() =>
                  updateUser({
                    status: u.status === "suspended" ? "active" : "suspended",
                  })
                }
                className={`btn btn-sm ${u.status === "suspended" ? "btn-secondary" : "border border-danger/30 text-danger hover:bg-danger-light"} flex items-center gap-1.5`}
              >
                {u.status === "suspended" ? (
                  <>
                    <UserCheck size={14} /> Unsuspend
                  </>
                ) : (
                  <>
                    <Ban size={14} /> Suspend
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
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
            label: "Invoices",
            value: u.invoiceCount || 0,
            icon: FileText,
            color: "text-primary",
            bg: "bg-primary-light",
          },
          {
            label: "Customers",
            value: data?.customerCount || 0,
            icon: Users,
            color: "text-warning",
            bg: "bg-warning-light",
          },
          {
            label: "Products",
            value: data?.productCount || 0,
            icon: Package,
            color: "text-purple-600",
            bg: "bg-purple-100",
          },
          {
            label: "Sales",
            value: sales.length,
            icon: ShoppingBag,
            color: "text-success",
            bg: "bg-success-light",
          },
          {
            label: "WhatsApp",
            value: data?.waConnected ? "Connected" : "Disconnected",
            icon: data?.waConnected ? Wifi : WifiOff,
            color: data?.waConnected ? "text-success" : "text-danger",
            bg: data?.waConnected ? "bg-success-light" : "bg-danger-light",
          },
          {
            label: "Store",
            value: u.storeActive ? "Active" : "Inactive",
            icon: Store,
            color: u.storeActive ? "text-success" : "text-danger",
            bg: u.storeActive ? "bg-success-light" : "bg-danger-light",
          },
          {
            label: "Category",
            value: u.businessCategory || "general",
            icon: Building,
            color: "text-warning",
            bg: "bg-warning-light",
          },
        ].map((s, i) => (
          <div key={i} className="card text-center py-4">
            <div
              className={`w-9 h-9 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}
            >
              <s.icon size={16} className={s.color} />
            </div>
            <p className={`text-lg font-black ${s.color} truncate`}>
              {s.value}
            </p>
            <p className="text-xs text-dark-400">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Invoices */}
      <div className="card p-0 overflow-hidden">
        <div className="p-4 border-b border-dark-100 dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-dark dark:text-white flex items-center gap-2">
            <FileText size={16} className="text-primary" /> Recent Invoices
          </h3>
          <span className="text-xs text-dark-400">{invoices.length} total</span>
        </div>
        {invoices.length === 0 ? (
          <div className="py-8 text-center text-dark-400 text-sm">
            No invoices yet
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {invoices.slice(0, 8).map((inv) => (
              <div
                key={inv._id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-dark dark:text-white">
                    {inv.invoiceNumber}
                  </p>
                  <p className="text-xs text-dark-400">
                    {dayjs(inv.createdAt).format("D MMM YYYY")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-dark dark:text-white">
                    {fmt(inv.totalAmount)}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      inv.status === "paid"
                        ? "bg-success-light text-success"
                        : inv.status === "overdue"
                          ? "bg-danger-light text-danger"
                          : inv.status === "partial"
                            ? "bg-warning-light text-warning"
                            : "bg-gray-100 text-dark-400"
                    }`}
                  >
                    {inv.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Sales */}
      {sales.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="p-4 border-b border-dark-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-dark dark:text-white flex items-center gap-2">
              <ShoppingBag size={16} className="text-success" /> Recent Sales
            </h3>
            <span className="text-xs text-dark-400">{sales.length} total</span>
          </div>
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {sales.slice(0, 8).map((sale) => (
              <div
                key={sale._id}
                className="flex items-center justify-between px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-dark dark:text-white">
                    {sale.saleNumber}
                  </p>
                  <p className="text-xs text-dark-400">
                    {dayjs(sale.createdAt).format("D MMM YYYY")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-dark dark:text-white">
                    {fmt(sale.totalAmount)}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sale.status === "paid"
                        ? "bg-success-light text-success"
                        : "bg-warning-light text-warning"
                    }`}
                  >
                    {sale.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
