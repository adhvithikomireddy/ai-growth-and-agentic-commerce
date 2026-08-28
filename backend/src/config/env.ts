import dotenv from "dotenv";
import path from "path";

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.resolve(process.cwd(), "backend/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
dotenv.config();

export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  CLIENT_URL: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  COOKIE_SECRET: string;
  RAZORPAY_KEY_ID: string;
  RAZORPAY_KEY_SECRET: string;
  GEMINI_API_KEY: string;
  EMAIL_API_KEY: string;
  EMAIL_FROM: string;
}

const getEnv = (key: string, fallback: string = ""): string => {
  return process.env[key] || fallback;
};

export const env: EnvConfig = {
  NODE_ENV: getEnv("NODE_ENV", "development"),
  PORT: parseInt(getEnv("PORT", "5000"), 10),
  CLIENT_URL: getEnv("CLIENT_URL", "http://localhost:5173"),
  MONGODB_URI: getEnv("MONGODB_URI", ""),
  JWT_SECRET: getEnv("JWT_SECRET", "dev_secret_key_minimum_32_chars_12345"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "7d"),
  COOKIE_SECRET: getEnv("COOKIE_SECRET", "dev_cookie_secret_key_12345"),
  RAZORPAY_KEY_ID: getEnv("RAZORPAY_KEY_ID", ""),
  RAZORPAY_KEY_SECRET: getEnv("RAZORPAY_KEY_SECRET", ""),
  GEMINI_API_KEY: getEnv("GEMINI_API_KEY", "") || getEnv("LLM_API_KEY", "") || getEnv("GOOGLE_API_KEY", ""),
  EMAIL_API_KEY: getEnv("EMAIL_API_KEY", ""),
  EMAIL_FROM: getEnv("EMAIL_FROM", "orders@nexcommerce.store"),
};

export const validateEnv = (): { isValid: boolean; missing: string[]; warnings: string[] } => {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!env.MONGODB_URI) {
    missing.push("MONGODB_URI (Required for persistent storage. MongoDB Atlas connection string needed)");
  }

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    warnings.push("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET missing (Razorpay test payments will require these credentials)");
  }

  if (!env.GEMINI_API_KEY) {
    warnings.push("GEMINI_API_KEY not configured. Deterministic Fallback Engine will handle natural language intents natively.");
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  };
};
