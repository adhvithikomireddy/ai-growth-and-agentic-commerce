import mongoose from "mongoose";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

let isConnecting = false;

export const connectDatabase = async (): Promise<boolean> => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  if (!env.MONGODB_URI) {
    logger.error("Database connection blocked: MONGODB_URI environment variable is missing.");
    return false;
  }

  if (isConnecting) return false;

  try {
    isConnecting = true;
    logger.info("Connecting to MongoDB Atlas...");
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    logger.info("Successfully connected to MongoDB Atlas (Persistent Storage Active).");
    isConnecting = false;
    return true;
  } catch (error: any) {
    isConnecting = false;
    logger.error("MongoDB Atlas connection failed:", {
      message: error?.message,
      code: error?.code,
    });
    return false;
  }
};

export const getDatabaseStatus = () => {
  const states = ["disconnected", "connected", "connecting", "disconnecting"];
  const stateIndex = mongoose.connection.readyState;
  return {
    state: states[stateIndex] || "unknown",
    isConnected: stateIndex === 1,
    host: mongoose.connection.host || null,
    name: mongoose.connection.name || null,
  };
};

mongoose.connection.on("disconnected", () => {
  logger.warn("MongoDB connection disconnected.");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB runtime error:", { message: err.message });
});
