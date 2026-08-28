import crypto from "crypto";
import { parseIntentDeterministic, ParsedIntent } from "../services/intentParser.js";
import { generateAgentExplanation } from "../ai/aiService.js";
import { handleMerchantA2ARequest } from "./merchantAgent.js";
import { broadcastA2AEvent, recordA2AInteraction, A2APacket } from "../a2a/a2aProtocol.js";
import { getTrendingProducts, getRelatedProducts } from "../services/catalogService.js";
import { IProduct } from "../models/Product.js";

export interface BuyerAgentShoppingResponse {
  requestId: string;
  parsedIntent: ParsedIntent;
  message: string;
  products: IProduct[];
  recommendations: Array<{ productId: string; reason: string }>;
  crossSellAccessories: IProduct[];
  suggestedAction?: string;
  negotiationOffer?: any;
}

export const processCustomerQuery = async (
  query: string,
  preferredLanguage: "en" | "hi" | "te" = "en",
  context?: { currentProductId?: string }
): Promise<BuyerAgentShoppingResponse> => {
  const requestId = `req_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const startTime = Date.now();

  // 1. Intent Extraction
  const parsedIntent = parseIntentDeterministic(query);
  const activeLanguage = preferredLanguage || parsedIntent.language || "en";

  broadcastA2AEvent({
    id: `evt_${Date.now()}_parse`,
    timestamp: new Date().toISOString(),
    requestId,
    agent: "Buyer Agent",
    action: "UNDERSTAND_INTENT",
    description: `Understood natural language request in ${activeLanguage.toUpperCase()}. Category: ${parsedIntent.category || "Any"}, BudgetMax: ?${parsedIntent.budgetMax || "Flexible"}.`,
    status: "completed",
    details: { intent: parsedIntent.intent, category: parsedIntent.category, budgetMax: parsedIntent.budgetMax },
  });

  // Handle Trending Query
  if (parsedIntent.intent === "trending") {
    const trendingProducts = await getTrendingProducts(6);

    broadcastA2AEvent({
      id: `evt_${Date.now()}_trend`,
      timestamp: new Date().toISOString(),
      requestId,
      agent: "Buyer Agent",
      action: "FETCH_TRENDING",
      description: "Retrieved top trending products based on verified sales and view velocity.",
      status: "verified",
      details: { count: trendingProducts.length },
    });

    const aiExplanation = await generateAgentExplanation(
      query,
      trendingProducts,
      activeLanguage,
      { intent: "trending" }
    );

    return {
      requestId,
      parsedIntent,
      message: aiExplanation.summary,
      products: trendingProducts,
      recommendations: aiExplanation.recommendations,
      crossSellAccessories: [],
    };
  }

  // Handle Bounded Negotiation Query
  if (parsedIntent.intent === "negotiate" && context?.currentProductId) {
    const packet: A2APacket = {
      messageId: `msg_${Date.now()}_neg`,
      requestId,
      sender: "buyer-agent",
      receiver: "merchant-agent",
      timestamp: new Date().toISOString(),
      messageType: "negotiate_offer",
      payload: {
        productId: context.currentProductId,
        requestedDiscountPercent: 10,
      },
      status: "PENDING",
    };

    await recordA2AInteraction(packet);
    const responsePacket = await handleMerchantA2ARequest(packet);
    const negData = responsePacket.responsePayload;

    let message = "I checked with the merchant. Here is the best approved offer for you.";
    if (activeLanguage === "te") {
      message = negData?.allowed
        ? `???????? ?????? ??????????? ?${negData.savings.toLocaleString("en-IN")} ?????????? ??????????!`
        : "??????????, ? ????????? ????? ???????? ????????????.";
    } else if (activeLanguage === "hi") {
      message = negData?.allowed
        ? `??????? ????? ?? ????? ??? ?? ?${negData.savings.toLocaleString("en-IN")} ?? ??? ??????? ?? ??!`
        : "???? ??????, ?? ?????? ?? ???????? ??? ?????? ???? ???";
    }

    return {
      requestId,
      parsedIntent,
      message,
      products: [],
      recommendations: [],
      crossSellAccessories: [],
      negotiationOffer: negData,
    };
  }

  // Handle Product Search via Structured A2A Communication
  const searchPacket: A2APacket = {
    messageId: `msg_${Date.now()}_search`,
    requestId,
    sender: "buyer-agent",
    receiver: "merchant-agent",
    timestamp: new Date().toISOString(),
    messageType: "product_search",
    payload: {
      category: parsedIntent.category,
      maxPrice: parsedIntent.budgetMax,
      minPrice: parsedIntent.budgetMin,
      requirements: parsedIntent.requirements,
      limit: 6,
    },
    status: "PENDING",
  };

  broadcastA2AEvent({
    id: `evt_${Date.now()}_disp`,
    timestamp: new Date().toISOString(),
    requestId,
    agent: "Buyer Agent",
    action: "DISPATCH_A2A_SEARCH",
    description: "Sent structured product search message to Merchant Agent over A2A layer.",
    status: "in_progress",
    details: searchPacket.payload,
  });

  await recordA2AInteraction(searchPacket);
  const merchantResponse = await handleMerchantA2ARequest(searchPacket);
  const products: IProduct[] = merchantResponse.responsePayload?.products || [];

  // Generate Multilingual Explanations
  const aiExplanation = await generateAgentExplanation(
    query,
    products,
    activeLanguage,
    {
      budgetMax: parsedIntent.budgetMax,
      requirements: parsedIntent.requirements,
      intent: parsedIntent.intent,
    }
  );

  // Fetch relevant cross-sell accessories if a primary product was matched
  let crossSellAccessories: IProduct[] = [];
  if (products.length > 0) {
    crossSellAccessories = await getRelatedProducts(products[0].productId);
  }

  broadcastA2AEvent({
    id: `evt_${Date.now()}_done`,
    timestamp: new Date().toISOString(),
    requestId,
    agent: "Buyer Agent",
    action: "RECOMMENDATIONS_READY",
    description: `Prepared ${products.length} authoritative product recommendations with verified prices and stock.`,
    status: "completed",
    details: { productCount: products.length, accessoriesCount: crossSellAccessories.length },
  });

  return {
    requestId,
    parsedIntent,
    message: aiExplanation.summary,
    products,
    recommendations: aiExplanation.recommendations,
    crossSellAccessories,
    suggestedAction: aiExplanation.suggestedAction,
  };
};
