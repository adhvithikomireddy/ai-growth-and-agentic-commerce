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

  const filter: any = {};

  if (category && category !== "All") {
    filter.category = new RegExp(`^${category}$`, "i");
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = minPrice;
    if (maxPrice !== undefined) filter.price.$lte = maxPrice;
  }

  if (inStockOnly) {
    filter.stock = { $gt: 0 };
  }

  // Collect search terms from query and keywords
  const searchTerms: string[] = [...keywords];
  if (brand && !searchTerms.includes(brand.toLowerCase())) {
    searchTerms.push(brand.toLowerCase());
  }

  if (query && query.trim()) {
    const rawTokens = query.trim().split(/\s+/).map(t => t.toLowerCase());
    for (const token of rawTokens) {
      if (token.length >= 3 && !searchTerms.includes(token)) {
        searchTerms.push(token);
      }
    }
  }

  // If search terms exist, filter with $or regex across fields
  if (searchTerms.length > 0) {
    const orConditions = searchTerms.map(term => ({
      $or: [
        { name: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
        { tags: { $in: [new RegExp(term, "i")] } },
        { "specifications.Brand": { $regex: term, $options: "i" } },
      ]
    }));
    filter.$and = orConditions.map(c => ({ $or: c.$or }));
  }

  let sortCriteria: any = { createdAt: -1 };
  if (sortBy === "price_asc") sortCriteria = { price: 1 };
  else if (sortBy === "price_desc") sortCriteria = { price: -1 };
  else if (sortBy === "rating") sortCriteria = { rating: -1 };
  else if (sortBy === "trending") sortCriteria = { salesCount: -1, viewCount: -1 };
  else if (sortBy === "relevance") sortCriteria = { rating: -1, salesCount: -1 };

  const skip = (page - 1) * limit;
  let [products, total] = await Promise.all([
    Product.find(filter).sort(sortCriteria).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

  // Fallback: If strict AND returned 0 results, retry with looser OR matching
  if (products.length === 0 && searchTerms.length > 0) {
    delete filter.$and;
    filter.$or = searchTerms.map(term => ({ name: { $regex: term, $options: "i" } }));
    
    [products, total] = await Promise.all([
      Product.find(filter).sort(sortCriteria).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);
  }

  // Final fallback: Return top rated products in category or catalog if still 0
  if (products.length === 0) {
    const fallbackFilter: any = { stock: { $gt: 0 } };
    if (category && category !== "All") fallbackFilter.category = new RegExp(`^${category}$`, "i");
    products = await Product.find(fallbackFilter).sort({ rating: -1 }).limit(limit);
    total = products.length;
  }

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
