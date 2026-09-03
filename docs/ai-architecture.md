# AI & Natural Language Architecture

## Dual Intent Engine
NexCommerce is engineered with a **Dual Intent Engine** to guarantee 100% availability, zero hallucinated financial metrics, and full multilingual support across English, Hindi, and Telugu.

```
Incoming Prompt (English / Hindi / Telugu)
    │
    ▼
Intent & Language Detector
    │
    ├── 1. LLM Engine (Google Gemini / OpenAI):
    │      Generates contextual conversational summaries, multilingual
    │      recommendation justifications, and drafts order confirmation messages.
    │
    └── 2. Deterministic Fallback Engine (Native):
           High-precision keyword, regex, and Unicode-range parser that extracts
           intent, categories, and budget constraints directly without external API keys.
```

## Multilingual Support Examples
- **Telugu (తెలుగు)**:
  - Input: *"నాకు ₹30000 లోపు మంచి కెమెరా ఉన్న ఫోన్ కావాలి"*
  - Extracted: `category = Phones`, `budgetMax = 30000`, `requirements = ["good camera"]`
  - Output: Conversational response in Telugu with authoritative product cards.
- **Hindi (हिन्दी)**:
  - Input: *"मुझे ₹30,000 के अंदर अच्छा कैमरा वाला फोन चाहिए"*
  - Extracted: `category = Phones`, `budgetMax = 30000`, `requirements = ["good camera"]`
  - Output: Conversational response in Hindi with authoritative product cards.
- **English**:
  - Input: *"I need a laptop under ₹70,000 for programming"*
  - Extracted: `category = Laptops`, `budgetMax = 70000`, `requirements = ["programming"]`
  - Output: Lenovo IdeaPad Slim 5 / ThinkPad E14 with developer justifications.

---

## Reverse Shopping (Goal-First Autonomous Decomposition)

Unlike keyword search which assumes the user knows the product model, **Reverse Shopping** accepts a high-level outcome or life goal and synthesizes a complete, multi-tier product solution:

```
Goal Input: "I want to create a comfortable study setup for under ₹15,000"
   │
   ▼
1. Goal Archetype & Requirement Decomposition:
   - Pillar 1: Core Computing & Note Taking (Laptops / Tablets / Phones)
   - Pillar 2: Ergonomic Desk Comfort (Chairs / Memory Foam Pads / Stands)
   - Pillar 3: Focus Audio & Lighting (Noise-isolating Earphones / Smart Task Lighting)
   │
   ▼
2. Multi-Tier Strategy Generation:
   - Budget Setup: Maximizes savings while fulfilling 100% of functional requirements.
   - Balanced Setup: Optimal blend of user ratings (★), balanced hardware specs, and price.
   - Premium Setup: Flagship durability and highest-tier components.
   │
   ▼
3. Deterministic Rationale & Deficit Calculation:
   - Cites concrete hardware specifications (battery life, noise cancellation, RAM, display).
   - Computes live Total Price, Budget Cap, and Savings / Over-budget warning.
   - Enables interactive component replacement via Alternatives Drawer.
```
