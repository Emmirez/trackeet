import Invoice from '../models/Invoice.js'

export const generateInvoiceNumber = async (user) => {
  const prefix = user.invoicePrefix || 'INV'
  const year   = new Date().getFullYear()

  // Find the highest existing sequence number for this user+year
  const last = await Invoice.findOne(
    {
      user: user._id,
      invoiceNumber: { $regex: `^${prefix}-${year}-` }
    },
    { invoiceNumber: 1 },
    { sort: { invoiceNumber: -1 } }
  )

  let nextSeq = 1

  if (last) {
    const parts = last.invoiceNumber.split('-')
    const lastSeq = parseInt(parts[parts.length - 1], 10)
    if (!isNaN(lastSeq)) nextSeq = lastSeq + 1
  }

  // Retry loop — skip any numbers already taken
  let invoiceNumber
  let attempts = 0

  while (attempts < 20) {
    invoiceNumber = `${prefix}-${year}-${String(nextSeq + attempts).padStart(4, '0')}`
    const exists = await Invoice.findOne({ invoiceNumber })
    if (!exists) break
    attempts++
  }

  return invoiceNumber
}