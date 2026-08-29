const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });

async function check() {
  const conn = await mongoose.createConnection(process.env.MONGODB_URI).asPromise();
  const prods = await conn.collection("products").find({
    category: "Phones"
  }).limit(25).toArray();

  console.log("25 Phones in DB:");
  prods.forEach(p => {
    console.log(`[${p.productId}] Name: "${p.name}" | Brand: "${p.specifications?.Brand}" | Model: "${p.specifications?.Model}" | Tags: ${JSON.stringify(p.tags)}`);
  });

  await conn.close();
}
check().catch(console.error);
