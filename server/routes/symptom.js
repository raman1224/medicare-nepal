import express from "express"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"
import { v4 as uuidv4 } from "uuid"
import SymptomAnalysis from "../models/SymptomAnalysis.js"
import { auth } from "../middleware/auth.js"
import { analyzeSymptoms } from "../services/geminiService.js"
import { processVoiceInput } from "../services/speechService.js"
import { logger } from "../utils/logger.js"

const router = express.Router()

// Rate limiting for symptom analysis
const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each user to 10 analyses per hour
  message: {
    error: "Too many symptom analyses. Please try again later.",
    retryAfter: 60 * 60, // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation rules
const symptomAnalysisValidation = [
  body("symptoms")
    .isArray({ min: 1 })
    .withMessage("At least one symptom is required")
    .custom((symptoms) => {
      return symptoms.every((symptom) => typeof symptom === "string" && symptom.trim().length > 0)
    })
    .withMessage("All symptoms must be non-empty strings"),
  body("temperature.value")
    .optional()
    .isFloat({ min: 30, max: 50 })
    .withMessage("Temperature must be between 30°C and 50°C"),
  body("temperature.unit").optional().isIn(["C", "F"]).withMessage("Temperature unit must be C or F"),
  body("emotions").optional().isArray().withMessage("Emotions must be an array"),
  body("language").optional().isIn(["en", "ne", "hi"]).withMessage("Language must be en, ne, or hi"),
]

// @route   POST /api/symptoms/analyze
// @desc    Analyze symptoms using AI
// @access  Private
router.post("/analyze", auth, analysisLimiter, symptomAnalysisValidation, async (req, res) => {
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

    const {
      symptoms,
      temperature,
      emotions = [],
      additionalInfo = "",
      images = [],
      voiceInput,
      language = "en",
    } = req.body

    // Generate unique session ID
    const sessionId = uuidv4()

    // Create analysis record
    const analysis = new SymptomAnalysis({
      user: req.user.id,
      sessionId,
      input: {
        symptoms: symptoms.map((symptom) => ({
          name: symptom,
          severity: 5, // Default severity
          duration: "unknown",
          description: symptom,
        })),
        temperature,
        emotions,
        additionalInfo,
        images,
        voiceInput,
      },
      language,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
      },
    })

    await analysis.save()

    try {
      // Process voice input if provided
      let processedSymptoms = symptoms
      if (voiceInput && voiceInput.transcript) {
        const voiceSymptoms = await processVoiceInput(voiceInput.transcript, language)
        processedSymptoms = [...symptoms, ...voiceSymptoms]
      }

      // Analyze symptoms using Gemini AI
      const aiAnalysis = await analyzeSymptoms({
        symptoms: processedSymptoms,
        temperature,
        emotions,
        additionalInfo,
        language,
        userAge: req.user.age,
        userGender: req.user.healthProfile?.gender,
      })

      // Update analysis with results
      analysis.analysis = aiAnalysis
      analysis.confidence = aiAnalysis.confidence || 75
      analysis.processingTime = Date.now() - startTime
      analysis.status = "completed"

      await analysis.save()

      // Emit real-time update via Socket.IO
      const io = req.app.get("io")
      io.to(`user_${req.user.id}`).emit("symptom_analysis_complete", {
        sessionId,
        analysis: aiAnalysis,
      })

      logger.info(`Symptom analysis completed for user ${req.user.id}, session ${sessionId}`)

      res.json({
        success: true,
        message: "Symptom analysis completed successfully",
        data: {
          sessionId,
          analysis: aiAnalysis,
          confidence: analysis.confidence,
          processingTime: analysis.processingTime,
        },
      })
    } catch (aiError) {
      // Update analysis status to failed
      analysis.status = "failed"
      analysis.processingTime = Date.now() - startTime
      await analysis.save()

      logger.error(`AI analysis error: ${aiError.message}`)

      res.status(500).json({
        success: false,
        message: "Failed to analyze symptoms. Please try again.",
        sessionId,
      })
    }
  } catch (error) {
    logger.error(`Symptom analysis error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error during symptom analysis",
    })
  }
})

// @route   GET /api/symptoms/history
// @desc    Get user's symptom analysis history
// @access  Private
router.get("/history", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query

    const query = { user: req.user.id }
    if (status) {
      query.status = status
    }

    const analyses = await SymptomAnalysis.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-metadata -input.voiceInput")

    const total = await SymptomAnalysis.countDocuments(query)

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
    logger.error(`Get symptom history error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   GET /api/symptoms/analysis/:sessionId
// @desc    Get specific symptom analysis
// @access  Private
router.get("/analysis/:sessionId", auth, async (req, res) => {
  try {
    const { sessionId } = req.params

    const analysis = await SymptomAnalysis.findOne({
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
    logger.error(`Get symptom analysis error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/symptoms/feedback/:sessionId
// @desc    Submit feedback for symptom analysis
// @access  Private
router.post(
  "/feedback/:sessionId",
  auth,
  [
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
      const { helpful, rating, comment, reportedIssues = [] } = req.body

      const analysis = await SymptomAnalysis.findOne({
        sessionId,
        user: req.user.id,
      })

      if (!analysis) {
        return res.status(404).json({
          success: false,
          message: "Analysis not found",
        })
      }

      await analysis.addFeedback(helpful, rating, comment, reportedIssues)

      logger.info(`Feedback submitted for analysis ${sessionId} by user ${req.user.id}`)

      res.json({
        success: true,
        message: "Feedback submitted successfully",
      })
    } catch (error) {
      logger.error(`Submit feedback error: ${error.message}`)
      res.status(500).json({
        success: false,
        message: "Server error",
      })
    }
  },
)

// @route   GET /api/symptoms/common
// @desc    Get common symptoms and conditions
// @access  Public
router.get("/common", async (req, res) => {
  try {
    const { language = "en" } = req.query

    // Get common symptoms from recent analyses
    const commonSymptoms = await SymptomAnalysis.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
        },
      },
      {
        $unwind: "$input.symptoms",
      },
      {
        $group: {
          _id: "$input.symptoms.name",
          count: { $sum: 1 },
          avgSeverity: { $avg: "$input.symptoms.severity" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 20,
      },
    ])

    // Get common conditions
    const commonConditions = await SymptomAnalysis.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $unwind: "$analysis.possibleConditions",
      },
      {
        $group: {
          _id: "$analysis.possibleConditions.name",
          count: { $sum: 1 },
          avgProbability: { $avg: "$analysis.possibleConditions.probability" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 15,
      },
    ])

    res.json({
      success: true,
      data: {
        symptoms: commonSymptoms,
        conditions: commonConditions,
      },
    })
  } catch (error) {
    logger.error(`Get common symptoms error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// @route   POST /api/symptoms/voice-process
// @desc    Process voice input for symptoms
// @access  Private
router.post(
  "/voice-process",
  auth,
  [
    body("transcript").notEmpty().withMessage("Transcript is required"),
    body("language").optional().isIn(["en", "ne", "hi"]).withMessage("Invalid language"),
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

      const { transcript, language = "en", confidence } = req.body

      // Process voice input to extract symptoms
      const extractedSymptoms = await processVoiceInput(transcript, language)

      res.json({
        success: true,
        data: {
          originalTranscript: transcript,
          extractedSymptoms,
          confidence,
          language,
        },
      })
    } catch (error) {
      logger.error(`Voice processing error: ${error.message}`)
      res.status(500).json({
        success: false,
        message: "Failed to process voice input",
      })
    }
  },
)

export default router
