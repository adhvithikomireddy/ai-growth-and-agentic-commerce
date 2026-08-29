const mongoose = require("../node_modules/mongoose");
require("../node_modules/dotenv").config({ path: "backend/.env" });

const AUTHENTIC_CATALOG = [
  // 1. PHONES
  {
    category: "Phones",
    variants: [" (128GB Storage)", " (256GB High-Speed)", " (512GB Flagship)", " (Space Black)", " (Titanium Grey)", " (Emerald Green)"],
    items: [
      { brand: "Apple", name: "Apple iPhone 15 Pro Max", price: 154900, specs: { Processor: "Apple A17 Pro Bionic", Camera: "48MP Main + 5x Telephoto", Storage: "256GB", Display: "6.7-inch Super Retina XDR OLED", OS: "iOS 17" }, image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80" },
      { brand: "Apple", name: "Apple iPhone 15 Pro", price: 134900, specs: { Processor: "Apple A17 Pro Bionic", Camera: "48MP Main + 3x Telephoto", Storage: "128GB", Display: "6.1-inch Super Retina XDR OLED", OS: "iOS 17" }, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80" },
      { brand: "Apple", name: "Apple iPhone 15", price: 72999, specs: { Processor: "Apple A16 Bionic", Camera: "48MP Dual Camera", Storage: "128GB", Display: "6.1-inch Dynamic Island OLED", OS: "iOS 17" }, image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80" },
      { brand: "Apple", name: "Apple iPhone 14", price: 58999, specs: { Processor: "Apple A15 Bionic", Camera: "12MP Dual Camera", Storage: "128GB", Display: "6.1-inch Super Retina XDR", OS: "iOS 17" }, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80" },
      { brand: "Samsung", name: "Samsung Galaxy S24 Ultra 5G", price: 129999, specs: { Processor: "Snapdragon 8 Gen 3 for Galaxy", Camera: "200MP Quad Camera + 100x Space Zoom", Storage: "256GB", Display: "6.8-inch QHD+ Dynamic AMOLED 2X", OS: "One UI 6.1" }, image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80" },
      { brand: "Samsung", name: "Samsung Galaxy S24 5G", price: 74999, specs: { Processor: "Exynos 2400 Deca-Core", Camera: "50MP Triple Camera", Storage: "128GB", Display: "6.2-inch FHD+ Dynamic AMOLED", OS: "One UI 6.1" }, image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80" },
      { brand: "Samsung", name: "Samsung Galaxy Z Fold5 5G", price: 154999, specs: { Processor: "Snapdragon 8 Gen 2", Camera: "50MP Dual-Screen", Storage: "256GB", Display: "7.6-inch Foldable Dynamic AMOLED", OS: "One UI 6.1" }, image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800&auto=format&fit=crop&q=80" },
      { brand: "Samsung", name: "Samsung Galaxy S23 FE 5G", price: 44999, specs: { Processor: "Exynos 2200", Camera: "50MP OIS Camera", Storage: "128GB", Display: "6.4-inch 120Hz AMOLED", OS: "One UI 6.1" }, image: "https://images.unsplash.com/photo-1533228876829-65c94e7b5025?w=800&auto=format&fit=crop&q=80" },
      { brand: "OnePlus", name: "OnePlus 12 5G", price: 64999, specs: { Processor: "Qualcomm Snapdragon 8 Gen 3", Camera: "50MP Sony LYT-808 + Hasselblad", Battery: "5400mAh 100W SUPERVOOC", Storage: "256GB", Display: "6.82-inch 2K ProXDR 120Hz", OS: "OxygenOS 14" }, image: "https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=800&auto=format&fit=crop&q=80" },
      { brand: "OnePlus", name: "OnePlus 12R 5G", price: 39999, specs: { Processor: "Qualcomm Snapdragon 8 Gen 2", Camera: "50MP Sony IMX890 OIS", Battery: "5500mAh 100W Charging", Storage: "128GB", Display: "6.78-inch 1.5K 120Hz LTPO4", OS: "OxygenOS 14" }, image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80" },
      { brand: "OnePlus", name: "OnePlus Open 5G Foldable", price: 139999, specs: { Processor: "Snapdragon 8 Gen 2", Camera: "48MP Hasselblad Triple Camera", Storage: "512GB", Display: "7.82-inch Flexi-fluid AMOLED", OS: "OxygenOS 14" }, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80" },
      { brand: "OnePlus", name: "OnePlus Nord 4 5G", price: 29999, specs: { Processor: "Snapdragon 7+ Gen 3", Camera: "50MP Sony LYT-600 OIS", Battery: "5500mAh 100W Fast Charge", Storage: "128GB", Display: "6.74-inch 120Hz AMOLED", OS: "OxygenOS 14" }, image: "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&auto=format&fit=crop&q=80" },
      { brand: "Google Pixel", name: "Google Pixel 8 Pro 5G", price: 98999, specs: { Processor: "Google Tensor G3", Camera: "50MP Octa PD + 48MP 5x Telephoto", Storage: "128GB", Display: "6.7-inch Super Actua 120Hz OLED", OS: "Stock Android 14" }, image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80" },
      { brand: "Google Pixel", name: "Google Pixel 8a 5G", price: 37999, specs: { Processor: "Google Tensor G3", Camera: "64MP Quad PD wide + 13MP ultrawide", Storage: "128GB", Display: "6.1-inch Actua 120Hz OLED", OS: "Stock Android 14" }, image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80" },
      { brand: "Xiaomi", name: "Xiaomi 14 Ultra 5G (Leica Optics)", price: 99999, specs: { Processor: "Snapdragon 8 Gen 3", Camera: "1-inch 50MP Quad Leica Camera", Storage: "512GB", Display: "6.73-inch WQHD+ AMOLED", OS: "Xiaomi HyperOS" }, image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80" },
      { brand: "Nothing", name: "Nothing Phone (2) 5G", price: 36999, specs: { Processor: "Snapdragon 8+ Gen 1", Camera: "50MP Sony IMX890 Dual Camera", Interface: "Glyph Interface LED", Storage: "128GB", Display: "6.7-inch LTPO OLED 120Hz", OS: "Nothing OS 2.5" }, image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=800&auto=format&fit=crop&q=80" },
    ]
  },

  // 2. LAPTOPS
  {
    category: "Laptops",
    variants: [" (16GB RAM, 512GB SSD)", " (16GB RAM, 1TB SSD)", " (32GB RAM, 1TB SSD)", " (Space Grey)", " (Silver)", " (Midnight)"],
    items: [
      { brand: "Apple", name: "Apple MacBook Pro 16-inch (M3 Max)", price: 349900, specs: { Processor: "Apple M3 Max (16-core CPU, 40-core GPU)", Memory: "36GB Unified Memory", Storage: "1TB SSD", Display: "16.2-inch Liquid Retina XDR 120Hz", OS: "macOS Sonoma" }, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80" },
      { brand: "Apple", name: "Apple MacBook Pro 14-inch (M3 Pro)", price: 199900, specs: { Processor: "Apple M3 Pro (11-core CPU, 14-core GPU)", Memory: "18GB Unified Memory", Storage: "512GB SSD", Display: "14.2-inch Liquid Retina XDR", OS: "macOS Sonoma" }, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80" },
      { brand: "Apple", name: "Apple MacBook Air 15-inch (M3)", price: 134900, specs: { Processor: "Apple M3 Chip (8-core CPU, 10-core GPU)", Memory: "8GB Unified Memory", Storage: "256GB SSD", Display: "15.3-inch Liquid Retina", OS: "macOS Sonoma" }, image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80" },
      { brand: "Apple", name: "Apple MacBook Air 13-inch (M2)", price: 89990, specs: { Processor: "Apple M2 Chip", Memory: "8GB Unified Memory", Storage: "256GB SSD", Display: "13.6-inch Liquid Retina", OS: "macOS Sonoma" }, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80" },
      { brand: "Lenovo", name: "Lenovo ThinkPad X1 Carbon Gen 11", price: 169990, specs: { Processor: "Intel Core i7-1365U vPro", Memory: "16GB LPDDR5", Storage: "1TB PCIe NVMe SSD", Keyboard: "Backlit Spill-Resistant ThinkPad", OS: "Windows 11 Pro" }, image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80" },
      { brand: "Lenovo", name: "Lenovo IdeaPad Slim 5 16-inch", price: 64999, specs: { Processor: "Intel Core i5-13500H", Memory: "16GB LPDDR5", Storage: "512GB NVMe SSD", Display: "16-inch WUXGA IPS", OS: "Windows 11 Home" }, image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80" },
      { brand: "Lenovo", name: "Lenovo Legion Pro 5i Gaming Laptop", price: 148990, specs: { Processor: "Intel Core i7-14700HX", Graphics: "NVIDIA GeForce RTX 4070 8GB", Memory: "16GB DDR5", Storage: "1TB SSD", Display: "16-inch WQXGA 240Hz" }, image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&auto=format&fit=crop&q=80" },
      { brand: "Dell", name: "Dell XPS 13 Plus (InfinityEdge)", price: 159990, specs: { Processor: "Intel Core Ultra 7 155H", Memory: "16GB LPDDR5X", Storage: "512GB NVMe SSD", Display: "13.4-inch FHD+ 500 nits", OS: "Windows 11 Pro" }, image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop&q=80" },
      { brand: "Dell", name: "Dell Inspiron 15 3520", price: 44990, specs: { Processor: "Intel Core i5-1235U", Memory: "8GB DDR4", Storage: "512GB SSD", Display: "15.6-inch 120Hz FHD" }, image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800&auto=format&fit=crop&q=80" },
      { brand: "ASUS", name: "ASUS ROG Strix G16 Gaming Laptop", price: 114999, specs: { Processor: "Intel Core i7-13650HX", Graphics: "NVIDIA GeForce RTX 4060 8GB", Memory: "16GB DDR5", Storage: "1TB SSD", Display: "16-inch 165Hz FHD+" }, image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80" },
      { brand: "ASUS", name: "ASUS Vivobook 15 OLED", price: 48990, specs: { Processor: "Intel Core i3-1215U", Memory: "8GB DDR4", Storage: "512GB SSD", Display: "15.6-inch Full HD OLED 600 nits" }, image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80" },
      { brand: "HP", name: "HP OMEN 16 Gaming Laptop", price: 124990, specs: { Processor: "AMD Ryzen 7 7840HS", Graphics: "NVIDIA GeForce RTX 4060 8GB", Memory: "16GB DDR5", Storage: "1TB PCIe Gen4 SSD", Display: "16.1-inch QHD 165Hz" }, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80" },
    ]
  },

  // 3. AUDIO
  {
    category: "Audio",
    variants: [" (Matte Black)", " (Silver)", " (Midnight Blue)", " (Wireless Edition)", " (Studio Edition)"],
    items: [
      { brand: "Sony", name: "Sony WH-1000XM5 Noise-Canceling Headphones", price: 29990, specs: { ANC: "Integrated Processor V1 + HD QN1", Battery: "30 Hours with Quick Charge", Drivers: "30mm Carbon Fiber", Codec: "LDAC High-Res Audio" }, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80" },
      { brand: "Sony", name: "Sony WF-1000XM5 Wireless Noise-Canceling Earbuds", price: 22990, specs: { ANC: "Dual Feedback Microphones", Battery: "24 Hours with Case", WaterResistance: "IPX4" }, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80" },
      { brand: "Apple", name: "Apple AirPods Pro (2nd Gen with USB-C)", price: 24900, specs: { Chip: "Apple H2 Headphone Chip", ANC: "2x More Active Noise Cancellation", Audio: "Personalized Spatial Audio" }, image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80" },
      { brand: "Bose", name: "Bose QuietComfort Ultra Headphones", price: 34990, specs: { Mode: "World-Class Noise Cancellation", Audio: "Bose Immersive Spatial Audio", Battery: "24 Hours" }, image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&auto=format&fit=crop&q=80" },
      { brand: "JBL", name: "JBL Flip 6 Portable Waterproof Bluetooth Speaker", price: 9999, specs: { Power: "20W RMS Output", Battery: "12 Hours Playtime", Waterproof: "IP67 Dust & Water Proof" }, image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&auto=format&fit=crop&q=80" },
      { brand: "Marshall", name: "Marshall Stanmore III Bluetooth Speaker", price: 31999, specs: { Connectivity: "Bluetooth 5.2 & RCA/3.5mm", Sound: "Wide Stereo Soundstage", Style: "Vintage Marshall Brass Detailing" }, image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&auto=format&fit=crop&q=80" },
      { brand: "boAt", name: "boAt Rockerz 550 Over-Ear Wireless Headphones", price: 1999, specs: { Drivers: "50mm Dynamic Drivers", Battery: "20 Hours Playback", Cushion: "Physical Noise Isolation Earpads" }, image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80" },
    ]
  },

  // 4. ACCESSORIES
  {
    category: "Accessories",
    variants: [" (Space Grey)", " (Matte Black)", " (White Edition)", " (Braided Cable)", " (Pro Hub Edition)"],
    items: [
      { brand: "Logitech", name: "Logitech MX Master 3S Wireless Mouse", price: 8995, specs: { Sensor: "8000 DPI Darkfield Laser", Scrolling: "MagSpeed Electromagnetic 1000 lines/sec", Battery: "70 Days USB-C Rechargeable" }, image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80" },
      { brand: "Keychron", name: "Keychron K2 V2 Wireless Mechanical Keyboard", price: 7499, specs: { Switches: "Gateron G Pro Brown Tactile", Layout: "75% Compact 84-Key", Connectivity: "Bluetooth 5.1 & Wired Type-C" }, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80" },
      { brand: "SanDisk", name: "SanDisk Extreme 1TB Portable NVMe External SSD", price: 8999, specs: { Speed: "Up to 1050MB/s Read Speed", Durability: "2-Meter Drop Protection & IP55 Resistance", Interface: "USB 3.2 Gen 2 Type-C" }, image: "https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=800&auto=format&fit=crop&q=80" },
      { brand: "Dell", name: "Dell UltraSharp 27 4K USB-C Hub Monitor", price: 44990, specs: { Resolution: "3840x2160 4K UHD IPS Black", Color: "100% sRGB & 98% DCI-P3", Hub: "90W USB-C Power Delivery with RJ45 Ethernet" }, image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80" },
      { brand: "Anker", name: "Anker 737 Power Bank (PowerCore 24K 140W)", price: 11999, specs: { Output: "140W High-Speed Two-Way Fast Charging", Capacity: "24,000mAh", Screen: "Smart Digital Power Display" }, image: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80" },
    ]
  },

  // 5. WEARABLES
  {
    category: "Wearables",
    variants: [" (45mm LTE)", " (44mm Bluetooth)", " (Titanium Edition)", " (Sport Band)", " (Trail Loop)"],
    items: [
      { brand: "Apple", name: "Apple Watch Ultra 2 (Titanium GPS+Cellular)", price: 89900, specs: { Case: "49mm Aerospace Titanium Case", Display: "3000 nits Sapphire Crystal", Battery: "Up to 72 Hours in Low Power Mode", Depth: "100m Water Resistant with Depth Gauge" }, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80" },
      { brand: "Apple", name: "Apple Watch Series 9 GPS 45mm", price: 44900, specs: { Chip: "S9 SiP with Double Tap Gesture", Display: "2000 nits Always-On Retina", Health: "ECG App, Blood Oxygen Sensor, Temperature Sensing" }, image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80" },
      { brand: "Samsung", name: "Samsung Galaxy Watch6 Classic 47mm LTE", price: 39999, specs: { Bezel: "Rotating Physical Stainless Steel Bezel", Health: "BioActive Sensor (ECG, Blood Pressure, BIA Body Composition)", OS: "Wear OS Powered by Samsung" }, image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80" },
      { brand: "OnePlus", name: "OnePlus Watch 2 (Dual-Engine Architecture)", price: 24999, specs: { Battery: "100 Hours Smart Mode Battery Life", OS: "Wear OS by Google + RTOS", GPS: "Dual-Frequency GPS (L1+L5)" }, image: "https://images.unsplash.com/photo-1510017803434-a899398421b3?w=800&auto=format&fit=crop&q=80" },
      { brand: "Garmin", name: "Garmin Forerunner 965 AMOLED GPS Watch", price: 67490, specs: { Display: "1.4-inch Colorful AMOLED Touchscreen", Maps: "Built-In Full Color TopoActive Mapping", Battery: "Up to 23 Days in Smartwatch Mode" }, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80" },
    ]
  },

  // 6. KITCHEN
  {
    category: "Kitchen",
    items: [
      { brand: "Philips", name: "Philips Digital Air Fryer HD9252/90", price: 7999, variants: ["", " (4.1L Compact)", " (6.2L XL Family)", " (Black & Gold)"], specs: { Technology: "Rapid Air Convection Technology (90% Less Oil)", Capacity: "4.1 Liters", Presets: "7 Touchscreen Cooking Presets" }, image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80", tags: ["kitchen", "air fryer", "fryer", "baking", "cooking", "philips", "healthy", "roasting"] },
      { brand: "Instant Pot", name: "Instant Pot Duo 7-in-1 Multi-Cooker 6L", price: 8499, variants: ["", " (6L Duo)", " (8L Large)", " (Stainless Steel)"], specs: { Functions: "Pressure Cooker, Slow Cooker, Rice Cooker, Steamer, Sauté, Yogurt Maker, Warmer", Safety: "10+ Proven Safety Mechanisms" }, image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80", tags: ["kitchen", "cooker", "multicooker", "pressure cooker", "steamer", "instant pot", "cooking"] },
      { brand: "Nespresso", name: "Nespresso Essenza Mini Espresso Coffee Machine", price: 14999, variants: ["", " (Piano Black)", " (Ruby Red)", " (Pure White)"], specs: { Pressure: "19-Bar High Pressure Pump", Heating: "25 Seconds Fast Heat-Up", Cups: "Espresso (40ml) & Lungo (110ml)" }, image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80", tags: ["kitchen", "coffee", "espresso", "coffee machine", "nespresso", "cafe", "beverage"] },
      { brand: "Bosch", name: "Bosch TrueMixx Pro 1000W Mixer Grinder", price: 7199, variants: ["", " (4 Jars Edition)", " (3 Jars Classic)", " (Black & Chrome)"], specs: { Motor: "1000W 3-Speed HiFlux Motor", Blades: "PoundingBlade for Authentic Dry Masalas", Jars: "4 Stainless Steel Jars" }, image: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=800&auto=format&fit=crop&q=80", tags: ["kitchen", "mixer", "grinder", "blender", "bosch", "spices", "cooking"] },
      { brand: "Philips", name: "Philips Daily Collection 750W Food Processor", price: 5499, variants: ["", " (Compact 2.1L)", " (Deluxe Accessories)"], specs: { Power: "750W Motor", Bowls: "2.1L Bowl Capacity", Accessories: "Chopping, slicing, and kneading discs" }, image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80", tags: ["kitchen", "food processor", "chopper", "philips", "cooking", "blender"] },
      { brand: "Morphy Richards", name: "Morphy Richards Europa Drip Coffee Maker", price: 3299, variants: ["", " (6-Cup Carafe)", " (Gloss Black)"], specs: { Capacity: "6-Cup Carafe", Filter: "Anti-Drip Permanent Filter", Warming: "Keep-Warm Hot Plate" }, image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=800&auto=format&fit=crop&q=80", tags: ["kitchen", "coffee", "coffee maker", "drip coffee", "morphy richards", "breakfast"] },
      { brand: "Prestige", name: "Prestige Deluxe Alpha Stainless Steel Pressure Cooker 5L", price: 3199, variants: ["", " (5L Standard)", " (3.5L Mini)", " (Stainless Steel)"], specs: { Material: "Heavy-Duty Alpha Base Stainless Steel", Safety: "Controlled Gasket Release System", Capacity: "5 Liters" }, image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80", tags: ["kitchen", "cooker", "pressure cooker", "prestige", "stainless steel", "cooking"] },
    ]
  },

  // 7. GIFTS & ARTS
  {
    category: "Gifts",
    variants: [" (Fine Nib)", " (Medium Nib)", " (Deluxe Gift Box)", " (Hardcover Dotted)", " (Artist Tin Set)"],
    items: [
      { brand: "XP-Pen", name: "XP-Pen Deco 01 V2 Digital Drawing Tablet", price: 3499, specs: { ActiveArea: "10 x 6.25 inches", Stylus: "Battery-Free Stylus with 8192 Pressure Levels", Tilt: "60 Degrees Tilt Brush Effect" }, image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80" },
      { brand: "Faber-Castell", name: "Faber-Castell Polychromos Artists' Color Pencils Set of 60", price: 9999, specs: { Pigments: "High-Quality Acid-Free Lightfast Pigments", Lead: "Break-Resistant 3.8mm SV Bonded Lead", Case: "Metal Tin Box" }, image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80" },
      { brand: "Parker", name: "Parker Sonnet Black Lacquer Gold Trim Fountain Pen", price: 11499, specs: { Nib: "18k Solid Gold Finish Nib", Body: "Gloss Black Lacquer with 23k Gold Plated Accents" }, image: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&auto=format&fit=crop&q=80" },
      { brand: "Kindle", name: "Kindle Paperwhite (16GB, 6.8-inch Warm Light)", price: 14999, specs: { Display: "6.8-inch 300 ppi Glare-Free Paperwhite", Waterproof: "IPX8 Waterproof Protection", Battery: "Up to 10 Weeks Battery Life" }, image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80" },
    ]
  },

  // 8. CAMERAS
  {
    category: "Cameras",
    variants: [" (Body Only)", " (Vlog Creator Kit)", " (Dual-Battery Fly More Kit)", " (Waterproof Adventure Kit)"],
    items: [
      { brand: "Sony", name: "Sony Alpha 7 IV Full-Frame Mirrorless Camera", price: 219990, specs: { Sensor: "33MP Full-Frame Exmor R CMOS", Video: "4K 60p 10-bit 4:2:2 Recording", Autofocus: "759-Point Phase-Detection Real-Time Eye AF" }, image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&auto=format&fit=crop&q=80" },
      { brand: "DJI", name: "DJI Mini 4 Pro 4K HDR Camera Drone with RC 2", price: 98990, specs: { Weight: "Under 249g Ultra-Lightweight", Video: "4K/60fps HDR True Vertical Shooting", Sensing: "Omnidirectional Obstacle Sensing", Range: "20km FHD Video Transmission" }, image: "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80" },
      { brand: "GoPro", name: "GoPro HERO12 Black Waterproof Action Camera", price: 37990, specs: { Video: "5.3K 60fps & 4K 120fps Video", Stabilization: "HyperSmooth 6.0 with 360 Horizon Lock", Waterproof: "Tough & Waterproof to 33ft (10m)" }, image: "https://images.unsplash.com/photo-1508898578281-774ac4893c0c?w=800&auto=format&fit=crop&q=80" },
      { brand: "Canon", name: "Canon EOS R10 Mirrorless Camera with 18-45mm Lens", price: 79990, specs: { Sensor: "24.2MP APS-C CMOS Sensor", Burst: "Up to 23fps Continuous Shooting", Autofocus: "Dual Pixel CMOS AF II with Subject Detection" }, image: "https://images.unsplash.com/photo-1512790182412-b19e6d62bc39?w=800&auto=format&fit=crop&q=80" },
    ]
  },

  // 9. GAMING
  {
    category: "Gaming",
    variants: [" (Disc Edition)", " (Digital Edition)", " (Midnight Black)", " (Wireless Controller Bundle)"],
    items: [
      { brand: "Sony", name: "Sony PlayStation 5 Slim Console (1TB Disc Edition)", price: 54990, specs: { Storage: "1TB Ultra-High Speed Custom NVMe SSD", Audio: "Tempest 3D AudioTech", RayTracing: "Hardware Ray Tracing Support", Output: "Up to 120fps with 4K Output" }, image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80" },
      { brand: "Microsoft", name: "Microsoft Xbox Series X Console 1TB", price: 52990, specs: { Compute: "12 Teraflops of Raw Graphic Processing Power", Resolution: "True 4K Gaming at up to 120fps", Architecture: "Xbox Velocity Architecture" }, image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=80" },
      { brand: "Razer", name: "Razer Iskur X Ergonomic Gaming Chair", price: 28990, specs: { Ergonomics: "Sculpted Lumbar Arch Support", Material: "Multi-Layered Synthetic Leather", Cushions: "High-Density Molded Foam" }, image: "https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=800&auto=format&fit=crop&q=80" },
      { brand: "Sony", name: "Sony PlayStation DualSense Wireless Controller", price: 5990, specs: { Feedback: "Immersive Haptic Feedback", Triggers: "Dynamic Adaptive Triggers", Microphone: "Built-In Microphone & 3.5mm Headset Jack" }, image: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=80" },
    ]
  },

  // 10. SMART HOME
  {
    category: "SmartHome",
    variants: [" (Starter Kit)", " (Pack of 2)", " (White)", " (Smart Hub Edition)"],
    items: [
      { brand: "TP-Link Tapo", name: "TP-Link Tapo C200 360 Smart Security Camera", price: 2199, specs: { Resolution: "1080p High-Definition Video", PanTilt: "360-Degree Horizontal & 114-Degree Vertical Range", NightVision: "Advanced Night Vision up to 30ft", Storage: "MicroSD Card up to 512GB" }, image: "https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=800&auto=format&fit=crop&q=80" },
      { brand: "Philips Hue", name: "Philips Hue Smart 9W RGB E27 LED Bulb", price: 2899, specs: { Colors: "16 Million Colors + Warm-to-Cool White", Control: "Instant Control via Bluetooth & Zigbee Hub", Voice: "Works with Alexa and Google Assistant" }, image: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=800&auto=format&fit=crop&q=80" },
      { brand: "Amazon", name: "Amazon Echo Show 8 (2nd Gen) HD Smart Display with Alexa", price: 8999, specs: { Display: "8-inch HD Touchscreen", Camera: "13MP Camera with Auto-Framing", Sound: "Stereo Speakers with Neodymium Drivers" }, image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=80" },
      { brand: "Eufy", name: "Eufy RoboVac 25C Wi-Fi Robot Vacuum Cleaner", price: 14999, specs: { Suction: "1500Pa Strong Suction Power", Noise: "Quiet Operation at 55dB", Navigation: "Bounce Navigation with Drop-Sensing Technology" }, image: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&auto=format&fit=crop&q=80" },
    ]
  }
];

function build1000RealisticProducts() {
  const products = [];
  let prodIndex = 1;
  const categoryCounters = {};

  for (let i = 0; i < 1000; i++) {
    const catGroup = AUTHENTIC_CATALOG[i % AUTHENTIC_CATALOG.length];
    const category = catGroup.category;

    if (!categoryCounters[category]) categoryCounters[category] = 0;
    const catIdx = categoryCounters[category]++;

    const template = catGroup.items[catIdx % catGroup.items.length];
    const brand = template.brand;

    const variants = template.variants || catGroup.variants || [""];
    const variant = variants[catIdx % variants.length];
    const fullName = `${template.name}${variant}`;

    const basePrice = template.price;
    const priceVariance = ((catIdx % 5) - 2) * 200;
    const finalPrice = Math.max(999, basePrice + priceVariance);

    const discountPercents = [0, 5, 8, 10, 12, 15];
    const discountPercent = discountPercents[(catIdx % discountPercents.length)];
    const rating = +(4.3 + ((catIdx % 7) * 0.1)).toFixed(1);
    const reviewCount = 80 + ((catIdx * 19) % 750);
    const salesCount = 50 + ((catIdx * 29) % 950);
    const stock = 15 + ((catIdx * 11) % 110);

    const specifications = {
      Brand: brand,
      Category: category,
      Model: template.name,
      Warranty: "1 Year Official Manufacturer Warranty",
      Origin: "Authorized Brand Distribution Stock",
      Condition: "Brand New, Factory Sealed",
      ...template.specs,
    };

    products.push({
      productId: `prod_cat_${1000 + prodIndex}`,
      sku: `${brand.replace(/\s+/g, "").substring(0, 3).toUpperCase()}-${category.substring(0, 3).toUpperCase()}-${100 + (catIdx % 900)}`,
      name: fullName,
      description: `Authentic ${brand} ${fullName}. Backed by genuine manufacturer warranty, verified authorized serials, and high-reliability merchant stock.`,
      category: category,
      price: finalPrice,
      currency: "INR",
      discountPercent: discountPercent,
      stock: stock,
      imageUrl: template.image,
      rating: rating,
      reviewCount: reviewCount,
      merchantId: "merch_apex_001",
      availability: "IN_STOCK",
      specifications: specifications,
      tags: template.tags || [category.toLowerCase(), brand.toLowerCase(), "verified", "authentic"],
      salesCount: salesCount,
      viewCount: salesCount * 5 + 120,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    prodIndex++;
  }

  return products;
}

async function reseed() {
  const uri = process.env.MONGODB_URI;
  const targetDbs = ["ai_agent", "ai_agentic_commerce"];
  const products = build1000RealisticProducts();

  console.log(`Generated ${products.length} brand-authentic products.`);

  for (const dbName of targetDbs) {
    const targetUri = uri.replace(/\/[^/?]+(\?|$)/, `/${dbName}$1`);
    console.log(`\nConnecting to ${dbName}...`);
    const conn = await mongoose.createConnection(targetUri).asPromise();
    
    console.log(`Clearing old products in ${dbName}...`);
    await conn.collection("products").deleteMany({});

    console.log(`Inserting 1,000 realistic products into ${dbName}...`);
    await conn.collection("products").insertMany(products);

    const kitchenSample = await conn.collection("products").find({ category: "Kitchen" }).limit(7).toArray();
    console.log(`Sample Kitchen products in ${dbName}:`);
    kitchenSample.forEach(p => console.log(`- [${p.productId}] ${p.name} (₹${p.price})`));

    const count = await conn.collection("products").countDocuments();
    console.log(`✓ Total products in ${dbName}: ${count}`);

    await conn.close();
  }

  console.log("\nSUCCESS! All Kitchen items and authentic products populated!");
  process.exit(0);
}

reseed().catch(console.error);
