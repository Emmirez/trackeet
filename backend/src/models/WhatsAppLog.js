import mongoose from 'mongoose'

const whatsappLogSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  invoice:  { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  type:     { type: String, enum: ['invoice','reminder','receipt','campaign','summary'] },
  message:  { type: String },
  status:   { type: String, enum: ['sent','failed','pending'], default: 'sent' },
  sentAt:   { type: Date, default: Date.now },
}, { timestamps: true })

export default mongoose.model('WhatsAppLog', whatsappLogSchema)