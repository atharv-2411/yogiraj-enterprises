const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    logo: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    testimonial: {
      quote: { type: String, trim: true },
      authorName: { type: String, trim: true },
      authorRole: { type: String, trim: true },
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

module.exports = mongoose.model("Client", clientSchema);
