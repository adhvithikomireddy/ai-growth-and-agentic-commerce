const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });
const { Product } = require("../dist/models/Product.js");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const categories = await Product.distinct("category");
  for (const cat of categories) {
    const sample = await Product.find({ category: cat }).select("name price").limit(3);
    console.log(`Category [${cat}]:`, sample.map(s => `${s.name} (₹${s.price})`).join(" | "));
  }

  await mongoose.disconnect();
}

run().catch(console.error);
