const { validateImageInput } = require("./validateImage");
const { getProvider } = require("./providers/provider");
const { getGuidanceForCategory } = require("./categories");
const { ErrorCodes, AIClassificationError } = require("./errors");

const DEFAULT_CONFIDENCE_THRESHOLD = 0.5;

/**
 * Main classification function for WasteQuest
 *
 * @param {Object} input - { buffer: Buffer, mimeType: string }
 * @param {Object} [options] - Optional configurations
 * @param {number} [options.confidenceThreshold] - Minimum confidence (0-1)
 * @param {Object} [options.provider] - Custom provider override
 * @param {number} [options.maxSizeMB] - Maximum file size in MB
 * @returns {Promise<Object>} Success or failure response envelope
 */
async function classifyWaste(input, options = {}) {
  try {
    // 1. Validate image format, size, and magic bytes
    validateImageInput(input, options);

    // 2. Resolve vision provider
    const provider = getProvider(options);

    // 3. Run model inference
    let rawResult;
    try {
      rawResult = await provider.classify(input.buffer, input.mimeType);
    } catch (err) {
      throw new AIClassificationError(
        ErrorCodes.INFERENCE_FAILED,
        `Vision classification failed: ${err.message}`
      );
    }

    if (!rawResult || typeof rawResult !== "object") {
      throw new AIClassificationError(
        ErrorCodes.INFERENCE_FAILED,
        "Malformed response from vision provider"
      );
    }

    // 4. Verify that the image actually contains waste/recyclable items
    if (rawResult.isWaste === false) {
      throw new AIClassificationError(
        ErrorCodes.NOT_WASTE,
        "The uploaded photo does not appear to contain a recognized waste item or discarded object."
      );
    }

    // 5. Check confidence score
    const threshold =
      options.confidenceThreshold !== undefined
        ? Number(options.confidenceThreshold)
        : Number(process.env.CONFIDENCE_THRESHOLD) || DEFAULT_CONFIDENCE_THRESHOLD;

    const confidence = Number(rawResult.confidence) || 0;

    if (confidence < threshold) {
      throw new AIClassificationError(
        ErrorCodes.LOW_CONFIDENCE,
        `Classification confidence (${(confidence * 100).toFixed(1)}%) is below the required threshold of ${(threshold * 100).toFixed(1)}%. Please take a clearer, closer photo.`
      );
    }

    // 6. Enrich with category guidelines, downstream routes, and LCA metrics
    const guidance = getGuidanceForCategory(rawResult.category);

    return {
      success: true,
      data: {
        category: guidance.canonicalCategory,
        confidence: Math.round(confidence * 100) / 100,
        itemDescription: rawResult.itemDescription || `Detected ${guidance.canonicalCategory}`,
        recyclable: guidance.recyclable,
        disposalAdvice: guidance.disposalAdvice,
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

    return {
      success: false,
      error: {
        code: ErrorCodes.INFERENCE_FAILED,
        message: err.message || "An unexpected error occurred during classification."
      }
    };
  }
}

module.exports = {
  classifyWaste,
  ErrorCodes,
  AIClassificationError
};
