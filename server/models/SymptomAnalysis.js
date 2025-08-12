import mongoose from 'mongoose'

const symptomAnalysisSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  symptoms: { type: [String], required: true },
  patientInfo: {
    age: Number,
    gender: String,
    height: Number,
    weight: Number,
    medicalHistory: [String],
    currentMedications: [String],
    allergies: [String],
  },
  analysis: { type: mongoose.Schema.Types.Mixed, required: true },
  language: { type: String, default: 'English' },
  processingTime: Number,
  confidence: Number,
  aiModel: String,
  metadata: {
    ipAddress: String,
    userAgent: String,
    sessionId: String,
  },
}, { timestamps: true })

export default mongoose.model('SymptomAnalysis', symptomAnalysisSchema)








// if need then this os SymptomAnalyzer code are this // import express from 'express'
// import { body, validationResult } from 'express-validator'
// import rateLimit from 'express-rate-limit'
// import { devAuth } from '../middleware/devAuth.js'
// import { logger } from '../utils/logger.js'

// const router = express.Router()

// // Rate limiting for symptom analysis
// const analysisLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 30, // limit each user to 30 analyses per hour
//   message: {
//     error: "Too many symptom analyses. Please try again later.",
//     retryAfter: 60 * 60,
//   },
//   standardHeaders: true,
//   legacyHeaders: false,
// })

// // Validation rules
// const symptomAnalysisValidation = [
//   body("prompt")
//     .isString()
//     .trim()
//     .isLength({ min: 1, max: 2000 })
//     .withMessage("Prompt must be between 1 and 2000 characters"),
//   body("language")
//     .optional()
//     .isIn(["en", "ne", "hi"])
//     .withMessage("Language must be en, ne, or hi"),
// ]

// // DeepSeek API configuration
// const DEEPSEEK_API_URL = "https://api.deepseek.com/chat/completions"
// const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

// // Analyze symptoms with DeepSeek AI
// const analyzeWithDeepSeek = async (prompt, language = 'en') => {
//   try {
//     if (!DEEPSEEK_API_KEY) {
//       throw new Error('DeepSeek API key not configured')
//     }

//     const systemPrompt = `You are a medical AI assistant specialized in healthcare for Nepal. Analyze the provided symptoms and provide comprehensive health insights.

// Important guidelines:
// - Consider common diseases in Nepal (dengue, typhoid, malaria, respiratory infections)
// - Suggest medicines available in Nepal
// - Consider monsoon-related health issues
// - Include traditional/home remedies common in Nepal
// - Always recommend consulting a doctor for serious symptoms
// - Provide information in ${language === "ne" ? "Nepali" : language === "hi" ? "Hindi" : "English"} context
// - Be empathetic and clear in your responses
// - Focus on practical, actionable advice

// Analyze the following symptoms and provide:
// 1. Detailed analysis with possible conditions
// 2. Recommended actions
// 3. Precautions and warnings
// 4. When to seek medical attention
// 5. General lifestyle recommendations

// Respond in JSON format with the following structure:
// {
//   "analysis": "Detailed analysis of the symptoms",
//   "recommendations": ["rec1", "rec2", "rec3"],
//   "precautions": ["prec1", "prec2", "prec3"],
//   "confidence": 0.85,
//   "type": "symptom"
// }`

//     const userPrompt = `Please analyze these symptoms: "${prompt}"

// Provide a comprehensive health analysis including:
// - Possible conditions or issues
// - Recommended actions
// - Precautions and warnings
// - When to seek medical attention
// - General lifestyle recommendations

// Format the response as JSON with the following structure:
// {
//   "analysis": "Detailed analysis of the symptoms",
//   "recommendations": ["rec1", "rec2", "rec3"],
//   "precautions": ["prec1", "prec2", "prec3"],
//   "confidence": 0.85,
//   "type": "symptom"
// }`

//     const response = await fetch(DEEPSEEK_API_URL, {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         model: 'deepseek-chat',
//         messages: [
//           {
//             role: 'system',
//             content: systemPrompt
//           },
//           {
//             role: 'user',
//             content: userPrompt
//           }
//         ],
//         max_tokens: 2000,
//         temperature: 0.3,
//       })
//     })

//     if (!response.ok) {
//       throw new Error(`DeepSeek API error: ${response.status}`)
//     }

//     const data = await response.json()
//     const aiResponse = data.choices[0].message.content

//     // Parse JSON response
//     try {
//       const parsedResponse = JSON.parse(aiResponse)
//       return {
//         success: true,
//         result: aiResponse, // Return the full JSON string for frontend parsing
//         parsed: parsedResponse
//       }
//     } catch (parseError) {
//       logger.error('Failed to parse AI response:', parseError)
//       // Return fallback response
//       return {
//         success: true,
//         result: JSON.stringify({
//           analysis: 'Based on the provided symptoms, here are some general recommendations. Please consult a healthcare professional for proper diagnosis.',
//           recommendations: [
//             'Stay hydrated and get adequate rest',
//             'Monitor your symptoms closely',
//             'Consider over-the-counter medications for symptom relief',
//             'Maintain a healthy diet and lifestyle'
//           ],
//           precautions: [
//             'Avoid self-diagnosis',
//             'Seek medical attention if symptoms worsen',
//             'Do not ignore severe symptoms',
//             'Follow prescribed medications as directed'
//           ],
//           confidence: 0.7,
//           type: 'symptom'
//         }),
//         parsed: {
//           analysis: 'Based on the provided symptoms, here are some general recommendations. Please consult a healthcare professional for proper diagnosis.',
//           recommendations: [
//             'Stay hydrated and get adequate rest',
//             'Monitor your symptoms closely',
//             'Consider over-the-counter medications for symptom relief',
//             'Maintain a healthy diet and lifestyle'
//           ],
//           precautions: [
//             'Avoid self-diagnosis',
//             'Seek medical attention if symptoms worsen',
//             'Do not ignore severe symptoms',
//             'Follow prescribed medications as directed'
//           ],
//           confidence: 0.7,
//           type: 'symptom'
//         }
//       }
//     }

//   } catch (error) {
//     logger.error('DeepSeek analysis error:', error)
//     throw new Error(`AI analysis failed: ${error.message}`)
//   }
// }

// // @route   POST /api/analyzeSymptom
// // @desc    Analyze symptoms with AI
// // @access  Private
// router.post("/", devAuth, analysisLimiter, symptomAnalysisValidation, async (req, res) => {
//   const startTime = Date.now()

//   try {
//     const errors = validationResult(req)
//     if (!errors.isEmpty()) {
//       return res.status(400).json({
//         success: false,
//         message: "Validation failed",
//         errors: errors.array(),
//       })
//     }

//     const { prompt, language = "en" } = req.body

//     logger.info(`Starting symptom analysis for user ${req.user.id}`)

//     // Analyze with DeepSeek AI
//     const result = await analyzeWithDeepSeek(prompt, language)

//     logger.info(`Symptom analysis completed for user ${req.user.id} in ${Date.now() - startTime}ms`)

//     res.json({
//       success: true,
//       message: "Analysis completed successfully",
//       result: result.result,
//       confidence: result.parsed?.confidence || 0.7,
//       type: result.parsed?.type || 'symptom'
//     })

//   } catch (error) {
//     logger.error(`Symptom analysis error: ${error.message}`)
    
//     // Return fallback response if AI fails
//     const fallbackResponse = {
//       analysis: 'Based on the provided symptoms, here are some general recommendations. Please consult a healthcare professional for proper diagnosis.',
//       recommendations: [
//         'Stay hydrated and get adequate rest',
//         'Monitor your symptoms closely',
//         'Consider over-the-counter medications for symptom relief',
//         'Maintain a healthy diet and lifestyle'
//       ],
//       precautions: [
//         'Avoid self-diagnosis',
//         'Seek medical attention if symptoms worsen',
//         'Do not ignore severe symptoms',
//         'Follow prescribed medications as directed'
//       ],
//       confidence: 0.7,
//       type: 'symptom'
//     }

//     res.json({
//       success: true,
//       message: "Analysis completed with fallback",
//       result: JSON.stringify(fallbackResponse),
//       confidence: 0.7,
//       type: 'symptom'
//     })
//   }
// })

// export default router

