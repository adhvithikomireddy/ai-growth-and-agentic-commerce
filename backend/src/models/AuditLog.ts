import mongoose, { Schema, Document } from "mongoose";

export interface IAuditLog extends Document {
  logId: string;
  timestamp: Date;
  actor: string;
  userId?: string;
  agent?: string;
  action: string;
  requestId: string;
  orderId?: string;
  productId?: string;
  amount?: number;
  policyResult: string;
  authorizationResult: string;
  paymentResult?: string;
  status: "SUCCESS" | "BLOCKED" | "FAILED" | "PENDING";
  reason?: string;
  metadata?: Record<string, any>;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    logId: { type: String, required: true, unique: true, index: true },
    timestamp: { type: Date, default: Date.now, index: true },
    actor: { type: String, required: true },
    userId: { type: String, index: true },
    agent: { type: String },
    action: { type: String, required: true, index: true },
    requestId: { type: String, required: true, index: true },
    orderId: { type: String, index: true },
    productId: { type: String },
    amount: { type: Number },
    policyResult: { type: String, default: "PASSED" },
    authorizationResult: { type: String, default: "AUTHORIZED" },
    paymentResult: { type: String },
    status: {
      type: String,
      enum: ["SUCCESS", "BLOCKED", "FAILED", "PENDING"],
      default: "SUCCESS",
      index: true,
    },
    reason: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
