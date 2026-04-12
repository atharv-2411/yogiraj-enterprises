const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createEnquiry,
  getEnquiries,
  getEnquiry,
  updateEnquiry,
  deleteEnquiry,
  replyToEnquiry,
} = require("../controllers/enquiryController");
const { protect } = require("../middleware/auth");
const { enquiryFilesUpload } = require("../middleware/upload");

const validateEnquiry = [
  body("company").notEmpty().withMessage("Company name is required"),
  body("contactName").notEmpty().withMessage("Contact name is required"),
  body("email").isEmail().withMessage("Please provide a valid email address"),
  body("partsDescription").notEmpty().withMessage("Parts description is required"),
];

router
  .route("/")
  .post(enquiryFilesUpload, validateEnquiry, createEnquiry)
  .get(protect, getEnquiries);

router
  .route("/:id")
  .get(protect, getEnquiry)
  .put(protect, updateEnquiry)
  .delete(protect, deleteEnquiry);

router.post("/:id/reply", protect, replyToEnquiry);

module.exports = router;
