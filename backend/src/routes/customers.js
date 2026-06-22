import express from 'express'
import { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer, importCustomers } from '../controllers/customerController.js'
import { protect } from '../middleware/auth.js'
const r = express.Router()
r.use(protect)
r.get('/', getCustomers)
r.post('/', createCustomer)
r.get('/:id', getCustomer)
r.put('/:id', updateCustomer)
r.delete('/:id', deleteCustomer)
r.post('/import', importCustomers)
export default r