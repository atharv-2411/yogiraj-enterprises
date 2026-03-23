const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../utils/cloudinary");

// ─── Helper: build CloudinaryStorage ─────────────────────────────────────────

const buildStorage = (folder, allowedFormats, transformation, resourceType = "image") =>
  new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
      // For non-image files (pdf, dwg, etc.) use resource_type "raw"
      const rawExtensions = ["pdf", "dwg", "step", "stp", "iges", "igs", "stl"];
      const ext = file.originalname.split(".").pop().toLowerCase();
      const isRaw = rawExtensions.includes(ext);

      return {
        folder,
        allowed_formats: allowedFormats,
        resource_type: isRaw ? "raw" : resourceType,
        transformation: isRaw ? undefined : transformation,
        public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, "").replace(/\s+/g, "-")}`,
      };
    },
  });

// ─── File Filter Factory ──────────────────────────────────────────────────────

const buildFileFilter = (allowedMimeTypes) => (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new multer.MulterError(
        "LIMIT_UNEXPECTED_FILE",
        `Invalid file type. Allowed: ${allowedMimeTypes.join(", ")}`
      ),
      false
    );
  }
};

// ─── 1. Product Image Upload (single) ────────────────────────────────────────

const productImageStorage = buildStorage(
  "yogiraj/products",
  ["jpg", "jpeg", "png", "webp"],
  [{ width: 800, height: 800, crop: "limit", quality: "auto" }]
);

const productImageUpload = multer({
  storage: productImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: buildFileFilter(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
}).single("image");

// ─── 2. Product Gallery Upload (multiple) ────────────────────────────────────

const productGalleryStorage = buildStorage(
  "yogiraj/products",
  ["jpg", "jpeg", "png", "webp"],
  [{ width: 800, height: 800, crop: "limit", quality: "auto" }]
);

const productGalleryUpload = multer({
  storage: productGalleryStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: buildFileFilter(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
}).array("gallery", 5);

// ─── 3. Client Logo Upload (single) ──────────────────────────────────────────

const clientLogoStorage = buildStorage(
  "yogiraj/clients",
  ["jpg", "jpeg", "png", "webp", "svg"],
  [{ width: 400, height: 200, crop: "limit", quality: "auto" }]
);

const clientLogoUpload = multer({
  storage: clientLogoStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: buildFileFilter([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/svg+xml",
  ]),
}).single("logo");

// ─── 4. Enquiry Files Upload (multiple, mixed types) ─────────────────────────

const enquiryFilesStorage = buildStorage(
  "yogiraj/enquiries",
  ["jpg", "jpeg", "png", "pdf", "dwg", "step", "stp", "iges", "igs", "stl"],
  [{ width: 1200, height: 1200, crop: "limit", quality: "auto" }]
);

const enquiryFilesUpload = multer({
  storage: enquiryFilesStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
      // CAD file types — browsers may report these as octet-stream
      "application/octet-stream",
      "application/acad",
      "application/x-acad",
      "application/autocad_dwg",
      "image/x-dwg",
      "application/dwg",
      "application/x-dwg",
      "application/x-autocad",
      "image/vnd.dwg",
      "drawing/dwg",
    ];
    const allowedExts = ["jpg", "jpeg", "png", "pdf", "dwg", "step", "stp", "iges", "igs", "stl"];
    const ext = file.originalname.split(".").pop().toLowerCase();

    if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new multer.MulterError(
          "LIMIT_UNEXPECTED_FILE",
          `Invalid file type. Allowed: ${allowedExts.join(", ")}`
        ),
        false
      );
    }
  },
}).array("attachments", 5);

// ─── 5. Service Image Upload (single) ────────────────────────────────────────

const serviceImageStorage = buildStorage(
  "yogiraj/services",
  ["jpg", "jpeg", "png", "webp"],
  [{ width: 1200, height: 800, crop: "limit", quality: "auto" }]
);

const serviceImageUpload = multer({
  storage: serviceImageStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: buildFileFilter(["image/jpeg", "image/jpg", "image/png", "image/webp"]),
}).single("image");

// ─── 6. Spec Sheet Upload (single PDF) ───────────────────────────────────────

const specSheetStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "yogiraj/specsheets",
    resource_type: "raw",
    allowed_formats: ["pdf"],
    public_id: (req, file) =>
      `specsheet-${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`,
  },
});

const specSheetUpload = multer({
  storage: specSheetStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: buildFileFilter(["application/pdf"]),
}).single("specsheet");

// ─── Multer Error Handler Wrapper ─────────────────────────────────────────────
// Wraps a multer middleware and converts MulterErrors to proper HTTP responses

const handleMulterError = (uploadMiddleware) => (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      let message = "File upload error";
      let status = 400;

      switch (err.code) {
        case "LIMIT_FILE_SIZE":
          message = "File is too large. Check the size limit for this upload type.";
          break;
        case "LIMIT_FILE_COUNT":
          message = "Too many files uploaded. Maximum allowed exceeded.";
          break;
        case "LIMIT_UNEXPECTED_FILE":
          message = err.message || "Unexpected file field or invalid file type.";
          break;
        default:
          message = err.message || "File upload failed.";
      }

      return res.status(status).json({ success: false, error: message });
    }

    // Non-multer errors
    next(err);
  });
};

module.exports = {
  productImageUpload: handleMulterError(productImageUpload),
  productGalleryUpload: handleMulterError(productGalleryUpload),
  clientLogoUpload: handleMulterError(clientLogoUpload),
  enquiryFilesUpload: handleMulterError(enquiryFilesUpload),
  serviceImageUpload: handleMulterError(serviceImageUpload),
  specSheetUpload: handleMulterError(specSheetUpload),
};
