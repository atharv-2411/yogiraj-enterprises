const { cloudinary, deleteImage } = require("../utils/cloudinary");

// @desc    Delete any Cloudinary asset by publicId
// @route   DELETE /api/upload/:publicId
// @access  Protected
const deleteAsset = async (req, res, next) => {
  try {
    const publicId = decodeURIComponent(req.params.publicId);
    const resourceType = req.query.type || "image";

    const result = await deleteImage(publicId, resourceType);
    console.log(`[Upload] Deleted asset: ${publicId}`);

    res.status(200).json({ success: true, data: result, message: "Asset deleted from Cloudinary" });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Cloudinary usage stats
// @route   GET /api/upload/stats
// @access  Protected
const getStats = async (req, res, next) => {
  try {
    const result = await cloudinary.api.usage();
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { deleteAsset, getStats };
