import express from "express"
import mongoose from "mongoose"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import compression from "compression"
import rateLimit from "express-rate-limit"
import { createServer } from "http"
import { Server } from "socket.io"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"







// Import routes
import authRoutes from "./routes/auth.js"
import userRoutes from "./routes/user.js"
import symptomRoutes from "./routes/symptom.js"
import medicineRoutes from "./routes/medicine.js"
import hospitalRoutes from "./routes/hospital.js"
import contactRoutes from "./routes/contact.js"
import analyticsRoutes from "./routes/analytics.js"
import uploadRoutes from "./routes/upload.js"

// Import middleware
import { errorHandler } from "./middleware/errorHandler.js"
import { notFound } from "./middleware/notFound.js"
import { logger } from "./utils/logger.js"

// Import socket handlers
import { setupSocketHandlers } from "./socket/socketHandlers.js"

// Import cron jobs
import "./jobs/healthDataSync.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
const server = createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
})

// Trust proxy for rate limiting
app.set("trust proxy", 1)

// Security middleware
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        connectSrc: ["'self'", "https:", "wss:", "ws:"],
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
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
  }),
)

// Rate limiting
const limiter = rateLimit({
  windowMs: Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number.parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests from this IP, please try again later.",
    retryAfter: Math.ceil((Number.parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 1000),
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

// Logging middleware
app.use(morgan("combined", { stream: { write: (message) => logger.info(message.trim()) } }))

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
  })
})

// API Routes
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/symptoms", symptomRoutes)
app.use("/api/medicines", medicineRoutes)
app.use("/api/hospitals", hospitalRoutes)
app.use("/api/contact", contactRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/upload", uploadRoutes)

// Socket.IO setup
setupSocketHandlers(io)

// Make io accessible to routes
app.set("io", io)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    logger.info(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`)
    process.exit(1)
  }
}

// Start server
const PORT = process.env.PORT || 5000

const startServer = async () => {
  try {
    await connectDB()

    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
      logger.info(`📱 Client URL: ${process.env.CLIENT_URL}`)
      logger.info(`🏥 Medicare Nepal Backend is ready!`)
    })
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`)
    process.exit(1)
  }
}

startServer()

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...")
  server.close(() => {
    logger.info("Process terminated")
    mongoose.connection.close()
  })
})

process.on("SIGINT", () => {
  logger.info("SIGINT received. Shutting down gracefully...")
  server.close(() => {
    logger.info("Process terminated")
    mongoose.connection.close()
  })
})

export default app
