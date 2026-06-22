import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
  user:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name:          { type: String, required: true, trim: true },
  phone:         { type: String, required: true },
  email:         { type: String, lowercase: true },
  businessName:  { type: String },
  address:       { type: String },
  notes:         { type: String },
  totalInvoices: { type: Number, default: 0 },
  totalSpent:    { type: Number, default: 0 },
  outstandingBalance: { type: Number, default: 0 },
}, { timestamps: true })

customerSchema.index({ user: 1, phone: 1 })

export default mongoose.model('Customer', customerSchema)