const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert/strict");
const { classifyWaste, ErrorCodes } = require("../src/classifyWaste");
const { MockProvider } = require("../src/providers/mockProvider");
const { MINIMAL_PNG, MINIMAL_JPEG } = require("./mockImages");

describe("WasteQuest AI Classification Module", () => {
  const ORIGINAL_ENV = { ...process.env };

  function cleanEnv() {
    process.env = { ...ORIGINAL_ENV };
    delete process.env.WASTEQUEST_AI_PROVIDER;
    delete process.env.AI_PROVIDER;
    delete process.env.GEMINI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.CONFIDENCE_THRESHOLD;
    delete process.env.MAX_IMAGE_SIZE_MB;
    process.env.NODE_ENV = "test";
  }

  beforeEach(() => {
    cleanEnv();
  });

  afterEach(() => {
    cleanEnv();
  });

  // 1. Mock mode is disabled by default
  it("should disable mock mode by default and return PROVIDER_UNAVAILABLE when unconfigured", async () => {
    const result = await classifyWaste({
      buffer: MINIMAL_PNG,
      mimeType: "image/png"
    });

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.PROVIDER_UNAVAILABLE);
    assert.match(result.error.message, /unavailable/i);
  });

  // 2. Explicit mock mode works in development/testing
  it("should allow explicit mock mode via WASTEQUEST_AI_PROVIDER in development/testing", async () => {
    process.env.WASTEQUEST_AI_PROVIDER = "mock";
    process.env.NODE_ENV = "development";

    const result = await classifyWaste({
      buffer: MINIMAL_PNG,
      mimeType: "image/png"
    });

    assert.equal(result.success, true);
    assert.ok(result.data.category);
    assert.ok(typeof result.data.confidence === "number");
  });

  it("should allow explicit mock provider instance override in testing", async () => {
    const provider = new MockProvider({
      presetCategory: "glass",
      presetConfidence: 0.91
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_PNG, mimeType: "image/png" },
      { provider }
    );

    assert.equal(result.success, true);
    assert.equal(result.data.category, "glass");
    assert.equal(result.data.confidence, 0.91);
  });

  // 3. Production configuration rejects mock mode
  it("should reject mock mode when NODE_ENV is production (env flag)", async () => {
    process.env.NODE_ENV = "production";
    process.env.WASTEQUEST_AI_PROVIDER = "mock";

    const result = await classifyWaste({
      buffer: MINIMAL_PNG,
      mimeType: "image/png"
    });

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.PROVIDER_UNAVAILABLE);
    assert.match(result.error.message, /mock provider/i);
  });

  it("should reject mock provider instance override when NODE_ENV is production", async () => {
    process.env.NODE_ENV = "production";
    const provider = new MockProvider();

    const result = await classifyWaste(
      { buffer: MINIMAL_PNG, mimeType: "image/png" },
      { provider }
    );

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.PROVIDER_UNAVAILABLE);
    assert.match(result.error.message, /mock provider/i);
  });

  // 4. Missing real-provider configuration returns PROVIDER_UNAVAILABLE
  it("should return PROVIDER_UNAVAILABLE when Gemini is requested but API key is missing", async () => {
    process.env.WASTEQUEST_AI_PROVIDER = "gemini";
    delete process.env.GEMINI_API_KEY;

    const result = await classifyWaste({
      buffer: MINIMAL_PNG,
      mimeType: "image/png"
    });

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.PROVIDER_UNAVAILABLE);
  });

  it("should return PROVIDER_UNAVAILABLE when Anthropic is requested but API key is missing", async () => {
    process.env.WASTEQUEST_AI_PROVIDER = "anthropic";
    delete process.env.ANTHROPIC_API_KEY;

    const result = await classifyWaste({
      buffer: MINIMAL_PNG,
      mimeType: "image/png"
    });

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.PROVIDER_UNAVAILABLE);
  });

  it("should return PROVIDER_UNAVAILABLE when an unknown provider is specified", async () => {
    process.env.WASTEQUEST_AI_PROVIDER = "non_existent_provider";

    const result = await classifyWaste({
      buffer: MINIMAL_PNG,
      mimeType: "image/png"
    });

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.PROVIDER_UNAVAILABLE);
  });

  // 5. Unknown categories return UNKNOWN_CATEGORY
  it("should reject unknown categories with UNKNOWN_CATEGORY and never silently map to general", async () => {
    const provider = new MockProvider({
      presetCategory: "spaceship_fuselage",
      presetConfidence: 0.95
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_PNG, mimeType: "image/png" },
      { provider }
    );

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.UNKNOWN_CATEGORY);
    assert.match(result.error.message, /unrecognized waste category/i);
  });

  // 6. e-waste is normalized to e_waste
  it("should normalize 'e-waste' alias to canonical 'e_waste'", async () => {
    const provider = new MockProvider({
      presetCategory: "e-waste",
      presetConfidence: 0.94
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_JPEG, mimeType: "image/jpeg" },
      { provider }
    );

    assert.equal(result.success, true);
    assert.equal(result.data.category, "e_waste");
    assert.equal(result.data.recyclable, true);
    assert.ok(result.data.disposalAdvice.length > 0);
    assert.match(result.data.bin.name, /E-Waste/i);
    assert.ok(result.data.environmentalImpact.co2SavedKg > 0);
  });

  it("should normalize 'ewaste' alias to canonical 'e_waste'", async () => {
    const provider = new MockProvider({
      presetCategory: "ewaste",
      presetConfidence: 0.88
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_PNG, mimeType: "image/png" },
      { provider }
    );

    assert.equal(result.success, true);
    assert.equal(result.data.category, "e_waste");
  });

  // 7. Confidence 0 is preserved or correctly rejected by configured threshold
  it("should reject confidence 0 when it falls below default threshold (never fabricates default)", async () => {
    const provider = new MockProvider({
      presetCategory: "paper",
      presetConfidence: 0
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_PNG, mimeType: "image/png" },
      { provider }
    );

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.LOW_CONFIDENCE);
    assert.match(result.error.message, /0\.0%/);
  });

  it("should preserve confidence 0 when threshold is explicitly set to 0", async () => {
    const provider = new MockProvider({
      presetCategory: "paper",
      presetConfidence: 0
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_PNG, mimeType: "image/png" },
      { provider, confidenceThreshold: 0 }
    );

    assert.equal(result.success, true);
    assert.equal(result.data.category, "paper");
    assert.strictEqual(result.data.confidence, 0);
  });

  // 8. Negative, greater-than-one, NaN, infinite, and invalid confidence values are rejected
  it("should reject negative confidence values", async () => {
    const provider = new MockProvider({
      presetCategory: "metal",
      presetConfidence: -0.2
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_PNG, mimeType: "image/png" },
      { provider }
    );

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.INFERENCE_FAILED);
  });

  it("should reject confidence values greater than 1", async () => {
    const provider = new MockProvider({
      presetCategory: "metal",
      presetConfidence: 1.25
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_PNG, mimeType: "image/png" },
      { provider }
    );

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.INFERENCE_FAILED);
  });

  it("should reject NaN, Infinity, -Infinity, and non-numeric confidence values", async () => {
    const invalidConfidences = [NaN, Infinity, -Infinity, "high", true, null, undefined];

    for (const invalidVal of invalidConfidences) {
      const provider = new MockProvider({
        presetCategory: "metal",
        presetConfidence: invalidVal
      });

      const result = await classifyWaste(
        { buffer: MINIMAL_PNG, mimeType: "image/png" },
        { provider }
      );

      assert.equal(
        result.success,
        false,
        `Expected rejection for invalid confidence: ${invalidVal}`
      );
      assert.equal(result.error.code, ErrorCodes.INFERENCE_FAILED);
    }
  });

  // 9. Provider exceptions produce safe, structured errors
  it("should contain provider exceptions into safe, structured errors without leaking secrets", async () => {
    const provider = new MockProvider({
      shouldFail: true,
      failureMessage: "Fatal error at api.vision.com/key=SECRET_API_KEY_12345 in /app/secret/internal.js:42"
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_PNG, mimeType: "image/png" },
      { provider }
    );

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.INFERENCE_FAILED);
    assert.strictEqual(result.error.message.includes("SECRET_API_KEY_12345"), false);
    assert.strictEqual(result.error.message.includes("/app/secret/internal.js"), false);
    assert.equal(result.error.stack, undefined);
  });

  // 10. Invalid MIME types, oversized images, and invalid image signatures are rejected
  it("should reject unsupported MIME types with INVALID_FILE_TYPE", async () => {
    const result = await classifyWaste({
      buffer: Buffer.from("fake data"),
      mimeType: "application/pdf"
    });

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.INVALID_FILE_TYPE);
  });

  it("should reject files exceeding the maximum size limit with FILE_TOO_LARGE", async () => {
    const hugeBuffer = Buffer.alloc(3 * 1024 * 1024); // 3 MB
    hugeBuffer[0] = 0x89;
    hugeBuffer[1] = 0x50;
    hugeBuffer[2] = 0x4e;
    hugeBuffer[3] = 0x47;

    const result = await classifyWaste(
      { buffer: hugeBuffer, mimeType: "image/png" },
      { maxSizeMB: 2 }
    );

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.FILE_TOO_LARGE);
  });

  it("should reject images with corrupt magic bytes with INVALID_IMAGE", async () => {
    const corruptPng = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x05, 0x06]);

    const result = await classifyWaste({
      buffer: corruptPng,
      mimeType: "image/png"
    });

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.INVALID_IMAGE);
  });

  it("should reject empty or missing buffer with INVALID_IMAGE", async () => {
    const result1 = await classifyWaste({
      buffer: Buffer.alloc(0),
      mimeType: "image/png"
    });
    assert.equal(result1.success, false);
    assert.equal(result1.error.code, ErrorCodes.INVALID_IMAGE);

    const result2 = await classifyWaste(null);
    assert.equal(result2.success, false);
    assert.equal(result2.error.code, ErrorCodes.INVALID_IMAGE);
  });

  // 11. Successful classifications include the required output fields
  it("should return the required output fields for successful classifications", async () => {
    const provider = new MockProvider({
      presetCategory: "plastic",
      presetConfidence: 0.94
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_PNG, mimeType: "image/png" },
      { provider }
    );

    assert.equal(result.success, true);
    assert.equal(result.data.category, "plastic");
    assert.equal(result.data.confidence, 0.94);
    assert.equal(result.data.recyclable, true);
    assert.ok(typeof result.data.disposalAdvice === "string");
    assert.ok(result.data.disposalAdvice.length > 0);
    assert.match(result.data.disposalAdvice, /rinse/i);
    assert.ok(result.data.bin.name.includes("Blue Bin"));
    assert.ok(result.data.downstreamRoute.length > 10);
    assert.ok(result.data.environmentalImpact.co2SavedKg > 0);
  });

  // Non-waste rejection
  it("should reject input when image does not contain waste (NOT_WASTE)", async () => {
    const provider = new MockProvider({
      presetIsWaste: false
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_PNG, mimeType: "image/png" },
      { provider }
    );

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.NOT_WASTE);
  });

  // Threshold check
  it("should reject classification when confidence is below configured threshold", async () => {
    const provider = new MockProvider({
      presetCategory: "paper",
      presetConfidence: 0.42
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_PNG, mimeType: "image/png" },
      { provider, confidenceThreshold: 0.5 }
    );

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.LOW_CONFIDENCE);
  });
});
