/**
 * Mock Provider for automated tests, offline local development, and CI.
 * Allows predictable testing without calling live external APIs.
 */

class MockProvider {
  constructor(options = {}) {
    this.name = "mock";
    this.presetCategory = options.presetCategory || null;
    this.presetConfidence = options.presetConfidence !== undefined ? options.presetConfidence : 0.94;
    this.presetIsWaste = options.presetIsWaste !== undefined ? options.presetIsWaste : true;
    this.shouldFail = options.shouldFail || false;
  }

  async classify(buffer, mimeType) {
    if (this.shouldFail) {
      throw new Error("Simulated provider network failure");
    }

    if (this.presetCategory) {
      return {
        category: this.presetCategory,
        confidence: this.presetConfidence,
        isWaste: this.presetIsWaste,
        itemDescription: `Simulated item of category '${this.presetCategory}'`
      };
    }

    // Heuristic fallback for mock tests based on buffer length
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
