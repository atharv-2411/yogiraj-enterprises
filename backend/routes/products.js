const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductGallery,
  deleteGalleryImage,
  uploadSpecSheet,
} = require("../controllers/productController");
const { protect } = require("../middleware/auth");
const {
  productImageUpload,
  productGalleryUpload,
  specSheetUpload,
} = require("../middleware/upload");

router.route("/").get(getProducts).post(protect, productImageUpload, createProduct);

router
  .route("/:id")
  .get(getProduct)
  .put(protect, productImageUpload, updateProduct)
  .delete(protect, deleteProduct);

router.post("/:id/gallery", protect, productGalleryUpload, uploadProductGallery);
router.delete("/:id/gallery/:publicId", protect, deleteGalleryImage);
router.post("/:id/specsheet", protect, specSheetUpload, uploadSpecSheet);

module.exports = router;
