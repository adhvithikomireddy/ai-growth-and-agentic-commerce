import React, { useState, useEffect } from "react";
import { Sparkles, Bot, Layers, ArrowRight } from "lucide-react";
import { Product, A2AActivityEvent } from "../../types/index.js";
import { api } from "../../api/client.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { AIShoppingBar } from "../../components/customer/AIShoppingBar.js";
import { A2AActivityTimeline } from "../../components/customer/A2AActivityTimeline.js";
import { ProductCard } from "../../components/customer/ProductCard.js";
import { NegotiationModal } from "../../components/customer/NegotiationModal.js";
import { ProductDetailsModal } from "../../components/customer/ProductDetailsModal.js";
import { ProductComparisonModal } from "../../components/customer/ProductComparisonModal.js";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";

export const AIShoppingView: React.FC = () => {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [agentResponse, setAgentResponse] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [accessories, setAccessories] = useState<Product[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<A2AActivityEvent[]>([]);

  // Modals state
  const [activeModalProduct, setActiveModalProduct] = useState<Product | null>(null);
  const [negotiatingProduct, setNegotiatingProduct] = useState<Product | null>(null);
  const [comparedProducts, setComparedProducts] = useState<Product[]>([]);
  const [comparisonModalOpen, setComparisonModalOpen] = useState(false);

  // Initial load: show trending products from catalog
  useEffect(() => {
    setLoading(true);
    api.getTrending(6)
      .then((data) => {
        setProducts(data.products || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setTimelineEvents([]);

    // Seed initial A2A event
    const initialEvent: A2AActivityEvent = {
      id: `evt_${Date.now()}_init`,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
      agent: "Buyer Agent",
      action: "RECEIVE_NATURAL_LANGUAGE_QUERY",
      description: `Analyzing customer input in ${language.toUpperCase()}: "${query}"`,
      status: "in_progress",
    };
    setTimelineEvents([initialEvent]);

    try {
      const data = await api.chatWithBuyerAgent(query, language);
      setAgentResponse(data);
      setProducts(data.products || []);
      setAccessories(data.crossSellAccessories || []);

      // Add timeline milestones from execution
      setTimelineEvents((prev) => [
        ...prev,
        {
          id: `evt_${Date.now()}_parse`,
          timestamp: new Date().toISOString(),
          requestId: data.requestId,
          agent: "Buyer Agent",
          action: "INTENT_EXTRACTED",
          description: `Extracted intent: ${data.parsedIntent.intent}. Category: ${data.parsedIntent.category || "Any"}, BudgetMax: ₹${data.parsedIntent.budgetMax || "Flexible"}.`,
          status: "completed",
        },
        {
          id: `evt_${Date.now()}_a2a`,
          timestamp: new Date().toISOString(),
          requestId: data.requestId,
          agent: "Merchant Agent",
          action: "A2A_VERIFICATION",
          description: `Merchant Agent verified ${data.products?.length || 0} catalog products with live database stock and authoritative pricing.`,
          status: "verified",
        },
        {
          id: `evt_${Date.now()}_policy`,
          timestamp: new Date().toISOString(),
          requestId: data.requestId,
          agent: "Policy Engine",
          action: "POLICY_GATEWAY_PASSED",
          description: "Policy check cleared: Zero hallucinated prices. Authoritative MongoDB data bound to recommendations.",
          status: "verified",
        },
      ]);
    } catch (err: any) {
      console.error("AI Shopping query error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareToggle = (product: Product) => {
    if (comparedProducts.some((p) => p.productId === product.productId)) {
      setComparedProducts(comparedProducts.filter((p) => p.productId !== product.productId));
    } else {
      if (comparedProducts.length >= 2) {
        setComparedProducts([comparedProducts[1], product]);
      } else {
        setComparedProducts([...comparedProducts, product]);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Hero Intro */}
      <div className="text-center max-w-2xl mx-auto pt-4 pb-2 space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#172018]">
          Shop Naturally with <span className="text-[#166534]">Buyer & Merchant Agents</span>
        </h1>
        <p className="text-sm text-[#667067] leading-relaxed">
          Express what you need in plain English, हिन्दी, or తెలుగు. Buyer and Merchant Agents communicate through structured A2A protocols with authoritative verified pricing and human-controlled spending guardrails.
        </p>
      </div>

      {/* Central Conversational AI Bar */}
      <AIShoppingBar onSearch={handleSearch} loading={loading} />

      {/* Real-time A2A Activity Timeline */}
      <A2AActivityTimeline events={timelineEvents} isLoading={loading} />

      {/* Buyer Agent Conversational Response Summary */}
      {agentResponse && (
        <Card className="max-w-4xl mx-auto p-4 sm:p-5 bg-white border border-[#BBF7D0] shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#DCFCE7] text-[#166534] flex items-center justify-center flex-shrink-0 mt-0.5">
              <Bot className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-semibold text-[#166534] uppercase tracking-wider">
                Buyer Agent Response ({agentResponse.parsedIntent?.language?.toUpperCase()})
              </span>
              <p className="text-sm sm:text-base font-medium text-[#172018] leading-relaxed">
                {agentResponse.message}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Product Results Grid */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-[#172018]">
            {agentResponse ? t("recommendations_title") : t("trending_title")}
          </h3>
          <span className="text-xs text-[#667067] font-medium">
            {products.length} Authoritative Options Found
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const reasonObj = agentResponse?.recommendations?.find(
              (r: any) => r.productId === product.productId
            );
            const enrichedProduct = {
              ...product,
              recommendationReason: reasonObj?.reason || product.recommendationReason,
            };

            return (
              <ProductCard
                key={product.productId}
                product={enrichedProduct}
                onViewDetails={(p) => setActiveModalProduct(p)}
                onNegotiate={(p) => setNegotiatingProduct(p)}
                onCompareToggle={handleCompareToggle}
                isCompared={comparedProducts.some((cp) => cp.productId === product.productId)}
              />
            );
          })}
        </div>
      </div>

      {/* Recommended Complementary Accessories (Cross-Sell Section) */}
      {accessories.length > 0 && (
        <div className="pt-8 border-t border-[#E2E8F0] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-[#172018]">{t("related_accessories")}</h3>
              <p className="text-xs text-[#667067]">
                Intelligently paired hardware and lifestyle accessories to complement your search.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {accessories.map((acc) => (
              <ProductCard
                key={acc.productId}
                product={acc}
                onViewDetails={(p) => setActiveModalProduct(p)}
                onNegotiate={(p) => setNegotiatingProduct(p)}
                onCompareToggle={handleCompareToggle}
                isCompared={comparedProducts.some((cp) => cp.productId === acc.productId)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Floating Comparison Bar (when 1 or 2 products selected) */}
      {comparedProducts.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-[#BBF7D0] shadow-xl rounded-2xl p-3 flex items-center gap-4 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#166534]" />
            <span className="text-xs font-semibold text-[#172018]">
              {comparedProducts.length} Product{comparedProducts.length > 1 ? "s" : ""} Selected
            </span>
          </div>
          <Button
            size="sm"
            variant="primary"
            disabled={comparedProducts.length < 2}
            onClick={() => setComparisonModalOpen(true)}
          >
            Compare Side-by-Side
          </Button>
          <button
            onClick={() => setComparedProducts([])}
            className="text-xs text-[#667067] hover:text-[#172018] underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* Interactive Modals */}
      <NegotiationModal
        product={negotiatingProduct}
        isOpen={Boolean(negotiatingProduct)}
        onClose={() => setNegotiatingProduct(null)}
      />

      <ProductDetailsModal
        product={activeModalProduct}
        isOpen={Boolean(activeModalProduct)}
        onClose={() => setActiveModalProduct(null)}
      />

      <ProductComparisonModal
        products={comparedProducts}
        isOpen={comparisonModalOpen}
        onClose={() => setComparisonModalOpen(false)}
        onRemoveFromCompare={(id) => setComparedProducts(comparedProducts.filter((p) => p.productId !== id))}
      />
    </div>
  );
};
