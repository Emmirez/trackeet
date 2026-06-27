import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Ticket,
  Plus,
  ChevronDown,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Check,
} from "lucide-react";
import api from "../../services/api.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
dayjs.extend(relativeTime);

const STATUS_CONFIG = {
  open: { label: "Open", color: "bg-warning-light text-warning" },
  pending: { label: "Pending", color: "bg-primary-light text-primary" },
  resolved: { label: "Resolved", color: "bg-success-light text-success" },
  closed: { label: "Closed", color: "bg-gray-100 text-dark-400" },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "bg-gray-100 text-dark-400" },
  medium: { label: "Medium", color: "bg-warning-light text-warning" },
  high: { label: "High", color: "bg-danger-light text-danger" },
};

const PRIORITIES = [
  { value: "low", label: "Low", color: "text-dark-400" },
  { value: "medium", label: "Medium", color: "text-warning" },
  { value: "high", label: "High", color: "text-danger" },
];

function PrioritySelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = PRIORITIES.find((p) => p.value === value) || PRIORITIES[1];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full px-4 py-3 rounded-xl border text-sm text-left flex items-center justify-between transition-all bg-white dark:bg-surface
          ${open ? "border-primary ring-2 ring-primary/20" : "border-dark-200 dark:border-gray-600"}`}
      >
        <span className={`font-medium ${selected.color}`}>
          {selected.label}
        </span>
        <ChevronDown
          size={15}
          className={`text-dark-400 transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-surface border border-dark-200 dark:border-gray-700 rounded-2xl shadow-xl z-20 overflow-hidden">
            {PRIORITIES.map((p) => (
              <button
                key={p.value}
                type="button"
                onClick={() => {
                  onChange(p.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-all hover:bg-primary-light dark:hover:bg-primary/10 hover:text-primary
                  ${value === p.value ? "bg-primary-light dark:bg-primary/10 font-semibold" : ""}`}
              >
                <span className={value === p.value ? "text-primary" : p.color}>
                  {p.label}
                </span>
                {value === p.value && (
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

export default function TicketsPage() {
  const qc = useQueryClient();
  const [showNew, setShowNew] = useState(false);
  const [activeTicket, setActiveTicket] = useState(null);
  const [form, setForm] = useState({
    subject: "",
    message: "",
    priority: "medium",
  });
  const [reply, setReply] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["tickets"],
    queryFn: () => api.get("/tickets").then((r) => r.data),
  });

  const tickets = data?.tickets || [];

  const { mutate: createTicket, isPending: creating } = useMutation({
    mutationFn: (data) => api.post("/tickets", data),
    onSuccess: () => {
      qc.invalidateQueries(["tickets"]);
      setShowNew(false);
      setForm({ subject: "", message: "", priority: "medium" });
    },
  });

  const { mutate: sendReply, isPending: replying } = useMutation({
    mutationFn: ({ id, message }) =>
      api.post(`/tickets/${id}/reply`, { message }),
    onSuccess: (res) => {
      qc.invalidateQueries(["tickets"]);
      setActiveTicket(res.data.ticket);
      setReply("");
    },
  });

  const handleCreate = (e) => {
    e.preventDefault();
    createTicket(form);
  };

  const handleReply = (e) => {
    e.preventDefault();
    if (!reply.trim()) return;
    sendReply({ id: activeTicket._id, message: reply });
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="section-header">
        <div>
          <h1 className="page-title">Support Tickets</h1>
          <p className="text-sm text-dark-400">
            Get help from our support team
          </p>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="btn btn-primary btn-sm flex-shrink-0"
        >
          <Plus size={16} /> New Ticket
        </button>
      </div>

      {/* New Ticket Modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-gray-700">
              <h2 className="text-lg font-bold text-dark dark:text-white">
                Open a Support Ticket
              </h2>
              <button
                onClick={() => setShowNew(false)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="input-label">Subject</label>
                <input
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  className="input"
                  placeholder="e.g. WhatsApp not connecting"
                  required
                />
              </div>
              <div>
                <label className="input-label">Priority</label>
                <PrioritySelect
                  value={form.priority}
                  onChange={(val) => setForm({ ...form, priority: val })}
                />
              </div>
              <div>
                <label className="input-label">Message</label>
                <textarea
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="input resize-none"
                  rows={4}
                  placeholder="Describe your issue in detail..."
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNew(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="btn btn-primary flex-shrink-0"
                >
                  {creating ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send size={15} /> Submit Ticket
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Ticket Detail Modal */}
      {activeTicket && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-dark-200 dark:border-gray-700">
              <div>
                <h2 className="text-base font-bold text-dark dark:text-white">
                  {activeTicket.subject}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_CONFIG[activeTicket.status]?.color}`}
                  >
                    {STATUS_CONFIG[activeTicket.status]?.label}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${PRIORITY_CONFIG[activeTicket.priority]?.color}`}
                  >
                    {PRIORITY_CONFIG[activeTicket.priority]?.label}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveTicket(null)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={18} className="text-dark-400" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Original message */}
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-primary text-white rounded-2xl rounded-tr-sm px-4 py-3">
                  <p className="text-sm leading-relaxed">
                    {activeTicket.message}
                  </p>
                  <p className="text-[10px] opacity-70 mt-1 text-right">
                    {dayjs(activeTicket.createdAt).fromNow()}
                  </p>
                </div>
              </div>

              {/* Replies */}
              {(activeTicket.messages || []).map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.sender === "user"
                        ? "bg-primary text-white rounded-tr-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-dark dark:text-white rounded-tl-sm"
                    }`}
                  >
                    {msg.sender === "support" && (
                      <p className="text-[10px] font-bold text-primary mb-1">
                        Support Team
                      </p>
                    )}
                    <p className="text-sm leading-relaxed">{msg.message}</p>
                    <p
                      className={`text-[10px] mt-1 ${msg.sender === "user" ? "opacity-70 text-right" : "text-dark-400"}`}
                    >
                      {dayjs(msg.createdAt).fromNow()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply input */}
            {activeTicket.status !== "resolved" &&
              activeTicket.status !== "closed" && (
                <form
                  onSubmit={handleReply}
                  className="p-4 border-t border-dark-200 dark:border-gray-700 flex gap-3"
                >
                  <input
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    className="input flex-1"
                    placeholder="Type your reply..."
                  />
                  <button
                    type="submit"
                    disabled={replying || !reply.trim()}
                    className="btn btn-primary px-4"
                  >
                    <Send size={16} />
                  </button>
                </form>
              )}
          </div>
        </div>
      )}

      {/* Tickets list */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-20 rounded-xl" />
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="empty-state py-16">
            <Ticket size={48} className="text-dark-200" />
            <p className="font-semibold text-dark dark:text-white">
              No tickets yet
            </p>
            <p className="text-dark-400 text-sm">
              Open a ticket if you need help
            </p>
            <button
              onClick={() => setShowNew(true)}
              className="btn btn-primary btn-sm mt-2"
            >
              <Plus size={15} /> New Ticket
            </button>
          </div>
        ) : (
          tickets.map((ticket, i) => (
            <div
              key={ticket._id}
              onClick={() => setActiveTicket(ticket)}
              className="flex items-start gap-4 px-4 py-4 border-b border-dark-100 dark:border-gray-700/30 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/20 cursor-pointer transition-colors"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5
                ${ticket.status === "resolved" ? "bg-success-light" : ticket.status === "open" ? "bg-warning-light" : "bg-primary-light"}`}
              >
                {ticket.status === "resolved" ? (
                  <CheckCircle size={18} className="text-success" />
                ) : ticket.status === "open" ? (
                  <AlertCircle size={18} className="text-warning" />
                ) : (
                  <Clock size={18} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-sm font-semibold text-dark dark:text-white truncate">
                    {ticket.subject}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_CONFIG[ticket.status]?.color}`}
                  >
                    {STATUS_CONFIG[ticket.status]?.label}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${PRIORITY_CONFIG[ticket.priority]?.color}`}
                  >
                    {PRIORITY_CONFIG[ticket.priority]?.label}
                  </span>
                </div>
                <p className="text-xs text-dark-400 truncate">
                  {ticket.message}
                </p>
                <p className="text-xs text-dark-300 mt-1">
                  {dayjs(ticket.updatedAt).fromNow()}
                </p>
              </div>
              {ticket.messages?.length > 0 && (
                <div className="flex-shrink-0 text-xs text-dark-400 flex items-center gap-1">
                  <ChevronDown size={12} /> {ticket.messages.length} replies
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
