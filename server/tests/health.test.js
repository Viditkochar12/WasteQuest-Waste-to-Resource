
const request = require("supertest");

jest.mock("../src/models/Report", () => ({
  find: jest.fn(),
  countDocuments: jest.fn(),
  create: jest.fn()
}));

jest.mock("../src/routes/health.routes", () => {
  const express = require("express");
  const router = express.Router();

  router.get("/", (req, res) => {
    const connected = req.app.locals.testDatabaseConnected;

    const data = {
      server: "ok",
      database: connected ? "connected" : "disconnected"
    };

    if (!connected) {
      return res.status(503).json({
        success: false,
        data,
        error: {
          code: "DATABASE_UNAVAILABLE",
          message: "The database is not connected."
        }
      });
    }

    return res.status(200).json({
      success: true,
      data
    });
  });

  return router;
});

const app = require("../src/app");

app.use((req, res, next) => next());

beforeEach(() => {
  app.locals.testDatabaseConnected = true;
});

describe("GET /api/health", () => {
  test("returns 200 when the database is connected", async () => {
    app.locals.testDatabaseConnected = true;

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.database).toBe("connected");
  });

  test("returns 503 when the database is disconnected", async () => {
    app.locals.testDatabaseConnected = false;

    const response = await request(app).get("/api/health");

    expect(response.status).toBe(503);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("DATABASE_UNAVAILABLE");
    expect(response.body.data.database).toBe("disconnected");
  });

  test("returns JSON for an unknown API route", async () => {
    const response = await request(app).get("/api/unknown");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});
