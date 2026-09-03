const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });
const { analyzeReverseShoppingGoal, refineReverseShoppingSolution } = require("../dist/services/reverseShoppingService.js");

async function runTests() {
  await mongoose.connect(process.env.MONGODB_URI);

  console.log("=== TEST 1: Goal with Budget ===");
  const res1 = await analyzeReverseShoppingGoal("I want to create a comfortable study setup for under ₹15,000.");
  console.log("Goal:", res1.goal);
  console.log("Extracted Budget:", res1.extractedBudget);
  console.log("Strategies Count:", res1.strategies.length);
  res1.strategies.forEach(s => {
    console.log(`- [${s.strategy.toUpperCase()}] ${s.title}: ₹${s.totalPrice.toLocaleString("en-IN")} | Budget: ₹${s.budget} | Over? ${s.isOverBudget} | Savings: ₹${s.savings}`);
    s.pillars.forEach(p => console.log(`    • ${p.name} (${p.role}): ₹${p.product?.price} - ${p.product?.name}`));
  });

  console.log("\n=== TEST 2: Goal without Budget (Follow-up check) ===");
  const res2 = await analyzeReverseShoppingGoal("I want a gaming setup");
  console.log("Goal:", res2.goal);
  console.log("Follow-up question:", res2.followUpQuestion);

  console.log("\n=== TEST 3: Unsatisfiable Goal ===");
  const res3 = await analyzeReverseShoppingGoal("I want to buy scuba diving suits and oxygen cylinders");
  console.log("Is Unsatisfiable?", res3.isUnsatisfiable);
  console.log("Reason:", res3.unsatisfiableReason);

  console.log("\n=== TEST 4: Refinement ('I already have a mouse') ===");
  const refined = await refineReverseShoppingSolution(res1, "I already have a mouse");
  console.log("Refined Overview:", refined.overviewSummary);
  console.log("Balanced Pillars count:", refined.strategies[1].pillars.length);
  console.log("New Balanced Total:", refined.strategies[1].totalPrice);

  await mongoose.disconnect();
}

runTests().catch(console.error);
