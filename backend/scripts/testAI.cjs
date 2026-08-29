const { processCustomerQuery } = require("../dist/agents/buyerAgent.js");
const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  console.log("\n==========================================");
  console.log("TEST 1: Quiet Keyboard for Office Typing");
  console.log("==========================================");
  const res1 = await processCustomerQuery("I need a quiet wireless keyboard for office typing under 5000", "en");
  console.log("Summary:", res1.message);
  res1.products.slice(0, 2).forEach(p => {
    const reason = res1.recommendations.find(r => r.productId === p.productId)?.reason;
    console.log(`Product: ${p.name} (Rs ${p.price})`);
    console.log(`Reason: ${reason}\n`);
  });

  console.log("\n==========================================");
  console.log("TEST 2: Telugu Camera Phone under Rs 30,000");
  console.log("==========================================");
  const res2 = await processCustomerQuery("నాకు ₹30000 లోపు మంచి కెమెరా ఉన్న ఫోన్ కావాలి", "te");
  console.log("Summary:", res2.message);
  res2.products.slice(0, 2).forEach(p => {
    const reason = res2.recommendations.find(r => r.productId === p.productId)?.reason;
    console.log(`Product: ${p.name} (Rs ${p.price})`);
    console.log(`Reason: ${reason}\n`);
  });

  console.log("\n==========================================");
  console.log("TEST 3: Coding Laptop with 16GB RAM");
  console.log("==========================================");
  const res3 = await processCustomerQuery("I need a Dell laptop with 16GB RAM for programming and Docker", "en");
  console.log("Summary:", res3.message);
  res3.products.slice(0, 2).forEach(p => {
    const reason = res3.recommendations.find(r => r.productId === p.productId)?.reason;
    console.log(`Product: ${p.name} (Rs ${p.price})`);
    console.log(`Reason: ${reason}\n`);
  });

  await mongoose.disconnect();
}
test().catch(console.error);
