type LogLevel = "info" | "warn" | "error" | "debug";

const sanitizeData = (data: any): any => {
  if (!data || typeof data !== "object") return data;
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  const sensitiveKeys = [
    "password", "passwordHash", "token", "jwt", "secret",
    "razorpay_key_secret", "RAZORPAY_KEY_SECRET", "key_secret",
    "authorization", "pin", "transactionPin"
  ];

  for (const key of Object.keys(sanitized)) {
    if (sensitiveKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof sanitized[key] === "object") {
      sanitized[key] = sanitizeData(sanitized[key]);
    }
  }
  return sanitized;
};

export const logger = {
  info: (message: string, meta?: any) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(sanitizeData(meta)) : "");
  },
  warn: (message: string, meta?: any) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(sanitizeData(meta)) : "");
  },
  error: (message: string, meta?: any) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(sanitizeData(meta)) : "");
  },
  debug: (message: string, meta?: any) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, meta ? JSON.stringify(sanitizeData(meta)) : "");
    }
  },
};
