/**
 * Standardized WasteQuest AI Error Codes
 */
const ErrorCodes = {
  INVALID_FILE_TYPE: "INVALID_FILE_TYPE",
  FILE_TOO_LARGE: "FILE_TOO_LARGE",
  INVALID_IMAGE: "INVALID_IMAGE",
  NOT_WASTE: "NOT_WASTE",
  LOW_CONFIDENCE: "LOW_CONFIDENCE",
  INFERENCE_FAILED: "INFERENCE_FAILED",
  MISSING_INPUT: "MISSING_INPUT"
};

class AIClassificationError extends Error {
  constructor(code, message, details = null) {
    super(message);
    this.name = "AIClassificationError";
    this.code = code;
    this.details = details;
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.details ? { details: this.details } : {})
    };
  }
}

module.exports = {
  ErrorCodes,
  AIClassificationError
};
