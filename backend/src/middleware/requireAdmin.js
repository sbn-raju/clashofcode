const HttpError = require("../utils/HttpError");
const requireAuth = require("./requireAuth");

/** requireAuth + role check. */
async function requireAdmin(req, res, next) {
  await requireAuth(req, res, () => {});
  if (req.user.role !== "admin") throw new HttpError(403, "Admin access required.");
  next();
}

module.exports = requireAdmin;
