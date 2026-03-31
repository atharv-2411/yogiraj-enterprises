const { validationResult } = require("express-validator");
const Enquiry = require("../models/Enquiry");
const { deleteImage } = require("../utils/cloudinary");
const { sendMail } = require("../utils/mailer");
const { enquiryConfirmationTemplate } = require("../utils/emailTemplates");

// @desc    Create enquiry (public)
// @route   POST /api/enquiries
// @access  Public
const createEnquiry = async (req, res, next) => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Clean up any uploaded files if validation fails
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await deleteImage(file.filename).catch(() => {});
        }
      }
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const enquiryData = { ...req.body };

    // Parse dimensions if sent as JSON string
    if (typeof enquiryData.dimensions === "string") {
      try {
        enquiryData.dimensions = JSON.parse(enquiryData.dimensions);
      } catch {
        enquiryData.dimensions = {};
      }
    }

    // Parse deadline
    if (enquiryData.deadline) {
      enquiryData.deadline = new Date(enquiryData.deadline);
    }

    // Map uploaded files to attachments
    if (req.files && req.files.length > 0) {
      enquiryData.attachments = req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
        filename: file.originalname,
        resourceType: file.resource_type || "image",
      }));
      console.log(`[Enquiries] ${req.files.length} attachments uploaded`);
    }

    const enquiry = await Enquiry.create(enquiryData);
    console.log(`[Enquiries] Created: ${enquiry.company} - ${enquiry._id}`);

    try {
      await sendMail(
        enquiry.email,
        "Enquiry Received – Yogiraj Enterprises",
        enquiryConfirmationTemplate(
          enquiry.company,
          enquiry.contactName,
          enquiry.email,
          enquiry.partsDescription,
          enquiry.quantity,
          enquiry.material,
          enquiry.deadline,
          enquiry.dimensions,
          enquiry.tolerance
        )
      );
    } catch (_) {}

    res.status(201).json({
      success: true,
      data: enquiry,
      message: "Enquiry submitted successfully. We will respond within 24 hours.",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all enquiries (admin)
// @route   GET /api/enquiries
// @access  Protected
const getEnquiries = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const filter = {};

    if (status && status !== "All") filter.status = status;
    if (search) {
      filter.$or = [
        { company: { $regex: search, $options: "i" } },
        { contactName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Enquiry.countDocuments(filter);
    const enquiries = await Enquiry.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    console.log(`[Enquiries] Fetched ${enquiries.length} of ${total} enquiries`);

    res.status(200).json({
      success: true,
      count: enquiries.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: enquiries,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single enquiry
// @route   GET /api/enquiries/:id
// @access  Protected
const getEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, error: "Enquiry not found" });
    }
    res.status(200).json({ success: true, data: enquiry });
  } catch (error) {
    next(error);
  }
};

// @desc    Update enquiry (status, notes, price)
// @route   PUT /api/enquiries/:id
// @access  Protected
const updateEnquiry = async (req, res, next) => {
  try {
    const { status, adminNotes, quotedPrice } = req.body;
    const updateData = {};

    if (status !== undefined) updateData.status = status;
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;
    if (quotedPrice !== undefined) updateData.quotedPrice = quotedPrice;

    const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!enquiry) {
      return res.status(404).json({ success: false, error: "Enquiry not found" });
    }

    console.log(`[Enquiries] Updated: ${enquiry._id} → status: ${enquiry.status}`);
    res.status(200).json({ success: true, data: enquiry, message: "Enquiry updated successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete enquiry (hard delete + Cloudinary cleanup)
// @route   DELETE /api/enquiries/:id
// @access  Protected
const deleteEnquiry = async (req, res, next) => {
  try {
    const enquiry = await Enquiry.findById(req.params.id);
    if (!enquiry) {
      return res.status(404).json({ success: false, error: "Enquiry not found" });
    }

    // Delete all attachments from Cloudinary
    for (const attachment of enquiry.attachments) {
      if (attachment.publicId) {
        const resourceType = attachment.resourceType === "raw" ? "raw" : "image";
        await deleteImage(attachment.publicId, resourceType).catch((err) =>
          console.warn(`[Enquiries] Could not delete attachment ${attachment.publicId}: ${err.message}`)
        );
      }
    }

    await Enquiry.findByIdAndDelete(req.params.id);
    console.log(`[Enquiries] Hard deleted: ${enquiry._id}`);

    res.status(200).json({ success: true, data: {}, message: "Enquiry deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { createEnquiry, getEnquiries, getEnquiry, updateEnquiry, deleteEnquiry };
