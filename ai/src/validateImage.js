const { ErrorCodes, AIClassificationError } = require("./errors");

const SUPPORTED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp"
]);

const DEFAULT_MAX_SIZE_MB = 5;

/**
 * Validates an image buffer and mime type
 * @param {Object} input - { buffer: Buffer, mimeType: string }
 * @param {Object} options - { maxSizeBytes?: number }
 */
function validateImageInput(input, options = {}) {
  if (!input) {
    throw new AIClassificationError(
      ErrorCodes.MISSING_INPUT,
      "Input object is required. Provide { buffer, mimeType }."
    );
  }

  const { buffer, mimeType } = input;

  if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new AIClassificationError(
      ErrorCodes.INVALID_IMAGE,
      "A valid non-empty image Buffer is required."
    );
  }

  const normalizedMime = (mimeType || "").trim().toLowerCase();
  if (!SUPPORTED_MIME_TYPES.has(normalizedMime)) {
    throw new AIClassificationError(
      ErrorCodes.INVALID_FILE_TYPE,
      `Unsupported MIME type '${mimeType}'. Supported types are: image/jpeg, image/png, image/webp.`
    );
  }

  const maxSizeMB = options.maxSizeMB || Number(process.env.MAX_IMAGE_SIZE_MB) || DEFAULT_MAX_SIZE_MB;
  const maxBytes = maxSizeMB * 1024 * 1024;

  if (buffer.length > maxBytes) {
    throw new AIClassificationError(
      ErrorCodes.FILE_TOO_LARGE,
      `Image size (${(buffer.length / (1024 * 1024)).toFixed(2)} MB) exceeds maximum limit of ${maxSizeMB} MB.`
    );
  }

  // Quick magic bytes verification
  verifyMagicBytes(buffer, normalizedMime);

  return {
    valid: true,
    sizeBytes: buffer.length,
    mimeType: normalizedMime
  };
}

/**
 * Basic check for common image header signatures
 */
function verifyMagicBytes(buffer, mimeType) {
  if (buffer.length < 4) {
    throw new AIClassificationError(
      ErrorCodes.INVALID_IMAGE,
      "File buffer is too small to be a valid image."
    );
  }

  // JPEG magic bytes: FF D8 FF
  if (mimeType === "image/jpeg" || mimeType === "image/jpg") {
    if (buffer[0] !== 0xff || buffer[1] !== 0xd8 || buffer[2] !== 0xff) {
      throw new AIClassificationError(
        ErrorCodes.INVALID_IMAGE,
        "Buffer does not contain valid JPEG image data."
      );
    }
  }

  // PNG magic bytes: 89 50 4E 47
  if (mimeType === "image/png") {
    if (
      buffer[0] !== 0x89 ||
      buffer[1] !== 0x50 ||
      buffer[2] !== 0x4e ||
      buffer[3] !== 0x47
    ) {
      throw new AIClassificationError(
        ErrorCodes.INVALID_IMAGE,
        "Buffer does not contain valid PNG image data."
      );
    }
  }

  // WEBP magic bytes: RIFF....WEBP
  if (mimeType === "image/webp") {
    const isRiff = buffer.toString("ascii", 0, 4) === "RIFF";
    const isWebp = buffer.toString("ascii", 8, 12) === "WEBP";
    if (!isRiff || !isWebp) {
      throw new AIClassificationError(
        ErrorCodes.INVALID_IMAGE,
        "Buffer does not contain valid WEBP image data."
      );
    }
  }
}

module.exports = {
  validateImageInput,
  SUPPORTED_MIME_TYPES,
  DEFAULT_MAX_SIZE_MB
};
