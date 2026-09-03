const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });

const BASE_AFFORDABLE = [
  // Accessories
  { name: "Portronics Konnect CL Type-C to Lightning Cable", cat: "Accessories", brand: "Portronics", price: 299, orig: 699, tags: ["cable", "type-c", "fast charging", "affordable", "accessories", "budget"], img: "https://images.unsplash.com/photo-1544816155-12df9643f363" },
  { name: "boAt Rugged v3 Extra Tough Braided Micro USB Cable", cat: "Accessories", brand: "boAt", price: 199, orig: 499, tags: ["cable", "boAt", "charging", "cheap", "affordable", "accessories"], img: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd" },
  { name: "AmazonBasics Ergonomic Memory Foam Mouse Pad", cat: "Accessories", brand: "AmazonBasics", price: 349, orig: 799, tags: ["mouse pad", "wrist rest", "ergonomic", "affordable", "office"], img: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Amiga500_Mouse.jpg" },
  { name: "SanDisk Ultra 64GB MicroSDXC Memory Card", cat: "Accessories", brand: "SanDisk", price: 499, orig: 1100, tags: ["sd card", "sandisk", "storage", "affordable", "accessories"], img: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147" },
  { name: "SanDisk Ultra 128GB MicroSDXC High Speed Card", cat: "Accessories", brand: "SanDisk", price: 799, orig: 1800, tags: ["sd card", "sandisk", "128gb", "affordable", "under 1000"], img: "https://images.unsplash.com/photo-1586953208448-b95a79798f07" },
  { name: "TP-Link 4-Port High Speed USB 3.0 Hub", cat: "Accessories", brand: "TP-Link", price: 699, orig: 1499, tags: ["usb hub", "hub", "usb 3.0", "affordable", "accessories"], img: "https://images.unsplash.com/photo-1518770660439-4636190af475" },
  { name: "Ambrane 20W PD Fast Charger Adapter", cat: "Accessories", brand: "Ambrane", price: 649, orig: 1299, tags: ["charger", "adapter", "fast charger", "20w", "affordable"], img: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5" },
  { name: "SToK Aluminum Folding Laptop Riser Stand", cat: "Accessories", brand: "SToK", price: 799, orig: 1999, tags: ["laptop stand", "stand", "aluminum", "affordable", "under 1000"], img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46" },
  { name: "Logitech B100 Wired Optical USB Mouse", cat: "Accessories", brand: "Logitech", price: 349, orig: 599, tags: ["mouse", "logitech", "usb mouse", "affordable", "under 500"], img: "https://upload.wikimedia.org/wikipedia/commons/c/c3/Amiga500_Mouse.jpg" },
  { name: "Zebronics Zeb-Comfort Wireless Optical Mouse", cat: "Accessories", brand: "Zebronics", price: 299, orig: 699, tags: ["mouse", "wireless mouse", "cheap", "affordable"], img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46" },

  // Audio
  { name: "boAt BassHeads 100 Wired In-Ear Earphones with Mic", cat: "Audio", brand: "boAt", price: 399, orig: 999, tags: ["earphones", "headphone", "boAt", "wired", "affordable", "audio"], img: "https://upload.wikimedia.org/wikipedia/commons/4/40/Headphones_illustration.png" },
  { name: "Boult Audio BassBuds X1 Wired In-Ear Headset", cat: "Audio", brand: "Boult", price: 349, orig: 899, tags: ["earphones", "boult", "bass", "audio", "cheap", "affordable"], img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e" },
  { name: "pTron Tangent Duo Magnetic Bluetooth Wireless Neckband", cat: "Audio", brand: "pTron", price: 599, orig: 1699, tags: ["earphones", "neckband", "bluetooth", "wireless", "affordable"], img: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df" },
  { name: "Zebronics Zeb-County Portable Bluetooth Speaker with FM", cat: "Audio", brand: "Zebronics", price: 699, orig: 1499, tags: ["speaker", "bluetooth speaker", "zebronics", "affordable"], img: "https://images.unsplash.com/photo-1545454675-3531b543be5d" },
  { name: "Realme Buds 2 Wired Earphones with Mic", cat: "Audio", brand: "Realme", price: 599, orig: 999, tags: ["earphones", "realme", "wired", "audio", "affordable"], img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b" },
  { name: "Portronics SoundDrum 1 5W Mini Bluetooth Speaker", cat: "Audio", brand: "Portronics", price: 849, orig: 1999, tags: ["speaker", "mini speaker", "bluetooth", "affordable"], img: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad" },

  // Kitchen
  { name: "InstaCuppa Rechargeable Electric Milk Frother & Coffee Whisk", cat: "Kitchen", brand: "InstaCuppa", price: 499, orig: 1299, tags: ["milk frother", "coffee", "kitchen", "frother", "affordable"], img: "https://images.unsplash.com/photo-1510017803434-a899398421b3" },
  { name: "HealthSense Chef-Mate Digital Kitchen Food Scale 5KG", cat: "Kitchen", brand: "HealthSense", price: 649, orig: 1599, tags: ["food scale", "kitchen scale", "digital scale", "affordable"], img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f" },
  { name: "Pigeon by Stovekraft 3-Piece Silicone Spatula & Spoon Set", cat: "Kitchen", brand: "Pigeon", price: 399, orig: 899, tags: ["spatula", "kitchen tools", "cooking", "affordable"], img: "https://images.unsplash.com/photo-1585515320310-259814833e62" },
  { name: "Milton Thermosteel Flip Lid Insulated Water Bottle 750ml", cat: "Kitchen", brand: "Milton", price: 599, orig: 1050, tags: ["water bottle", "milton", "insulated", "kitchen", "affordable"], img: "https://images.unsplash.com/photo-1570222094114-d054a817e56b" },
  { name: "Prestige Omega Deluxe Granite Induction Base Roti Tawa", cat: "Kitchen", brand: "Prestige", price: 899, orig: 1590, tags: ["tawa", "prestige", "kitchen", "cookware", "affordable"], img: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f" },
  { name: "Signoraware Compact Glass Lunch Box with Thermal Bag", cat: "Kitchen", brand: "Signoraware", price: 549, orig: 1199, tags: ["lunch box", "glass", "kitchen", "affordable"], img: "https://images.unsplash.com/photo-1585515320310-259814833e62" },

  // Gifts & Stationery
  { name: "Factor Notes Hardcover Dot Grid Journal (160 GSM)", cat: "Gifts", brand: "Factor Notes", price: 349, orig: 799, tags: ["journal", "notebook", "stationery", "gifts", "affordable"], img: "https://images.unsplash.com/photo-1512820790803-83ca734da794" },
  { name: "Parker Vector Standard Chrome Trim Fountain Pen", cat: "Gifts", brand: "Parker", price: 449, orig: 750, tags: ["fountain pen", "parker", "pen", "gifts", "affordable"], img: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd" },
  { name: "Brustro Technical Fine Liner Pigment Ink Pens (Set of 6)", cat: "Gifts", brand: "Brustro", price: 499, orig: 999, tags: ["pens", "sketch pens", "fineliner", "art supplies", "affordable"], img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f" },
  { name: "Faber-Castell Triangular Colored EcoPencils (24 Shades)", cat: "Gifts", brand: "Faber-Castell", price: 299, orig: 550, tags: ["colored pencils", "faber-castell", "drawing", "gifts", "affordable"], img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f" },
  { name: "Luxor Executive Metal Ballpoint Pen in Gift Box", cat: "Gifts", brand: "Luxor", price: 249, orig: 499, tags: ["pen", "ballpoint", "gift pen", "affordable", "cheap"], img: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd" },

  // SmartHome
  { name: "Wipro Next 9W Smart LED RGB WiFi Bulb", cat: "SmartHome", brand: "Wipro", price: 699, orig: 1999, tags: ["smart bulb", "rgb bulb", "wipro", "smart home", "affordable"], img: "https://images.unsplash.com/photo-1558002038-1055907df827" },
  { name: "TP-Link Tapo Smart WiFi Plug 10A (Mini)", cat: "SmartHome", brand: "TP-Link", price: 799, orig: 1899, tags: ["smart plug", "smart home", "wifi plug", "affordable"], img: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e" },
  { name: "Gesto Motion Sensor Rechargeable LED Night Light (2-Pack)", cat: "SmartHome", brand: "Gesto", price: 399, orig: 999, tags: ["motion light", "night light", "sensor light", "smart home", "affordable"], img: "https://images.unsplash.com/photo-1585060544812-6b45742d762f" },
  { name: "Syska Smart 7W LED Warm White WiFi Bulb", cat: "SmartHome", brand: "Syska", price: 499, orig: 1299, tags: ["smart bulb", "syska", "led bulb", "smart home", "affordable"], img: "https://images.unsplash.com/photo-1558002038-1055907df827" }
];

async function seed100AffordableProducts() {
  const uri = process.env.MONGODB_URI;
  const targetDbs = ["ai_agent", "ai_agentic_commerce"];

  for (const dbName of targetDbs) {
    const targetUri = uri.replace(/\/[^/?]+(\?|$)/, `/${dbName}$1`);
    console.log(`Connecting to: ${dbName}...`);
    const conn = await mongoose.createConnection(targetUri).asPromise();
    const ProductColl = conn.collection("products");

    const bulkOps = [];
    let count = 0;

    // Generate 100 distinct affordable products by expanding base templates
    for (let i = 0; i < 100; i++) {
      const template = BASE_AFFORDABLE[i % BASE_AFFORDABLE.length];
      const prodId = `prod_aff_${1000 + i}`;
      const suffix = Math.floor(i / BASE_AFFORDABLE.length) + 1;
      const variantName = suffix > 1 ? `${template.name} (V${suffix})` : template.name;
      const variationPrice = Math.max(199, Math.min(999, template.price + ((i % 5) * 40) - 60));

      bulkOps.push({
        updateOne: {
          filter: { productId: prodId },
          update: {
            $set: {
              productId: prodId,
              merchantId: "merch_apex_001",
              name: variantName,
              category: template.cat,
              price: variationPrice,
              originalPrice: Math.round(variationPrice * 1.8),
              stock: 40 + (i % 30),
              imageUrl: `${template.img}?w=800&auto=format&fit=crop&q=80&sig=aff_${i}`,
              description: `${template.name} - High-value affordable essential with premium build quality and warranty.`,
              specifications: { Category: template.cat, Brand: template.brand, Segment: "Affordable Budget Range" },
              tags: [...template.tags, "affordable", "cheap", "budget", "under 1000", "low price"],
              rating: Number((4.2 + (i % 7) * 0.1).toFixed(1)),
              salesCount: 120 + (i * 15),
              viewCount: 650 + (i * 45),
              frequentlyBoughtTogetherIds: [],
              updatedAt: new Date()
            }
          },
          upsert: true
        }
      });
      count++;
    }

    await ProductColl.bulkWrite(bulkOps);
    const totalUnder1000 = await ProductColl.countDocuments({ price: { $lt: 1000 } });
    console.log(`✓ Seeded ${count} affordable items in ${dbName}. Total products under ₹1000: ${totalUnder1000}`);
    await conn.close();
  }

  console.log("\nALL 100 AFFORDABLE PRODUCTS UNDER ₹1,000 SUCCESSFULLY SEEDED!");
  process.exit(0);
}

seed100AffordableProducts().catch(console.error);
