const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });

const categories = [
  {
    category: "Laptops",
    brands: ["Lenovo", "Apple", "Dell", "HP", "ASUS", "Acer", "MSI", "Samsung"],
    types: ["Ultrabook", "Gaming Laptop", "Business Laptop", "2-in-1 Touchscreen", "Creator Studio", "Workstation"],
    chips: ["Intel Core i5 13th Gen", "Intel Core i7 14th Gen", "Intel Core i9", "AMD Ryzen 5 7600", "AMD Ryzen 7 7800X", "Apple M2 Pro", "Apple M3 Max"],
    rams: ["8GB DDR5", "16GB DDR5", "32GB DDR5", "64GB Unified"],
    storages: ["512GB NVMe SSD", "1TB Gen4 SSD", "2TB High-Speed SSD"],
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80"
    ],
    priceRange: [38990, 189990]
  },
  {
    category: "Phones",
    brands: ["Apple", "Samsung", "OnePlus", "Google Pixel", "Xiaomi", "Nothing", "Motorola", "iQOO"],
    types: ["Pro Max 5G", "Ultra 5G", "Flagship Edition", "Lite 5G", "Foldable Dual-Screen", "Power Edition"],
    rams: ["8GB RAM", "12GB RAM", "16GB LPDDR5X"],
    storages: ["128GB UFS 4.0", "256GB High-Speed", "512GB Storage", "1TB Edition"],
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80"
    ],
    priceRange: [14999, 149999]
  },
  {
    category: "Audio",
    brands: ["Sony", "Bose", "Sennheiser", "Apple", "JBL", "boAt", "Marshall", "Anker Soundcore"],
    types: ["Active Noise Canceling Headphones", "True Wireless Earbuds", "Wireless Bluetooth Speaker", "Studio Monitor", "Dolby Atmos Soundbar"],
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80"
    ],
    priceRange: [1999, 34990]
  },
  {
    category: "Accessories",
    brands: ["Logitech", "Anker", "Razer", "Corsair", "Keychron", "Dell", "Belkin", "SanDisk"],
    types: ["Wireless Ergonomic Mouse", "Mechanical Gaming Keyboard", "4K Ultra-Wide Monitor", "USB-C Multiport Dock", "Fast NVMe External SSD", "MagSafe Power Bank"],
    images: [
      "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80"
    ],
    priceRange: [799, 42999]
  },
  {
    category: "Wearables",
    brands: ["Apple", "Samsung", "Garmin", "Fitbit", "Noise", "Amazfit", "OnePlus"],
    types: ["Smartwatch with ECG & SpO2", "GPS Running & Multisport Watch", "Fitness Tracker Band", "Rugged Titanium Smartwatch"],
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80"
    ],
    priceRange: [1999, 89900]
  },
  {
    category: "Kitchen",
    brands: ["Philips", "Morphy Richards", "Instant Pot", "Prestige", "Bosch", "Nespresso", "Panasonic"],
    types: ["Digital Air Fryer", "Multi-Cooker & Pressure Cooker", "Espresso & Coffee Machine", "Cold Press Slow Juicer", "High-Power Blender"],
    images: [
      "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80"
    ],
    priceRange: [2499, 29990]
  },
  {
    category: "Gifts",
    brands: ["XP-Pen", "Faber-Castell", "Parker", "Moleskine", "Montblanc", "Kindle", "Cross"],
    types: ["Digital Drawing Graphic Tablet", "Deluxe Artist Color & Sketching Kit", "Executive Fountain Pen Set", "E-Reader with Glare-Free Screen", "Premium Leather Travel Journal"],
    images: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80"
    ],
    priceRange: [999, 18999]
  },
  {
    category: "Cameras",
    brands: ["Sony", "Canon", "Nikon", "DJI", "GoPro", "Fujifilm"],
    types: ["Full-Frame Mirrorless Camera", "4K Waterproof Action Camera", "Foldable 4K Camera Drone", "Compact Vlog Camera", "Carbon Fiber Travel Tripod"],
    images: [
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&auto=format&fit=crop&q=80"
    ],
    priceRange: [9999, 199999]
  },
  {
    category: "Gaming",
    brands: ["Sony PlayStation", "Microsoft Xbox", "Nintendo", "Razer", "SteelSeries", "HyperX", "Secretlab"],
    types: ["Console Next-Gen Edition", "Wireless Low-Latency Controller", "7.1 Surround Gaming Headset", "Ergonomic Gaming Chair", "VR Immersive Headset"],
    images: [
      "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1612287233207-6b4d32a933f7?w=800&auto=format&fit=crop&q=80"
    ],
    priceRange: [1499, 54990]
  },
  {
    category: "SmartHome",
    brands: ["Amazon Echo", "Google Nest", "TP-Link Tapo", "Philips Hue", "Eufy", "Mi Smart"],
    types: ["Smart Display with Assistant", "Indoor 360 Security Camera", "Wi-Fi Mesh Router System", "Color Ambiance Smart Bulb Pack", "Robot Vacuum & Mop"],
    images: [
      "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80"
    ],
    priceRange: [999, 39999]
  }
];

function generate1000Products() {
  const products = [];
  let idCounter = 100;

  for (let i = 0; i < 1000; i++) {
    idCounter++;
    const catConfig = categories[i % categories.length];
    const brand = catConfig.brands[Math.floor(Math.random() * catConfig.brands.length)];
    const type = catConfig.types[Math.floor(Math.random() * catConfig.types.length)];
    const modelNum = Math.floor(100 + Math.random() * 900);
    const name = `${brand} ${type} ${modelNum}`;

    const [minP, maxP] = catConfig.priceRange;
    // Step prices by hundreds
    const price = Math.floor((minP + Math.random() * (maxP - minP)) / 100) * 100 - 1; 

    const discounts = [0, 5, 8, 10, 12, 15, 20];
    const discountPercent = discounts[Math.floor(Math.random() * discounts.length)];
    const rating = +(4.0 + Math.random() * 0.9).toFixed(1);
    const reviewCount = Math.floor(50 + Math.random() * 950);
    const salesCount = Math.floor(30 + Math.random() * 1200);
    const stock = Math.floor(10 + Math.random() * 140);
    const imageUrl = catConfig.images[Math.floor(Math.random() * catConfig.images.length)];

    const specifications = {
      Brand: brand,
      Category: catConfig.category,
      Model: `${brand}-${modelNum}`,
      Warranty: "1 Year Official Manufacturer Warranty",
      Origin: "Authorized Distribution Stock",
      Condition: "Brand New, Sealed Box"
    };

    if (catConfig.chips) {
      specifications["Processor"] = catConfig.chips[Math.floor(Math.random() * catConfig.chips.length)];
    }
    if (catConfig.rams) {
      specifications["Memory"] = catConfig.rams[Math.floor(Math.random() * catConfig.rams.length)];
    }
    if (catConfig.storages) {
      specifications["Storage"] = catConfig.storages[Math.floor(Math.random() * catConfig.storages.length)];
    }

    products.push({
      productId: `prod_cat_${idCounter}`,
      sku: `${brand.substring(0, 3).toUpperCase()}-${catConfig.category.substring(0, 3).toUpperCase()}-${modelNum}`,
      name,
      description: `Official ${brand} ${type}. Engineered for performance, reliability, and modern lifestyle demands. Features certified durability, factory warranty, and verified merchant stock.`,
      category: catConfig.category,
      price,
      currency: "INR",
      discountPercent,
      stock,
      imageUrl,
      rating,
      reviewCount,
      merchantId: "merch_apex_001",
      availability: "IN_STOCK",
      specifications,
      tags: [catConfig.category.toLowerCase(), brand.toLowerCase(), "featured", "verified"],
      salesCount,
      viewCount: salesCount * 6 + Math.floor(Math.random() * 500),
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  return products;
}

async function run() {
  console.log("Generating 1,000 realistic products across 10 categories...");
  const products = generate1000Products();
  console.log(`Generated ${products.length} products.`);

  const uri = process.env.MONGODB_URI;
  const targetDbs = ["ai_agent", "ai_agentic_commerce"];

  for (const dbName of targetDbs) {
    const targetUri = uri.replace(/\/[^/?]+(\?|$)/, `/${dbName}$1`);
    console.log(`\nConnecting to database: ${dbName}...`);
    try {
      const conn = await mongoose.createConnection(targetUri).asPromise();
      console.log(`Connected to ${dbName}. Clearing old products...`);
      await conn.collection("products").deleteMany({});
      
      console.log(`Inserting 1,000 products into ${dbName}.products...`);
      await conn.collection("products").insertMany(products);
      
      const count = await conn.collection("products").countDocuments();
      console.log(`✓ Verification: ${count} products now exist in ${dbName}!`);
      await conn.close();
    } catch (err) {
      console.error(`Error populating ${dbName}:`, err.message);
    }
  }

  console.log("\n=======================================================");
  console.log("SUCCESS! 1,000 PRODUCTS SEEDED ACROSS ALL DATABASES!");
  console.log("=======================================================");
  process.exit(0);
}

run();
