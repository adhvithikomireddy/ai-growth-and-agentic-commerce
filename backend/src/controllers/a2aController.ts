import { Request, Response } from "express";
import { processCustomerQuery } from "../agents/buyerAgent.js";
import { handleMerchantA2ARequest } from "../agents/merchantAgent.js";
import { subscribeToA2AEvents, A2APacket } from "../a2a/a2aProtocol.js";
import { A2AMessage } from "../models/A2AMessage.js";

export const chatWithBuyerAgent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, language = "en", context } = req.body;

    if (!query || typeof query !== "string") {
      res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_QUERY", message: "A text query is required." },
      });
      return;
    }

    const response = await processCustomerQuery(query, language, context);

    res.json({
      success: true,
      data: response,
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "AGENT_EXECUTION_FAILED", message: error.message },
    });
  }
};

export const negotiatePrice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId, requestedDiscountPercent } = req.body;

    if (!productId) {
      res.status(400).json({
        success: false,
        data: null,
        error: { code: "MISSING_PRODUCT_ID", message: "Product ID is required for negotiation." },
      });
      return;
    }

    const packet: A2APacket = {
      messageId: `msg_neg_${Date.now()}`,
      requestId: `req_neg_${Date.now()}`,
      sender: "buyer-agent",
      receiver: "merchant-agent",
      timestamp: new Date().toISOString(),
      messageType: "negotiate_offer",
      payload: {
        productId,
        requestedDiscountPercent: requestedDiscountPercent || 10,
      },
      status: "PENDING",
    };

    const responsePacket = await handleMerchantA2ARequest(packet);

    res.json({
      success: true,
      data: responsePacket.responsePayload,
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "NEGOTIATION_FAILED", message: error.message },
    });
  }
};

export const streamA2AEvents = (req: Request, res: Response): void => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: "CONNECTED", message: "A2A Event Stream Active" })}\n\n`);

  const unsubscribe = subscribeToA2AEvents((event) => {
    res.write(`data: ${JSON.stringify(event)}\n\n`);
  });

  req.on("close", () => {
    unsubscribe();
  });
};

export const getA2AMessages = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const messages = await A2AMessage.find().sort({ timestamp: -1 }).limit(limit);

    res.json({
      success: true,
      data: { messages },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "FETCH_A2A_FAILED", message: error.message },
    });
  }
};
