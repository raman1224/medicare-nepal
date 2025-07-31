import { v2 as cloudinary } from "cloudinary"
import { logger } from "./logger.js"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadToCloudinary = async (buffer, options = {}) => {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: "auto",
          ...options,
        },
        (error, result) => {
          if (error) {
            logger.error(`Cloudinary upload error: ${error.message}`)
            reject(new Error("Failed to upload image"))
          } else {
            logger.info(`Image uploaded to Cloudinary: ${result.public_id}`)
            resolve(result.secure_url)
          }
        },
      )
      uploadStream.end(buffer)
    })
  } catch (error) {
    logger.error(`Cloudinary upload error: ${error.message}`)
    throw new Error("Failed to upload to Cloudinary")
  }
}

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    logger.info(`Image deleted from Cloudinary: ${publicId}`)
    return result
  } catch (error) {
    logger.error(`Cloudinary delete error: ${error.message}`)
    throw new Error("Failed to delete from Cloudinary")
  }
}
