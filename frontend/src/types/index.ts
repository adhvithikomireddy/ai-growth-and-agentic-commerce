export interface User {
  id: string;
  email: string;
  name: string;
  role: "CUSTOMER" | "MERCHANT" | "ADMIN";
  merchantId?: string;
  language: "en" | "hi" | "te";
  spendingControls: {
    autonomousLimit: number;
    requirePinAbove: number;
    maxDailySpend: number;
    hasPinSet: boolean;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface Product {
  _id?: string;
  productId: string;
  merchantId: string;
  sku: string;
  name: string;
  category: string;
  subcategory?: string;
  description: string;
  price: number;
  currency: string;
  stock: number;
  availability: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  rating: number;
  reviewCount: number;
  specifications: Record<string, string>;
  tags: string[];
  discountPercent: number;
  imageUrl: string;
  compatibleProductIds: string[];
  frequentlyBoughtTogetherIds: string[];
  upsellProductIds: string[];
  alternativeProductIds: string[];
  viewCount: number;
  salesCount: number;
  recommendationReason?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  effectivePrice?: number;
  quantity: number;
  discountApplied: number;
  imageUrl: string;
  stock?: number;
  inStock?: boolean;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  discountTotal: number;
  finalAmount: number;
  negotiatedDiscountPercent?: number;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  discount: number;
  imageUrl: string;
}

export interface Order {
  _id?: string;
  orderId: string;
  userId: string;
  merchantId: string;
  items: OrderItem[];
  subtotal: number;
  discountTotal: number;
  tax: number;
  finalAmount: number;
  currency: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED";
  orderStatus: "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  authorizationMetadata?: {
    authorizedAt: string;
    authorizationMethod: "AUTONOMOUS_LIMIT" | "EXPLICIT_PIN" | "PASSWORD";
    actor: string;
  };
  aiAssisted: boolean;
  createdAt: string;
}

export interface A2AActivityEvent {
  id: string;
  timestamp: string;
  requestId: string;
  agent: "Buyer Agent" | "Merchant Agent" | "Policy Engine" | "AI Firewall";
  action: string;
  description: string;
  status: "completed" | "in_progress" | "verified" | "flagged";
  details?: Record<string, any>;
}

export interface BuyerAgentResponse {
  requestId: string;
  parsedIntent: {
    intent: string;
    category?: string;
    budgetMax?: number;
    requirements: string[];
    language: "en" | "hi" | "te";
  };
  message: string;
  products: Product[];
  recommendations: Array<{ productId: string; reason: string }>;
  crossSellAccessories: Product[];
  suggestedAction?: string;
  negotiationOffer?: any;
}

export interface RevenueOpportunity {
  _id?: string;
  opportunityId: string;
  merchantId: string;
  type: "cross_sell" | "upsell" | "bundle" | "trending_promotion" | "low_conversion" | "inventory_alert";
  title: string;
  description: string;
  observation: string;
  suggestedAction: string;
  primaryProductId: string;
  relatedProductIds: string[];
  suggestedDiscount: number;
  estimatedRevenueImpact: number;
  confidenceScore: number;
  status: "PENDING" | "APPROVED" | "DISMISSED";
  createdAt: string;
}

export interface Campaign {
  campaignId: string;
  merchantId: string;
  name: string;
  type: string;
  discountPercent: number;
  affectedProductIds: string[];
  isActive: boolean;
  metrics: {
    impressions: number;
    clicks: number;
    conversions: number;
    revenueGenerated: number;
  };
  createdAt: string;
}

export interface AuditLog {
  logId: string;
  timestamp: string;
  actor: string;
  agent: string;
  action: string;
  requestId: string;
  orderId?: string;
  amount?: number;
  policyResult: string;
  authorizationResult: string;
  paymentResult?: string;
  status: string;
  reason?: string;
}
