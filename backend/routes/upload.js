const express = require("express");
const router = express.Router();
const { deleteAsset, getStats } = require("../controllers/uploadController");
const { protect } = require("../middleware/auth");

router.get("/stats", protect, getStats);
router.delete("/:publicId", protect, deleteAsset);

module.exports = router;
