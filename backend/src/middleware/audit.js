import AuditLog from '../models/AuditLog.js'

export const auditLog = (action, resource) => async (req, res, next) => {
  res.on('finish', async () => {
    if (res.statusCode < 400) {
      try {
        await AuditLog.create({
          user: req.user?._id,
          action,
          resource,
          resourceId: req.params?.id,
          ip: req.ip,
        })
      } catch {}
    }
  })
  next()
}