import { Product, IProduct } from "../models/Product.js";
import { Merchant } from "../models/Merchant.js";

export interface CatalogSearchParams {
  query?: string;
  category?: string;
  brand?: string;
  keywords?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  limit?: number;
  page?: number;
  sortBy?: "relevance" | "price_asc" | "price_desc" | "rating" | "trending";
}

const STOP_WORDS = new Set([
  "show", "me", "a", "an", "the", "for", "and", "with", "or", "in", "to", "at", "by", "from",
  "under", "below", "less", "than", "upto", "up", "about", "above", "more", "budget", "price",
  "need", "want", "find", "looking", "give", "please", "can", "you", "some", "any",
  "good", "best", "great", "top", "cheap", "affordable", "store", "buy", "purchase",
  "item", "items", "product", "products", "device", "devices", "thing", "things",
  "కావాలి", "చూపించు", "ఉన్న", "మంచి", "చాహియే", "దిఖావో", "అచ్చా"
]);

export const searchCatalog = async (params: CatalogSearchParams) => {
  const {
    query,
    category,
    brand,
    keywords = [],
    minPrice,
    maxPrice,
    inStockOnly = false,
    limit = 20,
    page = 1,
    sortBy = "relevance",
  } = params;

  const baseFilter: any = {};

  if (category && category !== "All") {
    baseFilter.category = new RegExp(`^${category}$`, "i");
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    baseFilter.price = {};
    if (minPrice !== undefined) baseFilter.price.$gte = minPrice;
    if (maxPrice !== undefined) baseFilter.price.$lte = maxPrice;
  }

  if (inStockOnly) {
    baseFilter.stock = { $gt: 0 };
  }

  // Collect clean search terms without conversational stop words or numeric bounds
  const candidateTerms: string[] = [...keywords];
  if (brand && !candidateTerms.includes(brand.toLowerCase())) {
    candidateTerms.push(brand.toLowerCase());
  }

  if (query && query.trim()) {
    const rawTokens = query.trim().toLowerCase().split(/[^\w\u0C00-\u0C7F\u0900-\u097F]+/).filter(Boolean);
    for (const token of rawTokens) {
      if (token.length >= 2 && !STOP_WORDS.has(token) && !/^\d+$/.test(token)) {
        if (!candidateTerms.includes(token)) {
          candidateTerms.push(token);
        }
      }
    }
  }

  let matchedProducts: any[] = [];

  if (candidateTerms.length > 0) {
    const termOrFilters = candidateTerms.map(term => ({
      $or: [
        { name: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { tags: { $in: [new RegExp(term, "i")] } },
        { "specifications.Brand": { $regex: term, $options: "i" } },
      ]
    }));

    const searchFilter = {
      ...baseFilter,
      $or: termOrFilters.flatMap(f => f.$or),
    };

    matchedProducts = await Product.find(searchFilter).limit(100);
  }

  // Fallback: If no term matches found or empty search terms, retrieve from baseFilter
  if (matchedProducts.length === 0) {
    matchedProducts = await Product.find(baseFilter).sort({ rating: -1, salesCount: -1 }).limit(limit * 3);
  }

  // High-precision relevance scoring
  const qLower = (query || "").toLowerCase();
  const scored = matchedProducts.map((p) => {
    const pName = p.name.toLowerCase();
    const pTags = (p.tags || []).map((t: string) => t.toLowerCase());
    const pDesc = (p.description || "").toLowerCase();
    let score = 0;

    // Full query match in name (highest confidence)
    if (qLower && pName.includes(qLower)) {
      score += 150;
    }

    // Direct brand match
    if (brand && pName.includes(brand.toLowerCase())) {
      score += 60;
    }

    // Individual term hits
    for (const term of candidateTerms) {
      if (pName.includes(term)) score += 35;
      if (pTags.some((t: string) => t.includes(term))) score += 20;
      if (pDesc.includes(term)) score += 10;
    }

    // Price within budget bonus
    if (maxPrice && p.price <= maxPrice) {
      score += 25;
    }

    // Rating & sales as tie breakers
    score += (p.rating || 0) * 3;
    score += Math.min(20, (p.salesCount || 0) / 40);

    return { product: p, score };
  });

  scored.sort((a, b) => b.score - a.score);

  // Deduplicate products so different models are presented with high diversity
  const seenBaseNames = new Set<string>();
  const diverseProducts: any[] = [];

  for (const item of scored) {
    const baseName = item.product.name.replace(/\s*\([^)]*\)/g, "").trim().toLowerCase();
    if (!seenBaseNames.has(baseName)) {
      seenBaseNames.add(baseName);
      diverseProducts.push(item.product);
    }
    if (diverseProducts.length >= limit) break;
  }

  // If diversity filter is smaller than limit, fill remaining slots
  if (diverseProducts.length < limit) {
    for (const item of scored) {
      if (!diverseProducts.some(p => p.productId === item.product.productId)) {
        diverseProducts.push(item.product);
      }
      if (diverseProducts.length >= limit) break;
    }
  }

  const products = diverseProducts;
  const total = products.length;

  return {
    products,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (productId: string) => {
  const product = await Product.findOne({ productId });
  if (product) {
    Product.updateOne({ productId }, { $inc: { viewCount: 1 } }).exec();
  }
  return product;
};

export const getTrendingProducts = async (limit: number = 8) => {
  return await Product.find({ stock: { $gt: 0 } })
    .sort({ salesCount: -1, viewCount: -1, rating: -1 })
    .limit(limit);
};

export const getRelatedProducts = async (productId: string) => {
  const product = await Product.findOne({ productId });
  if (!product) return [];

  const relatedIds = [
    ...(product.frequentlyBoughtTogetherIds || []),
    ...(product.upsellProductIds || []),
  ];

  if (relatedIds.length > 0) {
    return await Product.find({ productId: { $in: relatedIds }, stock: { $gt: 0 } }).limit(4);
  }

  return await Product.find({
    category: product.category,
    productId: { $ne: productId },
    stock: { $gt: 0 },
  }).limit(4);
};

export const getCompatibleProducts = async (productId: string) => {
  const product = await Product.findOne({ productId });
  if (!product) return [];

  if (product.compatibleProductIds && product.compatibleProductIds.length > 0) {
    return await Product.find({
      productId: { $in: product.compatibleProductIds },
      stock: { $gt: 0 },
    });
  }

  return await Product.find({
    category: "Accessories",
    stock: { $gt: 0 },
  }).limit(3);
};

export const getCatalogCapabilities = async () => {
  const merchant = await Merchant.findOne({ merchantId: "merch_apex_001" });
  const categories = await Product.distinct("category");

  return {
    merchantId: "merch_apex_001",
    businessName: merchant?.businessName || "Apex Nova Lifestyle & Tech",
    supportedCurrencies: ["INR"],
    categories,
    aiProtocolsSupported: ["A2A-Commerce-v1.0", "UAP-Compatible", "ACP-Ready"],
    negotiationSupported: true,
    maxAutonomousDiscountPercent: merchant?.negotiationPolicy?.maxDiscountPercent || 10,
    spendingLimitsSupported: true,
    activeCampaignsCount: 3,
  };
};
