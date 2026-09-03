import { Router } from "express";
import {
  handleAnalyzeGoal,
  handleRefineSolution,
  handleGetAlternatives,
} from "../controllers/reverseShoppingController.js";
import { apiRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.use(apiRateLimiter);

router.post("/analyze", handleAnalyzeGoal);
router.post("/refine", handleRefineSolution);
router.post("/alternatives", handleGetAlternatives);

export default router;
