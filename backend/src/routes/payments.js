import express from 'express'
import { getPayments, recordPayment, deletePayment } from '../controllers/paymentController.js'
import { protect } from '../middleware/auth.js'
const r = express.Router()
r.use(protect)
r.get('/', getPayments)
r.post('/', recordPayment)
r.delete('/:id', deletePayment)
export default r