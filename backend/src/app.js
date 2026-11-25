const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const { clientOrigin } = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const problemRoutes = require("./routes/problemRoutes");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
app.use(cors({ origin: clientOrigin, credentials: true }));
// Admin payloads carry test data, so they get a larger body limit.
app.use("/api/admin", express.json({ limit: "8mb" }));
app.use(express.json({ limit: "200kb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", problemRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
