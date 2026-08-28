import { Router } from "express";
import { signup, login, getMe, updatePreferences, updateSpendingControls } from "../controllers/authController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { authRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.post("/signup", authRateLimiter, signup);
router.post("/login", authRateLimiter, login);
router.get("/me", requireAuth, getMe);
router.put("/preferences", requireAuth, updatePreferences);
router.put("/spending-controls", requireAuth, updateSpendingControls);

export default router;
