const Client = require("../models/Client");
const { deleteImage } = require("../utils/cloudinary");

// @desc    Get all clients (public)
// @route   GET /api/clients
// @access  Public
const getClients = async (req, res, next) => {
  try {
    const clients = await Client.find({ isActive: true }).sort({ order: 1, createdAt: 1 });
    console.log(`[Clients] Fetched ${clients.length} clients`);
    res.status(200).json({ success: true, count: clients.length, data: clients });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single client
// @route   GET /api/clients/:id
// @access  Protected
const getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }
    res.status(200).json({ success: true, data: client });
  } catch (error) {
    next(error);
  }
};

// @desc    Create client
// @route   POST /api/clients
// @access  Protected
const createClient = async (req, res, next) => {
  try {
    const clientData = { ...req.body };

    // Parse testimonial if sent as JSON string
    if (typeof clientData.testimonial === "string") {
      try {
        clientData.testimonial = JSON.parse(clientData.testimonial);
      } catch {
        clientData.testimonial = {};
      }
    }

    if (req.file) {
      clientData.logo = {
        url: req.file.path,
        publicId: req.file.filename,
      };
      console.log(`[Clients] Logo uploaded: ${req.file.filename}`);
    }

    const client = await Client.create(clientData);
    console.log(`[Clients] Created: ${client.name} (${client._id})`);

    res.status(201).json({ success: true, data: client, message: "Client created successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Update client
// @route   PUT /api/clients/:id
// @access  Protected
const updateClient = async (req, res, next) => {
  try {
    let client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }

    const updateData = { ...req.body };

    if (typeof updateData.testimonial === "string") {
      try {
        updateData.testimonial = JSON.parse(updateData.testimonial);
      } catch {
        updateData.testimonial = {};
      }
    }

    // Replace logo: delete old one first
    if (req.file) {
      if (client.logo && client.logo.publicId) {
        await deleteImage(client.logo.publicId);
      }
      updateData.logo = {
        url: req.file.path,
        publicId: req.file.filename,
      };
      console.log(`[Clients] Logo replaced: ${req.file.filename}`);
    }

    client = await Client.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    console.log(`[Clients] Updated: ${client.name} (${client._id})`);
    res.status(200).json({ success: true, data: client, message: "Client updated successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete client
// @route   DELETE /api/clients/:id
// @access  Protected
const deleteClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, error: "Client not found" });
    }

    if (client.logo && client.logo.publicId) {
      await deleteImage(client.logo.publicId);
    }

    await Client.findByIdAndUpdate(req.params.id, { isActive: false });
    console.log(`[Clients] Soft deleted: ${client.name} (${client._id})`);

    res.status(200).json({ success: true, data: {}, message: "Client deleted successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getClients, getClient, createClient, updateClient, deleteClient };
