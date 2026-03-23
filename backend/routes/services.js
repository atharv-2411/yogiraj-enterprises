const express = require("express");
const router = express.Router();
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
} = require("../controllers/serviceController");
const { protect } = require("../middleware/auth");
const { serviceImageUpload } = require("../middleware/upload");

router.route("/").get(getServices).post(protect, serviceImageUpload, createService);

router
  .route("/:id")
  .get(getService)
  .put(protect, serviceImageUpload, updateService)
  .delete(protect, deleteService);

module.exports = router;
