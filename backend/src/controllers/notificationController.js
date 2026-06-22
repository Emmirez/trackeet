import Notification from '../models/Notification.js'
import { asyncHandler } from '../utils/appError.js'

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
  const unread = notifications.filter(n => !n.read).length
  res.json({ success: true, notifications, unread })
})

export const markRead = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true }
  )
  res.json({ success: true })
})

export const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true })
  res.json({ success: true })
})

export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndDelete({ _id: req.params.id, user: req.user._id })
  res.json({ success: true })
})

export const deleteAllRead = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user._id, read: true })
  res.json({ success: true })
})

