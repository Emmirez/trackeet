import User from '../models/User.js'
import Invoice from '../models/Invoice.js'
import dayjs from 'dayjs'

const PLAN_LIMITS = {
  free:       { invoices: 5 },
  starter:    { invoices: 50 },
  business:   { invoices: Infinity },
  enterprise: { invoices: Infinity },
}

export const checkInvoiceLimit = async (req, res, next) => {
  const user = req.user
  const limit = PLAN_LIMITS[user.plan]?.invoices || 5
  if (limit === Infinity) return next()

  const start = dayjs().startOf('month').toDate()
  const end   = dayjs().endOf('month').toDate()
  const count = await Invoice.countDocuments({ user: user._id, createdAt: { $gte: start, $lte: end } })

  if (count >= limit) {
    return res.status(403).json({
      success: false,
      message: `You have reached your ${user.plan} plan limit of ${limit} invoices this month. Please upgrade.`,
      upgradeRequired: true,
    })
  }
  next()
}