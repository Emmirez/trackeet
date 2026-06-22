import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Users,
  UserPlus,
  Trash2,
  Crown,
  Shield,
  User,
  X,
  Check,
  Mail,
  ChevronDown,
} from "lucide-react";
import { teamAPI } from "../../services/api.js";
import useAuthStore from "../../store/authStore.js";
import { getInitials, avatarColor } from "../../utils/helpers.js";
import toast from "react-hot-toast";

const ROLE_COLORS = {
  manager: "bg-primary-light text-primary",
  staff: "bg-gray-100 dark:bg-gray-800 text-dark-400",
};

const STATUS_COLORS = {
  active: "bg-success-light text-success",
  pending: "bg-warning-light text-warning",
  suspended: "bg-danger-light text-danger",
};

const PLAN_LIMITS = {
  free: 0,
  starter: 0,
  business: 3,
  enterprise: 999,
};

export default function TeamPage() {
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("staff");

  const limit = PLAN_LIMITS[user?.plan] ?? 0;
  //   const canInvite = limit > 0;
  const canInvite = true;

  const { data, isLoading } = useQuery({
    queryKey: ["team"],
    queryFn: () => teamAPI.getTeam().then((r) => r.data),
  });

  const members = data?.members || [];
  const activeMembers = members.filter((m) => m.status !== "suspended");

  const { mutate: invite, isPending: inviting } = useMutation({
    mutationFn: teamAPI.inviteMember,
    onSuccess: (res) => {
      qc.invalidateQueries(["team"]);
      setShowInvite(false);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("staff");

      if (res.data.inviteLink) {
        toast(
          (t) => (
            <div className="space-y-2">
              <p className="text-sm font-semibold">✅ Invitation created!</p>
              <p className="text-xs text-dark-400">
                📧 An email has been sent to <strong>{inviteEmail}</strong>
              </p>
              <p className="text-xs text-dark-400">
                If they don't receive it, copy and send this link manually:
              </p>
              <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                <p className="text-xs text-primary font-mono flex-1 break-all">
                  {res.data.inviteLink}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(res.data.inviteLink);
                    toast.success("Copied!");
                  }}
                  className="px-2 py-1 bg-primary text-white text-xs rounded-lg flex-shrink-0"
                >
                  Copy
                </button>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full py-1.5 bg-gray-100 text-dark text-xs font-semibold rounded-lg"
              >
                Done
              </button>
            </div>
          ),
          { duration: Infinity },
        );
      }
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to invite"),
  });

  const { mutate: update } = useMutation({
    mutationFn: ({ id, data }) => teamAPI.updateMember(id, data),
    onSuccess: () => {
      toast.success("Updated!");
      qc.invalidateQueries(["team"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to update"),
  });

  const { mutate: remove } = useMutation({
    mutationFn: teamAPI.removeMember,
    onSuccess: () => {
      toast.success("Member removed", { duration: 2000 });
      qc.invalidateQueries(["team"]);
    },
    onError: (err) =>
      toast.error(err.response?.data?.message || "Failed to remove"),
  });

  const handleInvite = () => {
    if (!inviteName.trim()) return toast.error("Enter member name");
    if (!inviteEmail.trim()) return toast.error("Enter email address");
    if (!/\S+@\S+\.\S+/.test(inviteEmail))
      return toast.error("Enter a valid email");
    invite({ name: inviteName, email: inviteEmail, role: inviteRole });
  };

  const handleRemove = (member) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold">Remove {member.name}?</p>
          <p className="text-xs text-dark-400">
            They will lose access to your account.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                remove(member._id);
                toast.dismiss(t.id);
              }}
              className="px-3 py-1 bg-danger text-white text-xs font-bold rounded-lg"
            >
              Remove
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
      { duration: 3000 },
    );
  };

  return (
    <div className="space-y-5 animate-fade-in max-w-2xl mx-auto">
      <div className="section-header">
        <h1 className="page-title">Team Members</h1>
        {canInvite && activeMembers.length < limit && (
          <button
            onClick={() => setShowInvite(true)}
            className="btn btn-primary btn-sm"
          >
            <UserPlus size={16} /> Invite Member
          </button>
        )}
      </div>

      {/* Plan info */}
      {!canInvite ? (
        <div className="card bg-gradient-to-br from-primary/10 to-purple-50 dark:from-primary/10 dark:to-purple-900/10 border border-primary/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0">
              <Crown size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-dark dark:text-white">
                Upgrade to Add Team Members
              </h2>
              <p className="text-dark-400 text-sm">
                Team members are available on Business and Enterprise plans.
                Invite your staff to collaborate.
              </p>
            </div>
            <a
              href="/dashboard/subscription"
              className="btn btn-primary btn-sm flex-shrink-0"
            >
              Upgrade
            </a>
          </div>
        </div>
      ) : (
        <div className="card bg-primary-light dark:bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users size={18} className="text-primary" />
              <p className="text-sm font-semibold text-dark dark:text-white">
                {activeMembers.length} / {limit === 999 ? "Unlimited" : limit}{" "}
                team members used
              </p>
            </div>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${i < activeMembers.length ? "bg-primary" : "bg-primary/20"}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Owner card */}
      <div className="card">
        <h2 className="font-semibold text-dark dark:text-white mb-4">
          Account Owner
        </h2>
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark rounded-xl">
          <div
            className={`avatar w-10 h-10 text-sm ${avatarColor(user?.firstName || "")}`}
          >
            {getInitials(`${user?.firstName} ${user?.lastName}`)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-dark dark:text-white">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-dark-400">{user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full bg-warning-light text-warning">
              <Crown size={10} /> Owner
            </span>
          </div>
        </div>
      </div>

      {/* Team members */}
      <div className="card">
        <h2 className="font-semibold text-dark dark:text-white mb-4">
          Team Members {members.length > 0 && `(${members.length})`}
        </h2>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="empty-state py-8">
            <Users size={40} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No team members yet
            </p>
            <p className="text-dark-400 text-sm">
              Invite your staff to collaborate on invoices
            </p>
            {canInvite && (
              <button
                onClick={() => setShowInvite(true)}
                className="btn btn-primary btn-sm mt-2"
              >
                <UserPlus size={14} /> Invite First Member
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member._id}
                className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark rounded-xl group"
              >
                <div
                  className={`avatar w-10 h-10 text-sm ${avatarColor(member.name)}`}
                >
                  {getInitials(member.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-dark dark:text-white">
                      {member.name}
                    </p>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[member.role]}`}
                    >
                      {member.role}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[member.status]}`}
                    >
                      {member.status}
                    </span>
                  </div>
                  <p className="text-xs text-dark-400">{member.email}</p>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Toggle role */}
                  <button
                    onClick={() =>
                      update({
                        id: member._id,
                        data: {
                          role: member.role === "manager" ? "staff" : "manager",
                        },
                      })
                    }
                    className="text-xs px-2 py-1 rounded-lg bg-primary-light text-primary font-semibold hover:bg-primary hover:text-white transition-colors"
                    title="Toggle role"
                  >
                    {member.role === "manager" ? "Make Staff" : "Make Manager"}
                  </button>
                  {/* Suspend/Activate */}
                  <button
                    onClick={() =>
                      update({
                        id: member._id,
                        data: {
                          status:
                            member.status === "active" ? "suspended" : "active",
                        },
                      })
                    }
                    className={`text-xs px-2 py-1 rounded-lg font-semibold transition-colors ${
                      member.status === "active"
                        ? "bg-warning-light text-warning hover:bg-warning hover:text-white"
                        : "bg-success-light text-success hover:bg-success hover:text-white"
                    }`}
                  >
                    {member.status === "active" ? "Suspend" : "Activate"}
                  </button>
                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(member)}
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

      {/* Role permissions guide */}
      <div className="card">
        <h2 className="font-semibold text-dark dark:text-white mb-4">
          Role Permissions
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-200 dark:border-gray-700">
                <th className="text-left py-2 text-dark-400 font-semibold text-xs">
                  Permission
                </th>
                <th className="text-center py-2 text-warning font-semibold text-xs">
                  <Crown size={12} className="inline mr-1" />
                  Owner
                </th>
                <th className="text-center py-2 text-primary font-semibold text-xs">
                  <Shield size={12} className="inline mr-1" />
                  Manager
                </th>
                <th className="text-center py-2 text-dark-400 font-semibold text-xs">
                  <User size={12} className="inline mr-1" />
                  Staff
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-100 dark:divide-gray-800">
              {[
                {
                  perm: "Create invoices",
                  owner: true,
                  manager: true,
                  staff: true,
                },
                {
                  perm: "View all invoices",
                  owner: true,
                  manager: true,
                  staff: true,
                },
                {
                  perm: "Mark invoices paid",
                  owner: true,
                  manager: true,
                  staff: false,
                },
                {
                  perm: "Delete invoices",
                  owner: true,
                  manager: true,
                  staff: false,
                },
                {
                  perm: "Manage customers",
                  owner: true,
                  manager: true,
                  staff: true,
                },
                {
                  perm: "View reports",
                  owner: true,
                  manager: true,
                  staff: false,
                },
                {
                  perm: "WhatsApp automation",
                  owner: true,
                  manager: false,
                  staff: false,
                },
                {
                  perm: "Manage team members",
                  owner: true,
                  manager: false,
                  staff: false,
                },
                {
                  perm: "Billing & subscription",
                  owner: true,
                  manager: false,
                  staff: false,
                },
                {
                  perm: "Business settings",
                  owner: true,
                  manager: false,
                  staff: false,
                },
              ].map((row, i) => (
                <tr key={i}>
                  <td className="py-2.5 text-dark-500 dark:text-gray-400 text-xs">
                    {row.perm}
                  </td>
                  <td className="py-2.5 text-center">
                    {row.owner ? (
                      <Check size={14} className="text-success mx-auto" />
                    ) : (
                      <X size={14} className="text-danger mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    {row.manager ? (
                      <Check size={14} className="text-success mx-auto" />
                    ) : (
                      <X size={14} className="text-danger mx-auto" />
                    )}
                  </td>
                  <td className="py-2.5 text-center">
                    {row.staff ? (
                      <Check size={14} className="text-success mx-auto" />
                    ) : (
                      <X size={14} className="text-danger mx-auto" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-dark-200 dark:border-gray-700">
              <div>
                <h3 className="font-bold text-dark dark:text-white">
                  Invite Team Member
                </h3>
                <p className="text-xs text-dark-400">
                  They'll receive an invite link to join your account
                </p>
              </div>
              <button
                onClick={() => setShowInvite(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="label">Full Name *</label>
                <input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="e.g. Amaka Obi"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Email Address *</label>
                <input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  type="email"
                  placeholder="amaka@example.com"
                  className="input"
                />
              </div>
              <div>
                <label className="label">Role *</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      value: "staff",
                      label: "👤 Staff",
                      desc: "Create invoices only",
                    },
                    {
                      value: "manager",
                      label: "🛡️ Manager",
                      desc: "Full access except settings",
                    },
                  ].map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setInviteRole(r.value)}
                      className={`py-3 px-3 rounded-xl text-sm font-semibold border-2 transition-all text-left
                        ${inviteRole === r.value ? "bg-primary-light text-primary border-primary/30" : "border-dark-200 dark:border-gray-600 text-dark-400"}`}
                    >
                      <p>{r.label}</p>
                      <p className="text-[10px] font-normal opacity-70 mt-0.5">
                        {r.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-warning-light rounded-xl">
                <p className="text-xs font-semibold text-warning">
                  📋 How it works
                </p>
                <p className="text-xs text-dark-500 mt-0.5">
                  An invite link will be generated. Share it with your team
                  member — they'll create an account and get access to your
                  business data.
                </p>
              </div>

              <button
                onClick={handleInvite}
                disabled={inviting}
                className="btn btn-primary w-full py-3"
              >
                {inviting ? (
                  "Sending..."
                ) : (
                  <>
                    <Mail size={16} /> Send Invitation
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
