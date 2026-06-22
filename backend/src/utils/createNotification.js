import Notification from '../models/Notification.js'
import { emitToUser } from '../config/socket.js'

export const createNotification = async ({ userId, type, title, message, link, meta }) => {
  const notif = await Notification.create({ user: userId, type, title, message, link, meta })
  emitToUser(userId.toString(), 'notification', notif)
  return notif
}