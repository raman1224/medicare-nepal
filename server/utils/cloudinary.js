import { v2 as cloudinary } from "cloudinary"
import { logger } from "./logger.js"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Upload image to Cloudinary
export const uploadToCloudinary = async (file, folder = "medicare-nepal") => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: folder,
      resource_type: "auto",
      quality: "auto",
      fetch_format: "auto",
    })

    logger.info(`Image uploaded to Cloudinary: ${result.public_id}`)

    return {
      public_id: result.public_id,
      url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
    }
  } catch (error) {
    logger.error(`Cloudinary upload error: ${error.message}`)
    throw new Error(`Failed to upload image: ${error.message}`)
  }
}

// Delete image from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    logger.info(`Image deleted from Cloudinary: ${publicId}`)
    return result
  } catch (error) {
    logger.error(`Cloudinary delete error: ${error.message}`)
    throw new Error(`Failed to delete image: ${error.message}`)
  }
}

// Upload image from buffer
export const uploadBufferToCloudinary = async (buffer, folder = "medicare-nepal") => {
  try {
    return new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: folder,
            resource_type: "auto",
            quality: "auto",
            fetch_format: "auto",
          },
          (error, result) => {
            if (error) {
              logger.error(`Cloudinary buffer upload error: ${error.message}`)
              reject(new Error(`Failed to upload image: ${error.message}`))
            } else {
              logger.info(`Image uploaded to Cloudinary: ${result.public_id}`)
              resolve({
                public_id: result.public_id,
                url: result.secure_url,
                width: result.width,
                height: result.height,
                format: result.format,
                resource_type: result.resource_type,
              })
            }
          },
        )
        .end(buffer)
    })
  } catch (error) {
    logger.error(`Cloudinary buffer upload error: ${error.message}`)
    throw new Error(`Failed to upload image: ${error.message}`)
  }
}

export default cloudinary
