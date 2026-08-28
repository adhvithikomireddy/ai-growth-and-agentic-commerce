export interface ParsedIntent {
  intent: "search" | "trending" | "negotiate" | "compare" | "accessories" | "general_query";
  category?: string;
  budgetMax?: number;
  budgetMin?: number;
  requirements: string[];
  language: "en" | "hi" | "te";
  confidence: number;
  targetProductId?: string;
  rawText: string;
}

export const detectLanguage = (text: string): "en" | "hi" | "te" => {
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  return "en";
};

export const extractBudget = (text: string): { budgetMax?: number; budgetMin?: number } => {
  let budgetMax: number | undefined;
  let budgetMin: number | undefined;

  const cleaned = text.replace(/,/g, "");

  const regexList = [
    /(?:under|below|within|max|less\s+than)\s*(?:rs\.?|inr)?\s*(\d+)/i,
    /(\d+)\s*(?:లోపు|కింద|తక్కువ)/,
    /(?:के\s*अंदर|से\s*कम|तक)\s*(\d+)/,
    /(\d+)\s*(?:के\s*अंदर|से\s*कम|तक)/,
    /(?:rs\.?|inr)\s*(\d+)/i,
  ];

  for (const rx of regexList) {
    const m = cleaned.match(rx);
    if (m && m[1]) {
      const val = parseInt(m[1], 10);
      if (val >= 500 && val <= 500000) {
        budgetMax = val;
        break;
      }
    }
  }

  if (!budgetMax) {
    const symbolMatch = cleaned.match(/(?:₹)\s*(\d+)/);
    if (symbolMatch && symbolMatch[1]) {
      const val = parseInt(symbolMatch[1], 10);
      if (val >= 500 && val <= 500000) {
        budgetMax = val;
      }
    }
  }

  if (!budgetMax) {
    const numMatch = cleaned.match(/\b(\d{4,6})\b/);
    if (numMatch && numMatch[1]) {
      const val = parseInt(numMatch[1], 10);
      if (val >= 1000 && val <= 300000) {
        budgetMax = val;
      }
    }
  }

  return { budgetMax, budgetMin };
};

export const parseIntentDeterministic = (text: string): ParsedIntent => {
  const language = detectLanguage(text);
  const lower = text.toLowerCase();
  const requirements: string[] = [];

  let intent: ParsedIntent["intent"] = "search";

  if (
    lower.includes("trending") ||
    lower.includes("popular") ||
    lower.includes("best selling") ||
    lower.includes("హాట్") ||
    lower.includes("ట్రెండింగ్") ||
    lower.includes("ट्रेंडिंग") ||
    lower.includes("लोकप्रिय")
  ) {
    intent = "trending";
  } else if (
    lower.includes("better price") ||
    lower.includes("discount") ||
    lower.includes("cheaper") ||
    lower.includes("offer") ||
    lower.includes("bargain") ||
    lower.includes("ధర తగ్గించు") ||
    lower.includes("డిస్కౌంట్") ||
    lower.includes("మంచి ధర") ||
    lower.includes("తక్కువ ధర") ||
    lower.includes("डिस्काउंट") ||
    lower.includes("सस्ता") ||
    lower.includes("कम दाम") ||
    lower.includes("ऑफर")
  ) {
    intent = "negotiate";
  } else if (
    lower.includes("compare") ||
    lower.includes("difference") ||
    lower.includes("vs") ||
    lower.includes("పోల్చు") ||
    lower.includes("తేడా") ||
    lower.includes("तुलना") ||
    lower.includes("फर्क")
  ) {
    intent = "compare";
  } else if (
    lower.includes("goes well with") ||
    lower.includes("accessories") ||
    lower.includes("pairs with") ||
    lower.includes("దీనికి సరిపోయే") ||
    lower.includes("యాక్సెసరీలు") ||
    lower.includes("इसके साथ क्या अच्छा लगेगा")
  ) {
    intent = "accessories";
  }

  let category: string | undefined;

  if (
    lower.includes("laptop") ||
    lower.includes("computer") ||
    lower.includes("notebook") ||
    lower.includes("లాప్‌టాప్") ||
    lower.includes("కంప్యూటర్") ||
    lower.includes("लैपटॉप")
  ) {
    category = "Laptops";
  } else if (
    lower.includes("phone") ||
    lower.includes("mobile") ||
    lower.includes("smartphone") ||
    lower.includes("ఫోన్") ||
    lower.includes("మొబైల్") ||
    lower.includes("फोन") ||
    lower.includes("स्मार्टफोन")
  ) {
    category = "Phones";
  } else if (
    lower.includes("headphone") ||
    lower.includes("earbud") ||
    lower.includes("audio") ||
    lower.includes("earphone") ||
    lower.includes("హెడ్‌ఫోన్") ||
    lower.includes("ఇయర్‌బడ్స్") ||
    lower.includes("हेडफोन") ||
    lower.includes("इयरबड्स")
  ) {
    category = "Headphones";
  } else if (
    lower.includes("mouse") ||
    lower.includes("charger") ||
    lower.includes("bag") ||
    lower.includes("backpack") ||
    lower.includes("stand") ||
    lower.includes("మౌస్") ||
    lower.includes("చార్జర్") ||
    lower.includes("బ్యాగ్") ||
    lower.includes("माउस") ||
    lower.includes("चार्जर") ||
    lower.includes("बैग")
  ) {
    category = "Accessories";
  } else if (
    lower.includes("gift") ||
    lower.includes("daughter") ||
    lower.includes("birthday") ||
    lower.includes("tablet") ||
    lower.includes("art") ||
    lower.includes("drawing") ||
    lower.includes("బహుమతి") ||
    lower.includes("గిఫ్ట్") ||
    lower.includes("కూతురు") ||
    lower.includes("పుట్టినరోజు") ||
    lower.includes("డ్రాయింగ్") ||
    lower.includes("उपहार") ||
    lower.includes("गिफ्ट") ||
    lower.includes("बेटी") ||
    lower.includes("जन्मदिन") ||
    lower.includes("ड्राइंग")
  ) {
    category = "Gifts";
  } else if (
    lower.includes("book") ||
    lower.includes("kindle") ||
    lower.includes("పుస్తకం") ||
    lower.includes("కితాబ్") ||
    lower.includes("किताब")
  ) {
    category = "Books";
  } else if (
    lower.includes("monitor") ||
    lower.includes("screen") ||
    lower.includes("డిస్‌ప్లే") ||
    lower.includes("मॉनिटर")
  ) {
    category = "Monitors";
  } else if (
    lower.includes("kitchen") ||
    lower.includes("air fryer") ||
    lower.includes("వంటగది") ||
    lower.includes("रसोई")
  ) {
    category = "Kitchen";
  }

  if (lower.includes("programming") || lower.includes("coding") || lower.includes("developer") || lower.includes("ప్రోగ్రామింగ్") || lower.includes("కోడింగ్") || lower.includes("कोडिंग")) {
    requirements.push("programming");
  }
  if (lower.includes("camera") || lower.includes("ఫోటో") || lower.includes("కెమెరా") || lower.includes("कैमरा")) {
    requirements.push("good camera");
  }
  if (lower.includes("battery") || lower.includes("బ్యాటరీ") || lower.includes("बैटरी")) {
    requirements.push("long battery");
  }
  if (lower.includes("gaming") || lower.includes("గేమింగ్") || lower.includes("गेमिंग")) {
    requirements.push("gaming");
  }
  if (lower.includes("16gb") || lower.includes("16 gb")) {
    requirements.push("16GB RAM");
  }

  const { budgetMax, budgetMin } = extractBudget(text);

  return {
    intent,
    category,
    budgetMax,
    budgetMin,
    requirements,
    language,
    confidence: 0.95,
    rawText: text,
  };
};
