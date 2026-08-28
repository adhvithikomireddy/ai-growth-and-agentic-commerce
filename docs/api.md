# Complete API Specification

## 1. Public & Agent-Readable Catalog APIs
- `GET /api/agent/catalog/capabilities`: Returns merchant capabilities, currencies, supported categories, and negotiation bounds.
- `POST /api/agent/catalog/search`: Deterministic search by query, category, min/max price, and stock status.
- `GET /api/agent/catalog/product/:id`: Fetch verified product specifications and stock.
- `GET /api/agent/catalog/trending`: Retrieve top products sorted by sales and view velocity.
- `GET /api/agent/catalog/related/:id`: Retrieve frequently co-purchased products.
- `GET /api/agent/catalog/compatible/:id`: Retrieve compatible accessories.

## 2. Authentication & Profile
- `POST /api/auth/signup`: Register user with role (`CUSTOMER` or `MERCHANT`).
- `POST /api/auth/login`: Authenticate and receive JWT.
- `GET /api/auth/me`: Fetch current user profile.
- `PUT /api/auth/preferences`: Update preferred language (`en`, `hi`, `te`).
- `PUT /api/auth/spending-controls`: Update autonomous limit, daily spend cap, and security PIN.

## 3. A2A Commerce & Buyer Agent
- `POST /api/a2a/chat`: Submit natural language query in English, Hindi, or Telugu.
- `POST /api/a2a/negotiate`: Submit bounded negotiation request.
- `GET /api/a2a/stream`: Server-Sent Events stream for live agent activity.
- `GET /api/a2a/messages`: Fetch historical A2A message log.

## 4. Cart & Checkout
- `GET /api/cart`: Fetch current cart with authoritative prices and discounts.
- `POST /api/cart/add`: Add item to cart with stock validation.
- `PUT /api/cart/item`: Update item quantity.
- `DELETE /api/cart/item/:productId`: Remove item from cart.
- `POST /api/cart/apply-offer`: Apply signed negotiated discount.

## 5. Payments (Razorpay Test Mode) & Orders
- `POST /api/payment/create-order`: Re-validate cart, evaluate spending policy, verify PIN, and create Razorpay test order.
- `POST /api/payment/verify-payment`: Server-side HMAC-SHA256 signature verification, stock decrement, and order finalization.
- `GET /api/orders/my-orders`: Retrieve customer order history.
- `GET /api/orders/:id`: Retrieve single order details.
- `GET /api/receipts/:orderId`: Retrieve authoritative receipt breakdown.

## 6. Merchant Revenue Intelligence
- `GET /api/merchant/analytics`: Executive dashboard KPIs (Revenue, AOV, AI revenue share, conversion rate).
- `GET /api/merchant/opportunities`: Retrieve AI-identified revenue opportunities.
- `POST /api/merchant/opportunities/:id/approve`: Approve opportunity and activate live campaign.
- `POST /api/merchant/opportunities/:id/dismiss`: Dismiss opportunity.
- `GET /api/merchant/campaigns`: List active promotional campaigns and generated revenue.
- `GET /api/merchant/audit-logs`: Chronological audit trail of agent actions and payment validations.
