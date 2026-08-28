import { Router } from "express";
import { createRazorpayOrder, verifyPayment } from "../controllers/paymentController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { paymentRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.use(paymentRateLimiter);
router.use(requireAuth);

router.post("/create-order", createRazorpayOrder);
router.post("/verify-payment", verifyPayment);

export default router;
