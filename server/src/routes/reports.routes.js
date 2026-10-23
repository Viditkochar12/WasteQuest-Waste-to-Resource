
const express = require("express");
const Report = require("../models/Report");

const router = express.Router();


router.get("/", async (req, res, next) => {
  try {
    const allowedQueryParams = new Set([
      "page",
      "limit",
      "category",
      "status"
    ]);

    const invalidParam = Object.keys(req.query).some(
      (key) => !allowedQueryParams.has(key)
    );

    if (invalidParam) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_QUERY_PARAMETER",
          message: "One or more query parameters are not supported."
        }
      });
    }

    const parsePositiveInteger = (value, fallback) => {
      if (value === undefined) return fallback;

      if (
        typeof value !== "string" ||
        !/^[1-9]\d*$/.test(value)
      ) {
        return null;
      }

      const parsed = Number(value);

      return Number.isSafeInteger(parsed) ? parsed : null;
    };

    const page = parsePositiveInteger(req.query.page, 1);
    const limit = parsePositiveInteger(req.query.limit, 10);

    if (page === null || limit === null || limit > 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PAGINATION",
          message: "Page must be a positive integer and limit must be between 1 and 100."
        }
      });
    }

    const filter = {};

    if (req.query.category !== undefined) {
      if (
        typeof req.query.category !== "string" ||
        !req.query.category.trim()
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_CATEGORY",
            message: "Category must be a non-empty string."
          }
        });
      }

      filter.category = req.query.category.trim().toLowerCase();
    }

    if (req.query.status !== undefined) {
      const validStatuses = ["pending", "verified", "rejected"];

      if (
        typeof req.query.status !== "string" ||
        !validStatuses.includes(req.query.status)
      ) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_STATUS",
            message: "Status must be pending, verified, or rejected."
          }
        });
      }

      filter.status = req.query.status;
    }

    const skip = (page - 1) * limit;

    if (!Number.isSafeInteger(skip)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_PAGINATION",
          message: "The requested page is too large."
        }
      });
    }

    const [reports, totalReports] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Report.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      data: reports,
      pagination: {
        page,
        limit,
        totalReports,
        totalPages: Math.ceil(totalReports / limit),
        hasNextPage: skip + reports.length < totalReports,
        hasPreviousPage: page > 1
      }
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
