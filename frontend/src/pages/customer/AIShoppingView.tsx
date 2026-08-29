import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Layers,
  ArrowRight,
  ShieldCheck,
  Lock,
  AlertTriangle,
  X,
  Laptop,
  Smartphone,
  Headphones,
  Watch,
  Gamepad2,
  Palette,
  Camera,
  Utensils,
  Zap,
} from "lucide-react";
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
import { AIUpsellShowcase } from "../../components/customer/AIUpsellShowcase.js";

export const AIShoppingView: React.FC = () => {
  const { language, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [agentResponse, setAgentResponse] = useState<any>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [accessories, setAccessories] = useState<Product[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<A2AActivityEvent[]>([]);

  // Track 01 Bar Failure Simulation state
  const [simulationResult, setSimulationResult] = useState<{
    type: "BOUND_EXCEEDED" | "GATE_PIN_REQUIRED";
    title: string;
    description: string;
  } | null>(null);

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

      const completedEvent: A2AActivityEvent = {
        id: `evt_${Date.now()}_end`,
        timestamp: new Date().toISOString(),
        requestId: data.requestId,
        agent: "Buyer Agent",
        action: "RECOMMENDATION_DELIVERED",
        description: `Delivered ${data.products?.length || 0} authoritative recommendations with verified pricing and verified policy checks.`,
        status: "completed",
      };
      setTimelineEvents((prev) => [...prev, completedEvent]);
    } catch {
      // Fallback
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
      {/* Hero Intro with Vibrant Enterprise Gradients & Quick Category Pills */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-white via-emerald-50/40 to-white border border-emerald-200/80 shadow-md text-center max-w-4xl mx-auto space-y-4 overflow-hidden">
        {/* Glow ambient background accents */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-400/20 blur-3xl pointer-events-none" />

        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-300/80 text-emerald-800 text-xs font-semibold shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 radar-dot"></span>
          <span>A2A Protocol Live • 1,000 Verified Products In-Stock</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#172018] leading-tight">
          Shop Naturally with{" "}
          <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-indigo-600 bg-clip-text text-transparent">
            Buyer & Merchant AI Agents
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#667067] max-w-2xl mx-auto leading-relaxed">
          Express what you need in plain English, हिन्दी, or తెలుగు. Agents autonomously negotiate bounded discounts, cross-sell complementary accessories, and gate transactions behind biometric face verification.
        </p>

        {/* Colorful Category Quick-Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {[
            { label: "Laptops", query: "Show me laptops for coding and multitasking", icon: <Laptop className="w-3.5 h-3.5" />, color: "hover:bg-cyan-50 hover:border-cyan-400 text-cyan-800 border-cyan-200 bg-white" },
            { label: "Phones", query: "Flagship 5G camera smartphones", icon: <Smartphone className="w-3.5 h-3.5" />, color: "hover:bg-purple-50 hover:border-purple-400 text-purple-800 border-purple-200 bg-white" },
            { label: "Audio", query: "Active noise canceling headphones and speakers", icon: <Headphones className="w-3.5 h-3.5" />, color: "hover:bg-orange-50 hover:border-orange-400 text-orange-800 border-orange-200 bg-white" },
            { label: "Wearables", query: "Smartwatch with fitness and heart rate tracking", icon: <Watch className="w-3.5 h-3.5" />, color: "hover:bg-amber-50 hover:border-amber-400 text-amber-800 border-amber-200 bg-white" },
            { label: "Kitchen", query: "Digital air fryers and kitchen appliances", icon: <Utensils className="w-3.5 h-3.5" />, color: "hover:bg-emerald-50 hover:border-emerald-400 text-emerald-800 border-emerald-200 bg-white" },
            { label: "Gaming", query: "Next gen gaming consoles and controllers", icon: <Gamepad2 className="w-3.5 h-3.5" />, color: "hover:bg-rose-50 hover:border-rose-400 text-rose-800 border-rose-200 bg-white" },
            { label: "Creative Arts", query: "Digital drawing tablets and art supplies", icon: <Palette className="w-3.5 h-3.5" />, color: "hover:bg-pink-50 hover:border-pink-400 text-pink-800 border-pink-200 bg-white" },
            { label: "Cameras", query: "4K vlog cameras and photography drones", icon: <Camera className="w-3.5 h-3.5" />, color: "hover:bg-sky-50 hover:border-sky-400 text-sky-800 border-sky-200 bg-white" },
          ].map((cat, i) => (
            <button
              key={i}
              onClick={() => handleSearch(cat.query)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-2xs hover:scale-105 active:scale-95 ${cat.color}`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Track 01 Architecture Bar: The Bar */}
      <div className="max-w-4xl mx-auto p-4 rounded-2xl bg-white border border-[#BBF7D0] shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-[#E2E8F0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-md">
                Agentic Guardrails
              </span>
              <span className="text-xs font-semibold text-[#172018]">Autonomous Safety Standards</span>
            </div>
            <p className="text-[11px] text-[#667067] mt-0.5">
              Every money action explainable, bounded and gated. With audit trail and graceful failure handling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSimulationResult({
                  type: "BOUND_EXCEEDED",
                  title: "Failure Handled Gracefully: Negotiation Out-of-Bounds (50% Request)",
                  description: "Buyer Agent requested an aggressive 50% discount. The Merchant Agent's policy engine bounded the transaction because store gross margin is 24%. It gracefully intercepted the breach and counter-offered the maximum allowable 10% discount rather than crashing or terminating the negotiation."
                });
              }}
              className="text-[11px] font-semibold text-[#166534] bg-[#F0FDF4] border border-[#86EFAC] px-2.5 py-1.5 rounded-lg hover:bg-[#DCFCE7] transition-colors"
            >
              Simulate Bound Failure
            </button>
            <button
              onClick={() => {
                setSimulationResult({
                  type: "GATE_PIN_REQUIRED",
                  title: "Failure Handled Gracefully: Autonomous Spending Gate Breach",
                  description: "Transaction value exceeds customer's autonomous spending threshold (₹2,000). The AI Firewall / Action Gateway intercepted the operation, halting unauthorized money movement until the customer enters their verified 4-digit security PIN."
                });
              }}
              className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg hover:bg-amber-100 transition-colors"
            >
              Simulate Spending Gate
            </button>
          </div>
        </div>

        {/* 4 Pillars Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-[11px]">
          <div className="p-2 rounded-lg bg-neutral-50 border border-[#E2E8F0]">
            <span className="font-bold text-[#166534] block">1. Explainable</span>
            <span className="text-[#667067] leading-tight block mt-0.5">Hardware & spec-citing AI justifications</span>
          </div>
          <div className="p-2 rounded-lg bg-neutral-50 border border-[#E2E8F0]">
            <span className="font-bold text-[#166534] block">2. Bounded</span>
            <span className="text-[#667067] leading-tight block mt-0.5">Strict 10% max merchant discount ceiling</span>
          </div>
          <div className="p-2 rounded-lg bg-neutral-50 border border-[#E2E8F0]">
            <span className="font-bold text-[#166534] block">3. Gated</span>
            <span className="text-[#667067] leading-tight block mt-0.5">4-digit PIN security gate before Razorpay</span>
          </div>
          <div className="p-2 rounded-lg bg-neutral-50 border border-[#E2E8F0]">
            <span className="font-bold text-[#166534] block">4. Audit Trail</span>
            <span className="text-[#667067] leading-tight block mt-0.5">Immutable MongoDB logs & live SSE</span>
          </div>
        </div>

        {/* Simulation Output Banner */}
        {simulationResult && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 animate-in fade-in-50">
            <div className="flex items-center justify-between font-bold mb-1">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                {simulationResult.title}
              </span>
              <button onClick={() => setSimulationResult(null)} className="text-amber-700 hover:text-amber-900">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              {simulationResult.description}
            </p>
          </div>
        )}
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

      {/* Autonomous AI Upsell & Cross-Sell Engine Showcase */}
      <AIUpsellShowcase />

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
