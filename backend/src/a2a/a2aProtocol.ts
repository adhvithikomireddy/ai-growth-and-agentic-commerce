import { A2AMessage, IA2AMessage } from "../models/A2AMessage.js";
import { logger } from "../utils/logger.js";

export interface A2APacket {
  messageId: string;
  requestId: string;
  sender: "buyer-agent" | "merchant-agent" | "system";
  receiver: "buyer-agent" | "merchant-agent" | "customer";
  timestamp: string;
  messageType: "product_search" | "price_verification" | "negotiate_offer" | "order_intent" | "compatibility_check" | "recommendation_query";
  payload: Record<string, any>;
  responsePayload?: Record<string, any>;
  status: "SUCCESS" | "FAILED" | "PENDING";
  latencyMs?: number;
}

export interface A2AActivityEvent {
  id: string;
  timestamp: string;
  requestId: string;
  agent: "Buyer Agent" | "Merchant Agent" | "Policy Engine" | "AI Firewall";
  action: string;
  description: string;
  status: "completed" | "in_progress" | "verified" | "flagged";
  details?: Record<string, any>;
}

// In-memory event subscribers for SSE
type SSEListener = (event: A2AActivityEvent) => void;
const sseListeners: Set<SSEListener> = new Set();

export const subscribeToA2AEvents = (listener: SSEListener) => {
  sseListeners.add(listener);
  return () => sseListeners.delete(listener);
};

export const broadcastA2AEvent = (event: A2AActivityEvent) => {
  for (const listener of sseListeners) {
    try {
      listener(event);
    } catch (err) {
      logger.error("Error dispatching SSE event:", err);
    }
  }
};

export const recordA2AInteraction = async (packet: A2APacket): Promise<IA2AMessage> => {
  const doc = new A2AMessage({
    messageId: packet.messageId,
    requestId: packet.requestId,
    sender: packet.sender,
    receiver: packet.receiver,
    timestamp: new Date(packet.timestamp),
    messageType: packet.messageType,
    payload: packet.payload,
    responsePayload: packet.responsePayload,
    status: packet.status,
    latencyMs: packet.latencyMs || 0,
  });

  await doc.save();
  return doc;
};
