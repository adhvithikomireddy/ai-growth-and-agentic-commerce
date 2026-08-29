const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });

async function list() {
  const conn = await mongoose.createConnection(process.env.MONGODB_URI).asPromise();
  const prods = await conn.collection("products").find({}).limit(50).toArray();

  console.log("Real Catalog Products:");
  prods.forEach(p => {
    console.log(`- ID: "${p.productId}", Name: "${p.name}", Category: "${p.category}", Price: ₹${p.price}`);
  });

  await conn.close();
}
list().catch(console.error);
