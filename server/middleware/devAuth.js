import { logger } from '../utils/logger.js'

// Development authentication middleware for testing
export const devAuth = async (req, res, next) => {
  try {
    // For development, create a mock user
    req.user = {
      id: 'dev-user-123',
      email: 'dev@example.com',
      name: 'Development User',
      role: 'user'
    }
    
    logger.info('Development authentication bypass - using mock user')
    next()
  } catch (error) {
    logger.error(`Dev auth middleware error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
}

export const devAdminAuth = async (req, res, next) => {
  try {
    await devAuth(req, res, () => {
      // For now, allow all authenticated users
      next()
    })
  } catch (error) {
    logger.error(`Dev admin auth middleware error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
} 