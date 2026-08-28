import { Router, Request, Response } from "express";
import { getDatabaseStatus } from "../config/db.js";
import { isRazorpayConfigured } from "../config/razorpay.js";
import { env } from "../config/env.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const dbStatus = getDatabaseStatus();
  const razorpayOk = isRazorpayConfigured();
  const isHealthy = dbStatus.isConnected;

  const response = {
    status: isHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: {
      status: dbStatus.state,
      connected: dbStatus.isConnected,
      host: dbStatus.host,
      databaseName: dbStatus.name,
    },
    services: {
      razorpay: razorpayOk ? "configured" : "unconfigured",
      geminiAI: env.GEMINI_API_KEY ? "active" : "fallback_engine_active",
      multilingualNLU: "active (English, Hindi, Telugu)",
      a2aCommunicationLayer: "active",
      policyEngine: "active",
    },
  };

  const statusCode = isHealthy ? 200 : 503;
  res.status(statusCode).json(response);
});

export default router;
