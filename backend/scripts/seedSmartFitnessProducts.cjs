const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });
const { Product } = require("../dist/models/Product.js");

const fitnessProducts = [
  {
    productId: "prod_fit_scale_01",
    merchantId: "merch_store_01",
    sku: "FIT-SCALE-BT-01",
    name: "Withings Body+ Smart WiFi & Bluetooth Body Composition Scale (Gym Tracker Edition)",
    category: "SmartHome",
    subcategory: "Fitness & Health",
    description: "Full body composition analyzer measuring weight, body fat %, muscle mass, and water %. Syncs with Apple Health & Google Fit.",
    price: 4999,
    currency: "INR",
    stock: 45,
    availability: "IN_STOCK",
    rating: 4.8,
    reviewCount: 320,
    specifications: {
      "Brand": "Withings",
      "Connectivity": "Wi-Fi & Bluetooth",
      "Metrics": "Body Fat, Muscle Mass, BMI, Bone Mass",
      "Battery Life": "18 Months",
      "Color": "Matte Black"
    },
    tags: ["fitness", "gym", "scale", "health", "smart scale", "workout", "smart home"],
    discountPercent: 10,
    imageUrl: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&auto=format&fit=crop&q=80",
    compatibleProductIds: [],
    frequentlyBoughtTogetherIds: ["prod_fit_neckband_01"],
    upsellProductIds: [],
    alternativeProductIds: [],
    viewCount: 1400,
    salesCount: 420
  },
  {
    productId: "prod_fit_neckband_01",
    merchantId: "merch_store_01",
    sku: "FIT-AUDIO-NB-01",
    name: "OnePlus Bullets Wireless Z2 ANC Sweatproof Sports Neckband Earphones (Gym Edition)",
    category: "Audio",
    subcategory: "Sports Audio",
    description: "IP55 sweat and water-resistant magnetic Bluetooth neckband with 45dB Active Noise Cancellation and 28-hour workout battery life.",
    price: 1999,
    currency: "INR",
    stock: 120,
    availability: "IN_STOCK",
    rating: 4.7,
    reviewCount: 890,
    specifications: {
      "Brand": "OnePlus",
      "Noise Cancellation": "45dB Hybrid ANC",
      "Water Resistance": "IP55 Sweatproof",
      "Battery Life": "28 Hours",
      "Fast Charge": "10 Mins = 20 Hours"
    },
    tags: ["audio", "earphones", "gym", "workout", "sports", "neckband", "sweatproof", "fitness"],
    discountPercent: 15,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80",
    compatibleProductIds: [],
    frequentlyBoughtTogetherIds: ["prod_fit_scale_01"],
    upsellProductIds: [],
    alternativeProductIds: [],
    viewCount: 2200,
    salesCount: 780
  },
  {
    productId: "prod_fit_rope_01",
    merchantId: "merch_store_01",
    sku: "FIT-ROPE-DIG-01",
    name: "Tangram Factory SmartRope LED Connected Skipping Rope (Digital Gym Training)",
    category: "Accessories",
    subcategory: "Fitness Gear",
    description: "Smart jump rope displaying jump count in mid-air with embedded LEDs. Real-time calorie burn and cardio telemetry via smartphone.",
    price: 3499,
    currency: "INR",
    stock: 60,
    availability: "IN_STOCK",
    rating: 4.6,
    reviewCount: 210,
    specifications: {
      "Brand": "SmartRope",
      "Display": "23 Embedded LED Display",
      "Sensors": "Magnetic Hall Sensor",
      "Battery Life": "36 Hours",
      "Connectivity": "Bluetooth 4.0 LE"
    },
    tags: ["fitness", "gym", "workout", "jump rope", "accessories", "cardio", "training"],
    discountPercent: 8,
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80",
    compatibleProductIds: [],
    frequentlyBoughtTogetherIds: ["prod_fit_neckband_01"],
    upsellProductIds: [],
    alternativeProductIds: [],
    viewCount: 950,
    salesCount: 310
  },
  {
    productId: "prod_fit_massage_01",
    merchantId: "merch_store_01",
    sku: "FIT-GUN-REC-01",
    name: "Therabody Theragun Mini 2.0 Deep Tissue Percussive Therapy Massage Gun (Post-Workout Recovery)",
    category: "Accessories",
    subcategory: "Recovery & Wellness",
    description: "Compact, ultra-quiet percussive muscle massager designed to relieve muscle tension and accelerate workout recovery.",
    price: 13990,
    currency: "INR",
    stock: 25,
    availability: "IN_STOCK",
    rating: 4.9,
    reviewCount: 450,
    specifications: {
      "Brand": "Therabody",
      "Amplitude": "12mm Ergonomic Stroke",
      "Speeds": "3 Speeds (1750, 2100, 2400 PPM)",
      "Battery Life": "120 Mins",
      "Weight": "450g Ultra-Portable"
    },
    tags: ["fitness", "gym", "recovery", "massage gun", "theragun", "workout", "accessories"],
    discountPercent: 5,
    imageUrl: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&auto=format&fit=crop&q=80",
    compatibleProductIds: [],
    frequentlyBoughtTogetherIds: ["prod_fit_scale_01"],
    upsellProductIds: [],
    alternativeProductIds: [],
    viewCount: 3100,
    salesCount: 650
  },
  {
    productId: "prod_fit_band_01",
    merchantId: "merch_store_01",
    sku: "FIT-BAND-HR-01",
    name: "Xiaomi Smart Band 8 Pro Fitness Tracker with 1.74-inch AMOLED & Dual GPS (Gym Black)",
    category: "Wearables",
    subcategory: "Fitness Trackers",
    description: "150+ Sports modes, built-in independent GNSS satellite positioning, continuous SpO2 and heart-rate monitoring with 14-day battery.",
    price: 4499,
    currency: "INR",
    stock: 90,
    availability: "IN_STOCK",
    rating: 4.7,
    reviewCount: 520,
    specifications: {
      "Brand": "Xiaomi",
      "Display": "1.74-inch AMOLED 60Hz",
      "Water Resistance": "5ATM (50m Waterproof)",
      "Sensors": "Optical Heart Rate & SpO2",
      "Battery Life": "14 Days"
    },
    tags: ["wearables", "fitness", "gym", "workout", "smartwatch", "band", "running"],
    discountPercent: 12,
    imageUrl: "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=80",
    compatibleProductIds: [],
    frequentlyBoughtTogetherIds: ["prod_fit_neckband_01"],
    upsellProductIds: [],
    alternativeProductIds: [],
    viewCount: 1900,
    salesCount: 620
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);

  for (const item of fitnessProducts) {
    await Product.findOneAndUpdate(
      { productId: item.productId },
      { $set: item },
      { upsert: true, new: true }
    );
    console.log(`Seeded: ${item.name}`);
  }

  console.log("Successfully seeded smart fitness products!");
  await mongoose.disconnect();
}

seed().catch(console.error);
