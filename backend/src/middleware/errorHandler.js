const HttpError = require("../utils/HttpError");

function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  // Malformed JSON body
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ message: "Request body must be valid JSON." });
  }

  // Mongoose schema validation
  if (err.name === "ValidationError") {
    const fields = {};
    for (const [key, value] of Object.entries(err.errors)) fields[key] = value.message;
    return res.status(400).json({ message: "Please fix the highlighted fields.", fields });
  }

  // Unique index race (two signups at once)
  if (err.code === 11000) {
    const key = Object.keys(err.keyPattern || {})[0] || "field";
    return res.status(409).json({
      message: `That ${key} is already in use.`,
      fields: { [key]: `This ${key} is already in use.` },
    });
  }

  if (err instanceof HttpError) {
    return res.status(err.status).json({
      message: err.message,
      ...(err.fields && { fields: err.fields }),
      ...err.details,
    });
  }

  console.error(err);
  return res.status(500).json({ message: "Something went wrong. Please try again." });
}

module.exports = { notFound, errorHandler };
