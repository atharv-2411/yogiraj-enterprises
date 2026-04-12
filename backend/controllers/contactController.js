const { validationResult } = require("express-validator");
const ContactMessage = require("../models/ContactMessage");
const { sendMail } = require("../utils/mailer");
const { contactConfirmationTemplate } = require("../utils/emailTemplates");

const replyTemplate = (name, replyMessage) => `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:30px 0;">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;overflow:hidden;margin:0 auto;">
  <tr><td style="background:#2563EB;padding:24px 32px;"><h1 style="margin:0;color:#fff;font-size:20px;">Yogiraj Enterprises</h1></td></tr>
  <tr><td style="padding:32px;">
    <p style="color:#1e293b;font-size:15px;">Dear ${name},</p>
    <div style="background:#f8fafc;border-left:4px solid #2563EB;padding:16px;border-radius:0 6px 6px 0;margin:16px 0;color:#1e293b;font-size:14px;line-height:1.7;">${replyMessage.replace(/\n/g, "<br/>")}</div>
    <p style="color:#64748b;font-size:13px;">Best regards,<br/><strong>Yogiraj Enterprises Team</strong></p>
  </td></tr>
  <tr><td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e2e8f0;text-align:center;">
    <p style="margin:0;color:#94a3b8;font-size:12px;">© ${new Date().getFullYear()} Yogiraj Enterprises. All rights reserved.</p>
  </td></tr>
</table>
</body></html>`;


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

// @desc    Reply to contact message
// @route   POST /api/contact/:id/reply
// @access  Protected
const replyToMessage = async (req, res, next) => {
  try {
    const { replyMessage } = req.body;
    if (!replyMessage) {
      return res.status(400).json({ success: false, error: "Reply message is required" });
    }
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, error: "Message not found" });
    }
    await sendMail(
      message.email,
      "Re: Your Message – Yogiraj Enterprises",
      replyTemplate(message.name, replyMessage)
    );
    await ContactMessage.findByIdAndUpdate(req.params.id, { isRead: true });
    console.log(`[Contact] Reply sent to: ${message.email}`);
    res.status(200).json({ success: true, message: "Reply sent successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createMessage, getMessages, markAsRead, deleteMessage, replyToMessage };
