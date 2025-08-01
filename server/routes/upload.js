import express from "express"
import multer from "multer"
import { auth } from "../middleware/auth.js"
// import { uploadToCloudinary } from "../utils/cloudinary.js"
import { uploadImage as uploadToCloudinary } from "../utils/cloudinary.js"

import { logger } from "../utils/logger.js"

const router = express.Router()

// Configure multer
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

// @route   POST /api/upload/image
// @desc    Upload image to Cloudinary
// @access  Private
router.post("/image", auth, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      })
    }

    const { folder = "general" } = req.body

    // Upload to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, {
      folder: `medicare-nepal/${folder}`,
      public_id: `${Date.now()}_${req.user.id}`,
      resource_type: "image",
    })

    logger.info(`Image uploaded by user ${req.user.id}: ${imageUrl}`)

    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: imageUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    })
  } catch (error) {
    logger.error(`Image upload error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Failed to upload image",
    })
  }
})

// @route   POST /api/upload/multiple
// @desc    Upload multiple images
// @access  Private
router.post("/multiple", auth, upload.array("images", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided",
      })
    }

    const { folder = "general" } = req.body
    const uploadPromises = req.files.map(async (file, index) => {
      const imageUrl = await uploadToCloudinary(file.buffer, {
        folder: `medicare-nepal/${folder}`,
        public_id: `${Date.now()}_${req.user.id}_${index}`,
        resource_type: "image",
      })

      return {
        url: imageUrl,
        originalName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      }
    })

    const uploadedImages = await Promise.all(uploadPromises)

    logger.info(`${uploadedImages.length} images uploaded by user ${req.user.id}`)

    res.json({
      success: true,
      message: `${uploadedImages.length} images uploaded successfully`,
      data: { images: uploadedImages },
    })
  } catch (error) {
    logger.error(`Multiple image upload error: ${error.message}`)
    res.status(500).json({
      success: false,
      message: "Failed to upload images",
    })
  }
})

export default router
