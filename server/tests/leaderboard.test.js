const request = require("supertest");

jest.mock("../src/models/Report", () => ({
  aggregate: jest.fn(),
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn()
}));

const Report = require("../src/models/Report");
const app = require("../src/app");

describe("GET /api/leaderboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns an empty array when no contributor reports exist (empty database state)", async () => {
    Report.aggregate.mockResolvedValue([]);

    const response = await request(app).get("/api/leaderboard");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: []
    });
    expect(Report.aggregate).toHaveBeenCalledTimes(1);
  });

  test("returns ranked contributors calculated from real report aggregations", async () => {
    const mockAggregatedResults = [
      {
        _id: "user-alpha",
        name: "EcoPioneer_01",
        itemsCount: 22,
        recyclableCount: 20,
        points: 510,
        lastActive: new Date("2026-10-23T20:00:00.000Z")
      },
      {
        _id: "user-beta",
        name: "ZeroWasteSam",
        itemsCount: 15,
        recyclableCount: 12,
        points: 315,
        lastActive: new Date("2026-10-23T19:30:00.000Z")
      },
      {
        _id: "user-gamma",
        name: "GreenCitizen",
        itemsCount: 6,
        recyclableCount: 4,
        points: 110,
        lastActive: new Date("2026-10-23T18:00:00.000Z")
      },
      {
        _id: "user-delta",
        name: "EcoNovice",
        itemsCount: 2,
        recyclableCount: 1,
        points: 30,
        lastActive: new Date("2026-10-23T17:00:00.000Z")
      }
    ];

    Report.aggregate.mockResolvedValue(mockAggregatedResults);

    const response = await request(app).get("/api/leaderboard");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(4);

    // Verify Rank #1
    expect(response.body.data[0]).toMatchObject({
      rank: 1,
      _id: "user-alpha",
      name: "EcoPioneer_01",
      points: 510,
      ecoPoints: 510,
      itemsCount: 22,
      recyclableCount: 20,
      badge: "Gold Recycler"
    });

    // Verify Rank #2
    expect(response.body.data[1]).toMatchObject({
      rank: 2,
      _id: "user-beta",
      name: "ZeroWasteSam",
      points: 315,
      ecoPoints: 315,
      itemsCount: 15,
      recyclableCount: 12,
      badge: "Silver Sorter"
    });

    // Verify Rank #3
    expect(response.body.data[2]).toMatchObject({
      rank: 3,
      _id: "user-gamma",
      name: "GreenCitizen",
      points: 110,
      ecoPoints: 110,
      itemsCount: 6,
      recyclableCount: 4,
      badge: "Bronze Guardian"
    });

    // Verify Rank #4 (under 100 points -> Active Contributor)
    expect(response.body.data[3]).toMatchObject({
      rank: 4,
      _id: "user-delta",
      name: "EcoNovice",
      points: 30,
      ecoPoints: 30,
      itemsCount: 2,
      recyclableCount: 1,
      badge: "Active Contributor"
    });
  });

  test("respects valid custom limit query parameter", async () => {
    Report.aggregate.mockResolvedValue([
      {
        _id: "user-alpha",
        name: "EcoPioneer_01",
        itemsCount: 10,
        recyclableCount: 10,
        points: 250,
        lastActive: new Date()
      }
    ]);

    const response = await request(app).get("/api/leaderboard?limit=5");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify aggregation pipeline passed limit: 5
    const pipeline = Report.aggregate.mock.calls[0][0];
    const limitStage = pipeline.find((stage) => stage.$limit !== undefined);
    expect(limitStage).toEqual({ $limit: 5 });
  });

  test("rejects unsupported query parameters with 400 and INVALID_QUERY_PARAMETER", async () => {
    const response = await request(app).get("/api/leaderboard?sort=desc");

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "INVALID_QUERY_PARAMETER",
        message: "One or more query parameters are not supported."
      }
    });
    expect(Report.aggregate).not.toHaveBeenCalled();
  });

  test("rejects invalid limit values with 400 and INVALID_PAGINATION", async () => {
    const invalidLimits = ["0", "-5", "abc", "101", "1.5"];

    for (const invalid of invalidLimits) {
      const response = await request(app).get(`/api/leaderboard?limit=${invalid}`);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe("INVALID_PAGINATION");
      expect(Report.aggregate).not.toHaveBeenCalled();
    }
  });

  test("returns generic 500 error without exposing internal DB details when aggregation fails", async () => {
    Report.aggregate.mockRejectedValue(
      new Error("Sensitive mongo connection pool failure details")
    );

    const response = await request(app).get("/api/leaderboard");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected server error occurred."
      }
    });
    expect(JSON.stringify(response.body)).not.toContain(
      "Sensitive mongo connection pool failure details"
    );
  });
});
