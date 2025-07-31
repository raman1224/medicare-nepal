import express from "express"
import { body, validationResult } from "express-validator"
import User from "../models/User.js"
import { auth } from "../middleware/auth.js"
import { logger } from "../utils/logger.js"

const router = express.Router()

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

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
    logger.error(`Get user profile error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  auth,
  [
    body("name")
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage("Name must be between 2 and 50 characters"),
    body("phone")
      .optional()
      .matches(/^[0-9]{10}$/)
      .withMessage("Phone number must be 10 digits"),
    body("address.province").optional().isLength({ min: 2, max: 50 }).withMessage("Province is required"),
    body("address.district").optional().isLength({ min: 2, max: 50 }).withMessage("District is required"),
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

      const allowedUpdates = ["name", "phone", "address", "preferences", "healthProfile"]
      const updates = {}

      Object.keys(req.body).forEach((key) => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key]
        }
      })

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { $set: updates },
        { new: true, runValidators: true },
      ).select("-password")

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        })
      }

      await user.logActivity("profile_updated", req.ip, req.get("User-Agent"))

      logger.info(`Profile updated for user ${req.user.id}`)

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { user },
      })
    } catch (error) {
      logger.error(`Update user profile error: ${error.message}`)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/users/activity
// @desc    Get user activity log
// @access  Private
router.get("/activity", auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query

    const user = await User.findById(req.user.id).select("activityLog")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    const activities = user.activityLog
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice((page - 1) * limit, page * limit)

    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          current: Number.parseInt(page),
          pages: Math.ceil(user.activityLog.length / limit),
          total: user.activityLog.length,
        },
      },
    })
  } catch (error) {
    logger.error(`Get user activity error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete("/account", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    // In a real application, you might want to:
    // 1. Anonymize user data instead of deleting
    // 2. Keep analysis data for research purposes
    // 3. Send confirmation email

    await User.findByIdAndDelete(req.user.id)

    logger.info(`User account deleted: ${req.user.id}`)

    res.json({
      success: true,
      message: "Account deleted successfully",
    })
  } catch (error) {
    logger.error(`Delete user account error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

export default router
