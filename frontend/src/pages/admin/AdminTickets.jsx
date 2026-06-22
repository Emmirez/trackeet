import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ticket, MessageSquare, Send, X, UserCheck } from "lucide-react";
import { adminAPI } from "../../services/api.js";
import dayjs from "dayjs";
import toast from "react-hot-toast";

export default function AdminTickets() {
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-tickets"],
    queryFn: () => adminAPI.getTickets().then((r) => r.data),
  });

  const { mutate: sendReply, isPending } = useMutation({
    mutationFn: ({ id, message }) => adminAPI.replyTicket(id, { message }),
    onSuccess: (res) => {
      toast.success("Reply sent");
      qc.invalidateQueries(["admin-tickets"]);
      setReply("");
      setSelected(res.data.ticket);
    },
  });

  const { mutate: resolveTicket } = useMutation({
    mutationFn: (id) => adminAPI.resolveTicket(id),
    onSuccess: (res) => {
      toast.success("Ticket resolved");
      qc.invalidateQueries(["admin-tickets"]);
      setSelected(res.data.ticket);
    },
  });

  const tickets = data?.tickets || [];
  const openCount = tickets.filter((t) => t.status !== "resolved").length;

  const ticketBorderClass = (t) => {
    if (selected?._id === t._id)
      return "card border-2 border-primary w-full text-left hover:shadow-glow-sm transition-all";
    return "card border border-dark-200 dark:border-gray-700 w-full text-left hover:shadow-glow-sm transition-all";
  };

  const msgClass = (sender) => {
    if (sender === "admin")
      return "max-w-xs px-4 py-2 rounded-2xl text-sm bg-primary text-white";
    return "max-w-xs px-4 py-2 rounded-2xl text-sm bg-gray-100 dark:bg-gray-800 text-dark dark:text-white";
  };

  const statusBadge = (status) => {
    if (status === "resolved") return "badge-paid";
    if (status === "open") return "badge-pending";
    return "badge-partial";
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="section-header">
        <h1 className="page-title">Support Tickets</h1>
        <span className="badge-overdue">{openCount} open</span>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-2xl" />
            ))
          ) : tickets.length === 0 ? (
            <div className="empty-state py-10">
              <Ticket size={40} className="text-dark-200" />
              <p className="text-dark-400">No tickets</p>
            </div>
          ) : (
            tickets.map((t) => (
              <button
                key={t._id}
                onClick={() => setSelected(t)}
                className={ticketBorderClass(t)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="font-semibold text-sm text-dark dark:text-white line-clamp-1">
                    {t.subject}
                  </p>
                  <span className={statusBadge(t.status)}>{t.status}</span>
                </div>
                <p className="text-xs text-dark-400">
                  {t.user?.firstName} {t.user?.lastName} ·{" "}
                  {dayjs(t.createdAt).fromNow()}
                </p>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-3">
          {!selected ? (
            <div className="card empty-state py-16">
              <MessageSquare size={40} className="text-dark-200" />
              <p className="text-dark-400">Select a ticket to reply</p>
            </div>
          ) : (
            <div className="card space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-dark dark:text-white">
                    {selected.subject}
                  </h3>
                  <p className="text-xs text-dark-400">
                    From: {selected.user?.firstName} {selected.user?.lastName} (
                    {selected.user?.email})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {selected.status !== "resolved" && (
                    <button
                      onClick={() => resolveTicket(selected._id)}
                      className="btn btn-sm bg-success-light text-success hover:bg-success hover:text-white transition-all flex items-center gap-1"
                    >
                      <UserCheck size={14} /> Resolve
                    </button>
                  )}
                  <button
                    onClick={() => setSelected(null)}
                    className="btn btn-ghost p-1.5"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {(
                  selected.messages || [
                    {
                      sender: "user",
                      message: selected.message,
                      createdAt: selected.createdAt,
                    },
                  ]
                ).map((m, i) => (
                  <div
                    key={i}
                    className={
                      m.sender === "admin"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >
                    <div className={msgClass(m.sender)}>
                      <p>{m.message}</p>
                      <p
                        className={
                          m.sender === "admin"
                            ? "text-[10px] mt-1 text-white/60"
                            : "text-[10px] mt-1 text-dark-400"
                        }
                      >
                        {dayjs(m.createdAt).format("h:mm A")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2 border-t border-dark-200 dark:border-gray-700">
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder="Type your reply..."
                  className="input flex-1"
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    reply.trim() &&
                    sendReply({ id: selected._id, message: reply })
                  }
                />
                <button
                  onClick={() =>
                    sendReply({ id: selected._id, message: reply })
                  }
                  disabled={!reply.trim() || isPending}
                  className="btn btn-primary px-4"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
