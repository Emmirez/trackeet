import express from 'express'
import { getLogs, clearLogs } from '../controllers/activityController.js'
import { protect } from '../middleware/auth.js'

const r = express.Router()
r.use(protect)
r.get('/',   getLogs)
r.delete('/', clearLogs)

export default r