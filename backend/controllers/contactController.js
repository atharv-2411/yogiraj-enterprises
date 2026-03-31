const { validationResult } = require("express-validator");
const ContactMessage = require("../models/ContactMessage");
const { sendMail } = require("../utils/mailer");
const { contactConfirmationTemplate } = require("../utils/emailTemplates");

// @desc    Create contact message (public)
// @route   POST /api/contact
// @access  Public
const createMessage = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { name, company, email, phone, message } = req.body;
    const contactMessage = await ContactMessage.create({ name, company, email, phone, message });

    console.log(`[Contact] New message from: ${name} <${email}>`);

    try {
      await sendMail(
        email,
        "Your message has been received – Yogiraj Enterprises",
        contactConfirmationTemplate(name, company, email, phone, message)
      );
    } catch (_) {}

    res.status(201).json({
      success: true,
      data: contactMessage,
      message: "Message sent successfully. We will respond within 24 hours.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact messages (admin)
// @route   GET /api/contact
// @access  Protected
const getMessages = async (req, res, next) => {
  try {
    const { isRead, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (isRead !== undefined) filter.isRead = isRead === "true";

    const skip = (Number(page) - 1) * Number(limit);
    const total = await ContactMessage.countDocuments(filter);
    const messages = await ContactMessage.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    console.log(`[Contact] Fetched ${messages.length} messages`);
    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark message as read
// @route   PUT /api/contact/:id/read
// @access  Protected
const markAsRead = async (req, res, next) => {
  try {
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" });
    }

    console.log(`[Contact] Marked as read: ${message._id}`);
    res.status(200).json({ success: true, data: message, message: "Message marked as read" });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Protected
const deleteMessage = async (req, res, next) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" });
    }

    console.log(`[Contact] Deleted message: ${message._id}`);
    res.status(200).json({ success: true, data: {}, message: "Message deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createMessage, getMessages, markAsRead, deleteMessage };
