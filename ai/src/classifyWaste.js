const { validateImageInput } = require("./validateImage");
const { getProvider } = require("./providers/provider");
const { getGuidanceForCategory } = require("./categories");
const { ErrorCodes, AIClassificationError } = require("./errors");

const DEFAULT_CONFIDENCE_THRESHOLD = 0.5;

/**
 * Validates that confidence is a finite number between 0 and 1 inclusive.
 * Preserves 0 and never falls back to fabricated defaults.
 *
 * @param {*} rawConfidence - Value returned by model/provider
 * @returns {number} Validated confidence
 */
function validateConfidence(rawConfidence) {
  if (
    rawConfidence === null ||
    rawConfidence === undefined ||
    typeof rawConfidence === "boolean" ||
    rawConfidence === ""
  ) {
    throw new AIClassificationError(
      ErrorCodes.INFERENCE_FAILED,
      "Vision provider returned a missing or invalid confidence score."
    );
  }

  const confidence = Number(rawConfidence);

  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) {
    throw new AIClassificationError(
      ErrorCodes.INFERENCE_FAILED,
      "Vision provider returned an invalid confidence score. Confidence must be a finite number between 0 and 1."
    );
  }

  return confidence;
}

/**
 * Resolves the low-confidence threshold from options or environment.
 * Defaults to 0.5 if not configured or out of valid range.
 *
 * @param {number} [optionThreshold]
 * @returns {number}
 */
function resolveThreshold(optionThreshold) {
  if (optionThreshold !== undefined) {
    const parsed = Number(optionThreshold);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
      return parsed;
    }
  }

  if (process.env.CONFIDENCE_THRESHOLD !== undefined) {
    const parsed = Number(process.env.CONFIDENCE_THRESHOLD);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed <= 1) {
      return parsed;
    }
  }

  return DEFAULT_CONFIDENCE_THRESHOLD;
}

/**
 * Main classification function for WasteQuest.
 *
 * Inspects waste images, validates input formats, routes inference to configured
 * vision providers, enforces threshold checks, and enriches data with circular
 * economy downstream routing and category-level recyclability guidance.
 *
 * NOTE: Recyclability and disposalAdvice are generic category-level recommendations,
 * not verification of local municipal recycling acceptance.
 *
 * @param {Object} input - { buffer: Buffer, mimeType: string }
 * @param {Object} [options] - Optional configurations
 * @param {number} [options.confidenceThreshold] - Minimum confidence required (0-1)
 * @param {Object} [options.provider] - Custom provider override instance
 * @param {string} [options.aiProvider] - Provider name override ('gemini', 'anthropic', 'mock')
 * @param {number} [options.maxSizeMB] - Maximum image size in MB
 * @returns {Promise<Object>} Response envelope with { success: true, data: {...} } or { success: false, error: {...} }
 */
async function classifyWaste(input, options = {}) {
  try {
    // 1. Input validation (file type, size limits, magic bytes)
    validateImageInput(input, options);

    // 2. Resolve vision provider (strict production safety, rejects unconfigured providers)
    const provider = getProvider(options);

    // 3. Run model inference with safe error containment
    let rawResult;
    try {
      rawResult = await provider.classify(input.buffer, input.mimeType);
    } catch (err) {
      if (err instanceof AIClassificationError) {
        throw err;
      }
      // Contain internal provider errors, stack traces, and API keys
      throw new AIClassificationError(
        ErrorCodes.INFERENCE_FAILED,
        "Vision classification service failed to process the image."
      );
    }

    if (!rawResult || typeof rawResult !== "object") {
      throw new AIClassificationError(
        ErrorCodes.INFERENCE_FAILED,
        "Malformed response from vision provider."
      );
    }

    // 4. Verify whether image actually contains waste/recyclables
    if (rawResult.isWaste === false) {
      throw new AIClassificationError(
        ErrorCodes.NOT_WASTE,
        "The uploaded photo does not appear to contain a recognized waste item or discarded object."
      );
    }

    // 5. Strict confidence validation (preserves 0, rejects non-finite/out-of-range)
    const confidence = validateConfidence(rawResult.confidence);

    // 6. Apply low-confidence threshold
    const threshold = resolveThreshold(options.confidenceThreshold);
    if (confidence < threshold) {
      throw new AIClassificationError(
        ErrorCodes.LOW_CONFIDENCE,
        `Classification confidence (${(confidence * 100).toFixed(1)}%) is below the required threshold of ${(threshold * 100).toFixed(1)}%. Please take a clearer, closer photo.`
      );
    }

    // 7. Canonical category resolution and guidance enrichment (rejects unknown categories)
    const guidance = getGuidanceForCategory(rawResult.category);

    return {
      success: true,
      data: {
        category: guidance.canonicalCategory,
        confidence: Math.round(confidence * 100) / 100,
        recyclable: guidance.recyclable,
        disposalAdvice: guidance.disposalAdvice,
        itemDescription: rawResult.itemDescription || `Detected ${guidance.canonicalCategory}`,
        bin: guidance.bin,
        downstreamRoute: guidance.downstreamRoute,
        environmentalImpact: guidance.environmentalImpact
      }
    };
  } catch (err) {
    if (err instanceof AIClassificationError) {
      return {
        success: false,
        error: err.toJSON()
      };
    }

    // Generic safe fallback for unexpected runtime errors
    return {
      success: false,
      error: {
        code: ErrorCodes.INFERENCE_FAILED,
        message: "An unexpected error occurred during classification."
      }
    };
  }
}

module.exports = {
  classifyWaste,
  ErrorCodes,
  AIClassificationError,
  DEFAULT_CONFIDENCE_THRESHOLD
};
