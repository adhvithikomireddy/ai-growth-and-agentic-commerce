const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });

async function check() {
  const conn = await mongoose.createConnection(process.env.MONGODB_URI).asPromise();
  const carts = await conn.collection("carts").find({}).toArray();
  console.log("Carts found:", carts.length);
  for (const c of carts) {
    console.log("User:", c.userId, "Items:", c.items);
  }
  await conn.close();
}
check().catch(console.error);
