import 'dotenv/config'
import mongoose from 'mongoose'
import Invoice from '../models/Invoice.js'
import Payment from '../models/Payment.js'
import Customer from '../models/Customer.js'
import User from '../models/User.js'

await mongoose.connect(process.env.MONGO_URI)
console.log('Connected to MongoDB')

await Invoice.deleteMany({})
console.log('✅ All invoices deleted')

await Payment.deleteMany({})
console.log('✅ All payments deleted')

await Customer.updateMany({}, {
  $set: {
    totalInvoices:    0,
    totalSpent:       0,
    outstandingBalance: 0,
  }
})
console.log('✅ All customer balances reset')

await User.updateMany({}, {
  $set: { invoiceCount: 0 }
})
console.log('✅ All user invoice counts reset')

console.log('🎉 Done — all data reset. Start fresh!')
process.exit(0)