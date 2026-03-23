const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
    },
    benefits: [
      {
        type: String,
        trim: true,
      },
    ],
    caseStudy: {
      client: { type: String, trim: true },
      result: { type: String, trim: true },
    },
    image: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    icon: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Service", serviceSchema);
