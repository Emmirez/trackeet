import ActivityLog from '../models/ActivityLog.js'
import { asyncHandler } from '../utils/appError.js'

export const getLogs = asyncHandler(async (req, res) => {
  const uid = req.user._id
  const { page = 1, limit = 50, entity } = req.query

  const query = { owner: uid }
  if (entity) query.entity = entity

  const logs = await ActivityLog.find(query)
    .populate('user', 'firstName lastName')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)

  const total = await ActivityLog.countDocuments(query)

  res.json({ success: true, logs, total, page: Number(page) })
})

export const clearLogs = asyncHandler(async (req, res) => {
  await ActivityLog.deleteMany({ owner: req.user._id })
  res.json({ success: true, message: 'Activity logs cleared' })
})