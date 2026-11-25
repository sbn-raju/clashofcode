const mongoose = require("mongoose");
const { mongoUri, mongoDbName } = require("./env");

async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(mongoUri, { dbName: mongoDbName });
  console.log(`MongoDB connected (db: ${mongoDbName})`);
}

module.exports = connectDB;
