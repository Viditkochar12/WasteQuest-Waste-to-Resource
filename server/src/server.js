
require("dotenv").config();

const app = require("./app");
const { connectDB } = require("./config/db");

const PORT = Number(process.env.PORT) || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`WasteQuest API running on port ${PORT}`);
  });
}

startServer().catch(() => {
  console.error("Failed to start the server.");
  process.exitCode = 1;
});
