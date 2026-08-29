const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });

async function check() {
  const conn = await mongoose.createConnection(process.env.MONGODB_URI).asPromise();
  const prods = await conn.collection("products").find({
    productId: { $in: ["prod_cat_1023", "prod_cat_1024", "prod_cat_1025"] }
  }).toArray();

  console.log("Found products:");
  prods.forEach(p => console.log(`[${p.productId}] ${p.name} | Price: ₹${p.price}`));
  await conn.close();
}
check().catch(console.error);
