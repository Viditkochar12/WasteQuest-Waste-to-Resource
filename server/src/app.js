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
app.use(errorHandler);

module.exports = app;
