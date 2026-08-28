import { Router } from "express";
import {
  getAnalytics,
  getOpportunities,
  handleApproveOpportunity,
  handleDismissOpportunity,
  getMerchantCampaigns,
  getAuditLogs,
} from "../controllers/merchantRevenueController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import { apiRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.use(apiRateLimiter);
router.use(requireAuth);
router.use(requireRole(["MERCHANT", "ADMIN"]));

router.get("/analytics", getAnalytics);
router.get("/opportunities", getOpportunities);
router.post("/opportunities/:id/approve", handleApproveOpportunity);
router.post("/opportunities/:id/dismiss", handleDismissOpportunity);
router.get("/campaigns", getMerchantCampaigns);
router.get("/audit-logs", getAuditLogs);

export default router;
