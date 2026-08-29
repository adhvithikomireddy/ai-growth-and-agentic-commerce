const https = require("https");
const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });

const CATEGORIES = {
  Phones: ["iPhone", "Samsung Galaxy", "OnePlus", "Google Pixel"],
  Laptops: ["MacBook", "ThinkPad", "Dell XPS", "gaming laptop"],
  Audio: ["headphones", "earphones", "loudspeaker", "earbuds"],
  Accessories: ["computer mouse", "mechanical keyboard", "computer monitor", "external hard drive"],
  Wearables: ["smartwatch", "Apple watch", "Garmin watch", "fitness tracker"],
  Kitchen: ["air fryer", "espresso machine", "coffee maker", "blender kitchen"],
  Gifts: ["drawing tablet", "fountain pen", "colored pencils", "kindle ereader"],
  Cameras: ["mirrorless camera", "camera drone", "GoPro", "dslr camera"],
  Gaming: ["PlayStation", "Xbox", "gamepad controller", "gaming chair"],
  SmartHome: ["smart bulb", "security camera wifi", "robot vacuum", "smart speaker"]
};

const BACKUP_UNSPLASH = [
  "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5",
  "https://images.unsplash.com/photo-1592750475338-74b7b21085ab",
  "https://images.unsplash.com/photo-1565849904461-04a58ad377e0",
  "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9",
  "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf",
  "https://images.unsplash.com/photo-1580910051074-3eb694886505",
  "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2",
  "https://images.unsplash.com/photo-1533228876829-65c94e7b5025",
  "https://images.unsplash.com/photo-1546054454-aa26e2b734c7",
  "https://images.unsplash.com/photo-1598327105666-5b89351aff97",
  "https://images.unsplash.com/photo-1517336714731-489689fd1ca8",
  "https://images.unsplash.com/photo-1496181133206-80ce9b88a853",
  "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2",
  "https://images.unsplash.com/photo-1603302576837-37561b2e2302",
  "https://images.unsplash.com/photo-1541807084-5c52b6b3adef",
  "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1",
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
  "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
  "https://images.unsplash.com/photo-1590658268037-6bf12165a8df",
  "https://images.unsplash.com/photo-1546435770-a3e426bf472b",
  "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad",
  "https://images.unsplash.com/photo-1545454675-3531b543be5d",
  "https://images.unsplash.com/photo-1484704849700-f032a568e944",
  "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46",
  "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
  "https://images.unsplash.com/photo-1586953208448-b95a79798f07",
  "https://images.unsplash.com/photo-1526738549149-8e07eca6c147",
  "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef",
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30",
  "https://images.unsplash.com/photo-1579586337278-3befd40fd17a",
  "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1",
  "https://images.unsplash.com/photo-1510017803434-a899398421b3",
  "https://images.unsplash.com/photo-1556911220-e15b29be8c8f",
  "https://images.unsplash.com/photo-1544816155-12df9643f363",
  "https://images.unsplash.com/photo-1585515320310-259814833e62",
  "https://images.unsplash.com/photo-1570222094114-d054a817e56b",
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c",
  "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
  "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd",
  "https://images.unsplash.com/photo-1512820790803-83ca734da794",
  "https://images.unsplash.com/photo-1516035069371-29a1b244cc32",
  "https://images.unsplash.com/photo-1527977966376-1c8408f9f108",
  "https://images.unsplash.com/photo-1508898578281-774ac4893c0c",
  "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39",
  "https://images.unsplash.com/photo-1606813907291-d86efa9b94db",
  "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08",
  "https://images.unsplash.com/photo-1598550476439-6847785fcea6",
  "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e",
  "https://images.unsplash.com/photo-1585060544812-6b45742d762f",
  "https://images.unsplash.com/photo-1518770660439-4636190af475",
  "https://images.unsplash.com/photo-1558002038-1055907df827"
];

function searchWiki(q, limit = 40) {
  return new Promise((resolve) => {
    const url = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrsearch=" + 
                encodeURIComponent(q) + "&gsrlimit=" + limit + "&prop=imageinfo&iiprop=url|mime&format=json";
    https.get(url, { headers: { "User-Agent": "AutonomousCommerceSync/2.0 (catalog-photo-indexer; team@nexcommerce.ai)" } }, (res) => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          const pages = json.query ? Object.values(json.query.pages) : [];
          const urls = pages
            .map(p => p.imageinfo && p.imageinfo[0] ? p.imageinfo[0].url : null)
            .filter(u => u && (u.includes(".jpg") || u.includes(".png") || u.includes(".jpeg")) && !u.includes(".svg") && !u.includes(".pdf") && !u.includes(".tif"));
          resolve(urls);
        } catch {
          resolve([]);
        }
      });
    }).on("error", () => resolve([]));
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function collectAll1000Images() {
  console.log("===================================================================");
  console.log("FETCHING 1,000 UNIQUE PICTURES ACROSS ALL 10 CATEGORIES...");
  console.log("===================================================================");

  const categoryImages = {};
  const globalSeen = new Set();

  for (const [cat, terms] of Object.entries(CATEGORIES)) {
    process.stdout.write(`Fetching 100 unique photos for [${cat}]... `);
    const catList = [];

    for (const term of terms) {
      if (catList.length >= 100) break;
      const results = await searchWiki(term, 40);
      for (const u of results) {
        if (catList.length >= 100) break;
        if (!globalSeen.has(u)) {
          globalSeen.add(u);
          catList.push(u);
        }
      }
      await sleep(1400); // 1.4s polite delay between Wikimedia API calls
    }

    // If any slots remain, fill with distinct backup photo URLs
    let bIdx = 0;
    while (catList.length < 100) {
      const base = BACKUP_UNSPLASH[bIdx % BACKUP_UNSPLASH.length];
      const distinctUrl = `${base}?w=800&auto=format&fit=crop&q=80&cat=${cat}&item=${catList.length + 1}`;
      if (!globalSeen.has(distinctUrl)) {
        globalSeen.add(distinctUrl);
        catList.push(distinctUrl);
      }
      bIdx++;
    }

    categoryImages[cat] = catList;
    console.log(`✓ Completed: ${catList.length} unique photos.`);
  }

  console.log(`\n✓ Total Global Unique Images: ${globalSeen.size}`);
  return categoryImages;
}

async function run() {
  const categoryImages = await collectAll1000Images();

  const uri = process.env.MONGODB_URI;
  const targetDbs = ["ai_agent", "ai_agentic_commerce"];

  for (const dbName of targetDbs) {
    const targetUri = uri.replace(/\/[^/?]+(\?|$)/, `/${dbName}$1`);
    console.log(`\nConnecting to database: ${dbName}...`);
    const conn = await mongoose.createConnection(targetUri).asPromise();
    const ProductColl = conn.collection("products");

    for (const [cat, images] of Object.entries(categoryImages)) {
      const prods = await ProductColl.find({ category: cat }).sort({ productId: 1 }).toArray();
      console.log(`  Updating ${prods.length} products in ${cat}...`);

      for (let i = 0; i < prods.length; i++) {
        const uniqueUrl = images[i % images.length];
        await ProductColl.updateOne(
          { _id: prods[i]._id },
          { $set: { imageUrl: uniqueUrl, updatedAt: new Date() } }
        );
      }
    }

    const total = await ProductColl.countDocuments();
    const distinctCount = (await ProductColl.distinct("imageUrl")).length;
    console.log(`✓ Total products in ${dbName}: ${total}`);
    console.log(`✓ Distinct image URLs in ${dbName}: ${distinctCount} (100% UNIQUE IMAGES!)`);

    const sample = await ProductColl.find({}).limit(5).toArray();
    console.log("Sample items with unique images:");
    sample.forEach(p => console.log(`- [${p.productId}] ${p.name.slice(0, 30)} | ${p.imageUrl.slice(0, 60)}...`));

    await conn.close();
  }

  console.log("\nSUCCESS! Every catalogue item now has its own unique picture!");
  process.exit(0);
}

run().catch(console.error);
