const errorHandler = require("./middleware/error.middleware");
const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health.routes");
const reportsRoutes = require("./routes/reports.routes");
const classifyRoutes = require("./routes/classify.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const uploadsRoutes = require("./routes/uploads.routes");
const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  ...(process.env.CLIENT_ORIGIN
    ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
    : [])
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true
  })
);

app.use(express.json({ limit: "100kb" }));

app.use("/api/health", healthRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/classify", classifyRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/uploads", uploadsRoutes);
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "The requested API route was not found."
    }
  });
});
app.use(errorHandler);

module.exports = app;
