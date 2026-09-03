import { Product, IProduct } from "../models/Product.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";
import { extractBudget, detectLanguage } from "./intentParser.js";

let genAI: GoogleGenerativeAI | null = null;
if (env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  } catch (err: any) {
    logger.warn("Failed to initialize Gemini AI for Reverse Shopping:", err.message);
  }
}

export interface SolutionPillar {
  id: string;
  name: string;
  description: string;
  role: string;
  product?: IProduct;
  reason: string;
  alternatives?: IProduct[];
}

export interface SolutionStrategy {
  strategy: "budget" | "balanced" | "premium";
  title: string;
  description: string;
  totalPrice: number;
  budget?: number;
  savings?: number;
  isOverBudget: boolean;
  overBudgetAmount: number;
  pillars: SolutionPillar[];
}

export interface ReverseShoppingAnalysisResponse {
  goal: string;
  originalQuery: string;
  language: "en" | "hi" | "te";
  extractedBudget?: number;
  userPersona?: string;
  keyPriorities: string[];
  followUpQuestion?: {
    question: string;
    options: string[];
    parameter: "budget" | "priority" | "category_preference";
  };
  isUnsatisfiable: boolean;
  unsatisfiableReason?: string;
  strategies: SolutionStrategy[];
  activeStrategyIndex: number;
  overviewSummary: string;
}

// Goal Knowledge Graph Archetypes for High-Precision Matching
interface GoalArchetype {
  keywords: string[];
  title: string;
  priorities: string[];
  pillars: Array<{
    name: string;
    role: string;
    description: string;
    searchCategories: string[];
    searchTerms: string[];
    weight: number;
  }>;
}

const GOAL_ARCHETYPES: GoalArchetype[] = [
  {
    keywords: [
      "workout", "work out", "working out", "gym", "gym setup", "fitness", "bodybuilding",
      "exercise", "exercising", "training", "running", "runner", "yoga", "athletic",
      "cardio", "sports", "weight loss", "health tracking", "smart scale", "fitness band",
      "smartwatch fitness", "muscle recovery"
    ],
    title: "Home Fitness & Athletic Tracking Ecosystem",
    priorities: ["Heart Rate Telemetry", "Sweat Resistance", "Motivating Audio", "Post-Workout Recovery"],
    pillars: [
      {
        name: "Biometric Fitness Tracker & Smartwatch",
        role: "Heart Rate & Active Calorie Telemetry",
        description: "Tracks active workout metrics, heart-rate zones, GPS pace, and recovery sleep.",
        searchCategories: ["Wearables"],
        searchTerms: ["smart band", "band", "watch", "smartwatch", "fitness", "galaxy watch", "garmin", "apple watch"],
        weight: 0.40,
      },
      {
        name: "Sweatproof Athletic Workout Audio",
        role: "High-Energy Athletic Motivation",
        description: "Secure-fit, sweatproof Bluetooth earphones engineered to stay locked in during intense movement.",
        searchCategories: ["Audio"],
        searchTerms: ["neckband", "earbuds", "earphones", "wireless", "bass", "sports", "sweatproof"],
        weight: 0.25,
      },
      {
        name: "Smart Health Scale & Recovery Gear",
        role: "Body Telemetry & Muscle Recovery",
        description: "Measures body composition telemetry or aids in targeted muscle recovery and cardio training.",
        searchCategories: ["SmartHome", "Accessories"],
        searchTerms: ["scale", "smart scale", "jump rope", "smartrope", "massage gun", "theragun", "fitness", "gym"],
        weight: 0.35,
      },
    ],
  },
  {
    keywords: [
      "study", "studying", "study setup", "student", "college", "school", "homework",
      "exam", "reading", "learn", "learning", "academic", "desk", "desk setup",
      "workspace", "coding", "coder", "programmer", "developer", "office", "work from home", "wfh", "home office"
    ],
    title: "Ergonomic Study & Academic Productivity Setup",
    priorities: ["Ergonomics", "Focus", "Reliable Tech", "Portability"],
    pillars: [
      {
        name: "Core Computing & Note Taking",
        role: "Primary Computing & Research",
        description: "Dependable hardware for coursework, multitasking, and digital study.",
        searchCategories: ["Laptops", "Tablets", "Phones"],
        searchTerms: ["laptop", "tablet", "phone", "thinkpad", "ideapad", "galaxy"],
        weight: 0.6,
      },
      {
        name: "Ergonomic Desk Comfort",
        role: "Comfort & Posture Support",
        description: "Prevents fatigue during extended study and writing sessions.",
        searchCategories: ["Accessories", "Gifts"],
        searchTerms: ["mouse pad", "pad", "chair", "stand", "wrist rest", "cushion"],
        weight: 0.15,
      },
      {
        name: "Focus Audio & Ambient Lighting",
        role: "Distraction-Free Environment",
        description: "Blocks ambient noise and provides eye-friendly task illumination.",
        searchCategories: ["Audio", "SmartHome", "Accessories"],
        searchTerms: ["headphones", "earphones", "smart bulb", "bulb", "wireless"],
        weight: 0.25,
      },
    ],
  },
  {
    keywords: [
      "coffee", "making coffee", "espresso", "latte", "cappuccino", "brew", "brewing",
      "barista", "cafe", "kitchen", "cooking", "culinary", "baking", "cook", "chef", "breakfast", "meal prep", "air fryer"
    ],
    title: "Artisanal Home Cafe & Kitchen Cooking Setup",
    priorities: ["Easy Cleaning", "Precision Brewing", "Speed", "Compact Design"],
    pillars: [
      {
        name: "Beverage & Food Appliance",
        role: "Primary Culinary Station",
        description: "Brews rich coffee or cooks wholesome meals effortlessly at home.",
        searchCategories: ["Kitchen"],
        searchTerms: ["coffee", "air fryer", "frother", "kettle", "blender", "scale"],
        weight: 0.6,
      },
      {
        name: "Precision Measurement & Add-ons",
        role: "Recipe Precision & Utility",
        description: "Ensures accurate ratios and effortless morning prep.",
        searchCategories: ["Kitchen", "Accessories"],
        searchTerms: ["scale", "digital kitchen", "frother", "timer", "plug"],
        weight: 0.4,
      },
    ],
  },
  {
    keywords: [
      "gaming", "game", "gamer", "games", "playstation", "xbox", "ps5", "controller",
      "esports", "pc gaming", "console", "battlestation", "gaming setup"
    ],
    title: "High-Performance Next-Gen Gaming Battle-station",
    priorities: ["High Refresh Rate", "Low Latency", "Immersive Audio", "RGB Ergonomics"],
    pillars: [
      {
        name: "Core Gaming Platform",
        role: "Primary Gaming Console / Hardware",
        description: "Delivers smooth framerates and next-gen gaming experiences.",
        searchCategories: ["Gaming", "Laptops"],
        searchTerms: ["console", "ps5", "xbox", "gaming", "laptop", "rog", "alienware"],
        weight: 0.65,
      },
      {
        name: "Tactile Control & Seating",
        role: "Ergonomic Gaming Control",
        description: "Precision controls and posture support for marathon gaming.",
        searchCategories: ["Gaming", "Accessories"],
        searchTerms: ["controller", "chair", "mechanical keyboard", "mouse", "gaming chair"],
        weight: 0.2,
      },
      {
        name: "Spatial Audio Headset",
        role: "Immersive Directional Sound",
        description: "Positional 3D spatial audio with noise-isolating microphone.",
        searchCategories: ["Audio", "Gaming"],
        searchTerms: ["headset", "headphones", "soundbar", "surround"],
        weight: 0.15,
      },
    ],
  },
  {
    keywords: [
      "video", "video editing", "editing", "youtube", "youtuber", "vlog", "vlogging",
      "filmmaking", "creator", "content", "content creator", "podcast", "podcasting", "stream", "streaming", "filmmaker", "camera"
    ],
    title: "Pro Content Creator & Video Editing Studio",
    priorities: ["Color Accuracy", "Render Speed", "Crystal Clear Audio", "Fast Storage"],
    pillars: [
      {
        name: "Capture / Creative Hardware",
        role: "Primary Visual Capture",
        description: "Crisp 4K video recording with ultra-stable sensor stabilization.",
        searchCategories: ["Cameras", "Tablets", "Laptops"],
        searchTerms: ["camera", "vlog", "drone", "tablet", "macbook", "pro"],
        weight: 0.6,
      },
      {
        name: "Ultra-Fast Storage & Peripherals",
        role: "High-Bandwidth Ingestion",
        description: "High-speed memory and stylus for precise editing timeline scrubbing.",
        searchCategories: ["Accessories", "Gifts"],
        searchTerms: ["microsd", "sandisk", "mouse", "stylus", "hub", "type-c"],
        weight: 0.2,
      },
      {
        name: "Studio Reference Audio",
        role: "Audio Mixing & Voiceovers",
        description: "Flat-response acoustic monitoring for clean voiceovers and sound design.",
        searchCategories: ["Audio"],
        searchTerms: ["headphones", "mic", "monitor", "anc", "sound"],
        weight: 0.2,
      },
    ],
  },
];

// Fast in-memory cache for ultra-low latency (<1ms)
const reverseShoppingCache = new Map<string, { data: ReverseShoppingAnalysisResponse; expiresAt: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Helper: Match best products from MongoDB for a pillar with high-performance lean projections
const matchProductsForPillar = async (
  pillar: GoalArchetype["pillars"][0],
  budgetAlloc: number,
  exclusions: string[]
): Promise<{ budgetProduct?: IProduct; balancedProduct?: IProduct; premiumProduct?: IProduct; allCandidates: IProduct[] }> => {
  const queryFilter: any = {
    productId: { $nin: exclusions },
    stock: { $gt: 0 },
  };

  if (pillar.searchCategories && pillar.searchCategories.length > 0) {
    queryFilter.category = { $in: pillar.searchCategories };
  }

  const selectFields = "productId merchantId sku name category subcategory price currency stock availability rating reviewCount specifications tags discountPercent imageUrl";

  // Attempt term-specific matching first (e.g. "mouse pad", "earbuds", "frother")
  let candidates: IProduct[] = [];
  if (pillar.searchTerms && pillar.searchTerms.length > 0) {
    const termRegexes = pillar.searchTerms.map(t => new RegExp(t, "i"));
    candidates = (await Product.find({
      ...queryFilter,
      $or: [
        { name: { $in: termRegexes } },
        { tags: { $in: pillar.searchTerms } },
        { subcategory: { $in: termRegexes } },
      ],
    })
      .select(selectFields)
      .lean()
      .sort({ rating: -1, salesCount: -1 })
      .limit(20)) as any;
  }

  if (candidates.length === 0) {
    candidates = (await Product.find(queryFilter)
      .select(selectFields)
      .lean()
      .sort({ rating: -1, salesCount: -1 })
      .limit(20)) as any;
  }

  if (candidates.length === 0) {
    const fallbackCandidates = (await Product.find({
      productId: { $nin: exclusions },
      stock: { $gt: 0 },
    })
      .select(selectFields)
      .lean()
      .sort({ rating: -1 })
      .limit(15)) as any;

    return {
      allCandidates: fallbackCandidates,
      budgetProduct: fallbackCandidates[fallbackCandidates.length - 1],
      balancedProduct: fallbackCandidates[0],
      premiumProduct: fallbackCandidates[0],
    };
  }

  // Sort candidates by price ascending
  const sorted = [...candidates].sort((a, b) => a.price - b.price);

  // Budget product: prioritize items at or under budgetAlloc
  const underBudgetCandidates = sorted.filter(p => p.price <= (budgetAlloc > 0 ? budgetAlloc * 1.3 : Infinity));
  const budgetProduct = underBudgetCandidates.length > 0 ? underBudgetCandidates[0] : sorted[0];

  // Balanced product: sweet spot between budget and premium
  const balancedProduct = underBudgetCandidates.length > 1
    ? underBudgetCandidates[Math.floor(underBudgetCandidates.length / 2)]
    : sorted[Math.floor(sorted.length / 2)] || sorted[0];

  // Premium product: highest spec / rating
  const premiumProduct = sorted[sorted.length - 1] || sorted[0];

  return {
    budgetProduct,
    balancedProduct,
    premiumProduct,
    allCandidates: candidates.slice(0, 8),
  };
};

export const analyzeReverseShoppingGoal = async (
  rawGoal: string,
  preferredLanguage: "en" | "hi" | "te" = "en",
  providedBudget?: number,
  exclusions: string[] = []
): Promise<ReverseShoppingAnalysisResponse> => {
  const lang = preferredLanguage || detectLanguage(rawGoal);
  const budgetInfo = extractBudget(rawGoal);
  const budget = providedBudget || budgetInfo.budgetMax;
  const lowerGoal = rawGoal.toLowerCase().trim();

  // Check high-speed in-memory cache
  const cacheKey = `${lowerGoal}_${lang}_${budget || "any"}_${exclusions.join(",")}`;
  const cached = reverseShoppingCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // 1. Guard against empty / nonsensical input
  if (lowerGoal.length < 3) {
    return {
      goal: rawGoal,
      originalQuery: rawGoal,
      language: lang,
      keyPriorities: [],
      isUnsatisfiable: true,
      unsatisfiableReason: "Please describe what you want to accomplish in a few words (e.g. 'Study setup under ₹15,000' or 'Start making coffee at home').",
      strategies: [],
      activeStrategyIndex: 0,
      overviewSummary: "Unable to parse goal statement.",
    };
  }

  // 2. Check for Unsatisfiable Goals outside of consumer commerce catalog
  const outOfScopeTerms = ["car", "real estate", "house", "apartment", "flight", "visa", "scuba", "medicine", "prescription", "pet", "dog", "cat", "tractor", "bitcoin", "crypto"];
  const containsOutOfScope = outOfScopeTerms.some(term => new RegExp(`\\b${term}\\b`, "i").test(lowerGoal));

  if (containsOutOfScope) {
    return {
      goal: rawGoal,
      originalQuery: rawGoal,
      language: lang,
      extractedBudget: budget,
      keyPriorities: [],
      isUnsatisfiable: true,
      unsatisfiableReason: `Our store catalog specializes in Electronics, Appliances, Audio, Home Workspaces, Wearables, and Smart Devices. We could not find catalog products for '${rawGoal}'. Try searching for study setups, audio, creative gear, or kitchen appliances.`,
      strategies: [],
      activeStrategyIndex: 0,
      overviewSummary: "Goal falls outside available catalog inventory.",
    };
  }

  // 3. Match Goal Archetype or dynamically synthesize pillars
  let matchedArchetype = GOAL_ARCHETYPES.find(arch =>
    arch.keywords.some(kw => lowerGoal.includes(kw.toLowerCase()) || new RegExp(`\\b${kw}\\b`, "i").test(lowerGoal))
  );

  // If no predefined archetype, dynamically construct one based on query tokens & catalog categories
  if (!matchedArchetype) {
    const stopWords = new Set(["i", "want", "to", "start", "create", "build", "need", "setup", "home", "good", "best", "things", "everything", "under", "for", "a", "an", "the", "and", "with", "or", "in", "of", "my", "me", "buy", "find"]);
    const meaningfulTokens = lowerGoal.split(/\s+/).filter(w => w.length >= 3 && !stopWords.has(w));

    if (meaningfulTokens.length === 0) {
      return {
        goal: rawGoal,
        originalQuery: rawGoal,
        language: lang,
        extractedBudget: budget,
        keyPriorities: [],
        isUnsatisfiable: true,
        unsatisfiableReason: `Our store catalog specializes in Electronics, Audio, Wearables, Smart Home, Cameras, and Kitchen Appliances. We could not find catalog items for "${rawGoal}". Try searching for study setups, fitness telemetry, audio, or cooking.`,
        strategies: [],
        activeStrategyIndex: 0,
        overviewSummary: "Goal falls outside available catalog inventory.",
      };
    }

    matchedArchetype = {
      keywords: [lowerGoal],
      title: `Curated AI Solution: ${rawGoal}`,
      priorities: ["Utility", "Value for Money", "Ecosystem Compatibility"],
      pillars: [
        {
          name: "Primary Equipment",
          role: "Core Solution Foundation",
          description: "Essential centerpiece product to achieve your primary objective.",
          searchCategories: [],
          searchTerms: meaningfulTokens,
          weight: 0.65,
        },
        {
          name: "Companion Utility & Audio",
          role: "Enhancement & Audio Telemetry",
          description: "Essential companion accessories to maximize efficiency and enjoyment.",
          searchCategories: ["Audio", "Accessories", "SmartHome"],
          searchTerms: ["earbuds", "earphones", "smart plug", "hub", "fast charger"],
          weight: 0.35,
        },
      ],
    };
  }

  // 4. Missing Information Check: If goal has no budget, formulate a smart follow-up question
  let followUpQuestion: ReverseShoppingAnalysisResponse["followUpQuestion"] | undefined;
  if (!budget && !lowerGoal.includes("cheap") && !lowerGoal.includes("low cost")) {
    followUpQuestion = {
      question: "What is your target budget for this setup?",
      options: ["Under ₹15,000", "Under ₹40,000", "Under ₹80,000", "Flexible / Best Performance"],
      parameter: "budget",
    };
  }

  // 5. Build the 3 Strategies (Budget, Balanced, Premium) concurrently in parallel
  const matchResults = await Promise.all(
    matchedArchetype.pillars.map((pillar) => {
      const pillarBudgetAlloc = budget ? budget * pillar.weight : 10000;
      return matchProductsForPillar(pillar, pillarBudgetAlloc, exclusions);
    })
  );

  const budgetPillars: SolutionPillar[] = [];
  const balancedPillars: SolutionPillar[] = [];
  const premiumPillars: SolutionPillar[] = [];

  const getRationale = (p?: IProduct, pillarRole?: string, tier: "budget" | "balanced" | "premium" = "balanced") => {
    if (!p) return `Selected to fulfill ${pillarRole}.`;
    if (tier === "budget") {
      return `Delivers essential ${(pillarRole || "").toLowerCase()} at an ultra-accessible ₹${p.price.toLocaleString("en-IN")} price point while meeting core requirements.`;
    }
    if (tier === "premium") {
      return `High-end flagship choice featuring top-tier build quality, premium specs, and maximum durability for your ${matchedArchetype?.title.toLowerCase()}.`;
    }
    return `Recommended sweet-spot for your goal: provides strong performance, verified high ratings (${p.rating}★), and excellent price-to-value ratio.`;
  };

  matchedArchetype.pillars.forEach((pillar, idx) => {
    const matched = matchResults[idx];
    if (matched.budgetProduct) {
      budgetPillars.push({
        id: `pillar_${pillar.name.toLowerCase().replace(/\s+/g, "_")}_budget`,
        name: pillar.name,
        role: pillar.role,
        description: pillar.description,
        product: matched.budgetProduct,
        reason: getRationale(matched.budgetProduct, pillar.role, "budget"),
        alternatives: matched.allCandidates.filter(c => c.productId !== matched.budgetProduct?.productId),
      });
    }

    if (matched.balancedProduct) {
      balancedPillars.push({
        id: `pillar_${pillar.name.toLowerCase().replace(/\s+/g, "_")}_balanced`,
        name: pillar.name,
        role: pillar.role,
        description: pillar.description,
        product: matched.balancedProduct,
        reason: getRationale(matched.balancedProduct, pillar.role, "balanced"),
        alternatives: matched.allCandidates.filter(c => c.productId !== matched.balancedProduct?.productId),
      });
    }

    if (matched.premiumProduct) {
      premiumPillars.push({
        id: `pillar_${pillar.name.toLowerCase().replace(/\s+/g, "_")}_premium`,
        name: pillar.name,
        role: pillar.role,
        description: pillar.description,
        product: matched.premiumProduct,
        reason: getRationale(matched.premiumProduct, pillar.role, "premium"),
        alternatives: matched.allCandidates.filter(c => c.productId !== matched.premiumProduct?.productId),
      });
    }
  });

  // Calculate totals
  const calcTotal = (pillars: SolutionPillar[]) => pillars.reduce((sum, p) => sum + (p.product?.price || 0), 0);

  const budgetTotal = calcTotal(budgetPillars);
  const balancedTotal = calcTotal(balancedPillars);
  const premiumTotal = calcTotal(premiumPillars);

  const buildStrategyObj = (
    strategy: "budget" | "balanced" | "premium",
    title: string,
    desc: string,
    total: number,
    pillars: SolutionPillar[]
  ): SolutionStrategy => {
    const isOver = Boolean(budget && total > budget);
    const overAmt = isOver && budget ? total - budget : 0;
    const sav = budget && total <= budget ? budget - total : undefined;

    return {
      strategy,
      title,
      description: desc,
      totalPrice: total,
      budget,
      savings: sav,
      isOverBudget: isOver,
      overBudgetAmount: overAmt,
      pillars,
    };
  };

  const strategies: SolutionStrategy[] = [
    buildStrategyObj(
      "budget",
      "Essential Budget Setup",
      "Maximizes affordability while ensuring all functional pillars of your goal are met.",
      budgetTotal,
      budgetPillars
    ),
    buildStrategyObj(
      "balanced",
      "Recommended Balanced Solution",
      "Optimal balance of performance, user reviews, and value designed specifically for your goal.",
      balancedTotal,
      balancedPillars
    ),
    buildStrategyObj(
      "premium",
      "Pro Performance Setup",
      "Higher-spec equipment designed for maximum reliability and peak performance.",
      premiumTotal,
      premiumPillars
    ),
  ];

  // Default active strategy: if budget given, pick the best strategy that fits under budget
  let activeStrategyIndex = 1; // default to balanced
  if (budget) {
    if (balancedTotal <= budget) {
      activeStrategyIndex = 1;
    } else if (budgetTotal <= budget) {
      activeStrategyIndex = 0;
    } else {
      activeStrategyIndex = 0; // show budget even if over
    }
  }

  // Multilingual Overview Summary
  let overview = `AI analyzed your goal "${rawGoal}" and mapped it into ${matchedArchetype.pillars.length} essential requirements with authentic in-stock products.`;
  if (lang === "te") {
    overview = `మీ లక్ష్యం "${rawGoal}" కోసం అవసరమైన ${matchedArchetype.pillars.length} ముఖ్యమైన భాగాలను AI విశ్లేషించి, సరిపోయే ఉత్పత్తులతో పరిష్కారాన్ని రూపొందించింది.`;
  } else if (lang === "hi") {
    overview = `आपके लक्ष्य "${rawGoal}" के लिए AI ने ${matchedArchetype.pillars.length} आवश्यक आवश्यकताओं की पहचान की और उपयुक्त उत्पादों का समाधान तैयार किया।`;
  }

  const result: ReverseShoppingAnalysisResponse = {
    goal: matchedArchetype.title,
    originalQuery: rawGoal,
    language: lang,
    extractedBudget: budget,
    userPersona: matchedArchetype.title.split(" ")[0],
    keyPriorities: matchedArchetype.priorities,
    followUpQuestion,
    isUnsatisfiable: false,
    strategies,
    activeStrategyIndex,
    overviewSummary: overview,
  };

  reverseShoppingCache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
  return result;
};

// Conversational refinement handler
export const refineReverseShoppingSolution = async (
  currentSolution: ReverseShoppingAnalysisResponse,
  userInstruction: string
): Promise<ReverseShoppingAnalysisResponse> => {
  const lowerInst = userInstruction.toLowerCase().trim();

  // 1. "Make it cheaper" / "Lower budget"
  if (lowerInst.includes("cheap") || lowerInst.includes("lower") || lowerInst.includes("budget") || lowerInst.includes("less")) {
    const budgetMatch = extractBudget(userInstruction);
    const newBudget = budgetMatch.budgetMax || (currentSolution.extractedBudget ? currentSolution.extractedBudget * 0.75 : undefined);

    return await analyzeReverseShoppingGoal(
      currentSolution.originalQuery,
      currentSolution.language,
      newBudget
    );
  }

  // 2. "I already have X" / "Remove X"
  const shouldRemove = /(already have|remove|don't need|without|no need of|exclude|i have|have already)/i.test(lowerInst);
  if (shouldRemove) {
    // Extract target terms to remove (e.g. "mouse", "chair", "earphones", "laptop")
    const cleanedTerms = lowerInst
      .replace(/(already have|remove|don't need|without|no need of|exclude|i|a|an|the|have|already|got)/gi, " ")
      .trim()
      .split(/\s+/)
      .filter(w => w.length >= 3);

    const updatedStrategies = currentSolution.strategies.map(strategy => {
      const remainingPillars = strategy.pillars.filter(pillar => {
        const pName = pillar.name.toLowerCase();
        const pRole = pillar.role.toLowerCase();
        const prodName = (pillar.product?.name || "").toLowerCase();
        const prodCat = (pillar.product?.category || "").toLowerCase();

        const isTargeted = cleanedTerms.some(term =>
          pName.includes(term) ||
          pRole.includes(term) ||
          prodName.includes(term) ||
          prodCat.includes(term)
        );
        return !isTargeted;
      });

      const newTotal = remainingPillars.reduce((sum, p) => sum + (p.product?.price || 0), 0);
      const isOver = Boolean(strategy.budget && newTotal > strategy.budget);

      return {
        ...strategy,
        totalPrice: newTotal,
        isOverBudget: isOver,
        savings: strategy.budget && newTotal <= strategy.budget ? strategy.budget - newTotal : undefined,
        pillars: remainingPillars,
      };
    });

    return {
      ...currentSolution,
      strategies: updatedStrategies,
      overviewSummary: `Updated solution: excluded existing equipment per your instruction ("${userInstruction}").`,
    };
  }

  // 3. "Prioritize premium / best quality"
  if (lowerInst.includes("premium") || lowerInst.includes("best") || lowerInst.includes("pro") || lowerInst.includes("high quality")) {
    return {
      ...currentSolution,
      activeStrategyIndex: 2, // Switch to Premium
      overviewSummary: `Switched to Pro Performance tier for maximum specs and durability.`,
    };
  }

  // Fallback: re-analyze with combined context
  return await analyzeReverseShoppingGoal(
    `${currentSolution.originalQuery} (Refinement: ${userInstruction})`,
    currentSolution.language,
    currentSolution.extractedBudget
  );
};
