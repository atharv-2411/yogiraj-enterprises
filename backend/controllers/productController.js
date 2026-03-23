const Product = require("../models/Product");
const { deleteImage } = require("../utils/cloudinary");
const { cloudinary } = require("../utils/cloudinary");

// @desc    Get all products (public)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { category, material, search } = req.query;
    const filter = { isActive: true };

    if (category && category !== "All") filter.category = category;
    if (material && material !== "All") filter.material = material;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    console.log(`[Products] Fetched ${products.length} products`);

    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id  |  GET /api/products/slug/:slug
// @access  Public
const getProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product;

    // Check if it's a valid ObjectId or a slug
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      product = await Product.findById(id);
    } else {
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product
// @route   POST /api/products
// @access  Protected
const createProduct = async (req, res, next) => {
  try {
    const productData = { ...req.body };

    // Handle uploaded image from multer-cloudinary
    if (req.file) {
      productData.image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
      console.log(`[Products] Image uploaded: ${req.file.filename}`);
    }

    const product = await Product.create(productData);
    console.log(`[Products] Created: ${product.name} (${product._id})`);

    res.status(201).json({ success: true, data: product, message: "Product created successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Protected
const updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    const updateData = { ...req.body };

    // If a new image was uploaded, delete the old one from Cloudinary
    if (req.file) {
      if (product.image && product.image.publicId) {
        await deleteImage(product.image.publicId);
      }
      updateData.image = {
        url: req.file.path,
        publicId: req.file.filename,
      };
      console.log(`[Products] Image replaced: ${req.file.filename}`);
    }

    product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    console.log(`[Products] Updated: ${product.name} (${product._id})`);
    res.status(200).json({ success: true, data: product, message: "Product updated successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Soft delete product
// @route   DELETE /api/products/:id
// @access  Protected
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    // Delete main image from Cloudinary
    if (product.image && product.image.publicId) {
      await deleteImage(product.image.publicId);
    }

    // Delete all gallery images from Cloudinary
    for (const img of product.gallery) {
      if (img.publicId) await deleteImage(img.publicId);
    }

    // Delete spec sheet if exists
    if (product.specSheetPublicId) {
      await deleteImage(product.specSheetPublicId, "raw");
    }

    // Soft delete
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    console.log(`[Products] Soft deleted: ${product.name} (${product._id})`);

    res.status(200).json({ success: true, data: {}, message: "Product deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload gallery images for a product
// @route   POST /api/products/:id/gallery
// @access  Protected
const uploadProductGallery = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, error: "No files uploaded" });
    }

    // Enforce max 5 gallery images total
    const totalAfterUpload = product.gallery.length + req.files.length;
    if (totalAfterUpload > 5) {
      // Delete the just-uploaded files from Cloudinary since we're rejecting
      for (const file of req.files) {
        await deleteImage(file.filename);
      }
      return res.status(400).json({
        success: false,
        error: `Gallery limit exceeded. Max 5 images. Currently has ${product.gallery.length}.`,
      });
    }

    const newImages = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));

    product.gallery.push(...newImages);
    await product.save();

    console.log(`[Products] Added ${newImages.length} gallery images to: ${product.name}`);
    res.status(200).json({ success: true, data: product, message: "Gallery images uploaded" });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a specific gallery image
// @route   DELETE /api/products/:id/gallery/:publicId
// @access  Protected
const deleteGalleryImage = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    const publicId = decodeURIComponent(req.params.publicId);
    const imageExists = product.gallery.some((img) => img.publicId === publicId);

    if (!imageExists) {
      return res.status(404).json({ success: false, error: "Gallery image not found" });
    }

    // Delete from Cloudinary
    await deleteImage(publicId);

    // Remove from gallery array
    product.gallery = product.gallery.filter((img) => img.publicId !== publicId);
    await product.save();

    console.log(`[Products] Deleted gallery image: ${publicId}`);
    res.status(200).json({ success: true, data: product, message: "Gallery image deleted" });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload spec sheet PDF for a product
// @route   POST /api/products/:id/specsheet
// @access  Protected
const uploadSpecSheet = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: "No spec sheet file uploaded" });
    }

    // Delete old spec sheet if exists
    if (product.specSheetPublicId) {
      await deleteImage(product.specSheetPublicId, "raw");
    }

    product.specSheetUrl = req.file.path;
    product.specSheetPublicId = req.file.filename;
    await product.save();

    console.log(`[Products] Spec sheet uploaded for: ${product.name}`);
    res.status(200).json({ success: true, data: product, message: "Spec sheet uploaded successfully" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  uploadProductGallery,
  deleteGalleryImage,
  uploadSpecSheet,
};
