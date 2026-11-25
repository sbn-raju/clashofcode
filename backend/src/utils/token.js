const jwt = require("jsonwebtoken");
const { jwtSecret, jwtExpiresIn, isProduction } = require("../config/env");

const COOKIE_NAME = "coc_token";
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function signToken(userId) {
  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: jwtExpiresIn });
}

function verifyToken(token) {
  return jwt.verify(token, jwtSecret);
}

const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax",
  path: "/",
};

function setAuthCookie(res, userId) {
  res.cookie(COOKIE_NAME, signToken(userId), { ...cookieOptions, maxAge: SEVEN_DAYS_MS });
}

function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions);
}

module.exports = { COOKIE_NAME, verifyToken, setAuthCookie, clearAuthCookie };
