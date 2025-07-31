import express from "express"
import jwt from "jsonwebtoken"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"
import User from "../models/User.js"
import { auth } from "../middleware/auth.js"
import { sendEmail } from "../utils/email.js"
import { generateToken } from "../utils/jwt.js"
import { logger } from "../utils/logger.js"

const router = express.Router()

// Rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    error: "Too many authentication attempts, please try again later.",
    retryAfter: 15 * 60, // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation rules
const registerValidation = [
  body("name")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage("Name can only contain letters and spaces"),
  body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage("Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  body("phone")
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage("Phone number must be 10 digits"),
]

const loginValidation = [
  body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
]

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post("/register", authLimiter, registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { name, email, password, phone } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email address",
      })
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      phone,
    })

    await user.save()

    // Log user activity
    await user.logActivity("account_created", req.ip, req.get("User-Agent"))

    // Generate JWT token
    const token = generateToken(user._id)

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    logger.info(`New user registered: ${email}`)

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: userResponse,
        token,
      },
    })
  } catch (error) {
    logger.error(`Registration error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    })
  }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post("/login", authLimiter, loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      })
    }

    const { email, password } = req.body

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select("+password")

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: "Account is temporarily locked due to too many failed login attempts",
      })
    }

    // Check password
    const isPasswordValid = await user.matchPassword(password)

    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts()

      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      })
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts()
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Log user activity
    await user.logActivity("login", req.ip, req.get("User-Agent"))

    // Generate JWT token
    const token = generateToken(user._id)

    // Remove password from response
    const userResponse = user.toObject()
    delete userResponse.password

    logger.info(`User logged in: ${email}`)

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: userResponse,
        token,
      },
    })
  } catch (error) {
    logger.error(`Login error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error during login",
    })
  }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      data: { user },
    })
  } catch (error) {
    logger.error(`Get user error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post("/logout", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (user) {
      await user.logActivity("logout", req.ip, req.get("User-Agent"))
    }

    res.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    logger.error(`Logout error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    })
  }
})

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post(
  "/forgot-password",
  authLimiter,
  [body("email").isEmail().normalizeEmail().withMessage("Please enter a valid email address")],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { email } = req.body
      const user = await User.findOne({ email })

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No user found with this email address",
        })
      }

      // Generate reset token
      const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

      // Save reset token to user
      user.resetPasswordToken = resetToken
      user.resetPasswordExpire = Date.now() + 60 * 60 * 1000 // 1 hour
      await user.save()

      // Send email
      const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`

      try {
        await sendEmail({
          to: user.email,
          subject: "Password Reset - Medicare Nepal",
          html: `
          <h2>Password Reset Request</h2>
          <p>Hello ${user.name},</p>
          <p>You requested a password reset for your Medicare Nepal account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <p>Best regards,<br>Medicare Nepal Team</p>
        `,
        })

        res.json({
          success: true,
          message: "Password reset email sent successfully",
        })
      } catch (emailError) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save()

        logger.error(`Email sending error: ${emailError.message}`)
        return res.status(500).json({
          success: false,
          message: "Email could not be sent",
        })
      }
    } catch (error) {
      logger.error(`Forgot password error: ${error.message}`)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   POST /api/auth/reset-password
// @desc    Reset password
// @access  Public
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { token, password } = req.body

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findOne({
          _id: decoded.userId,
          resetPasswordToken: token,
          resetPasswordExpire: { $gt: Date.now() },
        })

        if (!user) {
          return res.status(400).json({
            success: false,
            message: "Invalid or expired reset token",
          })
        }

        // Set new password
        user.password = password
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save()

        // Log activity
        await user.logActivity("password_reset", req.ip, req.get("User-Agent"))

        res.json({
          success: true,
          message: "Password reset successfully",
        })
      } catch (jwtError) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        })
      }
    } catch (error) {
      logger.error(`Reset password error: ${error.message}`)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   PUT /api/auth/change-password
// @desc    Change password
// @access  Private
router.put(
  "/change-password",
  auth,
  [
    body("currentPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage("New password must contain at least one uppercase letter, one lowercase letter, and one number"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { currentPassword, newPassword } = req.body
      const user = await User.findById(req.user.id).select("+password")

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      // Check current password
      const isCurrentPasswordValid = await user.matchPassword(currentPassword)
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        })
      }

      // Set new password
      user.password = newPassword
      await user.save()

      // Log activity
      await user.logActivity("password_changed", req.ip, req.get("User-Agent"))

      res.json({
        success: true,
        message: "Password changed successfully",
      })
    } catch (error) {
      logger.error(`Change password error: ${error.message}`)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

export default router
