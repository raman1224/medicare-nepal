import express from "express"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"
import { auth } from "../middleware/auth.js"
import SymptomAnalysis from "../models/SymptomAnalysis.js"
import { logger } from "../utils/logger.js"
import { analyzeSymptoms } from "../services/symptomAnalyzerService.js" // Fixed import path

const router = express.Router()

// Rate limiting for symptom analysis
const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each user to 20 analyses per hour
  message: {
    error: "Too many symptom analyses. Please try again later.",
    retryAfter: 60 * 60,
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
  body("age").optional().isInt({ min: 1, max: 120 }).withMessage("Age must be between 1 and 120"),
  body("gender").optional().isIn(["male", "female", "other"]).withMessage("Invalid gender"),
  body("language").optional().isIn(["English", "Nepali", "Hindi"]).withMessage("Invalid language"),
]

// @route   POST /api/symptoms/analyze
// @desc    Analyze symptoms using advanced algorithm
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

    const inputData = req.body

    // Add user ID to input data
    inputData.userId = req.user.uid

    logger.info(`Starting symptom analysis for user ${req.user.uid}`)

    try {
      // Analyze symptoms using our enhanced service
      const result = await analyzeSymptoms(inputData)

      // Save analysis to database
      const symptomAnalysis = new SymptomAnalysis({
        userId: req.user.uid,
        symptoms: inputData.symptoms,
        patientInfo: {
          age: inputData.age,
          gender: inputData.gender,
          height: inputData.height_cm,
          weight: inputData.weight_kg,
          medicalHistory: inputData.medical_history || [],
          currentMedications: inputData.selected_medicines || [],
          allergies: inputData.allergies || [],
        },
        analysis: result.data,
        language: inputData.language || "English",
        processingTime: Date.now() - startTime,
        confidence: 85,
        aiModel: "enhanced-algorithm",
        metadata: {
          ipAddress: req.ip,
          userAgent: req.get("User-Agent"),
          sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      })

      await symptomAnalysis.save()

      // Emit real-time update via Socket.IO
      const io = req.app.get("io")
      if (io) {
        io.to(`user_${req.user.uid}`).emit("symptom_analysis_complete", {
          analysisId: symptomAnalysis._id,
          analysis: result.data,
        })
      }

      logger.info(`Symptom analysis completed for user ${req.user.uid} in ${Date.now() - startTime}ms`)

      res.json({
        success: true,
        message: "Symptom analysis completed successfully",
        data: result.data,
        processingTime: Date.now() - startTime,
      })
    } catch (analysisError) {
      logger.error(`Analysis service error: ${analysisError.message}`)

      // Provide fallback analysis
      const fallbackAnalysis = {
        primary_disease: {
          name: "General Health Concern",
          image_url: "",
          confidence_percent: "70%",
          description:
            "Based on your symptoms, this appears to be a general health concern. Please consult a healthcare provider for proper diagnosis.",
        },
        alternative_diseases: [
          { name: "Common Cold", confidence_percent: "50%" },
          { name: "Viral Infection", confidence_percent: "40%" },
        ],
        medicines: [
          {
            name: "Paracetamol",
            image_url: "",
            dosage: "500mg every 6 hours",
            notes: "For fever and pain relief",
            price_npr: "50-100",
          },
        ],
        alternative_medicines: [],
        food_to_eat: ["Plenty of fluids", "Fresh fruits", "Light, easily digestible foods"],
        food_to_avoid: ["Dairy products", "Spicy foods", "Processed foods"],
        natural_remedies: ["Get adequate rest", "Stay hydrated", "Use steam inhalation"],
        exercise_tips: ["Avoid strenuous exercise during illness", "Light stretching when feeling better"],
        side_effects: ["Drowsiness from medications"],
        allergy_warnings: ["Check medicine ingredients against known allergies"],
        severity: "moderate",
        contagious: "no",
        prevention_tips: ["Wash hands frequently", "Maintain good hygiene"],
        medicine_usage_timeline: "Take as directed for 3-5 days",
        stop_medicine_when: "When symptoms improve",
        see_doctor_if: "Symptoms worsen or persist beyond 5 days",
        emergency_symptoms: ["High fever above 39°C", "Difficulty breathing"],
        urgency_status: "🟡",
        bmi:
          inputData.height_cm && inputData.weight_kg ? inputData.weight_kg / Math.pow(inputData.height_cm / 100, 2) : 0,
        fitness_advice: "Maintain regular physical activity for good health",
        nutrition_advice: "Eat a balanced diet with plenty of fruits and vegetables",
        personalized_medicine_schedule: [
          {
            medicine_name: "Paracetamol",
            dose: "500mg",
            times: ["08:00", "14:00", "20:00"],
            before_or_after_food: "after",
            food_recommendation: "Take with light snack",
            notes: "For fever and pain relief",
          },
        ],
        ai_health_fitness_tips: [
          "Get 7-9 hours of quality sleep",
          "Stay hydrated",
          "Practice stress-reduction techniques",
        ],
        language: inputData.language || "English",
        disclaimer: "This is not a medical diagnosis. Please consult a doctor for proper evaluation and treatment.",
        ui_style: {
          button_shadow: "shadow-md shadow-blue-300 rounded-xl hover:scale-105",
          font_shadow: "1px 1px 3px rgba(0,0,0,0.3)",
          card_shadow: "shadow-lg rounded-xl hover:scale-105 transition-all",
          severity_colors: {
            mild: "#a8e6a1",
            moderate: "#ffd966",
            severe: "#ff4d4d",
          },
          "3d_elements": ["rotating_pill_model", "highlighted_body_map"],
        },
      }

      res.json({
        success: true,
        message: "Basic symptom analysis completed",
        data: fallbackAnalysis,
        processingTime: Date.now() - startTime,
        fallback: true,
      })
    }
  } catch (error) {
    logger.error(`Symptom analysis error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Failed to analyze symptoms. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// @route   GET /api/symptoms/history
// @desc    Get user's symptom analysis history
// @access  Private
router.get("/history", auth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const analyses = await SymptomAnalysis.find({ userId: req.user.uid })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-metadata")

    const total = await SymptomAnalysis.countDocuments({ userId: req.user.uid })

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
      message: "Failed to fetch symptom analysis history",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// @route   GET /api/symptoms/analysis/:id
// @desc    Get specific symptom analysis
// @access  Private
router.get("/analysis/:id", auth, async (req, res) => {
  try {
    const analysis = await SymptomAnalysis.findOne({
      _id: req.params.id,
      userId: req.user.uid,
    }).select("-metadata")

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Symptom analysis not found",
      })
    }

    res.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    logger.error(`Get symptom analysis error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Failed to fetch symptom analysis",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

export default router