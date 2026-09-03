import { Response } from "express";
import {
  getMerchantAnalytics,
  getRevenueOpportunities,
  approveOpportunity,
  dismissOpportunity,
  getCampaigns,
  refreshMerchantIntelligence,
} from "../services/merchantOrchestrator.js";
import { AuditLog } from "../models/AuditLog.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const handleRefreshIntelligence = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const merchantId = req.user?.merchantId || "merch_apex_001";
    const result = await refreshMerchantIntelligence(merchantId);

    res.json({
      success: true,
      data: {
        message: "Store Intelligence Engine successfully refreshed and new campaign suggestions generated!",
        ...result,
      },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "REFRESH_INTELLIGENCE_FAILED", message: error.message },
    });
  }
};

export const getAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const merchantId = req.user?.merchantId || "merch_apex_001";
    const analytics = await getMerchantAnalytics(merchantId);

    res.json({
      success: true,
      data: analytics,
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "ANALYTICS_FAILED", message: error.message },
    });
  }
};

export const getOpportunities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const merchantId = req.user?.merchantId || "merch_apex_001";
    const opportunities = await getRevenueOpportunities(merchantId);

    res.json({
      success: true,
      data: { opportunities },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "OPPORTUNITIES_FAILED", message: error.message },
    });
  }
};

export const handleApproveOpportunity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const merchantId = req.user?.merchantId || "merch_apex_001";
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const result = await approveOpportunity(id, merchantId);

    res.json({
      success: true,
      data: {
        message: "Opportunity approved and live campaign successfully activated!",
        ...result,
      },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "APPROVE_FAILED", message: error.message },
    });
  }
};

export const handleDismissOpportunity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const merchantId = req.user?.merchantId || "merch_apex_001";
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const opportunity = await dismissOpportunity(id, merchantId);

    res.json({
      success: true,
      data: { message: "Opportunity dismissed.", opportunity },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "DISMISS_FAILED", message: error.message },
    });
  }
};

export const getMerchantCampaigns = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const merchantId = req.user?.merchantId || "merch_apex_001";
    const campaigns = await getCampaigns(merchantId);

    res.json({
      success: true,
      data: { campaigns },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "CAMPAIGNS_FAILED", message: error.message },
    });
  }
};

export const getAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 50;
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(limit);

    res.json({
      success: true,
      data: { logs },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "AUDIT_LOG_FAILED", message: error.message },
    });
  }
};
