import 'dotenv/config'
import mongoose from 'mongoose'
import Invoice from '../models/Invoice.js'

await mongoose.connect(process.env.MONGO_URI)
console.log('Connected to MongoDB')

const invoices = await Invoice.find({})
console.log(`Found ${invoices.length} invoices`)

for (const inv of invoices) {
  let changed = false

  // If status is paid but amountPaid is 0 — fix it
  if (inv.status === 'paid' && (!inv.amountPaid || inv.amountPaid === 0)) {
    inv.amountPaid = inv.totalAmount
    changed = true
  }

  // If status is partial but amountPaid is 0 — can't fix automatically, set to pending
  if (inv.status === 'partial' && (!inv.amountPaid || inv.amountPaid === 0)) {
    inv.status = 'pending'
    changed = true
  }

  // Recalculate balance
  inv.balance = (inv.totalAmount || 0) - (inv.amountPaid || 0)

  if (changed) {
    await inv.save()
    console.log(`Fixed: ${inv.invoiceNumber} — status: ${inv.status}, amountPaid: ${inv.amountPaid}, balance: ${inv.balance}`)
  }
}

console.log('Done!')
process.exit(0)