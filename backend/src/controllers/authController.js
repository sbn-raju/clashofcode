const User = require("../models/User");
const HttpError = require("../utils/HttpError");
const { setAuthCookie, clearAuthCookie } = require("../utils/token");

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const HANDLE_RE = /^[a-zA-Z0-9_]{3,24}$/;

function asString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function validateSignup({ name, handle, email, password }) {
  const fields = {};
  if (name.length < 2 || name.length > 60) fields.name = "Name must be 2–60 characters.";
  if (!HANDLE_RE.test(handle)) {
    fields.handle = "Handle must be 3–24 characters: letters, numbers, or underscores.";
  }
  if (!EMAIL_RE.test(email)) fields.email = "Enter a valid email address.";
  if (password.length < 8) {
    fields.password = "Password must be at least 8 characters.";
  } else if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    fields.password = "Password must include at least one letter and one number.";
  } else if (password.length > 128) {
    fields.password = "Password must be at most 128 characters.";
  }
  return fields;
}

// POST /api/auth/signup
async function signup(req, res) {
  const body = req.body || {};
  const input = {
    name: asString(body.name),
    handle: asString(body.handle).toLowerCase(),
    email: asString(body.email).toLowerCase(),
    password: typeof body.password === "string" ? body.password : "",
  };

  const fields = validateSignup(input);
  if (Object.keys(fields).length) {
    throw new HttpError(400, "Please fix the highlighted fields.", fields);
  }

  const existing = await User.find({
    $or: [{ email: input.email }, { handle: input.handle }],
  })
    .select("email handle")
    .lean();
  if (existing.length) {
    const conflict = {};
    for (const u of existing) {
      if (u.email === input.email) conflict.email = "An account with this email already exists.";
      if (u.handle === input.handle) conflict.handle = "This handle is already taken.";
    }
    throw new HttpError(409, "Account already exists.", conflict);
  }

  const user = await User.create({ ...input, lastLoginAt: new Date() });
  setAuthCookie(res, user._id.toString());
  res.status(201).json({ user: user.toPublicJSON() });
}

async function verifyCredentials(body = {}) {
  const identifier = asString(body.identifier ?? body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";

  if (!identifier || !password) {
    throw new HttpError(400, "Email or handle and password are required.");
  }

  const query = identifier.includes("@") ? { email: identifier } : { handle: identifier };
  const user = await User.findOne(query).select("+password");

  // Same message for unknown user and wrong password, so accounts can't be enumerated.
  if (!user || !(await user.comparePassword(password))) {
    throw new HttpError(401, "Incorrect email/handle or password.");
  }
  return user;
}

async function startSession(res, user) {
  user.lastLoginAt = new Date();
  await user.save();
  setAuthCookie(res, user._id.toString());
  res.json({ user: user.toPublicJSON() });
}

// POST /api/auth/login  — accepts either email or handle as `identifier`
async function login(req, res) {
  const user = await verifyCredentials(req.body);
  await startSession(res, user);
}

// POST /api/auth/admin/login — same credentials check, but only admins may sign in here.
async function adminLogin(req, res) {
  const user = await verifyCredentials(req.body);
  if (user.role !== "admin") {
    throw new HttpError(403, "This account does not have admin access.");
  }
  await startSession(res, user);
}

// POST /api/auth/logout
function logout(_req, res) {
  clearAuthCookie(res);
  res.status(204).end();
}

// GET /api/auth/me
function me(req, res) {
  res.json({ user: req.user.toPublicJSON() });
}

module.exports = { signup, login, adminLogin, logout, me };
