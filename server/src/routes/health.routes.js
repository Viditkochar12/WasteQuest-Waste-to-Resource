
const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  const response = {
    success: databaseConnected,
    data: {
      server: "ok",
      database: databaseConnected ? "connected" : "disconnected"
    }
  };

  if (!databaseConnected) {
    return res.status(503).json({
      ...response,
      error: {
        code: "DATABASE_UNAVAILABLE",
        message: "The database is not connected."
      }
    });
  }

  return res.status(200).json(response);
});

module.exports = router;
