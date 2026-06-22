import mongoose from 'mongoose'

const whatsappSettingsSchema = new mongoose.Schema({
  user:            { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  connected:       { type: Boolean, default: false },
  phoneNumber:     { type: String },
  invoiceAuto:     { type: Boolean, default: true },
  paymentConfirm:  { type: Boolean, default: true },
  paymentReminder: { type: Boolean, default: true },
  autoReply:       { type: Boolean, default: false },
  dailySummary:    { type: Boolean, default: false },
  reminderDaysBefore: { type: Number, default: 2 },
}, { timestamps: true })

export default mongoose.model('WhatsAppSettings', whatsappSettingsSchema)