const Service = require("../models/Service");
const { deleteImage } = require("../utils/cloudinary");

// @desc    Get all services (public)
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    const services = await Service.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    console.log(`[Services] Fetched ${services.length} services`);
    res.status(200).json({ success: true, count: services.length, data: services });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Create service
// @route   POST /api/services
// @access  Protected
const createService = async (req, res, next) => {
  try {
    const serviceData = { ...req.body };

    // Parse benefits array if sent as JSON string
    if (typeof serviceData.benefits === "string") {
      try {
        serviceData.benefits = JSON.parse(serviceData.benefits);
      } catch {
        serviceData.benefits = serviceData.benefits.split(",").map((b) => b.trim());
      }
    }

    // Parse caseStudy if sent as JSON string
    if (typeof serviceData.caseStudy === "string") {
      try {
        serviceData.caseStudy = JSON.parse(serviceData.caseStudy);
      } catch {
        serviceData.caseStudy = {};
      }
    }

    if (req.file) {
      serviceData.image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
      console.log(`[Services] Image uploaded: ${req.file.filename}`);
    }

    const service = await Service.create(serviceData);
    console.log(`[Services] Created: ${service.title} (${service._id})`);

    res.status(201).json({ success: true, data: service, message: "Service created successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Protected
const updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }

    const updateData = { ...req.body };

    if (typeof updateData.benefits === "string") {
      try {
        updateData.benefits = JSON.parse(updateData.benefits);
      } catch {
        updateData.benefits = updateData.benefits.split(",").map((b) => b.trim());
      }
    }

    if (typeof updateData.caseStudy === "string") {
      try {
        updateData.caseStudy = JSON.parse(updateData.caseStudy);
      } catch {
        updateData.caseStudy = {};
      }
    }

    if (req.file) {
      if (service.image && service.image.publicId) {
        await deleteImage(service.image.publicId);
      }
      updateData.image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
      console.log(`[Services] Image replaced: ${req.file.filename}`);
    }

    service = await Service.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    console.log(`[Services] Updated: ${service.title} (${service._id})`);
    res.status(200).json({ success: true, data: service, message: "Service updated successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service (soft delete)
// @route   DELETE /api/services/:id
// @access  Protected
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, error: "Service not found" });
    }

    if (service.image && service.image.publicId) {
      await deleteImage(service.image.publicId);
    }

    await Service.findByIdAndUpdate(req.params.id, { isActive: false });
    console.log(`[Services] Soft deleted: ${service.title} (${service._id})`);

    res.status(200).json({ success: true, data: {}, message: "Service deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getServices, getService, createService, updateService, deleteService };
