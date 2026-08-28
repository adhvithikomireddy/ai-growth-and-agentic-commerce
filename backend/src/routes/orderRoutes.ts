import { Router } from "express";
import { getMyOrders, getOrderById } from "../controllers/orderController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();
router.use(requireAuth);

router.get("/my-orders", getMyOrders);
router.get("/:id", getOrderById);

export default router;
