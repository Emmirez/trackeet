import User from '../models/User.js'
import Notification from '../models/Notification.js'
import { emitToUser } from '../config/socket.js'

export const sendSystemAlert = async (title, message, meta = {}) => {
  try {
    const admins = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('_id')
    for (const admin of admins) {
      const notif = await Notification.create({
        user: admin._id,
        type: 'system',
        title,
        message,
        link: '/admin',
        meta,
      })
      emitToUser(admin._id.toString(), 'notification', notif)
    }
    console.log(`System alert sent: ${title}`)
  } catch (err) {
    console.error('System alert failed:', err.message)
  }
}