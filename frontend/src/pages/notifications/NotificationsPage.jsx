import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  CreditCard,
  FileText,
  MessageSquare,
  AlertCircle,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { notificationAPI } from "../../services/api.js";
import { fmt } from "../../utils/helpers.js";
import toast from "react-hot-toast";

const ICONS = {
  payment: CreditCard,
  invoice: FileText,
  whatsapp: MessageSquare,
  system: AlertCircle,
};

export default function NotificationsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationAPI.getAll().then((r) => r.data),
  });

  const { mutate: markAll } = useMutation({
    mutationFn: notificationAPI.markAllRead,
    onSuccess: () => {
      toast.success("All marked as read");
      qc.invalidateQueries(["notifications"]);
    },
  });

  const { mutate: deleteOne } = useMutation({
    mutationFn: (id) => notificationAPI.delete(id),
    onSuccess: () => qc.invalidateQueries(["notifications"]),
  });

  const { mutate: deleteAllRead } = useMutation({
    mutationFn: notificationAPI.deleteAllRead,
    onSuccess: () => {
      toast.success("Read notifications cleared");
      qc.invalidateQueries(["notifications"]);
    },
  });

  const { mutate: markRead } = useMutation({
    mutationFn: (id) => notificationAPI.markRead(id),
    onSuccess: () => qc.invalidateQueries(["notifications"]),
  });

  const notifs = data?.notifications || [];
  const hasRead = notifs.some((n) => n.read);
  const unread = data?.unread || 0;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="page-title"></h1>
          {unread > 0 && (
            <p className="text-sm text-dark-400">{unread} unread</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              onClick={() => markAll()}
              className="btn btn-ghost btn-sm text-primary border border-primary/30"
            >
              <CheckCheck size={15} /> Mark all read
            </button>
          )}
          {hasRead && (
            <button
              onClick={() => deleteAllRead()}
              className="btn btn-ghost btn-sm text-danger border border-danger/30"
            >
              <Trash2 size={15} /> Clear read
            </button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : notifs.length === 0 ? (
          <div className="empty-state py-12">
            <Bell size={48} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No notifications
            </p>
            <p className="text-dark-400 text-sm">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-100 dark:divide-gray-700/30">
            {notifs.map((n) => {
              const Icon = ICONS[n.type] || Bell;
              return (
                <div
                  key={n._id}
                  className={`flex items-start gap-3 p-4 transition-colors group
                    ${!n.read ? "bg-primary-50 dark:bg-primary/5 hover:bg-primary-100 dark:hover:bg-primary/10" : "hover:bg-gray-50 dark:hover:bg-gray-800/20"}`}
                >
                  {/* Icon */}
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
                    ${!n.read ? "bg-primary-light" : "bg-gray-100 dark:bg-gray-800"}`}
                  >
                    <Icon
                      size={18}
                      className={!n.read ? "text-primary" : "text-dark-400"}
                    />
                  </div>

                  {/* Content */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => !n.read && markRead(n._id)}
                  >
                    <p
                      className={`text-sm ${!n.read ? "font-semibold text-dark dark:text-white" : "font-medium text-dark-500 dark:text-gray-400"}`}
                    >
                      {n.title}
                    </p>
                    <p className="text-xs text-dark-400 mt-0.5 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-dark-300 mt-1">
                      {fmt.relative(n.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.read && (
                      <button
                        onClick={() => markRead(n._id)}
                        title="Mark as read"
                        className="p-1.5 rounded-lg hover:bg-success-light text-dark-300 hover:text-success transition-colors"
                      >
                        <CheckCircle size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => deleteOne(n._id)}
                      title="Delete"
                      className="p-1.5 rounded-lg hover:bg-danger-light text-dark-300 hover:text-danger transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2 group-hover:opacity-0 transition-opacity" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
