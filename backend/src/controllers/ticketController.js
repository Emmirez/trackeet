import Ticket from "../models/Ticket.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import { asyncHandler, AppError } from "../utils/appError.js";
import { emitToUser } from "../config/socket.js";

const notifyAdmins = async (title, message, meta = {}) => {
  try {
    const admins = await User.find({
      role: { $in: ["admin", "superadmin"] },
    }).select("_id");
    for (const admin of admins) {
      const notif = await Notification.create({
        user: admin._id,
        type: "ticket",
        title,
        message,
        link: "/admin/tickets",
        meta,
      });
      emitToUser(admin._id.toString(), "notification", notif);
    }
  } catch (e) {
    /* non-blocking */
  }
};

export const createTicket = asyncHandler(async (req, res) => {
  const { subject, message, priority } = req.body;
  const ticket = await Ticket.create({
    user: req.user._id,
    subject,
    message,
    priority: priority || "medium",
  });
  await notifyAdmins(
    "New Support Ticket",
    `${req.user.firstName} ${req.user.lastName} opened a ticket: "${subject}"`,
    { ticketId: ticket._id, userId: req.user._id },
  );
  res.status(201).json({ success: true, ticket });
});

export const getUserTickets = asyncHandler(async (req, res) => {
  const tickets = await Ticket.find({ user: req.user._id }).sort({
    updatedAt: -1,
  });
  res.json({ success: true, tickets });
});

export const getTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!ticket) throw new AppError("Ticket not found", 404);
  res.json({ success: true, ticket });
});

export const replyToTicket = asyncHandler(async (req, res) => {
  const ticket = await Ticket.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
  if (!ticket) throw new AppError("Ticket not found", 404);
  ticket.messages.push({ sender: "user", message: req.body.message });
  ticket.status = "open";
  await ticket.save();
  await notifyAdmins(
    "Ticket Reply Received",
    `${req.user.firstName} ${req.user.lastName} replied to ticket "${ticket.subject}"`,
    { ticketId: ticket._id },
  );
  res.json({ success: true, ticket });
});
