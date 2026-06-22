import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized' })
  }
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)
    if (!user || user.status === 'suspended') {
      return res.status(401).json({ success: false, message: 'Account suspended or not found' })
    }
    req.user = user
    next()
  } catch {
    res.status(401).json({ success: false, message: 'Token invalid or expired' })
  }
}

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Insufficient permissions' })
  }
  next()
}