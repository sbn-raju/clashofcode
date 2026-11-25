const { port } = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");

async function start() {
  try {
    await connectDB();
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`clashofcode API listening on http://localhost:${port}`);
  });
}

start();
