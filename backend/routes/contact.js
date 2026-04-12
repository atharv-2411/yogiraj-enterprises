const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  createMessage,
  getMessages,
  markAsRead,
  deleteMessage,
  replyToMessage,
} = require("../controllers/contactController");
const { protect } = require("../middleware/auth");

const validateContact = [
  body("name").notEmpty().withMessage("Name is required"),
  body("email").isEmail().withMessage("Please provide a valid email address"),
  body("message").notEmpty().withMessage("Message is required"),
];

router.route("/").post(validateContact, createMessage).get(protect, getMessages);

router.put("/:id/read", protect, markAsRead);
router.post("/:id/reply", protect, replyToMessage);
router.delete("/:id", protect, deleteMessage);

module.exports = router;
