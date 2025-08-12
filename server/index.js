import express from "express"
import cors from "cors"
import helmet from "helmet"
import compression from "compression"
import rateLimit from "express-rate-limit"
import { createServer } from "http"
import { Server } from "socket.io"
import mongoose from "mongoose"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"

// Import routes
import authRoutes from "./routes/auth.js"
import symptomRoutes from "./routes/symptom.js"
import medicineRoutes from "./routes/medicine.js"
import hospitalRoutes from "./routes/hospital.js"
import contactRoutes from "./routes/contact.js"
import analyticsRoutes from "./routes/analytics.js"
import uploadRoutes from "./routes/upload.js"
import aiAnalysisRoutes from "./routes/aiAnalysis.js"
import userRoutes from "./routes/user.js"
import analyzeSymptomRoutes from "./routes/analyzeSymptom.js"

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js"
import { notFound } from "./middleware/notFound.js"

// Import utilities
import { logger } from "./utils/logger.js"

// Import socket handlers
import { setupSocketHandlers } from "./socket/socketHandlers.js"

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Find available port
const findAvailablePort = async (startPort) => {
  const net = await import("net")

  return new Promise((resolve) => {
    const server = net.createServer()
    server.listen(startPort, () => {
      const port = server.address().port
      server.close(() => resolve(port))
    })
    server.on("error", () => {
      resolve(findAvailablePort(startPort + 1))
    })
  })
}

// Create HTTP server
const server = createServer(app)

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
})

// Make io accessible to routes
app.set("io", io)

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        scriptSrc: ["'self'"],
      },
    },
  }),
)

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// Compression middleware
app.use(compression())

// Trust proxy
app.set("trust proxy", 1)

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  })
})

// API routes
app.use("/api/auth", authRoutes)
app.use("/api/symptoms", symptomRoutes)
app.use("/api/medicines", medicineRoutes)
app.use("/api/medicare", medicineRoutes) // Add alternative route for medicare
app.use("/api/hospitals", hospitalRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/upload", uploadRoutes)
app.use("/api/ai", aiAnalysisRoutes)
app.use("/api/users", userRoutes)
app.use("/api/analyzeSymptom", analyzeSymptomRoutes)

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../dist")))

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../dist", "index.html"))
  })
}

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Socket.IO connection handling
setupSocketHandlers(io)

// Database connection with fixed options
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/medicare-nepal")
    logger.info(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`)
    process.exit(1)
  }
}

// Start server with dynamic port finding
const startServer = async () => {
  try {
    await connectDB()

    const PORT = await findAvailablePort(Number.parseInt(process.env.PORT) || 5000)

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`)
      logger.info(`🌍 Environment: ${process.env.NODE_ENV || "development"}`)
      logger.info(`🏥 Medicare Nepal API is ready!`)
      logger.info(`📱 Client should connect to: http://localhost:${PORT}`)
    })
  } catch (error) {
    logger.error(`Server startup error: ${error.message}`)
    process.exit(1)
  }
}

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully`)
  server.close(() => {
    logger.info("HTTP server closed")
    mongoose.connection.close(false, () => {
      logger.info("MongoDB connection closed")
      process.exit(0)
    })
  })
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"))
process.on("SIGINT", () => gracefulShutdown("SIGINT"))

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Unhandled Promise Rejection: ${err.message}`)
  server.close(() => {
    process.exit(1)
  })
})

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error(`Uncaught Exception: ${err.message}`)
  process.exit(1)
})

startServer()
