import mongoose, { Schema, Document } from "mongoose";

export interface IA2AMessage extends Document {
  messageId: string;
  requestId: string;
  sender: "buyer-agent" | "merchant-agent" | "system";
  receiver: "buyer-agent" | "merchant-agent" | "customer";
  timestamp: Date;
  messageType: "product_search" | "price_verification" | "negotiate_offer" | "order_intent" | "compatibility_check" | "recommendation_query";
  payload: Record<string, any>;
  responsePayload?: Record<string, any>;
  status: "SUCCESS" | "FAILED" | "PENDING";
  latencyMs: number;
  createdAt: Date;
}

const A2AMessageSchema = new Schema<IA2AMessage>(
  {
    messageId: { type: String, required: true, unique: true, index: true },
    requestId: { type: String, required: true, index: true },
    sender: {
      type: String,
      enum: ["buyer-agent", "merchant-agent", "system"],
      required: true,
    },
    receiver: {
      type: String,
      enum: ["buyer-agent", "merchant-agent", "customer"],
      required: true,
    },
    timestamp: { type: Date, default: Date.now, index: true },
    messageType: {
      type: String,
      required: true,
      index: true,
    },
    payload: { type: Schema.Types.Mixed, required: true },
    responsePayload: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "PENDING"],
      default: "SUCCESS",
      index: true,
    },
    latencyMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const A2AMessage = mongoose.model<IA2AMessage>("A2AMessage", A2AMessageSchema);
