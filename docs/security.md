# Security & AI Firewall Architecture

## 1. AI Firewall & Action Gateway
The application strictly enforces that the LLM or AI agent cannot directly perform financial mutations or bypass permissions.

```
LLM Proposal
    ↓
Schema Validation (Zod & Typed Interfaces)
    ↓
Permission & Role Check (requireAuth, requireRole)
    ↓
Policy Engine (Autonomous Limit vs Explicit PIN)
    ↓
Authoritative Database Revalidation (Live Stock & Price from MongoDB)
    ↓
Human Authorization (PIN / Action Preview Modal)
    ↓
Cryptographic Razorpay HMAC-SHA256 Signature Verification
    ↓
Atomic Stock Decrement & Order Finalization
```

## 2. Server-Side Payment Signature Verification
Client-side reports of payment success are never trusted. Immediately upon Razorpay checkout completion, the backend cryptographically validates:

$$\text{Expected Signature} = \text{HMAC-SHA256}(\text{razorpay\_order\_id} + "|" + \text{razorpay\_payment\_id}, \text{RAZORPAY\_KEY\_SECRET})$$

Verification is performed using `crypto.timingSafeEqual` to prevent timing attacks. Only matching signatures trigger stock decrement and order creation.

## 3. Customer Spending Controls
Customers can configure their personal spending controls:
- **Autonomous Purchase Limit**: Orders below this limit (e.g. ₹2,000) can be placed without secondary friction.
- **PIN Authorization**: Orders exceeding the limit require the customer to enter their 4-digit security PIN.
- **Daily Spend Cap**: Cumulative daily spend is tracked and transactions exceeding the cap are blocked server-side.
- PINs are hashed using `bcrypt` (10 rounds) and never exposed to the LLM or logged.

## 4. Role-Based Access Control (RBAC)
- `CUSTOMER`: Access restricted to own orders, cart, profile, and spending settings.
- `MERCHANT`: Access restricted to own merchant inventory, store analytics, and AI revenue opportunities.
- Strict server-side enforcement via Express middleware (`requireRole`).
