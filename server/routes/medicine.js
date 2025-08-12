import express from "express"
import multer from "multer"
import { body, validationResult } from "express-validator"
import { devAuth } from "../middleware/devAuth.js"
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"
import { analyzeMedicineImage, analyzeFoodImage } from "../services/ocrService.js"
import { analyzeMedicineName } from "../services/medicineAnalysisService.js"
import { getMedicineInfo } from "../services/geminiService.js"
import MedicineAnalysis from "../models/MedicineAnalysis.js"
import { logger } from "../utils/logger.js"

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"), false)
    }
  },
})

// Analyze medicine by image
router.post(
  "/analyze-image",
  devAuth,
  upload.single("image"),
  [body("language").optional().isIn(["en", "ne", "hi"]).withMessage("Invalid language")],
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

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        })
      }

      const { language = "en" } = req.body

      // Upload image to Cloudinary
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "medicine-analysis")

      // Analyze image with OCR and drug APIs
      const ocrResult = await analyzeMedicineImage(req.file.buffer)

      if (!ocrResult.success) {
        return res.status(400).json({
          success: false,
          message: ocrResult.message || "Failed to analyze medicine image"
        })
      }

      // Use the primary medicine from OCR result
      const primaryMedicine = ocrResult.data.primaryMedicine
      if (!primaryMedicine) {
        return res.status(400).json({
          success: false,
          message: "No medicine information found in the image"
        })
      }

      // Save analysis to database
      const analysis = new MedicineAnalysis({
        userId: req.user.id,
        imageUrl: uploadResult.url,
        imagePublicId: uploadResult.public_id,
        detectedText: ocrResult.detectedText,
        medicineName: primaryMedicine.name,
        description: primaryMedicine.purpose,
        usage: primaryMedicine.purpose,
        dosage: primaryMedicine.dosageForm,
        sideEffects: primaryMedicine.sideEffects,
        precautions: primaryMedicine.precautions,
        language: language,
        confidence: ocrResult.data.confidence || 0.8,
      })

      await analysis.save()

      logger.info(`Medicine analysis completed for user ${req.user.id}`)

      res.json({
        success: true,
        message: "Medicine analysis completed successfully",
        data: {
          id: analysis._id,
          medicineName: primaryMedicine.name,
          description: primaryMedicine.purpose,
          usage: primaryMedicine.purpose,
          dosage: primaryMedicine.dosageForm,
          sideEffects: primaryMedicine.sideEffects,
          precautions: primaryMedicine.precautions,
          imageUrl: uploadResult.url,
          confidence: ocrResult.data.confidence || 0.8,
          detectedText: ocrResult.data.detectedText,
          language: language,
          createdAt: analysis.createdAt,
          // Additional detailed information
          genericName: primaryMedicine.genericName,
          manufacturer: primaryMedicine.manufacturer,
          storage: primaryMedicine.storage,
          whenToTake: primaryMedicine.whenToTake,
          foodInteractions: primaryMedicine.foodInteractions,
          alternatives: primaryMedicine.alternatives || [],
          price: primaryMedicine.price,
          source: primaryMedicine.source,
          totalMedicines: ocrResult.data.totalMedicines
        },
      })
    } catch (error) {
      logger.error(`Medicine image analysis error: ${error.message}`)
      res.status(500).json({
        success: false,
        message: "Failed to analyze medicine image",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      })
    }
  },
)

// Analyze food image for health insights
router.post(
  "/analyze-food",
  devAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No image file provided",
        })
      }

      // Upload image to Cloudinary
      const uploadResult = await uploadBufferToCloudinary(req.file.buffer, "food-analysis")

      // Analyze food image
      const foodResult = await analyzeFoodImage(req.file.buffer)

      if (!foodResult.success) {
        return res.status(400).json({
          success: false,
          message: foodResult.message || "Failed to analyze food image"
        })
      }

      res.json({
        success: true,
        message: "Food analysis completed successfully",
        data: {
          imageUrl: uploadResult.url,
          detectedText: foodResult.data.detectedText,
          foods: foodResult.data.foods,
          message: foodResult.message,
          confidence: foodResult.data.confidence || 0.8,
          createdAt: new Date()
        },
      })
    } catch (error) {
      logger.error(`Food image analysis error: ${error.message}`)
      res.status(500).json({
        success: false,
        message: "Failed to analyze food image",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      })
    }
  },
)

// Analyze medicine by name
router.post(
  "/analyze-name",
  devAuth,
  [
    body("medicineName").notEmpty().trim().withMessage("Medicine name is required"),
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

      const { medicineName, language = "en" } = req.body

      // Use our medicine analysis service
      const result = await analyzeMedicineName(medicineName, language)

      // Save analysis to database
      const analysis = new MedicineAnalysis({
        userId: req.user.id,
        medicineName: result.data.medicineName,
        description: result.data.usage,
        usage: result.data.usage,
        dosage: result.data.dosage,
        sideEffects: result.data.sideEffects,
        precautions: result.data.precautions,
        language: language,
        confidence: 0.9, // Higher confidence for text-based analysis
      })

      await analysis.save()

      logger.info(`Medicine name analysis completed for user ${req.user.id}`)

      res.json({
        success: true,
        message: "Medicine analysis completed successfully",
        data: result.data,
      })
    } catch (error) {
      logger.error(`Medicine name analysis error: ${error.message}`)
      res.status(500).json({
        success: false,
        message: "Failed to analyze medicine",
        error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
      })
    }
  },
)

// Get user's medicine analysis history
router.get("/history", devAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query

    const analyses = await MedicineAnalysis.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("-__v")

    const total = await MedicineAnalysis.countDocuments({ userId: req.user.id })

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
      message: "Failed to fetch medicine analysis history",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Get specific medicine analysis
router.get("/:id", devAuth, async (req, res) => {
  try {
    const analysis = await MedicineAnalysis.findOne({
      _id: req.params.id,
      userId: req.user.id,
    }).select("-__v")

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Medicine analysis not found",
      })
    }

    res.json({
      success: true,
      data: analysis,
    })
  } catch (error) {
    logger.error(`Get medicine analysis error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Failed to fetch medicine analysis",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

// Delete medicine analysis
router.delete("/:id", devAuth, async (req, res) => {
  try {
    const analysis = await MedicineAnalysis.findOne({
      _id: req.params.id,
      userId: req.user.id,
    })

    if (!analysis) {
      return res.status(404).json({
        success: false,
        message: "Medicine analysis not found",
      })
    }

    // Delete image from Cloudinary if exists
    if (analysis.imagePublicId) {
      try {
        await deleteFromCloudinary(analysis.imagePublicId)
      } catch (cloudinaryError) {
        logger.warn(`Failed to delete image from Cloudinary: ${cloudinaryError.message}`)
      }
    }

    await MedicineAnalysis.findByIdAndDelete(req.params.id)

    logger.info(`Medicine analysis deleted: ${req.params.id}`)

    res.json({
      success: true,
      message: "Medicine analysis deleted successfully",
    })
  } catch (error) {
    logger.error(`Delete medicine analysis error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Failed to delete medicine analysis",
      error: process.env.NODE_ENV === "development" ? error.message : "Internal server error",
    })
  }
})

export default router
