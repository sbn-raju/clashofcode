const { Router } = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const c = require("../controllers/adminProblemController");

const router = Router();

router.use(requireAdmin);

router.get("/problems", c.listProblems);
router.post("/problems", c.createProblem);
router.get("/problems/:id", c.getProblem);
router.put("/problems/:id", c.updateProblem);
router.delete("/problems/:id", c.deleteProblem);
router.post("/problems/:id/publish", c.publishProblem);
router.post("/problems/:id/unpublish", c.unpublishProblem);
router.post("/run", c.runCode);

module.exports = router;
