const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: ["Gears", "Shafts", "Bearings", "Housings", "Brackets"],
        message: "Category must be one of: Gears, Shafts, Bearings, Housings, Brackets",
      },
    },
    material: {
      type: String,
      required: [true, "Material is required"],
      enum: {
        values: ["Steel", "Aluminum", "Titanium", "Custom"],
        message: "Material must be one of: Steel, Aluminum, Titanium, Custom",
      },
    },
    dimensions: {
      type: String,
      trim: true,
    },
    tolerance: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    gallery: [
      {
        url: { type: String },
        publicId: { type: String },
      },
    ],
    specSheetUrl: {
      type: String,
      default: "",
    },
    specSheetPublicId: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-generate slug from name before saving
productSchema.pre("save", function (next) {
  if (this.isModified("name") || this.isNew) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Also handle slug on findOneAndUpdate
productSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();
  if (update.name) {
    update.slug = slugify(update.name, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model("Product", productSchema);
