const mongoose = require("mongoose");

const enquirySchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    contactName: {
      type: String,
      required: [true, "Contact name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
    },
    partsDescription: {
      type: String,
      required: [true, "Parts description is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      default: 1,
      min: [1, "Quantity must be at least 1"],
    },
    material: {
      type: String,
      trim: true,
    },
    deadline: {
      type: Date,
    },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
      unit: { type: String, default: "mm" },
    },
    tolerance: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ["Pending", "In Review", "Quoted", "Completed", "Cancelled"],
        message: "Status must be one of: Pending, In Review, Quoted, Completed, Cancelled",
      },
      default: "Pending",
    },
    attachments: [
      {
        url: { type: String },
        publicId: { type: String },
        filename: { type: String },
        resourceType: { type: String, default: "image" },
      },
    ],
    adminNotes: {
      type: String,
      trim: true,
    },
    quotedPrice: {
      type: Number,
      min: [0, "Quoted price cannot be negative"],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Enquiry", enquirySchema);
