const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });
const { searchCatalog } = require("../dist/services/catalogService.js");
const { parseIntentDeterministic } = require("../dist/services/intentParser.js");

async function testAffordableSearch() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);

  const testQueries = [
    "affordable",
    "affordable earphones",
    "under 1000",
    "cheap accessories under 500"
  ];

  for (const q of testQueries) {
    console.log(`\n===========================================`);
    console.log(`Testing Query: "${q}"`);
    const intent = parseIntentDeterministic(q);
    console.log(`Parsed Intent -> budgetMax: ${intent.budgetMax}, category: ${intent.category}, keywords: ${intent.keywords.join(", ")}`);
    const result = await searchCatalog({
      query: q,
      category: intent.category,
      brand: intent.brand,
      keywords: intent.keywords,
      maxPrice: intent.budgetMax,
      limit: 5
    });

    console.log(`Found ${result.products.length} products:`);
    result.products.forEach(p => console.log(`- [₹${p.price}] ${p.name} | Category: ${p.category}`));
  }

  await mongoose.disconnect();
}

testAffordableSearch().catch(console.error);
