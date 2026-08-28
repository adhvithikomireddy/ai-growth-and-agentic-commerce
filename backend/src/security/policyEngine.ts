import bcrypt from "bcryptjs";
import { IUser } from "../models/User.js";
import { AuditLog } from "../models/AuditLog.js";
import { broadcastA2AEvent } from "../a2a/a2aProtocol.js";
import { logger } from "../utils/logger.js";

export interface PolicyCheckResult {
  allowed: boolean;
  requiresPin: boolean;
  reason: string;
  spendingLimit: number;
  autonomousLimit: number;
  amount: number;
}

export const evaluateSpendingPolicy = async (
  user: IUser,
  amount: number,
  requestId: string = `req_${Date.now()}`
): Promise<PolicyCheckResult> => {
  const spending = user.spendingControls || {
    autonomousLimit: 2000,
    requirePinAbove: 2000,
    maxDailySpend: 100000,
    spentToday: 0,
    lastSpendReset: new Date(),
  };

  // Check Daily Limit
  const now = new Date();
  const lastReset = new Date(spending.lastSpendReset || now);
  const isDifferentDay = now.toDateString() !== lastReset.toDateString();
  const currentDailySpent = isDifferentDay ? 0 : spending.spentToday || 0;

  if (currentDailySpent + amount > spending.maxDailySpend) {
    broadcastA2AEvent({
      id: `evt_${Date.now()}_policy_block`,
      timestamp: new Date().toISOString(),
      requestId,
      agent: "Policy Engine",
      action: "DAILY_SPEND_LIMIT_EXCEEDED",
      description: `Blocked: Transaction of ?${amount} exceeds daily spending cap (?${spending.maxDailySpend}).`,
      status: "flagged",
      details: { amount, maxDailySpend: spending.maxDailySpend, currentDailySpent },
    });

    return {
      allowed: false,
      requiresPin: true,
      reason: `Transaction of ?${amount.toLocaleString("en-IN")} exceeds your configured daily spending limit of ?${spending.maxDailySpend.toLocaleString("en-IN")}.`,
      spendingLimit: spending.maxDailySpend,
      autonomousLimit: spending.autonomousLimit,
      amount,
    };
  }

  // Determine if PIN authorization is required
  const requiresPin = amount > spending.requirePinAbove;

  broadcastA2AEvent({
    id: `evt_${Date.now()}_policy_ok`,
    timestamp: new Date().toISOString(),
    requestId,
    agent: "Policy Engine",
    action: "SPENDING_POLICY_EVALUATED",
    description: requiresPin
      ? `Transaction of ?${amount.toLocaleString("en-IN")} exceeds autonomous limit (?${spending.autonomousLimit}). Human authorization PIN required.`
      : `Transaction of ?${amount.toLocaleString("en-IN")} is within autonomous threshold (?${spending.autonomousLimit}). Authorized.`,
    status: "verified",
    details: { amount, autonomousLimit: spending.autonomousLimit, requiresPin },
  });

  return {
    allowed: true,
    requiresPin,
    reason: requiresPin
      ? `This purchase exceeds your autonomous threshold of ?${spending.autonomousLimit.toLocaleString("en-IN")}. Please enter your 4-digit PIN to authorize.`
      : `Autonomous purchase approved under ?${spending.autonomousLimit.toLocaleString("en-IN")}.`,
    spendingLimit: spending.maxDailySpend,
    autonomousLimit: spending.autonomousLimit,
    amount,
  };
};

export const verifyTransactionPin = async (user: IUser, pin: string): Promise<boolean> => {
  if (!user.spendingControls?.transactionPinHash) {
    // If no pin set, allow default "1234" or require pin setup
    return pin === "1234";
  }
  return await bcrypt.compare(pin, user.spendingControls.transactionPinHash);
};
