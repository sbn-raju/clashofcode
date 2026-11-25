const { Router } = require("express");
const rateLimit = require("express-rate-limit");
const requireAuth = require("../middleware/requireAuth");
const c = require("../controllers/problemController");

const router = Router();

// Code execution is expensive: cap runs + submissions per developer.
const executionLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  keyGenerator: (req) => req.user._id.toString(),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "You're running code too quickly. Wait a moment and try again." },
});

router.get("/languages", c.listLanguages);

router.use("/problems", requireAuth);
router.get("/problems", c.listProblems);
router.get("/problems/:slug", c.getProblem);
router.post("/problems/:slug/run", executionLimiter, c.runProblem);
router.post("/problems/:slug/submit", executionLimiter, c.submitProblem);
router.get("/problems/:slug/submissions", c.listSubmissions);

module.exports = router;
