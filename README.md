# NexCommerce: AI Growth & Agentic Commerce Platform
> Built for the **Razorpay Buildathon — Track 01: AI Growth & Agentic Commerce**
> *"Grow the merchant's revenue, and make them sellable to AI buyers."*

---

## 1. Executive Summary & Problem Statement

Traditional e-commerce forces customers through rigid filters, categories, and keyword searches, while merchants struggle to convert interest into larger basket sizes without expensive external ads. At the same time, the emergence of AI agent ecosystems requires merchants to expose machine-readable commerce capabilities so external AI buyer agents can discover, verify, negotiate, and transact directly with merchant systems.

**NexCommerce** bridges this divide with an end-to-end, full-stack agentic commerce platform:
1. **Making Merchants AI-Readable & Sellable**: Exposing structured, authoritative AI-readable catalog capabilities (`/api/agent/catalog/*`) with real-time stock verification and policy-bounded negotiation.
2. **Growing Merchant Revenue Proactively**: A private **Merchant AI Orchestrator** continuously analyzes co-purchase patterns and cart drop-offs, surfacing high-impact revenue opportunities (cross-sells, upsells, and bundles) that merchants can approve with a single click to activate live promotions.
3. **Frictionless Multilingual Commerce**: Customers shop naturally in **English**, **हिन्दी (Hindi)**, and **తెలుగు (Telugu)** without having to understand APIs, agent protocols, or complex filters.
4. **Deterministic Security & Authoritative Money Actions**: An AI Firewall and Spending Policy Engine enforce human-in-the-loop authorization thresholds, re-validating authoritative database pricing before initiating **Razorpay TEST MODE** payments with server-side HMAC-SHA256 signature verification.

---

## 2. Core Architecture & System Diagram

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

---

## 3. Key Feature Highlights

### A. Real Logical Separation in Agent-to-Agent (A2A) Commerce
- **Buyer Agent**: Represents the customer. Interprets natural-language intent, queries the catalog, negotiates discounts, justifies recommendations, and prepares the transaction.
- **Merchant Agent**: Represents the store. Verifies live stock and authoritative price bounds, proposes policy-compliant offers, and checks compatibility.
- **A2A Protocol**: Typed JSON communication packets (`A2APacket`) persisted in MongoDB and streamed in real-time to the UI via Server-Sent Events (`/api/a2a/stream`).

### B. AI-Readable Catalog
- Structured machine-readable endpoints:
  - `GET /api/agent/catalog/capabilities`
  - `POST /api/agent/catalog/search`
  - `GET /api/agent/catalog/product/:id`
  - `GET /api/agent/catalog/trending`
  - `GET /api/agent/catalog/related/:id`
  - `GET /api/agent/catalog/compatible/:id`
- Authoritative backend pricing and inventory from MongoDB Atlas. Zero AI hallucination.

### C. Private Merchant AI Orchestrator & Revenue Engine
- Continuously analyzes sales velocity, views, and co-purchases to generate revenue opportunities:
  - **Cross-sell**: Suggests high-converting accessories (e.g. ThinkPad Laptop $\rightarrow$ Logitech MX Master 3S).
  - **Upsell**: Identifies upgrade value propositions (e.g. IdeaPad $\rightarrow$ 8-core ThinkPad E14).
  - **Bundles**: Suggests combo packages (e.g. Drawing Tablet + 72-pc Art Set for under ₹5,000).
- Interactive **`[Approve]`** buttons dynamically create live `Campaign` records in MongoDB and link catalog relationships.
- Measurable metrics: Gross Revenue, Average Order Value (AOV), AI-Assisted Revenue Share %, and Store Conversion Rate.

### D. Multilingual Natural-Language Commerce
- Native support for **English**, **हिन्दी (Hindi)**, and **తెలుగు (Telugu)** with instant language switching.
- Handles prompts like:
  - *"నాకు ₹70,000 లోపు ప్రోగ్రామింగ్ కోసం లాప్‌టాప్ కావాలి"*
  - *"मुझे ₹30,000 के अंदर अच्छा कैमरा वाला फोन चाहिए"*
  - *"Show me what is trending right now"*
  - *"Can you get me a better price?"*

### E. AI Firewall, Spending Controls & Razorpay TEST MODE
- **Customer Spending Controls**: Configurable autonomous limit (e.g. ₹2,000). Purchases exceeding this limit require 4-digit security PIN authorization in the AI Action Preview modal.
- **Pre-Payment Revalidation**: Backend re-checks stock and calculates the exact final total in paise directly from MongoDB before calling Razorpay.
- **Server-Side Verification**: Computes HMAC-SHA256 signature against `razorpay_order_id|razorpay_payment_id` using `RAZORPAY_KEY_SECRET`.
- **Authoritative Receipts**: Printable and downloadable receipts with merchant GSTIN, itemized rows, and transaction IDs.
- **Multilingual Messaging**: Drafts order and payment confirmation notifications in customer's preferred language (DRAFT separated from SEND).

---

## 4. Visual Design System

- **Semi-White + Green Palette**:
  - Background: Warm off-white (`#F7F8F4`)
  - Surfaces: Clean white cards with subtle borders (`#E2E8F0`)
  - Primary Accent: Deep Forest Green (`#166534`)
  - Secondary Accent: Soft Green (`#DCFCE7`)
  - Typography: Dark Charcoal (`#172018`) with Muted Slate secondary text (`#667067`)
- **Aesthetic**: Premium commerce, modern fintech, and minimal AI. Strictly avoiding neon blobs, floating robots, or purple gradient cliches.

---

## 5. Local Setup & Quick Start

### Prerequisites
- Node.js v20+ and npm v10+
- MongoDB Atlas cluster connection string
- Razorpay TEST MODE Key ID & Secret

### Step 1: Clone and Configure Environment Variables
```bash
# Copy template
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env`:
```ini
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ai_agentic_commerce?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_32_characters
RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
RAZORPAY_KEY_SECRET=YourRazorpaySecretHere
GEMINI_API_KEY=your_gemini_api_key_here  # Optional: Fallback engine active
```

Edit `frontend/.env`:
```ini
VITE_API_URL=http://localhost:5000
VITE_RAZORPAY_KEY_ID=rzp_test_YourKeyIdHere
```

### Step 2: Install Dependencies & Run Automated Tests
```bash
# Install root, backend, and frontend dependencies
npm install

# Run automated tests (Multilingual, Policy Engine, HMAC Verification)
npm test
```

### Step 3: Seed Realistic Catalog (Idempotent)
```bash
npm run seed
```

### Step 4: Start Development Servers
```bash
# In Terminal 1: Backend
npm run dev:backend

# In Terminal 2: Frontend
npm run dev:frontend
```
Open your browser at **`http://localhost:5173`**.

---

## 6. Demo Accounts & Credentials

| Role | Email | Password | Default PIN | Notes |
| :--- | :--- | :--- | :--- | :--- |
| **Demo Customer** | `customer@gmail.com` | `password123` | `1234` | Autonomous Limit: ₹2,000 |
| **Demo Merchant** | `merchant@apexnova.store` | `password123` | `1234` | Full access to Merchant Operations |

---

## 7. Production Deployment Guidance
Refer to [`docs/deployment.md`](./docs/deployment.md) for complete step-by-step instructions for deploying to Vercel and Render/Railway.
