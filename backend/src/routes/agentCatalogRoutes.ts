import { Router } from "express";
import {
  getCapabilities,
  searchAgentCatalog,
  getAgentProduct,
  getAgentTrending,
  getAgentRelated,
  getAgentCompatible,
} from "../controllers/agentCatalogController.js";
import { apiRateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

router.use(apiRateLimiter);

router.get("/capabilities", getCapabilities);
router.post("/search", searchAgentCatalog);
router.get("/trending", getAgentTrending);
router.get("/product/:id", getAgentProduct);
router.get("/related/:id", getAgentRelated);
router.get("/compatible/:id", getAgentCompatible);

export default router;
