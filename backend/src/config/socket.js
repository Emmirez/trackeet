import { Server } from 'socket.io'

let io

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  })

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId
    if (userId) {
      socket.join(`user:${userId}`)
      console.log(`Socket connected: user:${userId}`)
    }

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  return io
}

export const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized')
  return io
}

export const emitToUser = (userId, event, data) => {
  if (io) io.to(`user:${userId}`).emit(event, data)
}
