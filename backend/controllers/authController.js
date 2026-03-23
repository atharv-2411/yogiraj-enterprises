const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const Admin = require("../models/Admin");

// Helper: generate JWT token
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || "7d" });

// @desc    Register new admin
// @route   POST /api/auth/register
// @access  Public (requires adminSecret)
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { email, password, name, adminSecret } = req.body;

    // Validate admin secret
    if (adminSecret !== process.env.ADMIN_SECRET) {
      console.warn(`[Auth] Invalid admin secret attempt for: ${email}`);
      return res.status(403).json({ success: false, error: "Invalid admin secret." });
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ success: false, error: "Admin with this email already exists." });
    }

    const admin = await Admin.create({ email, password, name });
    const token = generateToken(admin._id);

    console.log(`[Auth] New admin registered: ${admin.email}`);
    res.status(201).json({
      success: true,
      data: { _id: admin._id, email: admin.email, name: admin.name, role: admin.role },
      token,
      message: "Admin registered successfully",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // Find admin and include password field (select: false by default)
    const admin = await Admin.findOne({ email }).select("+password");
    if (!admin) {
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      console.warn(`[Auth] Failed login attempt for: ${email}`);
      return res.status(401).json({ success: false, error: "Invalid email or password." });
    }

    const token = generateToken(admin._id);
    console.log(`[Auth] Admin logged in: ${admin.email}`);

    res.status(200).json({
      success: true,
      data: { _id: admin._id, email: admin.email, name: admin.name, role: admin.role },
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged-in admin
// @route   GET /api/auth/me
// @access  Protected
const getMe = async (req, res, next) => {
  try {
    const admin = await Admin.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ success: false, error: "Admin not found" });
    }
    res.status(200).json({ success: true, data: admin });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
