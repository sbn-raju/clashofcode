const User = require("../models/User");
const HttpError = require("../utils/HttpError");
const { COOKIE_NAME, verifyToken } = require("../utils/token");

async function requireAuth(req, _res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new HttpError(401, "Not signed in.");

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new HttpError(401, "Session expired. Please sign in again.");
  }

  const user = await User.findById(payload.sub);
  if (!user) throw new HttpError(401, "Account no longer exists.");

  req.user = user;
  next();
}

module.exports = requireAuth;
