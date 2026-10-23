const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { classifyWaste, ErrorCodes } = require("../src/classifyWaste");
const { MockProvider } = require("../src/providers/mockProvider");
const { MINIMAL_PNG, MINIMAL_JPEG } = require("./mockImages");

describe("WasteQuest AI Classification Module", () => {
  it("should successfully classify a plastic item with high confidence", async () => {
    const provider = new MockProvider({
      presetCategory: "plastic",
      presetConfidence: 0.95
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_PNG, mimeType: "image/png" },
      { provider }
    );

    assert.equal(result.success, true);
    assert.equal(result.data.category, "plastic");
    assert.equal(result.data.confidence, 0.95);
    assert.equal(result.data.recyclable, true);
    assert.match(result.data.disposalAdvice, /rinse/i);
    assert.ok(result.data.bin.name.includes("Blue Bin"));
    assert.ok(result.data.downstreamRoute.length > 10);
    assert.ok(result.data.environmentalImpact.co2SavedKg > 0);
  });

  it("should normalize 'e-waste' alias to canonical 'e_waste'", async () => {
    const provider = new MockProvider({
      presetCategory: "e-waste",
      presetConfidence: 0.92
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_JPEG, mimeType: "image/jpeg" },
      { provider }
    );

    assert.equal(result.success, true);
    assert.equal(result.data.category, "e_waste");
    assert.match(result.data.bin.name, /E-Waste/i);
    assert.ok(result.data.environmentalImpact.co2SavedKg > 0.2);
  });

  it("should reject classification when confidence is below threshold", async () => {
    const provider = new MockProvider({
      presetCategory: "paper",
      presetConfidence: 0.42 // Below default 0.50
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_PNG, mimeType: "image/png" },
      { provider, confidenceThreshold: 0.5 }
    );

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.LOW_CONFIDENCE);
    assert.match(result.error.message, /threshold/i);
  });

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

  it("should reject unsupported MIME types", async () => {
    const result = await classifyWaste({
      buffer: Buffer.from("fake data"),
      mimeType: "application/pdf"
    });

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.INVALID_FILE_TYPE);
  });

  it("should reject files exceeding the maximum size limit", async () => {
    const hugeBuffer = Buffer.alloc(3 * 1024 * 1024); // 3 MB
    hugeBuffer[0] = 0x89;
    hugeBuffer[1] = 0x50;
    hugeBuffer[2] = 0x4e;
    hugeBuffer[3] = 0x47;

    const result = await classifyWaste(
      { buffer: hugeBuffer, mimeType: "image/png" },
      { maxSizeMB: 2 } // Limit to 2 MB
    );

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.FILE_TOO_LARGE);
  });

  it("should gracefully handle provider inference errors", async () => {
    const provider = new MockProvider({
      shouldFail: true
    });

    const result = await classifyWaste(
      { buffer: MINIMAL_PNG, mimeType: "image/png" },
      { provider }
    );

    assert.equal(result.success, false);
    assert.equal(result.error.code, ErrorCodes.INFERENCE_FAILED);
  });
});
