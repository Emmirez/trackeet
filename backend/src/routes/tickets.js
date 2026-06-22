import express from 'express'
import {
  createTicket,
  getUserTickets,
  getTicket,
  replyToTicket,
} from '../controllers/ticketController.js'
import { protect } from '../middleware/auth.js'

const r = express.Router()
r.use(protect)
r.get('/', getUserTickets)
r.post('/', createTicket)
r.get('/:id', getTicket)
r.post('/:id/reply', replyToTicket)
export default r