# NexCommerce System Architecture

## Overview
NexCommerce is an AI-native agentic commerce platform. It makes merchants AI-readable and transactable while proactively helping merchants uncover revenue growth opportunities.

```
                      CUSTOMER
                         │
             Natural Language (EN / HI / TE)
                         ▼
                    BUYER AGENT
                         │
                 Structured A2A Messages
                         ▼
               A2A COMMUNICATION LAYER
              (Validation, Audit, SSE)
                         ▲
                 Structured A2A Responses
                         │
                   MERCHANT AGENT
                         │
              Authoritative Capabilities
                         ▼
               AI-READABLE CATALOG
          (Endpoints: capabilities, search,
           trending, related, compatible)
                         ▲
                         │ Analyzes Performance
                         │ & Generates Opportunities
                         │
             MERCHANT AI ORCHESTRATOR
                (Merchant-Private)
                         │
         ┌───────────────┴───────────────┐
         ▼                               ▼
   MERCHANT DASHBOARD            CAMPAIGN ORCHESTRATOR
(Analytics, Opportunities,       (Cross-sell, Upsell,
 Approve/Reject Actions)          Bundles, Discounts)
```

## Component Separation

### 1. Customer Experience & Buyer Agent
- **Natural Language Understanding**: Real multilingual comprehension (English, Hindi, Telugu).
- **Constraints Extractor**: Extracts categories, budget maximums, and usage requirements without forcing users through complex forms.
- **Explainability**: Formulates human-friendly explanations for every recommendation.
- **Negotiation**: Requests policy-bounded discounts from the Merchant Agent.

### 2. A2A Communication Layer
- **Logical Separation**: Distinct agent identities exchanging structured JSON packets (`A2APacket`).
- **Audit Logging**: Every packet is persisted in MongoDB (`A2AMessage`) with latency tracking.
- **Real-Time Visibility**: Broadcasts operational milestone events over Server-Sent Events (`/api/a2a/stream`).

### 3. Merchant Agent & AI-Readable Catalog
- Exposes machine-readable endpoints: `/api/agent/catalog/capabilities`, `/search`, `/product/:id`, `/trending`, `/related/:id`, `/compatible/:id`.
- Queries authoritative database data only. Zero hallucinated pricing or fake stock levels.
- Enforces store-level negotiation bounds (e.g. maximum 10% discount, minimum margins).

### 4. Merchant AI Orchestrator (Private Intelligence)
- Strictly isolated from customer view.
- Evaluates co-purchase patterns, cart drop-offs, and product demand velocity.
- Generates actionable `RevenueOpportunity` records (cross-sell, upsell, bundle promotions).
- Real `[Approve]` actions activate live `Campaign` documents in MongoDB, immediately reflecting in customer recommendations and cart banners.

### 5. AI Firewall & Payment Gateway (Razorpay Test Mode)
- **Spending Controls**: Enforces autonomous transaction limits and triggers 4-digit PIN verification for larger purchases.
- **Pre-Payment Revalidation**: Backend re-checks inventory, authoritative prices, and permissions immediately before creating the Razorpay order.
- **Server-Side Verification**: Computes HMAC-SHA256 signature against `razorpay_order_id|razorpay_payment_id` using `RAZORPAY_KEY_SECRET`.
