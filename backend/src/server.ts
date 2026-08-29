import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import { env, validateEnv } from "./config/env.js";
import { connectDatabase } from "./config/db.js";
import { logger } from "./utils/logger.js";
import { errorHandler } from "./middleware/errorHandler.js";

// Routes
import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import catalogRoutes from "./routes/catalogRoutes.js";
import agentCatalogRoutes from "./routes/agentCatalogRoutes.js";
import a2aRoutes from "./routes/a2aRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import receiptRoutes from "./routes/receiptRoutes.js";
import merchantRevenueRoutes from "./routes/merchantRevenueRoutes.js";

const app = express();

// Security & Parsing Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

const allowedOrigins = [
  env.CLIENT_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin: any, callback: any) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || env.NODE_ENV === "development") {
        callback(null, true);
      } else {
        callback(new Error("CORS policy violation: Unauthorized origin."));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));
app.use(cookieParser(env.COOKIE_SECRET));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));

// Health Route
app.use("/health", healthRoutes);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/agent/catalog", agentCatalogRoutes);
app.use("/api/a2a", a2aRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/merchant", merchantRevenueRoutes);

// Global Error Handler
app.use(errorHandler);

const startServer = async () => {
  const envStatus = validateEnv();
  if (envStatus.warnings.length > 0) {
    for (const w of envStatus.warnings) {
      logger.warn(`[CONFIG WARNING] ${w}`);
    }
  }

  if (env.MONGODB_URI) {
    await connectDatabase();
  } else {
    logger.error("MONGODB_URI is not set. Database operations will be disabled until configured.");
  }

  const server = app.listen(env.PORT, () => {
    logger.info(`=======================================================`);
    logger.info(`NexCommerce Agentic Commerce Backend Running on port ${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    logger.info(`Health check: http://localhost:${env.PORT}/health`);
    logger.info(`AI Engine: ${env.GEMINI_API_KEY ? "Gemini Live" : "Deterministic Fallback Engine Active"}`);
    logger.info(`A2A Protocol: Active`);
    logger.info(`=======================================================`);
  });

  const shutdown = async () => {
    logger.info("Gracefully shutting down server...");
    server.close(() => {
      logger.info("HTTP server closed.");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
};

startServer().catch((err) => {
  logger.error("Failed to start server:", err);
});

export default app;
