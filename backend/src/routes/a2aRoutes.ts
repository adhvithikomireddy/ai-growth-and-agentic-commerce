import { Router } from "express";
import { chatWithBuyerAgent, negotiatePrice, streamA2AEvents, getA2AMessages } from "../controllers/a2aController.js";
import { apiRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.use(apiRateLimiter);

router.post("/chat", chatWithBuyerAgent);
router.post("/negotiate", negotiatePrice);
router.get("/stream", streamA2AEvents);
router.get("/messages", getA2AMessages);

export default router;
