import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Zap,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  Percent,
} from "lucide-react";
import { RevenueOpportunity, Campaign, AuditLog } from "../../types/index.js";
import { api } from "../../api/client.js";
import { Card } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { Button } from "../../components/ui/Button.js";
import { Skeleton } from "../../components/ui/Skeleton.js";

export const MerchantPortalView: React.FC<{ onBackToCustomer: () => void }> = ({
  onBackToCustomer,
}) => {
  const [activeTab, setActiveTab] = useState<"overview" | "opportunities" | "campaigns" | "audit">("overview");
  const [analytics, setAnalytics] = useState<any>(null);
  const [opportunities, setOpportunities] = useState<RevenueOpportunity[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const refreshMerchantData = async () => {
    try {
      setLoading(true);
      const [analyticsData, oppsData, campsData, logsData] = await Promise.all([
        api.getMerchantAnalytics(),
        api.getMerchantOpportunities(),
        api.getMerchantCampaigns(),
        api.getMerchantAuditLogs(),
      ]);
      setAnalytics(analyticsData);
      setOpportunities(oppsData.opportunities || []);
      setCampaigns(campsData.campaigns || []);
      setAuditLogs(logsData.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshMerchantData();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const res = await api.approveOpportunity(id);
      setActionSuccess(res.message || "Opportunity approved and campaign activated!");
      await refreshMerchantData();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err: any) {
      alert(err.message || "Approval failed.");
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await api.dismissOpportunity(id);
      await refreshMerchantData();
    } catch (err: any) {
      alert(err.message || "Dismissal failed.");
    }
  };

  if (loading && !analytics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      </div>
    );
  }

  const metrics = analytics?.metrics || {
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    aiAssistedRevenue: 0,
    aiAssistedSharePercent: 0,
    conversionRate: 3.4,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#172018]">Apex Nova Store Intelligence</h1>
            <Badge variant="success">Merchant-Private</Badge>
          </div>
          <p className="text-xs text-[#667067] mt-1">
            GSTIN: 29AABCU9603R1ZM • AI Agentic Revenue Engine Active • Razorpay Verified
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={onBackToCustomer}>
            Return to Customer View
          </Button>
          <Button variant="primary" size="sm" onClick={refreshMerchantData}>
            Refresh Intelligence
          </Button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 rounded-xl bg-[#DCFCE7] border border-[#BBF7D0] text-xs font-semibold text-[#166534] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667067] uppercase tracking-wider">Gross Revenue</span>
            <div className="p-2 rounded-lg bg-[#DCFCE7] text-[#166534]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#172018]">
              ₹{metrics.totalRevenue.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-emerald-600 block mt-0.5">Authoritative Paid Total</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667067] uppercase tracking-wider">Total Orders</span>
            <div className="p-2 rounded-lg bg-neutral-100 text-[#475548]">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#172018]">{metrics.totalOrders}</span>
            <span className="text-[11px] text-[#667067] block mt-0.5">AOV: ₹{metrics.averageOrderValue.toLocaleString("en-IN")}</span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667067] uppercase tracking-wider">AI-Assisted Revenue</span>
            <div className="p-2 rounded-lg bg-[#DCFCE7] text-[#166534]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#166534]">
              ₹{metrics.aiAssistedRevenue.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold block mt-0.5">
              {metrics.aiAssistedSharePercent}% of total revenue
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#667067] uppercase tracking-wider">Conversion Velocity</span>
            <div className="p-2 rounded-lg bg-neutral-100 text-[#475548]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-[#172018]">{metrics.conversionRate}%</span>
            <span className="text-[11px] text-[#667067] block mt-0.5">Catalog view-to-order rate</span>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "overview" ? "bg-[#166534] text-white" : "text-[#475548] hover:bg-neutral-100"
          }`}
        >
          AI Revenue Opportunities ({opportunities.filter((o) => o.status === "PENDING").length})
        </button>
        <button
          onClick={() => setActiveTab("campaigns")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "campaigns" ? "bg-[#166534] text-white" : "text-[#475548] hover:bg-neutral-100"
          }`}
        >
          Active Campaigns ({campaigns.length})
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === "audit" ? "bg-[#166534] text-white" : "text-[#475548] hover:bg-neutral-100"
          }`}
        >
          Immutable A2A Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: AI Revenue Opportunities */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#172018] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#166534]" />
              Merchant AI Orchestrator Recommendations
            </h3>
            <span className="text-xs text-[#667067]">
              Continuous background pattern analysis of customer cart abandonments and co-purchases.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {opportunities.map((opp) => (
              <Card
                key={opp.opportunityId}
                className={`p-5 flex flex-col justify-between border ${
                  opp.status === "APPROVED" ? "border-[#BBF7D0] bg-[#F0FDF4]/30" : "border-[#E2E8F0]"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={opp.status === "APPROVED" ? "success" : "warning"}>
                      {opp.type.replace("_", " ").toUpperCase()}
                    </Badge>
                    <span className="text-xs font-semibold text-[#166534]">
                      Est. Impact: +₹{opp.estimatedRevenueImpact?.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#172018]">{opp.title}</h4>

                  <div className="p-3 rounded-xl bg-neutral-50 border border-[#E2E8F0] text-xs space-y-1.5">
                    <span className="font-semibold text-[#475548] block">Behavioral Observation:</span>
                    <p className="text-[#667067] leading-relaxed">{opp.observation}</p>
                  </div>

                  <p className="text-xs text-[#172018] leading-relaxed">
                    <strong className="text-[#166534]">Suggested Action:</strong> {opp.suggestedAction}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
                  <span className="text-[11px] text-[#94A3B8]">Confidence: {(opp.confidenceScore * 100).toFixed(0)}%</span>
                  {opp.status === "PENDING" ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleDismiss(opp.opportunityId)}>
                        Dismiss
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => handleApprove(opp.opportunityId)}>
                        Approve Campaign
                      </Button>
                    </div>
                  ) : (
                    <Badge variant="success" size="sm">
                      ✓ Active Live Campaign
                    </Badge>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Active Campaigns */}
      {activeTab === "campaigns" && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#172018]">Live Merchant Campaigns</h3>
          <Card className="overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-neutral-50 border-b border-[#E2E8F0] text-[#667067]">
                <tr>
                  <th className="p-3">Campaign Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Promotional Discount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Generated Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {campaigns.map((camp) => (
                  <tr key={camp.campaignId} className="hover:bg-neutral-50">
                    <td className="p-3 font-semibold text-[#172018]">{camp.name}</td>
                    <td className="p-3 uppercase text-[11px] text-[#667067]">{camp.type}</td>
                    <td className="p-3 text-[#166534] font-semibold">{camp.discountPercent}% OFF</td>
                    <td className="p-3">
                      <Badge variant="success">Active</Badge>
                    </td>
                    <td className="p-3 font-bold text-[#172018]">
                      ₹{camp.metrics?.revenueGenerated?.toLocaleString("en-IN") || "0"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {/* TAB 3: Immutable A2A Audit Trail */}
      {activeTab === "audit" && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-[#172018] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#166534]" />
            Authoritative A2A Transaction Audit Logs
          </h3>
          <Card className="overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-neutral-50 border-b border-[#E2E8F0] text-[#667067]">
                <tr>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Agent / Actor</th>
                  <th className="p-3">Action</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Policy / Auth Result</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] font-mono text-[11px]">
                {auditLogs.map((log) => (
                  <tr key={log.logId} className="hover:bg-neutral-50">
                    <td className="p-3 text-[#667067]">{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td className="p-3 font-sans font-semibold text-[#172018]">{log.actor || log.agent}</td>
                    <td className="p-3 text-[#475548]">{log.action}</td>
                    <td className="p-3 font-semibold text-[#166534]">
                      {log.amount ? `₹${log.amount.toLocaleString("en-IN")}` : "-"}
                    </td>
                    <td className="p-3">
                      <span className="text-emerald-700">{log.policyResult}</span> / {log.authorizationResult}
                    </td>
                    <td className="p-3">
                      <Badge variant="success">{log.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </div>
  );
};
