const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });
const { refreshMerchantIntelligence } = require("../dist/services/merchantOrchestrator.js");

async function testRefresh() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri);

  console.log("Testing refreshMerchantIntelligence on MongoDB...");
  const res = await refreshMerchantIntelligence("merch_apex_001");
  console.log(`\nGenerated ${res.opportunities.length} AI Opportunities:`);
  res.opportunities.forEach(o => {
    console.log(`\n[${o.type.toUpperCase()}] ${o.title}`);
    console.log(`  Discount: ${o.suggestedDiscount}% | Impact: ₹${o.estimatedRevenueImpact.toLocaleString("en-IN")} | Confidence: ${o.confidenceScore}`);
    console.log(`  Observation: ${o.observation}`);
    console.log(`  Action: ${o.suggestedAction}`);
  });

  console.log("\nMetrics Summary:", res.analytics.metrics);
  await mongoose.disconnect();
}

testRefresh().catch(console.error);
