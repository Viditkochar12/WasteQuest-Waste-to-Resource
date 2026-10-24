const request = require("supertest");

jest.mock("../src/models/Report", () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn()
}));

const app = require("../src/app");
const { MINIMAL_PNG } = require("../../ai/tests/mockImages");

describe("POST /api/classify", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
    process.env.NODE_ENV = "development";
    process.env.WASTEQUEST_AI_PROVIDER = "mock";
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test("rejects request when no image file is uploaded", async () => {
    const response = await request(app).post("/api/classify");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "INVALID_IMAGE",
        message: 'Please upload an image using the "image" field.'
      }
    });
  });

  test("rejects request when file is uploaded under an unexpected field name", async () => {
    const response = await request(app)
      .post("/api/classify")
      .attach("photo", MINIMAL_PNG, {
        filename: "test.png",
        contentType: "image/png"
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "INVALID_IMAGE",
        message: 'Please upload an image using the "image" field.'
      }
    });
  });

  test("rejects unsupported file MIME type", async () => {
    const response = await request(app)
      .post("/api/classify")
      .attach("image", Buffer.from("plain text content"), {
        filename: "notes.txt",
        contentType: "text/plain"
      });

    expect(response.status).toBe(415);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("INVALID_FILE_TYPE");
    expect(response.body.error.message).toMatch(/Unsupported MIME type/i);
  });

  test("rejects invalid or corrupted image content signatures", async () => {
    const fakeImageBuffer = Buffer.from("NOT_A_VALID_IMAGE_HEADER_BYTES");

    const response = await request(app)
      .post("/api/classify")
      .attach("image", fakeImageBuffer, {
        filename: "corrupt.png",
        contentType: "image/png"
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("INVALID_IMAGE");
    expect(response.body.error.message).toMatch(/valid PNG image data/i);
  });

  test("rejects file exceeding the 5 MB upload limit", async () => {
    // 5 MB + 1 KB buffer
    const oversizedBuffer = Buffer.alloc(5 * 1024 * 1024 + 1024, 0);

    const response = await request(app)
      .post("/api/classify")
      .attach("image", oversizedBuffer, {
        filename: "large.png",
        contentType: "image/png"
      });

    expect(response.status).toBe(413);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "FILE_TOO_LARGE",
        message: "Image must be 5 MB or smaller."
      }
    });
  });

  test("successfully classifies waste image with explicit mock provider", async () => {
    process.env.NODE_ENV = "development";
    process.env.WASTEQUEST_AI_PROVIDER = "mock";

    const response = await request(app)
      .post("/api/classify")
      .attach("image", MINIMAL_PNG, {
        filename: "bottle.png",
        contentType: "image/png"
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();

    const data = response.body.data;
    expect(typeof data.category).toBe("string");
    expect(typeof data.confidence).toBe("number");
    expect(data.confidence).toBeGreaterThanOrEqual(0);
    expect(data.confidence).toBeLessThanOrEqual(1);
    expect(typeof data.recyclable).toBe("boolean");
    expect(typeof data.itemDescription).toBe("string");
    expect(typeof data.disposalAdvice).toBe("string");
    expect(typeof data.downstreamRoute).toBe("string");

    expect(data.bin).toMatchObject({
      name: expect.any(String),
      color: expect.any(String),
      symbol: expect.any(String)
    });

    expect(data.environmentalImpact).toMatchObject({
      co2SavedKg: expect.any(Number),
      waterSavedLiters: expect.any(Number),
      landfillDivertedGrams: expect.any(Number),
      assumptions: expect.any(String)
    });
  });

  test("returns 503 PROVIDER_UNAVAILABLE when no AI provider is configured", async () => {
    delete process.env.WASTEQUEST_AI_PROVIDER;
    delete process.env.AI_PROVIDER;
    delete process.env.GEMINI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;

    const response = await request(app)
      .post("/api/classify")
      .attach("image", MINIMAL_PNG, {
        filename: "sample.png",
        contentType: "image/png"
      });

    expect(response.status).toBe(503);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("PROVIDER_UNAVAILABLE");
    expect(response.body.error.message).toMatch(/No vision provider is configured/i);
  });

  test("handles provider inference failures safely without leaking internal details", async () => {
    const aiModule = require("../../ai/src/classifyWaste");
    const classifySpy = jest.spyOn(aiModule, "classifyWaste").mockResolvedValueOnce({
      success: false,
      error: {
        code: "INFERENCE_FAILED",
        message: "Vision classification service failed to process the image."
      }
    });

    const response = await request(app)
      .post("/api/classify")
      .attach("image", MINIMAL_PNG, {
        filename: "sample.png",
        contentType: "image/png"
      });

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "INFERENCE_FAILED",
        message: "Vision classification service failed to process the image."
      }
    });

    classifySpy.mockRestore();
  });
  test("successfully classifies waste with genuine Gemini provider returning honest null confidence", async () => {
    process.env.WASTEQUEST_AI_PROVIDER = "gemini";
    process.env.GEMINI_API_KEY = "test_gemini_api_key";

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    category: "organic",
                    isWaste: true,
                    itemDescription: "Decaying banana peel and fruit leftovers",
                    disposalAdvice: "Compost or discard in green wet waste container."
                  })
                }
              ]
            }
          }
        ]
      })
    });

    try {
      const response = await request(app)
        .post("/api/classify")
        .attach("image", MINIMAL_PNG, {
          filename: "banana.png",
          contentType: "image/png"
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.category).toBe("organic");
      expect(response.body.data.confidence).toBeNull(); // Honest null for LLM vision
      expect(response.body.data.itemDescription).toBe("Decaying banana peel and fruit leftovers");
      expect(response.body.data.disposalAdvice).toBe("Compost or discard in green wet waste container.");
      expect(response.body.data.recyclable).toBe(true);
      expect(response.body.data.bin.name).toMatch(/Green Bin/i);
    } finally {
      global.fetch = originalFetch;
    }
  });

  test("handles unknown/uncertain waste stream with genuine provider", async () => {
    process.env.WASTEQUEST_AI_PROVIDER = "gemini";
    process.env.GEMINI_API_KEY = "test_gemini_api_key";

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    category: "unknown",
                    isWaste: true,
                    itemDescription: "Composite unrecognizable fragment",
                    disposalAdvice: "Inspect locally before discarding."
                  })
                }
              ]
            }
          }
        ]
      })
    });

    try {
      const response = await request(app)
        .post("/api/classify")
        .attach("image", MINIMAL_PNG, {
          filename: "mystery.png",
          contentType: "image/png"
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.category).toBe("unknown");
      expect(response.body.data.confidence).toBeNull();
      expect(response.body.data.recyclable).toBe(false);
    } finally {
      global.fetch = originalFetch;
    }
  });

  test("returns 503 when Gemini provider returns 401 unauthorized", async () => {
    process.env.WASTEQUEST_AI_PROVIDER = "gemini";
    process.env.GEMINI_API_KEY = "invalid_key";

    const originalFetch = global.fetch;
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401
    });

    try {
      const response = await request(app)
        .post("/api/classify")
        .attach("image", MINIMAL_PNG, {
          filename: "test.png",
          contentType: "image/png"
        });

      expect(response.status).toBe(503);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe("PROVIDER_UNAVAILABLE");
      expect(response.body.error.message).toMatch(/invalid or unauthorized/i);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
