const request = require("supertest");

jest.mock("../src/config/cloudinary", () => ({
  isConfigured: true,
  cloudinary: {
    uploader: {
      upload_stream: jest.fn()
    }
  }
}));

const { cloudinary } = require("../src/config/cloudinary");
const app = require("../src/app");
const { MINIMAL_PNG } = require("../../ai/tests/mockImages");

describe("POST /api/uploads", () => {
  beforeEach(() => {
    cloudinary.uploader.upload_stream.mockReset();
    cloudinary.uploader.upload_stream.mockImplementation((_options, callback) => ({
      end: () => callback(null, {
        secure_url: "https://res.cloudinary.com/test/waste.png",
        public_id: "wastequest/reports/waste-test"
      })
    }));
  });

  test("requires an image file", async () => {
    const response = await request(app).post("/api/uploads");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("IMAGE_REQUIRED");
  });

  test("rejects unsupported MIME types", async () => {
    const response = await request(app)
      .post("/api/uploads")
      .attach("image", Buffer.from("plain text"), {
        filename: "notes.txt",
        contentType: "text/plain"
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_FILE_TYPE");
  });

  test("rejects image content with an invalid file signature", async () => {
    const response = await request(app)
      .post("/api/uploads")
      .attach("image", Buffer.from("not a png"), {
        filename: "invalid.png",
        contentType: "image/png"
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_IMAGE");
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });

  test("rejects images larger than 5 MB", async () => {
    const response = await request(app)
      .post("/api/uploads")
      .attach("image", Buffer.alloc(5 * 1024 * 1024 + 1), {
        filename: "large.png",
        contentType: "image/png"
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("FILE_TOO_LARGE");
    expect(cloudinary.uploader.upload_stream).not.toHaveBeenCalled();
  });

  test("returns the Cloudinary URL and public ID from the upload result", async () => {
    const response = await request(app)
      .post("/api/uploads")
      .attach("image", MINIMAL_PNG, {
        filename: "waste.png",
        contentType: "image/png"
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      success: true,
      data: {
        url: "https://res.cloudinary.com/test/waste.png",
        publicId: "wastequest/reports/waste-test"
      }
    });
    expect(cloudinary.uploader.upload_stream).toHaveBeenCalledWith(
      { folder: "wastequest/reports", resource_type: "image" },
      expect.any(Function)
    );
  });

  test("sanitizes Cloudinary provider errors", async () => {
    cloudinary.uploader.upload_stream.mockImplementation((_options, callback) => ({
      end: () => callback(new Error("credential=private-secret"))
    }));

    const response = await request(app)
      .post("/api/uploads")
      .attach("image", MINIMAL_PNG, {
        filename: "waste.png",
        contentType: "image/png"
      });

    expect(response.status).toBe(500);
    expect(response.body.error.message).toBe("An unexpected server error occurred.");
    expect(JSON.stringify(response.body)).not.toContain("private-secret");
  });
});
