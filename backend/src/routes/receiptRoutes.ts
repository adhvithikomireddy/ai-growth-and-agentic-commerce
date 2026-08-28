import { Router } from "express";
import { getReceipt } from "../controllers/receiptController.js";

const router = Router();

router.get("/:orderId", getReceipt);

export default router;
