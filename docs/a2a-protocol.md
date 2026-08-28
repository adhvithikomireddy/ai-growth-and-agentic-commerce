# Agent-to-Agent (A2A) Communication Protocol

## Protocol Specification
The A2A layer facilitates structured communication between the Customer's **Buyer Agent** and the Merchant's **Merchant Agent**.

### Standard Packet Schema
```json
{
  "messageId": "msg_1724839201948",
  "requestId": "req_1724839201948_a8f2",
  "sender": "buyer-agent",
  "receiver": "merchant-agent",
  "timestamp": "2026-08-28T06:40:00.000Z",
  "messageType": "product_search",
  "payload": {
    "category": "Laptops",
    "maxPrice": 70000,
    "requirements": ["programming", "16GB RAM"],
    "limit": 6
  },
  "responsePayload": {
    "products": [...],
    "merchantId": "merch_apex_001",
    "verified": true
  },
  "status": "SUCCESS",
  "latencyMs": 42
}
```

### Supported Message Types
1. `product_search`: Query catalog with constraints (budget, specifications, category).
2. `price_verification`: Verify live price and stock for specific SKU.
3. `negotiate_offer`: Propose a discount request bounded by merchant policy.
4. `compatibility_check`: Retrieve verified compatible accessories and co-purchased items.
5. `order_intent`: Prepare order for policy engine evaluation.

### Real-Time Event Streaming
Connected clients receive live milestone events via Server-Sent Events (`GET /api/a2a/stream`):
- `UNDERSTAND_INTENT`
- `DISPATCH_A2A_SEARCH`
- `VERIFY_STOCK_AND_PRICE`
- `BOUNDED_OFFER_EVALUATED`
- `RECOMMENDATIONS_READY`
- `SPENDING_POLICY_EVALUATED`
- `RAZORPAY_ORDER_CREATED`
- `PAYMENT_CONFIRMED`
