import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || "INTERNAL_SERVER_ERROR";
  const message = err.message || "An unexpected error occurred.";

  logger.error(`[API Error] ${req.method} ${req.path} (${statusCode}):`, {
    code,
    message,
  });

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message,
    },
  });
};
