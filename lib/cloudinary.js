const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dokcs4daz',
  api_key: process.env.CLOUDINARY_API_KEY || '172165474278718',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'qGhgTVutnXU6C_3MtSZ3XJ2MLTY',
});

/**
 * Upload a file to Cloudinary with optimized settings for CV profile photos
 * @param {Buffer|string} file - File buffer or file path
 * @param {Object} options - Upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
async function uploadProfilePhoto(file, options = {}) {
  try {
    const uploadOptions = {
      folder: 'cv-builder/profile-photos',
      resource_type: 'image',
      quality: 'auto:good',
      ...options
    };

    // Convert Buffer to data URI if needed
    let uploadData = file;
    if (Buffer.isBuffer(file)) {
      const mimeType = 'image/jpeg'; // Default to JPEG
      const base64 = file.toString('base64');
      uploadData = `data:${mimeType};base64,${base64}`;
    }

    const result = await cloudinary.uploader.upload(uploadData, uploadOptions);
    
    console.log('Cloudinary upload successful:', {
      public_id: result.public_id,
      secure_url: result.secure_url,
      bytes: result.bytes,
      format: result.format
    });

    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      bytes: result.bytes,
      format: result.format
    };
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} Deletion result
 */
async function deleteImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log('Cloudinary deletion result:', result);
    return {
      success: result.result === 'ok',
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary deletion failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Generate optimized image URL for different use cases
 * @param {string} publicId - Cloudinary public ID
 * @param {Object} transformations - Image transformations
 * @returns {string} Optimized image URL
 */
function getOptimizedImageUrl(publicId, transformations = {}) {
  const defaultTransformations = {
    quality: 'auto:good',
    format: 'auto',
    ...transformations
  };

  return cloudinary.url(publicId, defaultTransformations);
}

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID or null if not a Cloudinary URL
 */
function extractPublicId(url) {
  if (!url || !url.includes('cloudinary.com')) {
    return null;
  }
  
  const match = url.match(/\/upload\/[^\/]+\/(.+)$/);
  return match ? match[1] : null;
}

/**
 * Check if a URL is a Cloudinary URL
 * @param {string} url - URL to check
 * @returns {boolean} True if it's a Cloudinary URL
 */
function isCloudinaryUrl(url) {
  return url && url.includes('cloudinary.com');
}

/**
 * Check if a string is a base64 data URL
 * @param {string} str - String to check
 * @returns {boolean} True if it's a base64 data URL
 */
function isBase64DataUrl(str) {
  return str && str.startsWith('data:image/') && str.includes('base64,');
}

module.exports = {
  uploadProfilePhoto,
  deleteImage,
  getOptimizedImageUrl,
  extractPublicId,
  isCloudinaryUrl,
  isBase64DataUrl,
  cloudinary
};
