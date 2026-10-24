const express = require("express");
const multer = require("multer");
const aiModule = require("../../../ai/src/classifyWaste");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1
  }
});

router.post("/", (req, res, next) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(413).json({
            success: false,
            error: {
              code: "FILE_TOO_LARGE",
              message: "Image must be 5 MB or smaller."
            }
          });
        }

        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({
            success: false,
            error: {
              code: "INVALID_IMAGE",
              message: 'Please upload an image using the "image" field.'
            }
          });
        }

        return res.status(400).json({
          success: false,
          error: {
            code: "INVALID_UPLOAD",
            message: "The image upload could not be processed."
          }
        });
      }

      return next(err);
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: "INVALID_IMAGE",
          message: 'Please upload an image using the "image" field.'
        }
      });
    }

    try {
      const result = await aiModule.classifyWaste({
        buffer: req.file.buffer,
        mimeType: req.file.mimetype
      });

      if (!result.success) {
        const statusByCode = {
          INVALID_IMAGE: 400,
          MISSING_INPUT: 400,
          INVALID_FILE_TYPE: 415,
          FILE_TOO_LARGE: 413,
          NOT_WASTE: 422,
          LOW_CONFIDENCE: 422,
          UNKNOWN_CATEGORY: 422,
          PROVIDER_UNAVAILABLE: 503,
          INFERENCE_FAILED: 502
        };

        return res
          .status(statusByCode[result.error.code] || 500)
          .json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  });
});

module.exports = router;
