import jwt from "jsonwebtoken"
import User from "../models/User.js"
import { logger } from "../utils/logger.js"

export const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "") || req.header("x-auth-token")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      })
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      const user = await User.findById(decoded.id).select("-password")

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Token is not valid",
        })
      }

      req.user = user
      next()
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: "Token is not valid",
      })
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
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
