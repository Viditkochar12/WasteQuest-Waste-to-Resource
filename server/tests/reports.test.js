
const request = require("supertest");

jest.mock("../src/models/Report", () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn(),
}));

const Report = require("../src/models/Report");
const app = require("../src/app");

function mockReportQuery(reports = []) {
  const query = {
    sort: jest.fn(),
    skip: jest.fn(),
    limit: jest.fn(),
    lean: jest.fn(),
  };

  query.sort.mockReturnValue(query);
  query.skip.mockReturnValue(query);
  query.limit.mockReturnValue(query);
  query.lean.mockResolvedValue(reports);

  Report.find.mockReturnValue(query);
  return query;
}

const validPayload = {
  category: "plastic",
  confidence: 0.95,
  image: {
    url: "https://example.com/waste.jpg",
    publicId: "waste-test-image",
  },
  location: {
    latitude: 26.9124,
    longitude: 75.7873,
  },
  disposalAdvice: "Send it to a recycling facility.",
  recyclable: true,
};

describe("GET /api/reports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns reports with default pagination", async () => {
    const reports = [{ _id: "report-1", category: "plastic" }];
    mockReportQuery(reports);
    Report.countDocuments.mockResolvedValue(1);

    const response = await request(app).get("/api/reports");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toEqual(reports);
    expect(response.body.pagination).toMatchObject({
      page: 1,
      limit: 10,
      totalReports: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });
    expect(Report.find).toHaveBeenCalledWith({});
  });

  test("filters reports by category and status", async () => {
    mockReportQuery([]);
    Report.countDocuments.mockResolvedValue(0);

    const response = await request(app).get(
      "/api/reports?category=plastic&status=pending"
    );

    expect(response.status).toBe(200);
    expect(Report.find).toHaveBeenCalledWith({
      category: "plastic",
      status: "pending",
    });
    expect(Report.countDocuments).toHaveBeenCalledWith({
      category: "plastic",
      status: "pending",
    });
  });

  test("rejects an invalid pagination limit", async () => {
    const response = await request(app).get("/api/reports?limit=500");

    expect(response.status).toBe(400);
  });

  test("rejects an unsupported query parameter", async () => {
    const response = await request(app).get("/api/reports?unknown=value");

    expect(response.status).toBe(400);
  });

  test("rejects page zero", async () => {
    const response = await request(app).get("/api/reports?page=0");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_PAGINATION");
  });

  test("rejects a limit greater than 100", async () => {
    const response = await request(app).get("/api/reports?limit=101");

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_PAGINATION");
  });

  test("rejects an empty category", async () => {
    const response = await request(app).get(
      "/api/reports?category=%20%20"
    );

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_CATEGORY");
  });

  test("rejects an unsupported status", async () => {
    const response = await request(app).get(
      "/api/reports?status=archived"
    );

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_STATUS");
  });

  test("returns a generic 500 when fetching reports fails", async () => {
    const query = mockReportQuery();
    query.lean.mockRejectedValue(
      new Error("Database details must stay private")
    );
    Report.countDocuments.mockResolvedValue(0);

    const response = await request(app).get("/api/reports");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected server error occurred.",
      },
    });
    expect(JSON.stringify(response.body)).not.toContain(
      "Database details must stay private"
    );
  });
});

describe("POST /api/reports", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("creates a report with valid input", async () => {
    const createdReport = {
      _id: "report-123",
      ...validPayload,
      status: "pending",
    };

    Report.create.mockResolvedValue(createdReport);

    const response = await request(app)
      .post("/api/reports")
      .send(validPayload);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toMatchObject(createdReport);
    expect(Report.create).toHaveBeenCalledTimes(1);
  });

  test("rejects an invalid report payload", async () => {
    const response = await request(app)
      .post("/api/reports")
      .send({ category: "plastic" });

    expect(response.status).toBe(400);
    expect(Report.create).not.toHaveBeenCalled();
  });

  test("rejects coordinates outside valid geographic ranges", async () => {
    const response = await request(app)
      .post("/api/reports")
      .send({
        ...validPayload,
        location: {
          latitude: 120,
          longitude: 75.7873,
        },
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("INVALID_REPORT");
    expect(Report.create).not.toHaveBeenCalled();
  });

  test("returns a generic 500 when report creation fails", async () => {
    Report.create.mockRejectedValue(
      new Error("Database details must stay private")
    );

    const response = await request(app)
      .post("/api/reports")
      .send(validPayload);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected server error occurred.",
      },
    });
    expect(JSON.stringify(response.body)).not.toContain(
      "Database details must stay private"
    );
  });
});
