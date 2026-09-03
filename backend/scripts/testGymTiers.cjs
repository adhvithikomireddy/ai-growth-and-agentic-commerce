const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });
const { analyzeReverseShoppingGoal } = require("../dist/services/reverseShoppingService.js");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const res = await analyzeReverseShoppingGoal("gym setup under 15000");
  console.log("Goal:", res.goal);
  res.strategies.forEach(s => {
    console.log(`\n=== Strategy: ${s.strategy.toUpperCase()} (${s.title}) - Total: ₹${s.totalPrice} ===`);
    s.pillars.forEach(p => {
      console.log(`  • ${p.name}: ₹${p.product?.price} - [${p.product?.category}] ${p.product?.name}`);
      console.log(`    Why: ${p.reason}`);
    });
  });

  await mongoose.disconnect();
}

run().catch(console.error);
