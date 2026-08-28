import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeCartItem, applyNegotiatedOffer } from "../controllers/cartController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { apiRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.use(apiRateLimiter);
router.use(requireAuth);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/item", updateCartItem);
router.delete("/item/:productId", removeCartItem);
router.post("/apply-offer", applyNegotiatedOffer);

export default router;
