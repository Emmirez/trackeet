import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  sender:  { type: String, enum: ['user','admin'], required: true },
  message: { type: String, required: true },
  createdAt:{ type: Date, default: Date.now },
}, { _id: false })

const ticketSchema = new mongoose.Schema({
  user:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject:  { type: String, required: true },
  message:  { type: String, required: true },
  status:   { type: String, enum: ['open','in_progress','resolved'], default: 'open' },
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  messages: [messageSchema],
}, { timestamps: true })

export default mongoose.model('Ticket', ticketSchema)