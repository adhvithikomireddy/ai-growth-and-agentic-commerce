const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });
const { Product } = require("../dist/models/Product.js");

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);

  const categories = await Product.distinct("category");
  console.log("Distinct categories in DB:", categories);

  const fitnessItems = await Product.find({
    $or: [
      { name: { $regex: /fitness|gym|workout|watch|band|scale|sport|bottle|protein|health/i } },
      { category: { $regex: /wearable|fitness|health|sport/i } },
      { tags: { $in: ["fitness", "gym", "workout", "health", "smartwatch", "wearables"] } }
    ]
  }).select("productId name category price tags").limit(20);

  console.log(`Found ${fitnessItems.length} fitness/wearable items:`);
  fitnessItems.forEach(p => console.log(`- [${p.category}] ${p.name} (₹${p.price})`));

  await mongoose.disconnect();
}

run().catch(console.error);
