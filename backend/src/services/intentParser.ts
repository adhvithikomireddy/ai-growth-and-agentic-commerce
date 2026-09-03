export interface ParsedIntent {
  intent: "search" | "trending" | "negotiate" | "compare" | "accessories" | "general_query";
  category?: string;
  brand?: string;
  budgetMax?: number;
  budgetMin?: number;
  requirements: string[];
  keywords: string[];
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
  const lower = text.toLowerCase();

  // Check 1k, 2k, 5k shorthand e.g. "under 1k", "below 2k", "1k budget"
  const kMatch = cleaned.match(/(?:under|below|within|max|budget|less\s+than|upto|up\s+to)?\s*(\d+)\s*k\b/i);
  if (kMatch && kMatch[1]) {
    budgetMax = parseInt(kMatch[1], 10) * 1000;
  }

  if (!budgetMax) {
    const regexList = [
      /(?:under|below|within|max|budget|less\s+than|upto|up\s+to)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i,
      /(\d+)\s*(?:లోపు|కింద|తక్కువ|వరకు)/,
      /(?:के\s*अंदर|से\s*कम|तक)\s*(\d+)/,
      /(\d+)\s*(?:के\s*अंदर|से\s*कम|तक)/,
      /(?:rs\.?|inr|₹)\s*(\d+)/i,
    ];

    for (const rx of regexList) {
      const m = cleaned.match(rx);
      if (m && m[1]) {
        const val = parseInt(m[1], 10);
        if (val >= 100 && val <= 500000) {
          budgetMax = val;
          break;
        }
      }
    }
  }

  if (!budgetMax) {
    const numMatch = cleaned.match(/\b(\d{3,6})\b/);
    if (numMatch && numMatch[1]) {
      const val = parseInt(numMatch[1], 10);
      if (val >= 100 && val <= 300000) {
        budgetMax = val;
      }
    }
  }

  // If no explicit number, but user expresses "affordable" / "cheap" / "budget"
  if (!budgetMax) {
    if (
      lower.includes("affordable") ||
      lower.includes("cheap") ||
      lower.includes("pocket friendly") ||
      lower.includes("budget friendly") ||
      lower.includes("low cost") ||
      lower.includes("low price") ||
      lower.includes("inexpensive") ||
      lower.includes("తక్కువ ధర") ||
      lower.includes("సస్తా") ||
      lower.includes("सस्ता") ||
      lower.includes("कम दाम") ||
      lower.includes("कम कीमत")
    ) {
      budgetMax = 1000;
    }
  }

  return { budgetMax, budgetMin };
};

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Laptops: [
    "laptop", "notebook", "ultrabook", "macbook", "computer", "pc", "thinkpad", "ideapad",
    "లాప్‌టాప్", "కంప్యూటర్", "ల్యాప్‌టాప్", "लैपटॉप", "कंप्यूटर"
  ],
  Phones: [
    "phone", "mobile", "smartphone", "iphone", "galaxy", "pixel", "oneplus", "android",
    "ఫోన్", "మొబైల్", "స్మార్ట్‌ఫోన్", "फोन", "मोबाइल", "स्मार्टफोन"
  ],
  Audio: [
    "headphone", "earphone", "earbuds", "audio", "speaker", "soundbar", "soundcore", "airpods", "tws", "noise canceling", "anc",
    "హెడ్‌ఫోన్", "ఇయర్‌ఫోన్", "స్పీకర్", "ఆడియో", "हेडफोन", "इयरफोन", "स्पीकर", "ऑडियो"
  ],
  Accessories: [
    "mouse", "keyboard", "monitor", "dock", "hub", "ssd", "charger", "cable", "stand", "pad", "drive",
    "మౌస్", "కీబోర్డ్", "మానిటర్", "माउस", "कीबोर्ड", "मॉनिटर"
  ],
  Wearables: [
    "watch", "smartwatch", "fitness", "band", "tracker", "ecg", "wearable",
    "వాచ్", "స్మార్ట్‌వాచ్", "బ్యాండ్", "घड़ी", "स्मार्टवॉच", "बैंड"
  ],
  Kitchen: [
    "kitchen", "fryer", "air fryer", "coffee", "cooker", "blender", "juicer", "toaster", "appliance",
    "కిచెన్", "కాఫీ", "వంట", "किचन", "कॉफी", "एयर फ्रायर"
  ],
  Gifts: [
    "gift", "tablet", "drawing", "stylus", "art", "pencil", "pen", "journal", "sketch", "book",
    "బహుమతి", "గిఫ్ట్", "డ్రాయింగ్", "ఆర్ట్", "उपहार", "गिफ्ट", "ड्राइंग", "आर्ट"
  ],
  Cameras: [
    "camera", "drone", "tripod", "lens", "gopro", "photography", "vlog", "video",
    "కెమెరా", "డ్రోన్", "ఫోటోగ్రఫీ", "कैमरा", "ड्रोन", "फोटोग्राफी"
  ],
  Gaming: [
    "gaming", "game", "console", "playstation", "ps5", "xbox", "controller", "joystick",
    "గేమింగ్", "గేమ్", "గేమింగ్ ఛైర్", "गेमिंग", "गेम", "कंसोल"
  ],
  SmartHome: [
    "smart home", "bulb", "light", "security camera", "alexa", "echo", "nest", "vacuum", "robot",
    "స్మార్ట్ హోమ్", "బల్బ్", "स्मार्ट होम", "बल्ब"
  ],
};

const BRANDS = [
  "Apple", "Samsung", "Lenovo", "Dell", "HP", "ASUS", "OnePlus", "Google", "Pixel",
  "Sony", "Bose", "Sennheiser", "JBL", "boAt", "Logitech", "Razer", "Keychron",
  "Philips", "Garmin", "Amazfit", "Noise", "XP-Pen", "Faber-Castell", "DJI", "GoPro",
  "Nintendo", "Microsoft", "Anker", "Nothing", "Canon", "Nikon"
];

export const parseIntentDeterministic = (text: string): ParsedIntent => {
  const language = detectLanguage(text);
  const lower = text.toLowerCase();
  const requirements: string[] = [];
  const keywords: string[] = [];

  // Determine High-Level Intent
  let intent: ParsedIntent["intent"] = "search";

  if (
    lower.includes("trending") || lower.includes("popular") || lower.includes("best selling") ||
    lower.includes("హాట్") || lower.includes("ట్రెండింగ్") || lower.includes("ट्रेंडिंग") || lower.includes("लोकप्रिय")
  ) {
    intent = "trending";
  } else if (
    lower.includes("better price") || lower.includes("discount") || lower.includes("cheaper") ||
    lower.includes("offer") || lower.includes("bargain") || lower.includes("ధర తగ్గించు") ||
    lower.includes("డిస్కౌంట్") || lower.includes("మంచి ధర") || lower.includes("डिस्काउंट") ||
    lower.includes("सस्ता") || lower.includes("कम दाम")
  ) {
    intent = "negotiate";
  } else if (
    lower.includes("compare") || lower.includes("difference") || lower.includes("vs") ||
    lower.includes("పోల్చు") || lower.includes("తేడా") || lower.includes("तुलना")
  ) {
    intent = "compare";
  } else if (
    lower.includes("accessories") || lower.includes("goes well with") || lower.includes("pairs with")
  ) {
    intent = "accessories";
  }

const matchesWord = (text: string, target: string): boolean => {
  if (/[\u0C00-\u0C7F\u0900-\u097F]/.test(target)) {
    return text.includes(target);
  }
  const escaped = target.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, "i");
  return regex.test(text);
};

  // Detect Category
  let category: string | undefined;
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some(w => matchesWord(lower, w))) {
      category = cat;
      break;
    }
  }

  // Detect Brand
  let brand: string | undefined;
  for (const b of BRANDS) {
    if (matchesWord(lower, b.toLowerCase())) {
      brand = b;
      keywords.push(b);
      break;
    }
  }

  // Detect Feature Requirements
  const FEATURE_MAP: Record<string, string> = {
    "programming": "programming",
    "coding": "programming",
    "developer": "programming",
    "software": "programming",
    "కోడింగ్": "programming",
    "ప్రోగ్రామింగ్": "programming",
    "कोडिंग": "programming",
    "camera": "good camera",
    "photography": "good camera",
    "కెమెరా": "good camera",
    "कैमरा": "good camera",
    "gaming": "gaming",
    "games": "gaming",
    "battery": "long battery life",
    "battery life": "long battery life",
    "బ్యాటరీ": "long battery life",
    "बैटरी": "long battery life",
    "quiet": "quiet typing",
    "silent": "quiet typing",
    "office": "office productivity",
    "student": "student use",
    "lightweight": "lightweight portability",
    "travel": "travel portability",
    "4k": "4K display",
    "wireless": "wireless connectivity",
    "noise canceling": "active noise canceling",
    "anc": "active noise canceling",
    "ergonomic": "ergonomic comfort",
  };

  for (const [trigger, requirement] of Object.entries(FEATURE_MAP)) {
    if (matchesWord(lower, trigger) && !requirements.includes(requirement)) {
      requirements.push(requirement);
      keywords.push(trigger);
    }
  }

  // Extract clean search tokens (excluding stop words)
  const stopWords = new Set([
    "i", "need", "want", "looking", "for", "a", "an", "the", "under", "below", "with", "and", "or",
    "in", "to", "of", "best", "good", "me", "show", "give", "please", "can", "you", "get",
    "నాకు", "కావాలి", "ఒక", "మరియు", "లో", "ఉన్న", "मुझे", "चाहिए", "एक", "के", "लिए", "वाला", "वाले"
  ]);

  const rawWords = text.replace(/[^a-zA-Z0-9\u0C00-\u0C7F\u0900-\u097F\s]/g, " ").split(/\s+/);
  for (const w of rawWords) {
    const cleanWord = w.toLowerCase().trim();
    if (cleanWord.length >= 3 && !stopWords.has(cleanWord) && !keywords.includes(cleanWord)) {
      keywords.push(cleanWord);
    }
  }

  // Extract Budget
  const { budgetMax, budgetMin } = extractBudget(text);

  return {
    intent,
    category,
    brand,
    budgetMax,
    budgetMin,
    requirements,
    keywords,
    language,
    confidence: 0.95,
    rawText: text,
  };
};
