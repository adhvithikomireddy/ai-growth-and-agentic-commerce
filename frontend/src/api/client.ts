const API_BASE = import.meta.env.VITE_API_URL || "";

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response) => {
  const json = await res.json();
  if (!res.ok || json.success === false) {
    const errorMsg = json?.error?.message || `Request failed with status ${res.status}`;
    const err = new Error(errorMsg);
    (err as any).code = json?.error?.code;
    (err as any).data = json?.data;
    throw err;
  }
  return json.data;
};

export const api = {
  // Health
  checkHealth: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return await res.json();
  },

  // Auth
  signup: async (data: any) => {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  login: async (credentials: any) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  updatePreferences: async (language: "en" | "hi" | "te") => {
    const res = await fetch(`${API_BASE}/api/auth/preferences`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ language }),
    });
    return handleResponse(res);
  },

  updateSpendingControls: async (data: any) => {
    const res = await fetch(`${API_BASE}/api/auth/spending-controls`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Catalog
  getProducts: async (params?: Record<string, any>) => {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/api/catalog/products?${query}`);
    return handleResponse(res);
  },

  getProductById: async (id: string) => {
    const res = await fetch(`${API_BASE}/api/catalog/products/${id}`);
    return handleResponse(res);
  },

  getCategories: async () => {
    const res = await fetch(`${API_BASE}/api/catalog/categories`);
    return handleResponse(res);
  },

  getTrending: async (limit: number = 8) => {
    const res = await fetch(`${API_BASE}/api/catalog/trending?limit=${limit}`);
    return handleResponse(res);
  },

  // A2A Commerce & Buyer Agent
  chatWithBuyerAgent: async (query: string, language: "en" | "hi" | "te", context?: any) => {
    const res = await fetch(`${API_BASE}/api/a2a/chat`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ query, language, context }),
    });
    return handleResponse(res);
  },

  negotiatePrice: async (productId: string, requestedDiscountPercent: number = 10) => {
    const res = await fetch(`${API_BASE}/api/a2a/negotiate`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, requestedDiscountPercent }),
    });
    return handleResponse(res);
  },

  getA2AMessages: async () => {
    const res = await fetch(`${API_BASE}/api/a2a/messages`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  // Cart
  getCart: async () => {
    const res = await fetch(`${API_BASE}/api/cart`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  addToCart: async (productId: string, quantity: number = 1, discountPercent: number = 0) => {
    const res = await fetch(`${API_BASE}/api/cart/add`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, quantity, discountPercent }),
    });
    return handleResponse(res);
  },

  updateCartItem: async (productId: string, quantity: number) => {
    const res = await fetch(`${API_BASE}/api/cart/item`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, quantity }),
    });
    return handleResponse(res);
  },

  removeCartItem: async (productId: string) => {
    const res = await fetch(`${API_BASE}/api/cart/item/${productId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  applyOffer: async (productId: string, discountPercent: number, offerToken?: string) => {
    const res = await fetch(`${API_BASE}/api/cart/apply-offer`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ productId, discountPercent, offerToken }),
    });
    return handleResponse(res);
  },

  // Payments (Razorpay Test Mode)
  createRazorpayOrder: async (transactionPin?: string, shippingAddress?: any) => {
    const res = await fetch(`${API_BASE}/api/payment/create-order`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ transactionPin, shippingAddress }),
    });
    return handleResponse(res);
  },

  verifyPayment: async (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
  }) => {
    const res = await fetch(`${API_BASE}/api/payment/verify-payment`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Orders & Receipts
  getMyOrders: async () => {
    const res = await fetch(`${API_BASE}/api/orders/my-orders`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getOrderById: async (id: string) => {
    const res = await fetch(`${API_BASE}/api/orders/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getReceipt: async (orderId: string) => {
    const res = await fetch(`${API_BASE}/api/receipts/${orderId}`);
    return handleResponse(res);
  },

  // Merchant Intelligence
  getMerchantAnalytics: async () => {
    const res = await fetch(`${API_BASE}/api/merchant/analytics`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getMerchantOpportunities: async () => {
    const res = await fetch(`${API_BASE}/api/merchant/opportunities`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  approveOpportunity: async (id: string) => {
    const res = await fetch(`${API_BASE}/api/merchant/opportunities/${id}/approve`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  dismissOpportunity: async (id: string) => {
    const res = await fetch(`${API_BASE}/api/merchant/opportunities/${id}/dismiss`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getMerchantCampaigns: async () => {
    const res = await fetch(`${API_BASE}/api/merchant/campaigns`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getMerchantAuditLogs: async () => {
    const res = await fetch(`${API_BASE}/api/merchant/audit-logs`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  refreshMerchantIntelligence: async () => {
    const res = await fetch(`${API_BASE}/api/merchant/refresh-intelligence`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};
