import { logger } from "../utils/logger.js"
import User from "../models/User.js"
import Analytics from "../models/Analytics.js"

export const setupSocketHandlers = (io) => {
  io.on("connection", (socket) => {
    logger.info(`User connected: ${socket.id}`)

    // Join user to their personal room
    socket.on("join", (room) => {
      socket.join(room)
      logger.info(`User ${socket.id} joined room: ${room}`)
    })

    // Handle real-time symptom analysis updates
    socket.on("symptom_analysis_start", async (data) => {
      try {
        const { sessionId, userId } = data

        // Emit progress updates
        socket.emit("symptom_analysis_progress", {
          sessionId,
          progress: 25,
          message: "Analyzing symptoms with AI...",
        })

        setTimeout(() => {
          socket.emit("symptom_analysis_progress", {
            sessionId,
            progress: 50,
            message: "Processing medical data...",
          })
        }, 1000)

        setTimeout(() => {
          socket.emit("symptom_analysis_progress", {
            sessionId,
            progress: 75,
            message: "Generating recommendations...",
          })
        }, 2000)

        // The actual analysis completion will be handled by the API route
        // This is just for progress updates
      } catch (error) {
        logger.error(`Socket symptom analysis error: ${error.message}`)
        socket.emit("symptom_analysis_error", {
          sessionId: data.sessionId,
          error: "Analysis failed",
        })
      }
    })

    // Handle real-time medicine analysis updates
    socket.on("medicine_analysis_start", async (data) => {
      try {
        const { sessionId, userId } = data

        socket.emit("medicine_analysis_progress", {
          sessionId,
          progress: 20,
          message: "Processing image...",
        })

        setTimeout(() => {
          socket.emit("medicine_analysis_progress", {
            sessionId,
            progress: 40,
            message: "Detecting medicine...",
          })
        }, 1000)

        setTimeout(() => {
          socket.emit("medicine_analysis_progress", {
            sessionId,
            progress: 60,
            message: "Analyzing composition...",
          })
        }, 2000)

        setTimeout(() => {
          socket.emit("medicine_analysis_progress", {
            sessionId,
            progress: 80,
            message: "Generating detailed information...",
          })
        }, 3000)
      } catch (error) {
        logger.error(`Socket medicine analysis error: ${error.message}`)
        socket.emit("medicine_analysis_error", {
          sessionId: data.sessionId,
          error: "Analysis failed",
        })
      }
    })

    // Handle real-time analytics updates
    socket.on("request_analytics", async (data) => {
      try {
        const { userId, type } = data

        // Get real-time analytics data
        const analytics = await Analytics.findOne().sort({ createdAt: -1 })

        socket.emit("analytics_update", {
          type,
          data: analytics || {},
          timestamp: new Date(),
        })
      } catch (error) {
        logger.error(`Socket analytics error: ${error.message}`)
        socket.emit("analytics_error", {
          error: "Failed to fetch analytics",
        })
      }
    })

    // Handle user activity tracking
    socket.on("track_activity", async (data) => {
      try {
        const { userId, activity, metadata } = data

        if (userId) {
          const user = await User.findById(userId)
          if (user) {
            await user.logActivity(activity, socket.handshake.address, socket.handshake.headers["user-agent"], metadata)
          }
        }

        // Update real-time analytics
        await Analytics.findOneAndUpdate(
          {},
          {
            $inc: {
              "realTime.activeUsers": activity === "page_view" ? 1 : 0,
              "realTime.totalEvents": 1,
            },
            $set: {
              "realTime.lastActivity": new Date(),
            },
          },
          { upsert: true },
        )

        // Broadcast activity to admin users (if needed)
        socket.broadcast.to("admin").emit("user_activity", {
          userId,
          activity,
          timestamp: new Date(),
          metadata,
        })
      } catch (error) {
        logger.error(`Socket activity tracking error: ${error.message}`)
      }
    })

    // Handle typing indicators for chat/support
    socket.on("typing_start", (data) => {
      socket.broadcast.to(data.room).emit("user_typing", {
        userId: data.userId,
        userName: data.userName,
      })
    })

    socket.on("typing_stop", (data) => {
      socket.broadcast.to(data.room).emit("user_stopped_typing", {
        userId: data.userId,
      })
    })

    // Handle notifications
    socket.on("subscribe_notifications", (userId) => {
      socket.join(`notifications_${userId}`)
      logger.info(`User ${socket.id} subscribed to notifications for user ${userId}`)
    })

    // Handle health alerts
    socket.on("health_alert", async (data) => {
      try {
        const { userId, alertType, severity, message } = data

        // Broadcast to user's devices
        io.to(`user_${userId}`).emit("health_alert_received", {
          alertType,
          severity,
          message,
          timestamp: new Date(),
        })

        // Log the alert
        logger.info(`Health alert sent to user ${userId}: ${alertType} - ${severity}`)
      } catch (error) {
        logger.error(`Socket health alert error: ${error.message}`)
      }
    })

    // Handle emergency situations
    socket.on("emergency_request", async (data) => {
      try {
        const { userId, location, emergencyType, message } = data

        // Broadcast to emergency responders (if implemented)
        socket.broadcast.to("emergency_responders").emit("emergency_alert", {
          userId,
          location,
          emergencyType,
          message,
          timestamp: new Date(),
          socketId: socket.id,
        })

        // Send confirmation to user
        socket.emit("emergency_request_received", {
          message: "Emergency request has been sent. Help is on the way.",
          timestamp: new Date(),
        })

        logger.warn(`Emergency request from user ${userId}: ${emergencyType}`)
      } catch (error) {
        logger.error(`Socket emergency request error: ${error.message}`)
        socket.emit("emergency_request_failed", {
          error: "Failed to send emergency request",
        })
      }
    })

    // Handle disconnection
    socket.on("disconnect", (reason) => {
      logger.info(`User disconnected: ${socket.id}, reason: ${reason}`)

      // Update analytics
      Analytics.findOneAndUpdate(
        {},
        {
          $inc: {
            "realTime.activeUsers": -1,
          },
        },
      ).catch((err) => logger.error(`Analytics update error on disconnect: ${err.message}`))
    })

    // Handle connection errors
    socket.on("error", (error) => {
      logger.error(`Socket error for ${socket.id}: ${error.message}`)
    })
  })

  // Broadcast system-wide notifications
  const broadcastSystemNotification = (notification) => {
    io.emit("system_notification", {
      ...notification,
      timestamp: new Date(),
    })
  }

  // Broadcast health trends updates
  const broadcastHealthTrends = (trends) => {
    io.emit("health_trends_update", {
      trends,
      timestamp: new Date(),
    })
  }

  // Export functions for use in other parts of the application
  io.broadcastSystemNotification = broadcastSystemNotification
  io.broadcastHealthTrends = broadcastHealthTrends

  logger.info("Socket.IO handlers initialized successfully")
}
