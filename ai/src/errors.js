/**
 * Standardized WasteQuest AI Error Codes
 */
const ErrorCodes = {
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_IMAGE: "INVALID_IMAGE",
  NOT_WASTE: "NOT_WASTE",
  LOW_CONFIDENCE: "LOW_CONFIDENCE",
  UNKNOWN_CATEGORY: "UNKNOWN_CATEGORY",
  PROVIDER_UNAVAILABLE: "PROVIDER_UNAVAILABLE",
  INFERENCE_FAILED: "INFERENCE_FAILED"
};

/**
 * Custom error class for WasteQuest AI operations
 */
class AIClassificationError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "AIClassificationError";
    this.code = code;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message
    };
  }
}

module.exports = {
  ErrorCodes,
  AIClassificationError
};
