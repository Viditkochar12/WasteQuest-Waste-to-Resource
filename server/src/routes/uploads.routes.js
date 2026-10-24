
const express = require("express");
const multer = require("multer");
const { cloudinary, isConfigured } = require("../config/cloudinary");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      const error = new Error(
        "Only JPEG, PNG, and WebP images are allowed."
      );
      error.code = "INVALID_FILE_TYPE";
      return callback(error);
    }

    callback(null, true);
  },
});

router.post("/", (req, res, next) => {
  upload.single("image")(req, res, async (uploadError) => {
    if (uploadError) {
      const isTooLarge = uploadError.code === "LIMIT_FILE_SIZE";
      const isInvalidType = uploadError.code === "INVALID_FILE_TYPE";

      if (isTooLarge || isInvalidType) {
        return res.status(400).json({
          success: false,
          error: {
            code: isTooLarge ? "FILE_TOO_LARGE" : "INVALID_FILE_TYPE",
            message: isTooLarge
              ? "Image must be 5 MB or smaller."
              : uploadError.message,
          },
        });
      }

      return next(uploadError);
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: "IMAGE_REQUIRED",
          message: 'Please attach an image using the "image" field.',
        },
      });
    }

    if (!isConfigured) {
      return res.status(503).json({
        success: false,
        error: {
          code: "IMAGE_STORAGE_UNAVAILABLE",
          message: "Image storage is not configured.",
        },
      });
    }

    try {
      // Check the actual file signature, not just its MIME type.
      const buffer = req.file.buffer;
      const isJpeg =
        buffer.length >= 3 &&
        buffer[0] === 0xff &&
        buffer[1] === 0xd8 &&
        buffer[2] === 0xff;

      const isPng =
        buffer.length >= 8 &&
        buffer.subarray(0, 8).equals(
          Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
        );

      const isWebp =
        buffer.length >= 12 &&
        buffer.toString("ascii", 0, 4) === "RIFF" &&
        buffer.toString("ascii", 8, 12) === "WEBP";

      if (!isJpeg && !isPng && !isWebp) {
        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_IMAGE",
            message: "The uploaded file is not a supported image.",
          },
        });
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "wastequest/reports",
            resource_type: "image",
          },
          (error, uploadedImage) => {
            if (error) return reject(error);
            resolve(uploadedImage);
          }
        );

        stream.end(req.file.buffer);
      });

      return res.status(201).json({
        success: true,
        data: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      });
    } catch (error) {
      return next(error);
    }
  });
});

module.exports = router;
