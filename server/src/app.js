const errorHandler = require("./middleware/error.middleware");
const express = require("express");
const cors = require("cors");
const healthRoutes = require("./routes/health.routes");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173"
  })
);

app.use(express.json({ limit: "100kb" }));

app.use("/api/health", healthRoutes);
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
