import { Product, IProduct } from "../models/Product.js";
import { Merchant } from "../models/Merchant.js";

export interface CatalogSearchParams {
  query?: string;
  category?: string;
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

  if (query && query.trim()) {
    const q = query.trim();
    filter.$or = [
      { name: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { tags: { $in: [new RegExp(q, "i")] } },
      { category: { $regex: q, $options: "i" } },
    ];
  }

  let sortCriteria: any = { createdAt: -1 };
  if (sortBy === "price_asc") sortCriteria = { price: 1 };
  else if (sortBy === "price_desc") sortCriteria = { price: -1 };
  else if (sortBy === "rating") sortCriteria = { rating: -1 };
  else if (sortBy === "trending") sortCriteria = { salesCount: -1, viewCount: -1 };

  const skip = (page - 1) * limit;
  const [products, total] = await Promise.all([
    Product.find(filter).sort(sortCriteria).skip(skip).limit(limit),
    Product.countDocuments(filter),
  ]);

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
    // Increment viewCount asynchronously for trending analysis
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
    const specificRelated = await Product.find({ productId: { $in: relatedIds } });
    if (specificRelated.length > 0) return specificRelated;
  }

  // Fallback to same category
  return await Product.find({
    category: product.category,
    productId: { $ne: productId },
  }).limit(4);
};

export const getCompatibleProducts = async (productId: string) => {
  const product = await Product.findOne({ productId });
  if (!product) return [];

  if (product.compatibleProductIds && product.compatibleProductIds.length > 0) {
    return await Product.find({ productId: { $in: product.compatibleProductIds } });
  }

  // Fallback to Accessories
  return await Product.find({
    category: "Accessories",
    productId: { $ne: productId },
  }).limit(4);
};

export const getCatalogCapabilities = async () => {
  const [categories, merchant] = await Promise.all([
    Product.distinct("category"),
    Merchant.findOne({ merchantId: "merch_apex_001" }),
  ]);

  return {
    merchantId: merchant?.merchantId || "merch_apex_001",
    businessName: merchant?.businessName || "Apex Nova Lifestyle & Tech",
    currency: merchant?.currency || "INR",
    negotiationSupported: merchant?.negotiationPolicy?.allowNegotiation ?? true,
    maxNegotiationDiscountPercent: merchant?.negotiationPolicy?.maxDiscountPercent ?? 10,
    supportedCategories: categories,
    capabilities: [
      "real_time_stock_check",
      "authoritative_price_check",
      "bounded_negotiation",
      "upsell_recommendations",
      "cross_sell_accessories",
      "bundle_discovery",
    ],
    agentProtocolVersion: "2.0-razorpay-a2a",
  };
};
