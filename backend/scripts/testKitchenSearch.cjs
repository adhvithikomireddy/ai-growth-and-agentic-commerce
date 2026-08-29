const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });

const { parseIntentDeterministic } = require("../dist/services/intentParser.js");
const { searchCatalog } = require("../dist/services/catalogService.js");

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB.");

  const queries = [
    "kitchen",
    "Digital air fryers and kitchen appliances",
    "Show me a digital air fryer for healthy baking and cooking under 10000",
    "air fryer"
  ];

  for (const q of queries) {
    console.log(`\n===========================================`);
    console.log(`Testing query: "${q}"`);
    const parsed = parseIntentDeterministic(q);
    console.log("Parsed Intent:", {
      intent: parsed.intent,
      category: parsed.category,
      brand: parsed.brand,
      keywords: parsed.keywords,
      budgetMax: parsed.budgetMax
    });

    const results = await searchCatalog({
      query: q,
      category: parsed.category,
      brand: parsed.brand,
      keywords: parsed.keywords,
      maxPrice: parsed.budgetMax,
      limit: 6
    });

    console.log(`Found ${results.products.length} products:`);
    results.products.forEach(p => {
      console.log(`- [${p.productId}] ${p.name} | Category: ${p.category} | ₹${p.price}`);
    });
  }

  await mongoose.disconnect();
}

test().catch(console.error);
