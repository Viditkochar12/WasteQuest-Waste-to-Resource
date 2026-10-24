const { MockProvider } = require("./mockProvider");
const { GeminiProvider } = require("./geminiProvider");
const { AnthropicProvider } = require("./anthropicProvider");
const { ErrorCodes, AIClassificationError } = require("../errors");

/**
 * Resolves vision provider with strict production safety and explicit mock enforcement.
 *
 * Rules:
 * 1. Mock provider is ONLY allowed when explicitly requested in non-production environments
 *    (e.g., WASTEQUEST_AI_PROVIDER=mock or AI_PROVIDER=mock).
 * 2. When NODE_ENV=production, mock mode is strictly rejected with PROVIDER_UNAVAILABLE.
 * 3. Default provider is the real configured vision provider (Gemini or Anthropic).
 * 4. If no real provider is configured or configuration is invalid, throws PROVIDER_UNAVAILABLE.
 * 5. Never silently fall back to mock classification.
 *
 * @param {Object} [options]
 * @param {Object} [options.provider] - Custom provider override
 * @param {string} [options.aiProvider] - Explicit provider selection
 * @param {boolean} [options.mock] - Explicit mock mode flag
 * @param {Object} [options.mockOptions] - Options for MockProvider
 * @returns {Object} Configured vision provider instance
 */
function getProvider(options = {}) {
  const isProduction = (process.env.NODE_ENV || "").trim().toLowerCase() === "production";

  // Check if a direct provider instance override was provided
  if (options.provider) {
    const isMock =
      options.provider instanceof MockProvider ||
      options.provider.name === "mock" ||
      options.provider.constructor?.name === "MockProvider";

    if (isMock && isProduction) {
      throw new AIClassificationError(
        ErrorCodes.PROVIDER_UNAVAILABLE,
        "The classification service is unavailable. Mock provider is not permitted in production environments."
      );
    }
    return options.provider;
  }

  // Explicit provider selection from environment or options
  // WASTEQUEST_AI_PROVIDER takes highest precedence
  const configuredProvider = (
    process.env.WASTEQUEST_AI_PROVIDER ||
    process.env.AI_PROVIDER ||
    options.aiProvider ||
    ""
  ).trim().toLowerCase();

  const isMockRequested = configuredProvider === "mock" || options.mock === true;

  // Reject mock mode in production environments unconditionally
  if (isMockRequested && isProduction) {
    throw new AIClassificationError(
      ErrorCodes.PROVIDER_UNAVAILABLE,
      "The classification service is unavailable. Mock provider is disabled in production environments."
    );
  }

  // Allow mock mode ONLY if explicitly configured in non-production environments
  if (isMockRequested) {
    return new MockProvider(options.mockOptions);
  }

  // Handle explicit Gemini selection
  if (configuredProvider === "gemini") {
    const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
    if (!geminiKey) {
      throw new AIClassificationError(
        ErrorCodes.PROVIDER_UNAVAILABLE,
        "The classification service is unavailable. Gemini API key is missing or misconfigured."
      );
    }
    return new GeminiProvider(
      geminiKey,
      process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"
    );
  }

  // Handle explicit Anthropic selection
  if (configuredProvider === "anthropic") {
    const anthropicKey = (process.env.ANTHROPIC_API_KEY || "").trim();
    if (!anthropicKey) {
      throw new AIClassificationError(
        ErrorCodes.PROVIDER_UNAVAILABLE,
        "The classification service is unavailable. Anthropic API key is missing or misconfigured."
      );
    }
    return new AnthropicProvider(
      anthropicKey,
      process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022"
    );
  }

  // If an unrecognized provider name was specified
  if (configuredProvider !== "") {
    throw new AIClassificationError(
      ErrorCodes.PROVIDER_UNAVAILABLE,
      `The classification service is unavailable. Unknown AI provider '${configuredProvider}'.`
    );
  }

  // Default resolution: Use the real configured vision provider
  // 1. Check Gemini
  const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
  if (geminiKey) {
    return new GeminiProvider(
      geminiKey,
      process.env.GEMINI_MODEL || "gemini-3.5-flash-lite"
    );
  }

  // 2. Check Anthropic
  const anthropicKey = (process.env.ANTHROPIC_API_KEY || "").trim();
  if (anthropicKey) {
    return new AnthropicProvider(
      anthropicKey,
      process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022"
    );
  }

  // 3. No real provider is configured. Never silently fall back to mock!
  throw new AIClassificationError(
    ErrorCodes.PROVIDER_UNAVAILABLE,
    "The classification service is unavailable. No vision provider is configured."
  );
}

module.exports = {
  getProvider,
  MockProvider,
  GeminiProvider,
  AnthropicProvider
};
