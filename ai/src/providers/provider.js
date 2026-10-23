const { MockProvider } = require("./mockProvider");
const { GeminiProvider } = require("./geminiProvider");
const { AnthropicProvider } = require("./anthropicProvider");

/**
 * Resolves the vision provider based on environment or passed options
 */
function getProvider(options = {}) {
  // Direct override
  if (options.provider) {
    return options.provider;
  }

  const providerType = (process.env.AI_PROVIDER || "").toLowerCase();

  if (providerType === "mock" || process.env.NODE_ENV === "test") {
    return new MockProvider(options.mockOptions);
  }

  // 1. Check Gemini
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey || providerType === "gemini") {
    return new GeminiProvider(
      geminiKey,
      process.env.GEMINI_MODEL || "gemini-1.5-flash"
    );
  }

  // 2. Check Anthropic
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (anthropicKey || providerType === "anthropic") {
    return new AnthropicProvider(
      anthropicKey,
      process.env.ANTHROPIC_MODEL || "claude-3-5-sonnet-20241022"
    );
  }

  // 3. Fallback to Mock provider for local development without keys
  return new MockProvider(options.mockOptions);
}

module.exports = {
  getProvider,
  MockProvider,
  GeminiProvider,
  AnthropicProvider
};
