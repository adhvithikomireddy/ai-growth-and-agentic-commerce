const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });

async function inspect() {
  const conn = await mongoose.createConnection(process.env.MONGODB_URI.replace("/ai_agentic_commerce", "/ai_agent")).asPromise();
  const products = await conn.collection("products").find({}).limit(20).toArray();
  products.forEach(p => console.log(`[${p.category}] ${p.name}`));
  await conn.close();
}
inspect().catch(console.error);
