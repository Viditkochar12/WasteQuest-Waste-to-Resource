
const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn("MongoDB URI is not configured. Database is disconnected.");
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected successfully.");
  } catch {
    console.error("MongoDB connection failed. Check your configuration.");
  }
}

module.exports = { connectDB };
