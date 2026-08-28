import Razorpay from "razorpay";
import { env } from "./env.js";
import { logger } from "../utils/logger.js";

let razorpayInstance: Razorpay | null = null;

export const getRazorpayInstance = (): Razorpay | null => {
  if (razorpayInstance) return razorpayInstance;

  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    logger.warn("Razorpay credentials missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET for test payments.");
    return null;
  }

  try {
    razorpayInstance = new Razorpay({
      key_id: env.RAZORPAY_KEY_ID,
      key_secret: env.RAZORPAY_KEY_SECRET,
    });
    logger.info("Razorpay SDK initialized in TEST MODE.", { key_id: env.RAZORPAY_KEY_ID });
    return razorpayInstance;
  } catch (error: any) {
    logger.error("Failed to initialize Razorpay SDK:", { message: error.message });
    return null;
  }
};

export const isRazorpayConfigured = (): boolean => {
  return Boolean(env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET);
};
