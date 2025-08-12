import { auth } from '../utils/firebaseAdmin.js'
import { logger } from '../utils/logger.js'

export const firebaseAuth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "") || req.header("x-auth-token")

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided, authorization denied",
      })
    }

    try {
      // Verify Firebase ID token
      const decodedToken = await auth.verifyIdToken(token)
      
      // Create a user object similar to what the JWT auth expects
      req.user = {
        id: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || decodedToken.email,
        role: 'user'
      }
      
      next()
    } catch (firebaseError) {
      logger.error(`Firebase token verification failed: ${firebaseError.message}`)
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      })
    }
  } catch (error) {
    logger.error(`Firebase auth middleware error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

export const firebaseAdminAuth = async (req, res, next) => {
  try {
    await firebaseAuth(req, res, () => {
      // For now, allow all authenticated users
      // You can add role-based checks here later
      next()
    })
  } catch (error) {
    logger.error(`Firebase admin auth middleware error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
} 