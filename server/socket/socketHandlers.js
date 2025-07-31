import { logger } from "../utils/logger.js"

export const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.id}`)

    // Join user-specific room
    socket.on("join", (room) => {
      socket.join(room)
      logger.info(`User ${socket.id} joined room: ${room}`)
    })

    // Handle real-time symptom analysis updates
    socket.on("symptom_analysis_start", (data) => {
      socket.to(`user_${data.userId}`).emit("analysis_progress", {
        sessionId: data.sessionId,
        progress: 0,
        status: "starting",
      })
    })

    // Handle real-time medicine analysis updates
    socket.on("medicine_analysis_start", (data) => {
      socket.to(`user_${data.userId}`).emit("analysis_progress", {
        sessionId: data.sessionId,
        progress: 0,
        status: "processing_image",
      })
    })

    // Handle hospital search updates
    socket.on("hospital_search", (data) => {
      socket.emit("hospital_results", {
        query: data.query,
        results: [], // This would be populated with actual search results
        timestamp: new Date(),
      })
    })

    // Handle user typing indicators
    socket.on("typing", (data) => {
      socket.to(data.room).emit("user_typing", {
        userId: data.userId,
        isTyping: data.isTyping,
      })
    })

    // Handle disconnect
    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.id}`)
    })

    // Error handling
    socket.on("error", (error) => {
      logger.error(`Socket error for ${socket.id}: ${error.message}`)
    })
  })

  // Broadcast system-wide notifications
  setInterval(() => {
    io.emit("system_status", {
      status: "online",
      timestamp: new Date(),
      activeUsers: io.engine.clientsCount,
    })
  }, 30000) // Every 30 seconds
}
