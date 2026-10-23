
const express = require("express");
const Report = require("../models/Report");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const reports = await Report.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: reports
    });
  } catch (err) {
    return next(err);
  }
});

router.post("/", async (req, res, next) => {
  const {
    category,
    confidence,
    image,
    location,
    disposalAdvice,
    recyclable
  } = req.body || {};

  if (
    typeof category !== "string" ||
    !category.trim() ||
    typeof image?.url !== "string" ||
    !image.url.trim() ||
    typeof image?.publicId !== "string" ||
    !image.publicId.trim() ||
    typeof location?.latitude !== "number" ||
    !Number.isFinite(location.latitude) ||
    location.latitude < -90 ||
    location.latitude > 90 ||
    typeof location?.longitude !== "number" ||
    !Number.isFinite(location.longitude) ||
    location.longitude < -180 ||
    location.longitude > 180 ||
    typeof disposalAdvice !== "string" ||
    !disposalAdvice.trim() ||
    typeof recyclable !== "boolean" ||
    (confidence !== undefined &&
      (typeof confidence !== "number" ||
        !Number.isFinite(confidence) ||
        confidence < 0 ||
        confidence > 1))
  ) {
    return res.status(400).json({
      success: false,
      error: {
        code: "INVALID_REPORT",
        message: "Please provide valid report details."
      }
    });
  }

  try {
    const report = await Report.create({
      category: category.trim(),
      confidence,
      image: {
        url: image.url.trim(),
        publicId: image.publicId.trim()
      },
      location: {
        latitude: location.latitude,
        longitude: location.longitude
      },
      disposalAdvice: disposalAdvice.trim(),
      recyclable
    });

    return res.status(201).json({
      success: true,
      data: report
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
