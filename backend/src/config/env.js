const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// MONGODB_URL may contain a {MONGODB_PASSWORD} placeholder that is filled from MONGODB_PASSWORD.
function buildMongoUri() {
  const url = required("MONGODB_URL");
  const password = process.env.MONGODB_PASSWORD;
  if (url.includes("{MONGODB_PASSWORD}")) {
    if (!password) throw new Error("MONGODB_URL references {MONGODB_PASSWORD} but it is not set");
    return url.replace("{MONGODB_PASSWORD}", encodeURIComponent(password));
  }
  return url;
}

const nodeEnv = process.env.NODE_ENV || "development";

module.exports = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  port: Number(process.env.PORT) || 4000,
  mongoUri: buildMongoUri(),
  mongoDbName: process.env.MONGODB_DB_NAME || "clashofcode",
  jwtSecret: required("JWT_SECRET"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  // townhall code-execution service (see /townhall). The token is townhall's AUTH_TOKEN.
  townhallUrl: (process.env.TOWNHALL_URL || "http://localhost:3000").replace(/\/+$/, ""),
  townhallToken: process.env.TOWNHALL_TOKEN || "",
};
