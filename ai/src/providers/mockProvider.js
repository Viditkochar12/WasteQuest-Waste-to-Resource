/**
 * Mock Provider for automated tests, offline local development, and CI.
 * Allows predictable testing without calling live external vision APIs.
 */

class MockProvider {
  constructor(options = {}) {
    this.name = "mock";
    this.presetCategory = options.presetCategory !== undefined ? options.presetCategory : null;
    this.presetConfidence = "presetConfidence" in options ? options.presetConfidence : 0.94;
    this.presetIsWaste = options.presetIsWaste !== undefined ? options.presetIsWaste : true;
    this.shouldFail = options.shouldFail || false;
    this.failureMessage = options.failureMessage || "Simulated provider network failure";
  }

  async classify(buffer, mimeType) {
    if (this.shouldFail) {
      throw new Error(this.failureMessage);
    }

    if (this.presetCategory !== null) {
      return {
        category: this.presetCategory,
        confidence: this.presetConfidence,
        isWaste: this.presetIsWaste,
        itemDescription: `Simulated item of category '${this.presetCategory}'`
      };
    }

    // Default predictable rotation across canonical categories for mock tests
    const categories = ["plastic", "paper", "glass", "metal", "organic", "e_waste", "general"];
    const index = buffer.length % categories.length;

    return {
      category: categories[index],
      confidence: this.presetConfidence,
      isWaste: this.presetIsWaste,
      itemDescription: `Detected sample ${categories[index]} item (mock mode)`
    };
  }
}

module.exports = { MockProvider };
