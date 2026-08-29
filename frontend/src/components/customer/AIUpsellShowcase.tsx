import React, { useState } from "react";
import { Sparkles, Plus, ArrowRight, Zap, TrendingUp, Check, ShieldCheck } from "lucide-react";
import { useCart } from "../../context/CartContext.js";
import { Card } from "../ui/Card.js";
import { Button } from "../ui/Button.js";

interface BundleItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
}

interface UpsellBundle {
  bundleId: string;
  badge: string;
  badgeColor: string;
  headline: string;
  subheadline: string;
  primary: BundleItem;
  secondary: BundleItem;
  discountPercent: number;
  aiRationale: string;
}

export const AIUpsellShowcase: React.FC = () => {
  const { addToCart } = useCart();
  const [addedBundleId, setAddedBundleId] = useState<string | null>(null);

  const bundles: UpsellBundle[] = [
    {
      bundleId: "bundle_dev_pack",
      badge: "68% Co-Purchase Rate",
      badgeColor: "from-emerald-600 to-teal-700",
      headline: "The Pro Developer Ecosystem",
      subheadline: "High-performance compute paired with precision ergonomic input",
      primary: {
        id: "prod_cat_1021",
        name: "Apple Ultrabook 891 (16GB RAM)",
        category: "Laptops",
        price: 81699,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
      },
      secondary: {
        id: "prod_cat_1024",
        name: "Razer Fast NVMe External SSD 850",
        category: "Accessories",
        price: 28799,
        image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
      },
      discountPercent: 8,
      aiRationale: "Merchant Cross-Sell Agent identified that developers purchasing this laptop require high-speed external storage for local LLMs and Docker images. Formulated an 8% bundle incentive.",
    },
    {
      bundleId: "bundle_creator_pack",
      badge: "AI Creator Favorite",
      badgeColor: "from-indigo-600 to-violet-700",
      headline: "The 4K Content Creator Kit",
      subheadline: "Cinema optical clarity with wireless surround audio capture",
      primary: {
        id: "prod_cat_1022",
        name: "Nothing Pro Max 5G (Flagship Camera)",
        category: "Phones",
        price: 71499,
        image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80",
      },
      secondary: {
        id: "prod_cat_1023",
        name: "Anker Soundcore Wireless Bluetooth Speaker",
        category: "Audio",
        price: 24799,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
      },
      discountPercent: 10,
      aiRationale: "Cross-Sell Agent analyzed audio-visual purchase patterns: 74% of mobile filmmakers pair flagship video cameras with companion studio audio monitors. Bounded 10% discount applied.",
    },
    {
      bundleId: "bundle_fitness_pack",
      badge: "High Velocity Match",
      badgeColor: "from-amber-600 to-rose-700",
      headline: "The Active Lifestyle & Health Suite",
      subheadline: "Continuous biometric telemetry with ergonomic quick-charge dock",
      primary: {
        id: "prod_cat_1025",
        name: "Garmin Fitness Tracker Band 283 (ECG)",
        category: "Wearables",
        price: 75199,
        image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
      },
      secondary: {
        id: "prod_cat_1024",
        name: "Logitech Ergonomic Wireless Companion Hub",
        category: "Accessories",
        price: 18499,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
      },
      discountPercent: 6,
      aiRationale: "Autonomous Campaign Orchestrator generated bundle affinity based on multi-device connectivity, offering 6% savings on companion desk peripherals.",
    },
  ];

  const handleAddBundle = async (bundle: UpsellBundle) => {
    // Add primary with bundle discount
    await addToCart(bundle.primary.id, 1, bundle.discountPercent);
    // Add secondary with bundle discount
    await addToCart(bundle.secondary.id, 1, bundle.discountPercent);

    setAddedBundleId(bundle.bundleId);
    setTimeout(() => setAddedBundleId(null), 2000);
  };

  return (
    <div className="w-full my-10 space-y-6">
      {/* Visual Header */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-emerald-900 via-[#064e3b] to-teal-900 text-white overflow-hidden shadow-xl border border-emerald-500/30">
        {/* Abstract Background Artwork */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-teal-400/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-emerald-300 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Autonomous Upsell & Cross-Sell Engine</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Smart AI Bundles with <span className="text-emerald-400">Instant Extra Discounts</span>
          </h2>

          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Our Merchant AI Agent analyzes real-time purchase affinities and automatically pairs complementary products with bounded volume discounts to grow cart value and reward customers.
          </p>
        </div>
      </div>

      {/* Interactive Bundles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {bundles.map((bundle) => {
          const rawTotal = bundle.primary.price + bundle.secondary.price;
          const savings = Math.round((rawTotal * bundle.discountPercent) / 100);
          const bundlePrice = rawTotal - savings;
          const isAdded = addedBundleId === bundle.bundleId;

          return (
            <Card
              key={bundle.bundleId}
              className="flex flex-col justify-between overflow-hidden border border-neutral-200 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 group bg-white"
            >
              <div>
                {/* Bundle Header Badge */}
                <div className="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/70">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${bundle.badgeColor} shadow-xs`}
                  >
                    {bundle.badge}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Save {bundle.discountPercent}% Extra
                  </span>
                </div>

                {/* Bundle Visual Pair Showcase */}
                <div className="p-4 sm:p-5 space-y-4">
                  <div>
                    <h3 className="font-bold text-base text-[#172018] group-hover:text-emerald-700 transition-colors">
                      {bundle.headline}
                    </h3>
                    <p className="text-xs text-[#667067] line-clamp-1 mt-0.5">
                      {bundle.subheadline}
                    </p>
                  </div>

                  {/* Products Pair Row */}
                  <div className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-neutral-50 border border-neutral-200/80">
                    {/* Primary Product */}
                    <div className="flex-1 space-y-1.5 text-center">
                      <div className="relative w-full aspect-square max-w-[100px] mx-auto rounded-xl overflow-hidden shadow-xs bg-white border border-neutral-200">
                        <img
                          src={bundle.primary.image}
                          alt={bundle.primary.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <p className="text-[11px] font-semibold text-[#172018] line-clamp-1">
                        {bundle.primary.name}
                      </p>
                      <span className="text-[10px] text-[#667067] font-medium block">
                        ₹{bundle.primary.price.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Plus Badge */}
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-md shadow-emerald-600/30">
                      <Plus className="w-4 h-4" />
                    </div>

                    {/* Secondary Product */}
                    <div className="flex-1 space-y-1.5 text-center">
                      <div className="relative w-full aspect-square max-w-[100px] mx-auto rounded-xl overflow-hidden shadow-xs bg-white border border-neutral-200">
                        <img
                          src={bundle.secondary.image}
                          alt={bundle.secondary.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <p className="text-[11px] font-semibold text-[#172018] line-clamp-1">
                        {bundle.secondary.name}
                      </p>
                      <span className="text-[10px] text-[#667067] font-medium block">
                        ₹{bundle.secondary.price.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* AI Cross-Sell Reasoning Box */}
                  <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider text-emerald-800">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      <span>AI Upsell Agent Rationale</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-emerald-800/90 font-medium">
                      {bundle.aiRationale}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price & Action Area */}
              <div className="p-4 sm:p-5 pt-0 border-t border-neutral-100 space-y-3">
                <div className="flex items-baseline justify-between pt-3">
                  <div>
                    <span className="text-xs text-neutral-400 line-through mr-2">
                      ₹{rawTotal.toLocaleString("en-IN")}
                    </span>
                    <span className="text-lg font-black text-[#172018]">
                      ₹{bundlePrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Save ₹{savings.toLocaleString("en-IN")}
                  </span>
                </div>

                <button
                  onClick={() => handleAddBundle(bundle)}
                  disabled={isAdded}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
                    isAdded
                      ? "bg-emerald-600 text-white"
                      : "bg-[#166534] hover:bg-[#14532D] text-white hover:shadow-md"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added Both with {bundle.discountPercent}% Off!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add Bundle to Cart ({bundle.discountPercent}% Off)</span>
                    </>
                  )}
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
