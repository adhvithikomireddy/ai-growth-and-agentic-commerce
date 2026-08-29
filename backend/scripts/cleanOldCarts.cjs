const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });

async function clean() {
  const uri = process.env.MONGODB_URI;
  const dbs = ["ai_agent", "ai_agentic_commerce"];

  for (const db of dbs) {
    const dbUri = uri.replace(/\/[^/?]+(\?|$)/, `/${db}$1`);
    const conn = await mongoose.createConnection(dbUri).asPromise();
    console.log(`Cleaning old cart items in ${db}...`);

    const validProductIds = await conn.collection("products").distinct("productId");
    const validSet = new Set(validProductIds);

    const carts = await conn.collection("carts").find({}).toArray();
    for (const c of carts) {
      const filtered = (c.items || []).filter(item => validSet.has(item.productId));
      await conn.collection("carts").updateOne(
        { _id: c._id },
        { $set: { items: filtered } }
      );
      console.log(`Cart for user ${c.userId}: preserved ${filtered.length} items (removed ${(c.items || []).length - filtered.length})`);
    }

    await conn.close();
  }
  console.log("Cart cleanup complete!");
  process.exit(0);
}

clean().catch(console.error);
