import crypto from "crypto";
import { Product, IProduct } from "../models/Product.js";
import { Merchant } from "../models/Merchant.js";
import { searchCatalog, getProductById, getRelatedProducts, getCompatibleProducts } from "../services/catalogService.js";
import { broadcastA2AEvent, recordA2AInteraction, A2APacket } from "../a2a/a2aProtocol.js";

export interface NegotiationResult {
  allowed: boolean;
  originalPrice: number;
  discountPercent: number;
  offeredPrice: number;
  savings: number;
  offerToken?: string;
  reason: string;
}

export const handleMerchantA2ARequest = async (packet: A2APacket): Promise<A2APacket> => {
  const startTime = Date.now();
  const requestId = packet.requestId;

  broadcastA2AEvent({
    id: `evt_${Date.now()}_1`,
    timestamp: new Date().toISOString(),
    requestId,
    agent: "Merchant Agent",
    action: "RECEIVE_QUERY",
    description: `Received ${packet.messageType} request from Buyer Agent.`,
    status: "in_progress",
    details: { messageType: packet.messageType },
  });

  let responsePayload: Record<string, any> = {};

  try {
    switch (packet.messageType) {
      case "product_search": {
        const { category, minPrice, maxPrice, requirements, limit } = packet.payload;
        const result = await searchCatalog({
          category,
          minPrice,
          maxPrice,
          inStockOnly: true,
          limit: limit || 6,
          sortBy: "rating",
        });

        broadcastA2AEvent({
          id: `evt_${Date.now()}_2`,
          timestamp: new Date().toISOString(),
          requestId,
          agent: "Merchant Agent",
          action: "VERIFY_STOCK_AND_PRICE",
          description: `Verified authoritative stock and live prices for ${result.products.length} products.`,
          status: "verified",
          details: { productCount: result.products.length },
        });

        responsePayload = {
          products: result.products,
          merchantId: "merch_apex_001",
          verified: true,
        };
        break;
      }

      case "price_verification": {
        const { productId } = packet.payload;
        const product = await getProductById(productId);

        if (!product) {
          responsePayload = { verified: false, error: "PRODUCT_NOT_FOUND" };
        } else {
          broadcastA2AEvent({
            id: `evt_${Date.now()}_pv`,
            timestamp: new Date().toISOString(),
            requestId,
            agent: "Merchant Agent",
            action: "PRICE_AND_STOCK_CONFIRMED",
            description: `Live price ?${product.price.toLocaleString("en-IN")} and stock (${product.stock} units) confirmed from database.`,
            status: "verified",
            details: { productId, price: product.price, stock: product.stock },
          });

          responsePayload = {
            verified: true,
            productId: product.productId,
            name: product.name,
            authoritativePrice: product.price,
            stock: product.stock,
            inStock: product.stock > 0,
          };
        }
        break;
      }

      case "negotiate_offer": {
        const { productId, requestedDiscountPercent } = packet.payload;
        const product = await getProductById(productId);
        const merchant = await Merchant.findOne({ merchantId: "merch_apex_001" });

        if (!product) {
          responsePayload = { allowed: false, reason: "Product not found." };
          break;
        }

        const policy = merchant?.negotiationPolicy || {
          allowNegotiation: true,
          maxDiscountPercent: 10,
          minMarginThreshold: 500,
        };

        if (!policy.allowNegotiation) {
          responsePayload = {
            allowed: false,
            originalPrice: product.price,
            offeredPrice: product.price,
            savings: 0,
            reason: "Merchant policy does not permit automated price negotiations for this item.",
          };
          break;
        }

        // Bounded negotiation: Clamp discount to merchant maximum
        const requested = requestedDiscountPercent ? Number(requestedDiscountPercent) : 8;
        const grantedDiscountPercent = Math.min(requested, policy.maxDiscountPercent);
        const savings = Math.round((product.price * grantedDiscountPercent) / 100);
        const offeredPrice = product.price - savings;

        // Security token signed for bounded time
        const offerToken = crypto
          .createHmac("sha256", "offer_secret_salt")
          .update(`${product.productId}:${offeredPrice}:${Date.now() + 15 * 60 * 1000}`)
          .digest("hex");

        broadcastA2AEvent({
          id: `evt_${Date.now()}_neg`,
          timestamp: new Date().toISOString(),
          requestId,
          agent: "Merchant Agent",
          action: "BOUNDED_OFFER_EVALUATED",
          description: `Applied merchant policy: Granted ${grantedDiscountPercent}% discount. Price reduced from ?${product.price} to ?${offeredPrice}.`,
          status: "verified",
          details: { originalPrice: product.price, offeredPrice, savings, grantedDiscountPercent },
        });

        responsePayload = {
          allowed: true,
          productId: product.productId,
          originalPrice: product.price,
          discountPercent: grantedDiscountPercent,
          offeredPrice,
          savings,
          offerToken,
          expiresInMinutes: 15,
          reason: `Merchant approved an exclusive ${grantedDiscountPercent}% agentic discount.`,
        };
        break;
      }

      case "compatibility_check": {
        const { productId } = packet.payload;
        const [related, compatible] = await Promise.all([
          getRelatedProducts(productId),
          getCompatibleProducts(productId),
        ]);

        responsePayload = {
          productId,
          relatedProducts: related,
          compatibleProducts: compatible,
        };
        break;
      }

      default:
        responsePayload = { error: `Unsupported messageType: ${packet.messageType}` };
    }

    const responsePacket: A2APacket = {
      messageId: `msg_resp_${Date.now()}`,
      requestId,
      sender: "merchant-agent",
      receiver: "buyer-agent",
      timestamp: new Date().toISOString(),
      messageType: packet.messageType,
      payload: packet.payload,
      responsePayload,
      status: "SUCCESS",
      latencyMs: Date.now() - startTime,
    };

    await recordA2AInteraction(responsePacket);
    return responsePacket;
  } catch (error: any) {
    const errorPacket: A2APacket = {
      messageId: `msg_err_${Date.now()}`,
      requestId,
      sender: "merchant-agent",
      receiver: "buyer-agent",
      timestamp: new Date().toISOString(),
      messageType: packet.messageType,
      payload: packet.payload,
      responsePayload: { error: error.message },
      status: "FAILED",
      latencyMs: Date.now() - startTime,
    };

    await recordA2AInteraction(errorPacket);
    return errorPacket;
  }
};
