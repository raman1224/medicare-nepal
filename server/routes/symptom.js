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
  max: 15, // increased limit for better user experience
  message: {
    error: "Too many symptom analyses. Please try again later.",
    retryAfter: 60 * 60, // 1 hour in seconds
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Enhanced validation rules
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
  body("painLevel").optional().isInt({ min: 0, max: 10 }).withMessage("Pain level must be between 0 and 10"),
  body("symptomDuration").optional().isString().withMessage("Symptom duration must be a string"),
  body("language").optional().isIn(["en", "ne", "hi"]).withMessage("Language must be en, ne, or hi"),
]

// Helper function to emit real-time progress updates
const emitProgress = (io, userId, sessionId, progress, step) => {
  io.to(`user_${userId}`).emit("symptom_analysis_progress", {
    sessionId,
    progress,
    step,
    timestamp: new Date().toISOString()
  })
}

// @route   POST /api/symptoms/analyze
// @desc    Analyze symptoms using AI with real-time updates
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
      painLevel = 0,
      symptomDuration = "",
      language = "en",
    } = req.body

    // Generate unique session ID
    const sessionId = uuidv4()
    const io = req.app.get("io")

    // Send initial progress update
    emitProgress(io, req.user.id, sessionId, 10, "Initializing analysis...")

    // Create analysis record
    const analysis = new SymptomAnalysis({
      user: req.user.id,
      sessionId,
      input: {
        symptoms: symptoms.map((symptom) => ({
          name: symptom,
          severity: Math.min(Math.max(painLevel / 2, 1), 5), // Convert pain level to severity
          duration: symptomDuration || "unknown",
          description: symptom,
        })),
        temperature,
        emotions,
        additionalInfo,
        images,
        voiceInput,
        painLevel,
        symptomDuration,
      },
      language,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get("User-Agent"),
        timestamp: new Date(),
      },
    })

    await analysis.save()
    emitProgress(io, req.user.id, sessionId, 25, "Processing symptoms...")

    try {
      // Process voice input if provided
      let processedSymptoms = symptoms
      if (voiceInput && voiceInput.transcript) {
        emitProgress(io, req.user.id, sessionId, 35, "Processing voice input...")
        const voiceSymptoms = await processVoiceInput(voiceInput.transcript, language)
        processedSymptoms = [...symptoms, ...voiceSymptoms]
      }

      emitProgress(io, req.user.id, sessionId, 50, "Analyzing with AI...")

      // Analyze symptoms using Gemini AI with enhanced parameters
      const aiAnalysis = await analyzeSymptoms({
        symptoms: processedSymptoms,
        temperature,
        emotions,
        additionalInfo,
        language,
        userAge: req.user.age,
        userGender: req.user.healthProfile?.gender,
        painLevel,
        symptomDuration,
      })

      emitProgress(io, req.user.id, sessionId, 80, "Generating recommendations...")

      // Update analysis with results
      analysis.analysis = aiAnalysis
      analysis.confidence = aiAnalysis.confidence || 75
      analysis.processingTime = Date.now() - startTime
      analysis.status = "completed"

      await analysis.save()
      emitProgress(io, req.user.id, sessionId, 95, "Finalizing results...")

      // Emit real-time completion update via Socket.IO
      io.to(`user_${req.user.id}`).emit("symptom_analysis_complete", {
        sessionId,
        analysis: aiAnalysis,
        processingTime: analysis.processingTime,
        timestamp: new Date().toISOString()
      })

      emitProgress(io, req.user.id, sessionId, 100, "Analysis complete!")

      logger.info(`Symptom analysis completed for user ${req.user.id}, session ${sessionId}, processing time: ${analysis.processingTime}ms`)

      res.json({
        success: true,
        message: "Symptom analysis completed successfully",
        data: {
          sessionId,
          analysis: aiAnalysis,
          confidence: analysis.confidence,
          processingTime: analysis.processingTime,
          timestamp: new Date().toISOString(),
        },
      })
    } catch (aiError) {
      // Update analysis status to failed
      analysis.status = "failed"
      analysis.processingTime = Date.now() - startTime
      analysis.errorMessage = aiError.message
      await analysis.save()

      // Emit failure notification
      io.to(`user_${req.user.id}`).emit("symptom_analysis_failed", {
        sessionId,
        error: "Analysis failed. Please try again.",
        timestamp: new Date().toISOString()
      })

      logger.error(`AI analysis error for session ${sessionId}: ${aiError.message}`)

      res.status(500).json({
        success: false,
        message: "Failed to analyze symptoms. Please try again.",
        sessionId,
        error: process.env.NODE_ENV === 'development' ? aiError.message : undefined,
      })
    }
  } catch (error) {
    logger.error(`Symptom analysis error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error during symptom analysis",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    })
  }
})

// @route   GET /api/symptoms/history
// @desc    Get user's symptom analysis history with enhanced filtering
// @access  Private
router.get("/history", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, dateFrom, dateTo, riskLevel } = req.query

    const query = { user: req.user.id }
    
    if (status) {
      query.status = status
    }
    
    if (riskLevel) {
      query["analysis.riskLevel"] = riskLevel
    }
    
    if (dateFrom || dateTo) {
      query.createdAt = {}
      if (dateFrom) query.createdAt.$gte = new Date(dateFrom)
      if (dateTo) query.createdAt.$lte = new Date(dateTo)
    }

    const analyses = await SymptomAnalysis.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-metadata -input.voiceInput")
      .populate("user", "name email")

    const total = await SymptomAnalysis.countDocuments(query)

    // Calculate statistics
    const stats = await SymptomAnalysis.aggregate([
      { $match: { user: req.user.id, status: "completed" } },
      {
        $group: {
          _id: null,
          avgConfidence: { $avg: "$confidence" },
          avgProcessingTime: { $avg: "$processingTime" },
          totalAnalyses: { $sum: 1 },
          riskLevels: {
            $push: "$analysis.riskLevel"
          }
        }
      }
    ])

    res.json({
      success: true,
      data: {
        analyses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
          limit: parseInt(limit)
        },
        statistics: stats[0] || {
          avgConfidence: 0,
          avgProcessingTime: 0,
          totalAnalyses: 0,
          riskLevels: []
        }
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
// @desc    Get specific symptom analysis with detailed information
// @access  Private
router.get("/analysis/:sessionId", auth, async (req, res) => {
  try {
    const { sessionId } = req.params

    const analysis = await SymptomAnalysis.findOne({
      sessionId,
      user: req.user.id,
    }).select("-metadata").populate("user", "name email age")

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found",
      })
    }

    // Add related analyses for comparison
    const relatedAnalyses = await SymptomAnalysis.find({
      user: req.user.id,
      _id: { $ne: analysis._id },
      status: "completed"
    })
    .sort({ createdAt: -1 })
    .limit(3)
    .select("sessionId createdAt analysis.possibleConditions analysis.confidence analysis.riskLevel")

    res.json({
      success: true,
      data: { 
        analysis,
        relatedAnalyses,
        insights: {
          isRecurring: relatedAnalyses.some(ra => 
            ra.analysis.possibleConditions.some(pc => 
              analysis.analysis.possibleConditions.some(apc => apc.name === pc.name)
            )
          ),
          improvementTrend: calculateImprovementTrend(analysis, relatedAnalyses),
          riskTrend: calculateRiskTrend(analysis, relatedAnalyses)
        }
      },
    })
  } catch (error) {
    logger.error(`Get symptom analysis error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
})

// Helper functions for trend analysis
const calculateImprovementTrend = (currentAnalysis, previousAnalyses) => {
  if (previousAnalyses.length === 0) return "no_data"
  
  const currentRisk = getRiskScore(currentAnalysis.analysis.riskLevel)
  const avgPreviousRisk = previousAnalyses.reduce((sum, analysis) => 
    sum + getRiskScore(analysis.analysis.riskLevel), 0) / previousAnalyses.length
  
  if (currentRisk < avgPreviousRisk) return "improving"
  if (currentRisk > avgPreviousRisk) return "worsening"
  return "stable"
}

const calculateRiskTrend = (currentAnalysis, previousAnalyses) => {
  const riskHistory = [currentAnalysis, ...previousAnalyses]
    .map(a => getRiskScore(a.analysis?.riskLevel || "medium"))
    .slice(0, 5) // Last 5 analyses
  
  if (riskHistory.length < 2) return "insufficient_data"
  
  const trend = riskHistory[0] - riskHistory[riskHistory.length - 1]
  if (trend > 0) return "increasing"
  if (trend < 0) return "decreasing"
  return "stable"
}

const getRiskScore = (riskLevel) => {
  const scores = { low: 1, medium: 2, high: 3, critical: 4 }
  return scores[riskLevel] || 2
}

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
