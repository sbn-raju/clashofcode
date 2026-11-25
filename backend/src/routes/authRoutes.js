const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const { signup, login, adminLogin, logout, me } = require("../controllers/authController");
const requireAuth = require("../middleware/requireAuth");

const router = Router();

// Slow down brute-force attempts on credential endpoints.
const credentialLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please wait a few minutes and try again." },
});

router.post("/signup", credentialLimiter, signup);
router.post("/login", credentialLimiter, login);
router.post("/admin/login", credentialLimiter, adminLogin);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

module.exports = router;
