import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Users,
  Shield,
  Ban,
  UserCheck,
  ChevronDown,
  Check,
  Eye,
  Download,
} from "lucide-react";
import { adminAPI } from "../../services/api.js";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { createPortal } from "react-dom";
import { useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore.js";

const ROLES = [
  { value: "", label: "All Roles" },
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "support", label: "Support" },
];

function RoleSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = ROLES.find((r) => r.value === value) || ROLES[0];

  return (
    <div className="relative w-40" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-left flex items-center justify-between transition-all bg-white dark:bg-surface dark:text-gray-100
          ${open ? "border-primary ring-2 ring-primary/20" : "border-dark-200 dark:border-gray-600"}`}
      >
        <span className="font-medium">{selected.label}</span>
        <ChevronDown
          size={15}
          className={`text-dark-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface border border-dark-200 dark:border-gray-700 rounded-2xl shadow-xl z-20 overflow-hidden animate-slide-up">
            {ROLES.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => {
                  onChange(role.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-all hover:bg-primary-light dark:hover:bg-primary/10 hover:text-primary
                  ${value === role.value ? "bg-primary-light dark:bg-primary/10 text-primary font-semibold" : "text-dark dark:text-gray-300"}`}
              >
                <span>{role.label}</span>
                {value === role.value && (
                  <Check size={14} className="text-primary flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const USER_ROLES = [
  { value: "user", label: "User", color: "text-dark-400" },
  { value: "support", label: "Support", color: "text-primary" },
  { value: "admin", label: "Admin", color: "text-warning" },
];

function UserRoleSelect({ currentRole, onChange }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const btnRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 4,
        left: rect.right - 128, // 128 = w-32, align to right edge of button
      });
    }
    setOpen((v) => !v);
  };

  return (
    <div ref={ref}>
      <button
        ref={btnRef}
        type="button"
        onClick={handleOpen}
        title="Change role"
        className="btn btn-ghost p-1.5 text-warning hover:bg-warning-light flex items-center gap-1"
      >
        <Shield size={14} />
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
              onMouseDown={() => setOpen(false)}
            />
            <div
              className="fixed w-32 bg-white dark:bg-surface border border-dark-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden"
              style={{ top: pos.top, left: pos.left }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 border-b border-dark-100 dark:border-gray-700">
                <p className="text-[10px] font-bold text-dark-400 uppercase">
                  Set Role
                </p>
              </div>
              {USER_ROLES.map((role) => (
                <button
                  key={role.value}
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    onChange(role.value);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left hover:bg-primary-light dark:hover:bg-primary/10 hover:text-primary transition-all
              ${currentRole === role.value ? "font-bold text-primary bg-primary-light dark:bg-primary/10" : "text-dark dark:text-gray-300"}`}
                >
                  <span>{role.label}</span>
                  {currentRole === role.value && (
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

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const qc = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, roleFilter],
    queryFn: () =>
      adminAPI.getUsers({ search, role: roleFilter }).then((r) => r.data),
  });

  const { mutate: updateUser } = useMutation({
    mutationFn: ({ id, updates }) => adminAPI.updateUser(id, updates),
    onSuccess: () => {
      toast.success("Updated successfully");
      qc.invalidateQueries(["admin-users"]);
    },
    onError: () => toast.error("Failed to update"),
  });

  const users = data?.users || [];

  const { user: authUser } = useAuthStore();
  const isSuperAdmin = authUser?.role === "superadmin";

  const handleExport = async () => {
    try {
      const res = await adminAPI.exportUsers();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `trackeet-users-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Users exported!");
    } catch {
      toast.error("Failed to export");
    }
  };

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

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="section-header">
        <h1 className="page-title">
          Users{" "}
          <span className="text-dark-400 font-normal text-base">
            ({data?.total || 0})
          </span>
        </h1>
        {isSuperAdmin && (
          <button
            onClick={handleExport}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Download size={16} /> Export CSV
          </button>
        )}
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-400"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="input pl-10"
          />
        </div>
        <RoleSelect value={roleFilter} onChange={setRoleFilter} />
      </div>

      <div className="card p-0">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-white/5 border-b border-dark-200 dark:border-gray-700">
                <tr>
                  <th className="th">User</th>
                  <th className="th">Plan</th>
                  <th className="th">Role</th>
                  <th className="th">Invoices</th>
                  <th className="th">Joined</th>
                  <th className="th">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="td text-center text-dark-400 py-10"
                    >
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="tr">
                      <td className="td">
                        <div className="flex items-center gap-3">
                          <div className="avatar w-9 h-9 bg-primary text-white text-sm flex-shrink-0">
                            {u.firstName?.[0]}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-dark dark:text-white text-sm truncate">
                              {u.firstName} {u.lastName}
                            </p>
                            <p className="text-xs text-dark-400 truncate">
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="td">
                        <span className={planBadge(u.plan)}>
                          {u.plan || "free"}
                        </span>
                      </td>
                      <td className="td">
                        <span className={roleBadge(u.role)}>{u.role}</span>
                      </td>
                      <td className="td font-semibold">
                        {u.invoiceCount || 0}
                      </td>
                      <td className="td text-dark-400">
                        {dayjs(u.createdAt).format("D MMM YY")}
                      </td>
                      <td className="td">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => navigate(`/admin/users/${u._id}`)}
                            title="View Details"
                            className="btn btn-ghost p-1.5 hover:text-primary"
                          >
                            <Eye size={14} />
                          </button>
                          {u.role !== "superadmin" && (
                            <UserRoleSelect
                              currentRole={u.role}
                              onChange={(role) =>
                                updateUser({ id: u._id, updates: { role } })
                              }
                            />
                          )}
                          <button
                            onClick={() =>
                              updateUser({
                                id: u._id,
                                updates: {
                                  status:
                                    u.status === "suspended"
                                      ? "active"
                                      : "suspended",
                                },
                              })
                            }
                            title={
                              u.status === "suspended" ? "Unsuspend" : "Suspend"
                            }
                            className="btn btn-ghost p-1.5 hover:text-danger"
                          >
                            {u.status === "suspended" ? (
                              <UserCheck size={14} className="text-success" />
                            ) : (
                              <Ban size={14} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
