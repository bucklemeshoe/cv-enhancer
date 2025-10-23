const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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

/**
 * Generate video thumbnail from URL
 * @param {string} videoUrl - Video URL (YouTube, TikTok, etc.)
 * @returns {Promise<Object>} Thumbnail result
 */
async function generateVideoThumbnail(videoUrl) {
  try {
    // For now, return the original URL as we'll handle thumbnails client-side
    // In the future, we could use Cloudinary's video analysis features
    return {
      success: true,
      thumbnailUrl: videoUrl,
      videoUrl: videoUrl
    };
  } catch (error) {
    console.error('Video thumbnail generation failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Validate video URL format
 * @param {string} url - Video URL to validate
 * @returns {boolean} True if valid video URL
 */
function isValidVideoUrl(url) {
  if (!url) return false;
  
  const videoPatterns = [
    /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/,
    /^https?:\/\/(www\.)?tiktok\.com\/.+/,
    /^https?:\/\/(www\.)?instagram\.com\/.+/,
    /^https?:\/\/(www\.)?vimeo\.com\/.+/
  ];
  
  return videoPatterns.some(pattern => pattern.test(url));
}

module.exports = {
  uploadProfilePhoto,
  deleteImage,
  getOptimizedImageUrl,
  extractPublicId,
  isCloudinaryUrl,
  isBase64DataUrl,
  generateVideoThumbnail,
  isValidVideoUrl,
  cloudinary
};
