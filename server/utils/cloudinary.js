import { v2 as cloudinary } from "cloudinary"
import { logger } from "./logger.js"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadImage = async (file, folder = "medicare-nepal") => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "auto",
      quality: "auto",
      fetch_format: "auto",
      transformation: [{ width: 1000, height: 1000, crop: "limit" }, { quality: "auto" }],
    })

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    }
  } catch (error) {
    logger.error(`Cloudinary upload error: ${error.message}`)
    throw new Error("Failed to upload image")
  }
}

export const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (error) {
    logger.error(`Cloudinary delete error: ${error.message}`)
    throw new Error("Failed to delete image")
  }
}

export const uploadMultipleImages = async (files, folder = "medicare-nepal") => {
  try {
    const uploadPromises = files.map((file) => uploadImage(file, folder))
    const results = await Promise.all(uploadPromises)
    return results
  } catch (error) {
    logger.error(`Cloudinary multiple upload error: ${error.message}`)
    throw new Error("Failed to upload multiple images")
  }
}

export const generateImageUrl = (publicId, transformations = {}) => {
  try {
    return cloudinary.url(publicId, {
      ...transformations,
      secure: true,
    })
  } catch (error) {
    logger.error(`Cloudinary URL generation error: ${error.message}`)
    return null
  }
}
