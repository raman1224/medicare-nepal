import cloudinary from 'cloudinary';
import { v2 as cloudinaryV2 } from 'cloudinary'; // Use V2 API for better functionality

// Initialize Cloudinary with your credentials from environment variables
cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Your Cloudinary Cloud name
  api_key: process.env.CLOUDINARY_API_KEY,      // Your Cloudinary API key
  api_secret: process.env.CLOUDINARY_API_SECRET, // Your Cloudinary API secret
});

// Function to upload image to Cloudinary
export const uploadToCloudinary = async (fileBuffer, options) => {
  try {
    // Return a promise that resolves when upload is successful
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinaryV2.uploader.upload_stream(
        {
          resource_type: 'image', // Specify image upload
          ...options, // Add additional options like folder, public_id, etc.
        },
        (error, result) => {
          if (error) {
            return reject(new Error(`Failed to upload image: ${error.message}`));
          }
          resolve(result); // On success, resolve the result
        }
      );
      // Pipe the fileBuffer into Cloudinary's upload stream
      fileBuffer.pipe(uploadStream);
    });
    
    // Return the upload result, which contains image URL and other metadata
    return result;
  } catch (error) {
    throw new Error(`Cloudinary upload failed: ${error.message}`);
  }
};
