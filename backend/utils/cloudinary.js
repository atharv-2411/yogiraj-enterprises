const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Delete an image or file from Cloudinary by its public ID
 * @param {string} publicId - The Cloudinary public ID of the asset
 * @param {string} resourceType - "image" | "raw" | "video" (default: "image")
 * @returns {Promise<object>} Cloudinary deletion result
 */
const deleteImage = async (publicId, resourceType = "image") => {
  try {
    if (!publicId) {
      console.log("[Cloudinary] No publicId provided, skipping deletion");
      return null;
    }
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log(`[Cloudinary] Deleted asset: ${publicId} → ${result.result}`);
    return result;
  } catch (error) {
    console.error(`[Cloudinary] Error deleting asset ${publicId}:`, error.message);
    throw error;
  }
};

// Upload presets / folder paths for different resource types
const uploadFolders = {
  products: "yogiraj/products",
  clients: "yogiraj/clients",
  enquiries: "yogiraj/enquiries",
  services: "yogiraj/services",
  specsheets: "yogiraj/specsheets",
};

module.exports = { cloudinary, deleteImage, uploadFolders };
