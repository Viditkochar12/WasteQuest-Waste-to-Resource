const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/", (req, res) => {
  const databaseConnected = mongoose.connection.readyState === 1;

  const providerName = (
    process.env.WASTEQUEST_AI_PROVIDER ||
    process.env.AI_PROVIDER ||
    ""
  ).trim().toLowerCase();

  const isMock = providerName === "mock";
  const geminiKey = (process.env.GEMINI_API_KEY || "").trim();
  const anthropicKey = (process.env.ANTHROPIC_API_KEY || "").trim();

  let aiProvider = "unconfigured";
  let aiReady = false;

  if (isMock) {
    aiProvider = "mock";
    aiReady = process.env.NODE_ENV !== "production";
  } else if (providerName === "gemini") {
    aiProvider = "gemini";
    aiReady = Boolean(geminiKey);
  } else if (providerName === "anthropic") {
    aiProvider = "anthropic";
    aiReady = Boolean(anthropicKey);
  } else if (geminiKey) {
    aiProvider = "gemini";
    aiReady = true;
  } else if (anthropicKey) {
    aiProvider = "anthropic";
    aiReady = true;
  }

  const response = {
    success: databaseConnected,
    data: {
      server: "ok",
      database: databaseConnected ? "connected" : "disconnected",
      aiProvider,
      aiReady,
      isMock
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
