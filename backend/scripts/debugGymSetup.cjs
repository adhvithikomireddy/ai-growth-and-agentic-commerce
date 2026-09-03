const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });
const { analyzeReverseShoppingGoal } = require("../dist/services/reverseShoppingService.js");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const res = await analyzeReverseShoppingGoal("gym setup");
  console.log("Goal Title:", res.goal);
  console.log("Is Unsatisfiable:", res.isUnsatisfiable);
  console.log("Strategies:");
  res.strategies.forEach(s => {
    console.log(`\n=== Strategy: ${s.title} ===`);
    s.pillars.forEach(p => console.log(`  Pillar: ${p.name} (${p.role}) -> [${p.product?.category}] ${p.product?.name}`));
  });

  await mongoose.disconnect();
}

run().catch(console.error);
