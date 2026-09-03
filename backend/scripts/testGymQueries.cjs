const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });
const { analyzeReverseShoppingGoal } = require("../dist/services/reverseShoppingService.js");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const queries = [
    "gym setup",
    "I want to start working out at home",
    "gym",
    "home gym",
    "i want to build a gym setup",
    "fitness setup",
    "gym setup under 20000",
    "i need gym items",
    "heavy weights gym setup"
  ];

  for (const q of queries) {
    const res = await analyzeReverseShoppingGoal(q);
    console.log(`\nQuery: "${q}"`);
    console.log(`  Archetype Title: ${res.goal}`);
    console.log(`  Unsatisfiable: ${res.isUnsatisfiable} (${res.unsatisfiableReason || "N/A"})`);
    if (res.strategies.length > 0) {
      console.log(`  Balanced Items:`, res.strategies[1]?.pillars.map(p => `[${p.product?.category}] ${p.product?.name}`));
    }
  }

  await mongoose.disconnect();
}

run().catch(console.error);
