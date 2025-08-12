import express from "express"
import { body, validationResult } from "express-validator"
import rateLimit from "express-rate-limit"
import { devAuth } from "../middleware/devAuth.js"
import { logger } from "../utils/logger.js"

const router = express.Router()

// Rate limiting for AI analysis
const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each user to 20 analyses per hour
  message: {
    error: "Too many AI analyses. Please try again later.",
    retryAfter: 60 * 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// Validation rules
const aiAnalysisValidation = [
  body("text")
    .isString()
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage("Text must be between 1 and 2000 characters"),
  body("language")
    .optional()
    .isIn(["en", "ne", "hi"])
    .withMessage("Language must be en, ne, or hi"),
]

// DeepSeek API configuration
const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

// Analyze image/text with DeepSeek AI
const analyzeWithDeepSeek = async (text, language = 'en') => {
  try {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key not configured')
    }

    const systemPrompt = `You are a medical AI assistant specialized in healthcare for Nepal. Analyze the provided information and provide comprehensive health insights.

Important guidelines:
- Consider common diseases in Nepal (dengue, typhoid, malaria, respiratory infections)
- Suggest medicines available in Nepal
- Consider monsoon-related health issues
- Include traditional/home remedies common in Nepal
- Always recommend consulting a doctor for serious symptoms
- Provide information in ${language === "ne" ? "Nepali" : language === "hi" ? "Hindi" : "English"} context
- Be empathetic and clear in your responses
- Focus on practical, actionable advice

Analyze the following information and provide:
1. Type of analysis (medicine/food/symptom/general)
2. Confidence level (0-1)
3. Detailed analysis with recommendations
4. Warnings and precautions
5. Recommended actions
6. Specialist recommendations if needed
7. Medicine suggestions if applicable
8. Food recommendations if applicable

Respond in JSON format.`

    const userPrompt = `Please analyze this information: "${text}"

Provide a comprehensive health analysis including:
- Possible conditions or issues
- Recommended actions
- Medicines (if applicable)
- Foods to eat/avoid (if applicable)
- Specialist recommendations
- Warnings and precautions

Format the response as JSON with the following structure:
{
  "type": "medicine|food|symptom|general",
  "confidence": 0.85,
  "analysis": {
    "title": "Analysis Title",
    "description": "Detailed description",
    "recommendations": ["rec1", "rec2"],
    "warnings": ["warning1", "warning2"],
    "actions": ["action1", "action2"],
    "specialist": "Recommended specialist",
    "medicines": ["medicine1", "medicine2"],
    "foods": ["food1", "food2"]
  }
}`

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3,
      })
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status}`)
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    // Parse JSON response
    try {
      const parsedResponse = JSON.parse(aiResponse)
      return {
        success: true,
        result: {
          ...parsedResponse,
          detectedText: text,
          timestamp: new Date()
        }
      }
    } catch (parseError) {
      logger.error('Failed to parse AI response:', parseError)
      // Return fallback response
      return {
        success: true,
        result: {
          type: 'general',
          confidence: 0.7,
          detectedText: text,
          analysis: {
            title: 'Health Analysis',
            description: 'Based on the provided information, here are some general recommendations.',
            recommendations: [
              'Consult a healthcare professional for proper diagnosis',
              'Maintain a healthy lifestyle',
              'Follow any prescribed medications as directed'
            ],
            warnings: [
              'This analysis is for informational purposes only',
              'Do not self-diagnose or self-medicate'
            ],
            actions: [
              'Schedule an appointment with your doctor',
              'Keep a record of your symptoms',
              'Follow up with healthcare provider'
            ]
          },
          timestamp: new Date()
        }
      }
    }

  } catch (error) {
    logger.error('DeepSeek analysis error:', error)
    throw new Error(`AI analysis failed: ${error.message}`)
  }
}

// @route   POST /api/analyze-image
// @desc    Analyze image/text with AI
// @access  Private
router.post("/analyze-image", devAuth, analysisLimiter, aiAnalysisValidation, async (req, res) => {
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

    const { text, language = "en" } = req.body

    logger.info(`Starting AI analysis for user ${req.user.id}`)

    // Analyze with DeepSeek AI
    const result = await analyzeWithDeepSeek(text, language)

    logger.info(`AI analysis completed for user ${req.user.id} in ${Date.now() - startTime}ms`)

    res.json({
      success: true,
      message: "Analysis completed successfully",
      ...result
    })

  } catch (error) {
    logger.error(`AI analysis error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Failed to analyze with AI",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// @route   POST /api/analyze-symptom
// @desc    Analyze symptoms with AI
// @access  Private
router.post("/analyze-symptom", devAuth, analysisLimiter, [
  body("symptoms")
    .isArray({ min: 1 })
    .withMessage("At least one symptom is required"),
  body("language")
    .optional()
    .isIn(["en", "ne", "hi"])
    .withMessage("Language must be en, ne, or hi"),
], async (req, res) => {
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

    const { symptoms, language = "en" } = req.body
    const symptomsText = Array.isArray(symptoms) ? symptoms.join(", ") : symptoms

    logger.info(`Starting symptom analysis for user ${req.user.id}`)

    // Analyze symptoms with DeepSeek AI
    const result = await analyzeWithDeepSeek(symptomsText, language)

    logger.info(`Symptom analysis completed for user ${req.user.id} in ${Date.now() - startTime}ms`)

    res.json({
      success: true,
      message: "Symptom analysis completed successfully",
      ...result
    })

  } catch (error) {
    logger.error(`Symptom analysis error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Failed to analyze symptoms",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

export default router
