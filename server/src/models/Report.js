
const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      trim: true
    },

    confidence: {
      type: Number,
      min: 0,
      max: 1
    },

    image: {
      url: {
        type: String,
        required: true,
        trim: true
      },
      publicId: {
        type: String,
        required: true,
        trim: true
      }
    },

    location: {
      latitude: {
        type: Number,
        required: true,
        min: -90,
        max: 90
      },
      longitude: {
        type: Number,
        required: true,
        min: -180,
        max: 180
      }
    },

    disposalAdvice: {
      type: String,
      required: true,
      trim: true
    },

    recyclable: {
      type: Boolean,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      required: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Report", reportSchema);
