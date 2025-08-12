import admin from "firebase-admin"
import { logger } from "../utils/logger.js"
import dotenv from "dotenv"

dotenv.config()

// Initialize Firebase Admin SDK here
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    }),
  })
}

// ...rest of your auth middleware code below...


export const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided or invalid format",
      })
    }

    const token = authHeader.split(" ")[1]

    try {
      const decodedToken = await admin.auth().verifyIdToken(token)

      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email,
      }

      next()
    } catch (tokenError) {
      logger.error("Token verification failed:", tokenError)
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      })
    }
  } catch (error) {
    logger.error("Auth middleware error:", error)
    return res.status(500).json({
      success: false,
      message: "Authentication error",
    })
  }
}

export const devAuth = (req, res, next) => {
  if (process.env.NODE_ENV === "development" && process.env.SKIP_AUTH === "true") {
    req.user = {
      uid: "dev-user-123",
      email: "dev@medicare-nepal.com",
      name: "Development User",
    }
    return next()
  }

  return auth(req, res, next)
}

export const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admin privileges required.",
        })
      }
      next()
    })
  } catch (error) {
    logger.error(`Admin auth middleware error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}
