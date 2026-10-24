import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();

// Configure Cloudinary SDK with credentials from .env
const isConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
  });
  console.log('✅ Cloudinary initialized with Cloud Name:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('⚠️ Cloudinary credentials not fully set in .env. Image uploads will use base64 fallback until CLOUDINARY_API_KEY & SECRET are provided.');
}

/**
 * Upload an image (base64 data URI or Buffer or file path) to Cloudinary
 * @param {string} fileInput - Base64 data string (e.g., data:image/jpeg;base64,...) or file path/buffer
 * @param {string} folder - Destination folder on Cloudinary (default: 'sems_sports')
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export async function uploadToCloudinary(fileInput, folder = 'sems_sports') {
  if (!fileInput) return null;

  // If Cloudinary is configured, upload to CDN
  if (isConfigured) {
    try {
      const result = await cloudinary.uploader.upload(fileInput, {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1200, crop: 'limit' }
        ]
      });
      return {
        url: result.secure_url,
        public_id: result.public_id
      };
    } catch (err) {
      console.error('❌ Cloudinary upload error:', err.message);
      // Fallback: return raw base64 data URI if upload fails
      return { url: fileInput, public_id: null };
    }
  }

  // Fallback when credentials are still to be supplied by user
  return {
    url: fileInput,
    public_id: null
  };
}

export { cloudinary, isConfigured };
