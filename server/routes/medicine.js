import express from "express"
import multer from "multer"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"
import { v4 as uuidv4 } from "uuid"
import MedicineAnalysis from "../models/MedicineAnalysis.js"
import { auth } from "../middleware/auth.js"
import { analyzeMedicineImage } from "../services/visionService.js"
import { getMedicineInfo } from "../services/geminiService.js"
import { uploadImage } from "../utils/cloudinary.js" // Correct import
import { logger } from "../utils/logger.js"

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: Number.parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || "image/jpeg,image/png,image/webp,image/jpg").split(",")
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are allowed."))
    }
  },
})

// Rate limiting for medicine analysis
const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15, // limit each user to 15 analyses per hour
  message: {
    error: "Too many medicine analyses. Please try again later.",
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// @route   POST /api/medicines/analyze-image
// @desc    Analyze medicine from uploaded image
// @access  Private
router.post("/analyze-image", auth, analysisLimiter, upload.single("image"), async (req, res) => {
  const startTime = Date.now()

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      })
    }

    const { additionalInfo = "", language = "en" } = req.body

    // Generate unique session ID
    const sessionId = uuidv4()

    // Upload image to Cloudinary
    const imageUrl = await uploadImage(req.file, {
      folder: "medicine-analysis",
      public_id: `medicine_${sessionId}`,
      resource_type: "image",
    })

    // Create analysis record
    const analysis = new MedicineAnalysis({
      user: req.user.id,
      sessionId,
      input: {
        image: {
          url: imageUrl,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
        },
        additionalInfo,
      },
      language,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      },
    })

    await analysis.save()

    try {
      // Analyze image using Google Vision API
      const visionResults = await analyzeMedicineImage(imageUrl)

      // Get detailed medicine information using Gemini AI
      const medicineInfo = await getMedicineInfo({
        detectedText: visionResults.detectedText,
        objects: visionResults.objects,
        additionalInfo,
        language,
      })

      // Update analysis with results
      analysis.analysis = medicineInfo
      analysis.confidence = visionResults.confidence
      analysis.processingTime = Date.now() - startTime
      analysis.status = "completed"
      analysis.metadata.imageAnalysis = {
        textDetected: visionResults.detectedText,
        objectsDetected: visionResults.objects,
        confidence: visionResults.confidence,
      }

      await analysis.save()

      // Emit real-time update via Socket.IO
      const io = req.app.get("io")
      io.to(`user_${req.user.id}`).emit("medicine_analysis_complete", {
        sessionId,
        analysis: medicineInfo,
      })

      logger.info(`Medicine analysis completed for user ${req.user.id}, session ${sessionId}`)

      res.json({
        success: true,
        message: "Medicine analysis completed successfully",
        data: {
          sessionId,
          analysis: medicineInfo,
          confidence: analysis.confidence,
          processingTime: analysis.processingTime,
        },
      })
    } catch (aiError) {
      // Update analysis status to failed
      analysis.status = "failed"
      analysis.processingTime = Date.now() - startTime
      await analysis.save()

      logger.error(`Medicine AI analysis error: ${aiError.message}`)

      res.status(500).json({
        success: false,
        message: "Failed to analyze medicine image. Please try again.",
        sessionId,
      })
    }
  } catch (error) {
    logger.error(`Medicine analysis error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error during medicine analysis",
    })
  }
})

// @route   POST /api/medicines/analyze-text
// @desc    Analyze medicine from text input
// @access  Private
router.post(
  "/analyze-text",
  auth,
  analysisLimiter,
  [
    body("medicineName").notEmpty().withMessage("Medicine name is required"),
    body("language").optional().isIn(["en", "ne", "hi"]).withMessage("Invalid language"),
  ],
  async (req, res) => {
    const startTime = Date.now()

    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        })
      }

      const { medicineName, additionalInfo = "", language = "en" } = req.body

      // Generate unique session ID
      const sessionId = uuidv4()

      // Create analysis record
      const analysis = new MedicineAnalysis({
        user: req.user.id,
        sessionId,
        input: {
          text: medicineName,
          additionalInfo,
        },
        language,
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
        },
      })

      await analysis.save()

      try {
        // Get medicine information using Gemini AI
        const medicineInfo = await getMedicineInfo({
          medicineName,
          additionalInfo,
          language,
        })

        // Update analysis with results
        analysis.analysis = medicineInfo
        analysis.confidence = 85 // Default confidence for text-based analysis
        analysis.processingTime = Date.now() - startTime
        analysis.status = "completed"

        await analysis.save()

        // Emit real-time update via Socket.IO
        const io = req.app.get("io")
        io.to(`user_${req.user.id}`).emit("medicine_analysis_complete", {
          sessionId,
          analysis: medicineInfo,
        })

        logger.info(`Medicine text analysis completed for user ${req.user.id}, session ${sessionId}`)

        res.json({
          success: true,
          message: "Medicine analysis completed successfully",
          data: {
            sessionId,
            analysis: medicineInfo,
            confidence: analysis.confidence,
            processingTime: analysis.processingTime,
          },
        })
      } catch (aiError) {
        // Update analysis status to failed
        analysis.status = "failed"
        analysis.processingTime = Date.now() - startTime
        await analysis.save()

        logger.error(`Medicine text analysis error: ${aiError.message}`)

        res.status(500).json({
          success: false,
          message: "Failed to analyze medicine. Please try again.",
          sessionId,
        })
      }
    } catch (error) {
      logger.error(`Medicine text analysis error: ${error.message}`)
      res.status(500).json({
        success: false,
        message: "Server error during medicine analysis",
      })
    }
  },
)

// @route   GET /api/medicines/history
// @desc    Get user's medicine analysis history
// @access  Private
router.get("/history", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query

    const query = { user: req.user.id }
    if (status) {
      query.status = status
    }

    const analyses = await MedicineAnalysis.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-metadata")

    const total = await MedicineAnalysis.countDocuments(query)

    res.json({
      success: true,
      data: {
        analyses,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
        },
      },
    })
  } catch (error) {
    logger.error(`Get medicine history error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/medicines/analysis/:sessionId
// @desc    Get specific medicine analysis
// @access  Private
router.get("/analysis/:sessionId", auth, async (req, res) => {
  try {
    const { sessionId } = req.params

    const analysis = await MedicineAnalysis.findOne({
      sessionId,
      user: req.user.id,
    }).select("-metadata")

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      })
    }

    res.json({
      success: true,
      data: { analysis },
    })
  } catch (error) {
    logger.error(`Get medicine analysis error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/medicines/feedback/:sessionId
// @desc    Submit feedback for medicine analysis
// @access  Private
router.post(
  "/feedback/:sessionId",
  auth,
  [
    body("accurate").isBoolean().withMessage("Accurate must be a boolean"),
    body("helpful").isBoolean().withMessage("Helpful must be a boolean"),
    body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
    body("comment").optional().isLength({ max: 500 }).withMessage("Comment cannot exceed 500 characters"),
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

      const { sessionId } = req.params
      const { accurate, helpful, rating, comment, corrections = [] } = req.body

      const analysis = await MedicineAnalysis.findOne({
        sessionId,
        user: req.user.id,
      })

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: "Analysis not found",
        })
      }

      await analysis.addFeedback(accurate, helpful, rating, comment, corrections)

      logger.info(`Medicine feedback submitted for analysis ${sessionId} by user ${req.user.id}`)

      res.json({
        success: true,
        message: "Feedback submitted successfully",
      })
    } catch (error) {
      logger.error(`Submit medicine feedback error: ${error.message}`)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/medicines/popular
// @desc    Get popular medicines
// @access  Public
router.get("/popular", async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const popularMedicines = await MedicineAnalysis.getPopularMedicines(Number.parseInt(limit))

    res.json({
      success: true,
      data: { medicines: popularMedicines },
    })
  } catch (error) {
    logger.error(`Get popular medicines error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/medicines/search
// @desc    Search medicines by name
// @access  Public
router.get("/search", async (req, res) => {
  try {
    const { q, language = "en", limit = 20 } = req.query

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters long",
      })
    }

    // Search in completed analyses
    const searchResults = await MedicineAnalysis.aggregate([
      {
        $match: {
          status: "completed",
          $or: [
            { "analysis.medicine.name": { $regex: q, $options: "i" } },
            { "analysis.medicine.genericName": { $regex: q, $options: "i" } },
            { "analysis.medicine.brandNames": { $regex: q, $options: "i" } },
          ],
        },
      },
      {
        $group: {
          _id: "$analysis.medicine.name",
          medicine: { $first: "$analysis.medicine" },
          analysisCount: { $sum: 1 },
          avgConfidence: { $avg: "$confidence" },
          lastAnalyzed: { $max: "$createdAt" },
        },
      },
      {
        $sort: { analysisCount: -1, avgConfidence: -1 },
      },
      {
        $limit: Number.parseInt(limit),
      },
    ])

    res.json({
      success: true,
      data: {
        query: q,
        results: searchResults,
        count: searchResults.length,
      },
    })
  } catch (error) {
    logger.error(`Medicine search error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

export default router
