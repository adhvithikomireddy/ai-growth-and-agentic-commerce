import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { RevenueOpportunity, IRevenueOpportunity } from "../models/RevenueOpportunity.js";
import { Campaign } from "../models/Campaign.js";
import { AuditLog } from "../models/AuditLog.js";
import { broadcastA2AEvent } from "../a2a/a2aProtocol.js";
import { generateDynamicCampaignSuggestions } from "./campaignSuggestionService.js";

export const getMerchantAnalytics = async (merchantId: string = "merch_apex_001") => {
  const [orders, products, activeCampaigns] = await Promise.all([
    Order.find({ merchantId }),
    Product.find({ merchantId }),
    Campaign.find({ merchantId, isActive: true }),
  ]);

  const paidOrders = orders.filter(o => o.paymentStatus === "PAID");
  const totalRevenue = paidOrders.reduce((sum, o) => sum + o.finalAmount, 0);
  const totalOrders = paidOrders.length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const aiAssistedOrders = paidOrders.filter(o => o.aiAssisted);
  const aiAssistedRevenue = aiAssistedOrders.reduce((sum, o) => sum + o.finalAmount, 0);
  const aiAssistedSharePercent = totalRevenue > 0 ? Math.round((aiAssistedRevenue / totalRevenue) * 100) : 0;

  const topProducts = products
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 5)
    .map(p => ({
      productId: p.productId,
      name: p.name,
      category: p.category,
      price: p.price,
      salesCount: p.salesCount,
      stock: p.stock,
      revenueGenerated: p.salesCount * p.price,
    }));

  const totalViews = products.reduce((sum, p) => sum + (p.viewCount || 0), 0);
  const totalSales = products.reduce((sum, p) => sum + (p.salesCount || 0), 0);
  const conversionRate = totalViews > 0 ? Number(((totalSales / totalViews) * 100).toFixed(2)) : 3.4;

  return {
    metrics: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      aiAssistedRevenue,
      aiAssistedSharePercent,
      conversionRate,
      activeProductsCount: products.length,
      activeCampaignsCount: activeCampaigns.length,
    },
    topProducts,
    recentOrders: paidOrders.slice(-5).reverse(),
  };
};

export const getRevenueOpportunities = async (merchantId: string = "merch_apex_001"): Promise<any[]> => {
  let opportunities: any[] = await RevenueOpportunity.find({ merchantId }).sort({ createdAt: -1 });
  if (opportunities.length === 0) {
    opportunities = await generateDynamicCampaignSuggestions(merchantId);
  }
  return opportunities;
};

export const refreshMerchantIntelligence = async (merchantId: string = "merch_apex_001") => {
  const [newOpportunities, analytics, campaigns, auditLogs] = await Promise.all([
    generateDynamicCampaignSuggestions(merchantId),
    getMerchantAnalytics(merchantId),
    getCampaigns(merchantId),
    AuditLog.find().sort({ timestamp: -1 }).limit(50),
  ]);
  return {
    analytics,
    opportunities: newOpportunities,
    campaigns,
    auditLogs,
  };
};

export const approveOpportunity = async (opportunityId: string, merchantId: string = "merch_apex_001") => {
  const opp = await RevenueOpportunity.findOne({ opportunityId, merchantId });
  if (!opp) throw new Error("Opportunity not found");

  opp.status = "APPROVED";
  opp.reviewedAt = new Date();
  await opp.save();

  // Create and activate real Campaign
  const campaignId = `camp_${Date.now()}`;
  const campaign = new Campaign({
    campaignId,
    merchantId,
    opportunityId: opp.opportunityId,
    name: opp.title,
    type: opp.type === "bundle" ? "bundle_discount" : "cross_sell_promo",
    discountPercent: opp.suggestedDiscount || 5,
    affectedProductIds: [opp.primaryProductId, ...(opp.relatedProductIds || [])],
    bundleProductIds: opp.type === "bundle" ? [opp.primaryProductId, ...(opp.relatedProductIds || [])] : [],
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    isActive: true,
    metrics: {
      impressions: 0,
      clicks: 0,
      conversions: 0,
      revenueGenerated: 0,
    },
  });

  await campaign.save();

  // If cross-sell, link products in catalog
  if (opp.relatedProductIds && opp.relatedProductIds.length > 0) {
    await Product.updateOne(
      { productId: opp.primaryProductId },
      { $addToSet: { frequentlyBoughtTogetherIds: { $each: opp.relatedProductIds } } }
    );
  }

  // Audit Log
  const audit = new AuditLog({
    logId: `aud_${Date.now()}`,
    actor: "Merchant Store Manager",
    agent: "Merchant AI Orchestrator",
    action: "OPPORTUNITY_APPROVED_AND_CAMPAIGN_ACTIVATED",
    requestId: `req_${Date.now()}`,
    policyResult: "APPROVED",
    authorizationResult: "MERCHANT_CONFIRMED",
    status: "SUCCESS",
    reason: `Merchant approved opportunity "${opp.title}". Campaign ${campaignId} activated with ${opp.suggestedDiscount}% discount.`,
    metadata: { opportunityId, campaignId },
  });
  await audit.save();

  broadcastA2AEvent({
    id: `evt_${Date.now()}_camp`,
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}`,
    agent: "Merchant Agent",
    action: "CAMPAIGN_ACTIVATED",
    description: `Campaign "${opp.title}" activated with ${opp.suggestedDiscount}% promotional discount.`,
    status: "completed",
    details: { campaignId, discountPercent: opp.suggestedDiscount },
  });

  return { opportunity: opp, campaign };
};

export const dismissOpportunity = async (opportunityId: string, merchantId: string = "merch_apex_001") => {
  const opp = await RevenueOpportunity.findOne({ opportunityId, merchantId });
  if (!opp) throw new Error("Opportunity not found");

  opp.status = "DISMISSED";
  opp.reviewedAt = new Date();
  await opp.save();

  return opp;
};

export const getCampaigns = async (merchantId: string = "merch_apex_001") => {
  return await Campaign.find({ merchantId }).sort({ createdAt: -1 });
};
