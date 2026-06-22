import express from 'express'
import { getSummary, getRevenue, exportPDF, getInsights } from '../controllers/reportController.js'
import { protect } from '../middleware/auth.js'
const r = express.Router()
r.use(protect)
r.get('/summary', getSummary)
r.get('/revenue', getRevenue)
r.get('/export', exportPDF)
r.get('/insights', getInsights)
export default r