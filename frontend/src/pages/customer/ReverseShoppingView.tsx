import React, { useState } from "react";
import {
  Sparkles,
  Target,
  ArrowRight,
  Layers,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  HelpCircle,
  RefreshCw,
  ShoppingBag,
  Sliders,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Trash2,
  ShieldCheck,
  Check,
  Flame,
  ArrowDownUp,
  Laptop,
  Coffee,
  Dumbbell,
  Video,
  Gamepad2,
  GraduationCap,
} from "lucide-react";
import { Product, SolutionPillar, SolutionStrategy, ReverseShoppingAnalysisResponse } from "../../types/index.js";
import { api } from "../../api/client.js";
import { useCart } from "../../context/CartContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { Card } from "../../components/ui/Card.js";
import { Button } from "../../components/ui/Button.js";
import { Badge } from "../../components/ui/Badge.js";
import { Skeleton } from "../../components/ui/Skeleton.js";

interface ReverseShoppingViewProps {
  onExploreCatalog?: () => void;
  onOpenAuth?: () => void;
}

export const ReverseShoppingView: React.FC<ReverseShoppingViewProps> = () => {
  const { language, t } = useLanguage();
  const { addMultipleToCart } = useCart();

  const [goalInput, setGoalInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [solutionData, setSolutionData] = useState<ReverseShoppingAnalysisResponse | null>(null);
  const [activeStrategyIndex, setActiveStrategyIndex] = useState(1); // 0 = budget, 1 = balanced, 2 = premium
  const [refinementInput, setRefinementInput] = useState("");
  const [refining, setRefining] = useState(false);
  const [addedToCartSuccess, setAddedToCartSuccess] = useState(false);

  // Alternatives Modal state
  const [alternativesPillar, setAlternativesPillar] = useState<SolutionPillar | null>(null);
  const [swapModalOpen, setSwapModalOpen] = useState(false);

  // Expandable "Why this?" states
  const [expandedWhyThis, setExpandedWhyThis] = useState<Record<string, boolean>>({});

  const toggleWhyThis = (pillarId: string) => {
    setExpandedWhyThis((prev) => ({ ...prev, [pillarId]: !prev[pillarId] }));
  };

  const sampleGoals = [
    {
      title: "Study Setup under ₹15,000",
      query: "I want to create a comfortable study setup for under ₹15,000.",
      icon: <GraduationCap className="w-3.5 h-3.5" />,
    },
    {
      title: "Home Workout & Fitness",
      query: "I want to start working out at home with heart rate tracking and motivating audio.",
      icon: <Dumbbell className="w-3.5 h-3.5" />,
    },
    {
      title: "Home Barista Cafe",
      query: "I want to start making artisanal coffee at home.",
      icon: <Coffee className="w-3.5 h-3.5" />,
    },
    {
      title: "Video Editing & Vlogging",
      query: "I want a setup for video editing and 4K content creation.",
      icon: <Video className="w-3.5 h-3.5" />,
    },
    {
      title: "Next-Gen Gaming Setup",
      query: "I want to build a gaming setup under ₹80,000.",
      icon: <Gamepad2 className="w-3.5 h-3.5" />,
    },
  ];

  const handleAnalyzeGoal = async (queryToUse?: string, budgetOverride?: number) => {
    const goalText = queryToUse || goalInput;
    if (!goalText.trim()) return;

    try {
      setLoading(true);
      setAddedToCartSuccess(false);
      const data = await api.analyzeReverseGoal(goalText, language, budgetOverride);
      setSolutionData(data);
      setActiveStrategyIndex(data.activeStrategyIndex || 0);

      // Open all "Why this?" rationales by default
      const initialExpanded: Record<string, boolean> = {};
      if (data.strategies && data.strategies.length > 0) {
        data.strategies.forEach((s: SolutionStrategy) => {
          s.pillars.forEach((p: SolutionPillar) => {
            initialExpanded[p.id] = true;
          });
        });
      }
      setExpandedWhyThis(initialExpanded);
    } catch (err: any) {
      alert(err.message || "Failed to analyze goal.");
    } finally {
      setLoading(false);
    }
  };

  const handleFollowUpSelect = (optionText: string) => {
    // Extract budget from option e.g. "Under ₹40,000"
    const match = optionText.match(/(\d+[\d,]*)/);
    const num = match ? parseInt(match[1].replace(/,/g, ""), 10) : undefined;
    handleAnalyzeGoal(solutionData?.originalQuery || goalInput, num);
  };

  const handleRefine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refinementInput.trim() || !solutionData) return;

    try {
      setRefining(true);
      const updated = await api.refineReverseGoal(solutionData, refinementInput);
      setSolutionData(updated);
      setActiveStrategyIndex(updated.activeStrategyIndex || 0);
      setRefinementInput("");
    } catch (err: any) {
      alert(err.message || "Refinement failed.");
    } finally {
      setRefining(false);
    }
  };

  const handleSwapProduct = (pillarId: string, newProduct: Product) => {
    if (!solutionData) return;

    const currentStrategy = solutionData.strategies[activeStrategyIndex];
    if (!currentStrategy) return;

    const updatedPillars = currentStrategy.pillars.map((pillar) => {
      if (pillar.id === pillarId) {
        return {
          ...pillar,
          product: newProduct,
          reason: `Manually customized by customer: chosen ${newProduct.name} to fulfill ${pillar.role}.`,
        };
      }
      return pillar;
    });

    const newTotal = updatedPillars.reduce((sum, p) => sum + (p.product?.price || 0), 0);
    const isOver = Boolean(currentStrategy.budget && newTotal > currentStrategy.budget);
    const sav = currentStrategy.budget && newTotal <= currentStrategy.budget ? currentStrategy.budget - newTotal : undefined;

    const updatedStrategies = [...solutionData.strategies];
    updatedStrategies[activeStrategyIndex] = {
      ...currentStrategy,
      totalPrice: newTotal,
      isOverBudget: isOver,
      savings: sav,
      pillars: updatedPillars,
    };

    setSolutionData({
      ...solutionData,
      strategies: updatedStrategies,
    });

    setSwapModalOpen(false);
    setAlternativesPillar(null);
  };

  const handleRemovePillar = (pillarId: string) => {
    if (!solutionData) return;

    const currentStrategy = solutionData.strategies[activeStrategyIndex];
    if (!currentStrategy) return;

    const updatedPillars = currentStrategy.pillars.filter((p) => p.id !== pillarId);
    const newTotal = updatedPillars.reduce((sum, p) => sum + (p.product?.price || 0), 0);
    const isOver = Boolean(currentStrategy.budget && newTotal > currentStrategy.budget);
    const sav = currentStrategy.budget && newTotal <= currentStrategy.budget ? currentStrategy.budget - newTotal : undefined;

    const updatedStrategies = [...solutionData.strategies];
    updatedStrategies[activeStrategyIndex] = {
      ...currentStrategy,
      totalPrice: newTotal,
      isOverBudget: isOver,
      savings: sav,
      pillars: updatedPillars,
    };

    setSolutionData({
      ...solutionData,
      strategies: updatedStrategies,
    });
  };

  const handleAddAllToCart = async () => {
    if (!solutionData) return;
    const currentStrategy = solutionData.strategies[activeStrategyIndex];
    if (!currentStrategy || currentStrategy.pillars.length === 0) return;

    const itemsToAdd = currentStrategy.pillars
      .filter((p) => Boolean(p.product))
      .map((p) => ({
        productId: p.product!.productId,
        quantity: 1,
        discountPercent: p.product!.discountPercent || 0,
      }));

    await addMultipleToCart(itemsToAdd);
    setAddedToCartSuccess(true);
    setTimeout(() => setAddedToCartSuccess(false), 4000);
  };

  const currentStrategy = solutionData?.strategies?.[activeStrategyIndex];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors duration-200">
      {/* 1. Hero Goal Input Header */}
      <div className="relative rounded-3xl p-6 sm:p-10 bg-gradient-to-b from-emerald-50/70 via-white to-white dark:from-emerald-950/30 dark:via-[#0F172A] dark:to-[#0F172A] border border-emerald-200/80 dark:border-slate-800 shadow-md text-center max-w-4xl mx-auto space-y-4 overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide uppercase shadow-xs">
          <Target className="w-3.5 h-3.5" />
          <span>Reverse Shopping • Goal-First Autonomous Commerce</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#172018] dark:text-white leading-tight">
          What are you trying to{" "}
          <span className="bg-gradient-to-r from-emerald-700 via-teal-600 to-indigo-600 dark:from-emerald-400 dark:via-teal-300 dark:to-indigo-300 bg-clip-text text-transparent">
            accomplish?
          </span>
        </h1>

        <p className="text-sm sm:text-base text-[#667067] dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          You don't need to know what products to buy. Just describe your goal, and our AI will architect the complete solution from authentic, in-stock catalog hardware.
        </p>

        {/* Goal Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyzeGoal();
          }}
          className="max-w-3xl mx-auto pt-2"
        >
          <div className="flex flex-col sm:flex-row items-center gap-2 p-2 rounded-2xl bg-white dark:bg-slate-900 border-2 border-emerald-600/30 dark:border-emerald-500/40 shadow-lg focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10 transition-all">
            <input
              type="text"
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              placeholder="e.g. I want to create a comfortable study setup for under ₹15,000..."
              className="flex-1 w-full px-4 py-3 text-sm sm:text-base bg-transparent border-0 outline-none text-[#172018] dark:text-white placeholder-[#94A3B8] dark:placeholder-slate-500"
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={loading || !goalInput.trim()}
              icon={<Sparkles className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />}
              className="w-full sm:w-auto shrink-0 shadow-md font-bold px-6 py-3"
            >
              {loading ? "Architecting Solution..." : "Build My Solution"}
            </Button>
          </div>
        </form>

        {/* Goal Sample Chips */}
        <div className="space-y-1.5 pt-2">
          <span className="text-[11px] font-semibold text-[#667067] dark:text-slate-400 block uppercase tracking-wider">
            Popular Example Goals:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {sampleGoals.map((sample, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setGoalInput(sample.query);
                  handleAnalyzeGoal(sample.query);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white dark:bg-slate-800/80 border border-[#E2E8F0] dark:border-slate-700 text-[#475548] dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-slate-800 transition-all shadow-2xs hover:scale-102"
              >
                {sample.icon}
                <span>{sample.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Loading Skeleton State */}
      {loading && (
        <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 space-y-4">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
              <Skeleton className="h-48" />
            </div>
          </div>
        </div>
      )}

      {/* 3. Follow-up Question Prompt (Missing Information Handling) */}
      {solutionData && solutionData.followUpQuestion && !loading && (
        <div className="max-w-3xl mx-auto p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-300 dark:border-amber-700/60 shadow-md space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0" />
            <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200">
              {solutionData.followUpQuestion.question}
            </h3>
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            Select an option below to tailor your solution:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {solutionData.followUpQuestion.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleFollowUpSelect(opt)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-700 text-amber-950 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-all shadow-2xs hover:scale-105"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 4. Unsatisfiable Goal State */}
      {solutionData && solutionData.isUnsatisfiable && !loading && (
        <div className="max-w-3xl mx-auto p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-center space-y-3 animate-in fade-in">
          <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-rose-900 dark:text-rose-200">
            Cannot Build Solution from Catalog
          </h3>
          <p className="text-xs sm:text-sm text-rose-800 dark:text-rose-300 max-w-xl mx-auto leading-relaxed">
            {solutionData.unsatisfiableReason}
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setGoalInput("I want to create a comfortable study setup for under ₹15,000.");
                handleAnalyzeGoal("I want to create a comfortable study setup for under ₹15,000.");
              }}
            >
              Try Example: Study Setup under ₹15,000
            </Button>
          </div>
        </div>
      )}

      {/* 5. Main Solution Presentation */}
      {solutionData && !solutionData.isUnsatisfiable && !loading && (
        <div className="space-y-6 animate-in fade-in">
          {/* Visual Goal Breakdown Breadcrumb Flow */}
          <div className="p-4 rounded-2xl bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#166534] dark:text-emerald-400 block">
                Target Objective
              </span>
              <h2 className="text-lg font-bold text-[#172018] dark:text-white">
                {solutionData.goal}
              </h2>
              <p className="text-xs text-[#667067] dark:text-slate-400">
                {solutionData.overviewSummary}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {solutionData.keyPriorities.map((prio, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 font-semibold"
                >
                  ✓ {prio}
                </span>
              ))}
            </div>
          </div>

          {/* Strategy Selector Tabs (Budget / Balanced / Premium) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {solutionData.strategies.map((strat, idx) => {
              const isSelected = activeStrategyIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveStrategyIndex(idx)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "bg-white dark:bg-[#0F172A] border-emerald-600 dark:border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                      : "bg-neutral-50 dark:bg-slate-900/50 border-[#E2E8F0] dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-[#166534] dark:text-emerald-400 uppercase tracking-wide">
                      {strat.strategy.toUpperCase()} TIER
                    </span>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm font-bold text-[#172018] dark:text-white">{strat.title}</h4>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl font-extrabold text-[#172018] dark:text-white">
                      ₹{strat.totalPrice.toLocaleString("en-IN")}
                    </span>
                    {strat.savings !== undefined && (
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        Save ₹{strat.savings.toLocaleString("en-IN")}
                      </span>
                    )}
                    {strat.isOverBudget && (
                      <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                        +₹{strat.overBudgetAmount.toLocaleString("en-IN")} over budget
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-[#667067] dark:text-slate-400 mt-1 leading-snug line-clamp-2">
                    {strat.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Solution Pillars & Matched Products */}
          {currentStrategy && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#172018] dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#166534] dark:text-emerald-400" />
                  Recommended Solution Components ({currentStrategy.pillars.length} Items)
                </h3>
                <span className="text-xs text-[#667067] dark:text-slate-400">
                  Customizable: click "Show Alternatives" or remove any item you already own.
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentStrategy.pillars.map((pillar) => {
                  const product = pillar.product;
                  const isWhyOpen = expandedWhyThis[pillar.id] !== false;

                  return (
                    <Card
                      key={pillar.id}
                      className="p-5 flex flex-col justify-between border border-[#E2E8F0] dark:border-slate-800 dark:bg-[#0F172A] shadow-xs hover:border-emerald-500/50 transition-all space-y-4"
                    >
                      <div className="space-y-3">
                        {/* Requirement Role Badge */}
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-1 rounded-md bg-emerald-100/90 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                            {pillar.role}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemovePillar(pillar.id)}
                            className="text-[#667067] dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 p-1 transition-colors"
                            title="Remove from solution"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {product ? (
                          <div className="space-y-2">
                            <div className="aspect-square w-full rounded-xl overflow-hidden bg-neutral-100 dark:bg-slate-800 relative border border-neutral-200 dark:border-slate-700">
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                onError={(e) => {
                                  e.currentTarget.src = "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=600&auto=format&fit=crop&q=80";
                                }}
                              />
                              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/70 text-white text-[10px] font-bold">
                                {product.category}
                              </div>
                            </div>

                            <h4 className="font-bold text-sm text-[#172018] dark:text-white line-clamp-2">
                              {product.name}
                            </h4>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-base font-extrabold text-[#172018] dark:text-white">
                                ₹{product.price.toLocaleString("en-IN")}
                              </span>
                              <span className="text-xs text-amber-500 font-semibold">
                                ★ {product.rating || 4.5}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 rounded-xl bg-neutral-100 dark:bg-slate-800 text-center text-xs text-[#667067] dark:text-slate-400">
                            No product matched for this component.
                          </div>
                        )}

                        {/* Expandable "Why this?" Section */}
                        <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 p-3 space-y-1.5">
                          <button
                            type="button"
                            onClick={() => toggleWhyThis(pillar.id)}
                            className="w-full flex items-center justify-between text-xs font-bold text-emerald-900 dark:text-emerald-300"
                          >
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              Why This Product?
                            </span>
                            {isWhyOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {isWhyOpen && (
                            <p className="text-[11px] text-[#475548] dark:text-slate-300 leading-relaxed pt-1">
                              {pillar.reason}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Pillar Actions (Swap Alternative) */}
                      <div className="pt-3 border-t border-[#E2E8F0] dark:border-slate-800 flex items-center justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs font-semibold"
                          icon={<ArrowDownUp className="w-3 h-3" />}
                          onClick={() => {
                            setAlternativesPillar(pillar);
                            setSwapModalOpen(true);
                          }}
                        >
                          Show Alternatives ({pillar.alternatives?.length || 0})
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* 6. Conversational Refinement Bar */}
              <Card className="p-5 bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#166534] dark:text-emerald-400" />
                  <h4 className="text-sm font-bold text-[#172018] dark:text-white">
                    Refine or Modify This Solution
                  </h4>
                </div>

                <form onSubmit={handleRefine} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={refinementInput}
                    onChange={(e) => setRefinementInput(e.target.value)}
                    placeholder="e.g. 'I already have a mouse', 'Make it under ₹10,000', 'Prioritize premium quality'..."
                    className="flex-1 px-4 py-2 text-xs sm:text-sm bg-neutral-50 dark:bg-slate-900 rounded-xl border border-[#E2E8F0] dark:border-slate-700 text-[#172018] dark:text-white placeholder-[#94A3B8] dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    size="sm"
                    disabled={refining || !refinementInput.trim()}
                    icon={<RefreshCw className={`w-3.5 h-3.5 ${refining ? "animate-spin" : ""}`} />}
                  >
                    {refining ? "Refining..." : "Apply Refinement"}
                  </Button>
                </form>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#667067] dark:text-slate-400">
                  <span>Quick Tweaks:</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRefinementInput("Make it cheaper");
                    }}
                    className="underline hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    "Make it cheaper"
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => {
                      setRefinementInput("Prioritize premium quality");
                    }}
                    className="underline hover:text-emerald-600 dark:hover:text-emerald-400"
                  >
                    "Prioritize premium quality"
                  </button>
                </div>
              </Card>

              {/* 7. Solution Summary & Smart Budget Box */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-white via-emerald-50/40 to-white dark:from-[#0F172A] dark:via-slate-900 dark:to-[#0F172A] border-2 border-emerald-600/30 dark:border-emerald-500/40 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <h3 className="text-lg font-bold text-[#172018] dark:text-white">
                      Complete Solution Summary
                    </h3>
                  </div>

                  <div className="flex flex-wrap items-baseline gap-4 text-xs">
                    <div>
                      <span className="text-[#667067] dark:text-slate-400 block">Total Solution Price:</span>
                      <strong className="text-2xl font-extrabold text-[#172018] dark:text-white">
                        ₹{currentStrategy.totalPrice.toLocaleString("en-IN")}
                      </strong>
                    </div>

                    {currentStrategy.budget && (
                      <div className="pl-4 border-l border-neutral-200 dark:border-slate-800">
                        <span className="text-[#667067] dark:text-slate-400 block">Target Budget:</span>
                        <strong className="text-lg font-bold text-[#475548] dark:text-slate-300">
                          ₹{currentStrategy.budget.toLocaleString("en-IN")}
                        </strong>
                      </div>
                    )}

                    {currentStrategy.savings !== undefined && (
                      <div className="pl-4 border-l border-neutral-200 dark:border-slate-800">
                        <span className="text-emerald-600 dark:text-emerald-400 block font-semibold">Remaining / Saved:</span>
                        <strong className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                          +₹{currentStrategy.savings.toLocaleString("en-IN")}
                        </strong>
                      </div>
                    )}

                    {currentStrategy.isOverBudget && (
                      <div className="pl-4 border-l border-neutral-200 dark:border-slate-800">
                        <span className="text-amber-600 dark:text-amber-400 block font-semibold">Exceeds Budget By:</span>
                        <strong className="text-lg font-extrabold text-amber-700 dark:text-amber-400">
                          ₹{currentStrategy.overBudgetAmount.toLocaleString("en-IN")}
                        </strong>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={handleAddAllToCart}
                    icon={<ShoppingBag className="w-4 h-4" />}
                    className="w-full sm:w-auto font-bold px-6 py-3 shadow-md"
                  >
                    {addedToCartSuccess ? "✓ Added Solution to Cart!" : `Add All ${currentStrategy.pillars.length} Items to Cart`}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 8. Component Alternatives Swap Modal */}
      {swapModalOpen && alternativesPillar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="max-w-2xl w-full bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0] dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-[#172018] dark:text-white flex items-center gap-2">
                  <ArrowDownUp className="w-4 h-4 text-[#166534] dark:text-emerald-400" />
                  Swap Component: {alternativesPillar.name}
                </h3>
                <p className="text-xs text-[#667067] dark:text-slate-400">
                  Select an authentic catalog alternative to replace this component.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSwapModalOpen(false)}
                className="p-1 rounded-lg text-[#667067] dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {alternativesPillar.alternatives && alternativesPillar.alternatives.length > 0 ? (
                alternativesPillar.alternatives.map((alt) => (
                  <div
                    key={alt.productId}
                    className="p-3 rounded-xl border border-[#E2E8F0] dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400 bg-neutral-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={alt.imageUrl}
                        alt={alt.name}
                        className="w-14 h-14 rounded-lg object-cover bg-white dark:bg-slate-800 border"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-[#172018] dark:text-white line-clamp-1">
                          {alt.name}
                        </h4>
                        <span className="text-[11px] text-[#667067] dark:text-slate-400">
                          {alt.category} • ★ {alt.rating || 4.5}
                        </span>
                        <div className="text-sm font-extrabold text-[#166534] dark:text-emerald-400 mt-0.5">
                          ₹{alt.price.toLocaleString("en-IN")}
                        </div>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleSwapProduct(alternativesPillar.id, alt)}
                    >
                      Select This
                    </Button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#667067] dark:text-slate-400">
                  No other alternatives found in this price bracket.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
