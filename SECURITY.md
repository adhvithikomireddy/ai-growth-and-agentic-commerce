# Security Policy

## Supported Versions

| Version | Supported          |
| :------ | :----------------- |
| 1.0.x   | :white_check_mark: |

---

## Reporting a Vulnerability

We take the security and integrity of the **NexCommerce Autonomous Multi-Agent Commerce Platform** seriously.

If you believe you have discovered a security vulnerability in this project, please **do not open a public GitHub issue**. Instead, follow these steps:

1. **Email us**: Send an email to `security@nexcommerce.io` or reach out directly to the repository maintainer.
2. **Include details**:
   - Description of the vulnerability and its potential impact.
   - Step-by-step instructions or proof-of-concept (PoC) to reproduce the issue.
   - Any proposed mitigations or code patches.
3. **Response timeline**:
   - We will acknowledge receipt of your vulnerability report within **48 hours**.
   - We will provide a status update or patch timeline within **7 business days**.

---

## Core Security & Cryptographic Safeguards

NexCommerce adheres strictly to financial data privacy, agent containment, and payment security standards:

1. **HMAC-SHA256 Payment Verification**:
   - All Razorpay checkout completions require authoritative server-side cryptographic signature calculation (`crypto.createHmac("sha256", secret)` against `order_id|payment_id`).
2. **AI Action Containment & Spending Policy Engine**:
   - AI agents are strictly prohibited from directly calling financial capture endpoints.
   - Purchases exceeding the user's autonomous threshold (e.g., ₹2,000) require mandatory human-in-the-loop authorization with 4-digit PIN verification or 3D biometric face verification.
3. **Zero-Card Retention & DPDP Act 2023 Compliance**:
   - Raw payment credentials, credit card PANs, and bank account numbers are never retained or logged in backend databases.
   - UPI Virtual Payment Addresses (VPAs) are masked (`****@okhdfcbank`) before transmission to merchant analytics.
4. **Helmet & Rate Limiting**:
   - HTTP response headers are hardened via `helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } })`.
   - IP rate limiting is enforced on all API endpoints via `express-rate-limit`.
