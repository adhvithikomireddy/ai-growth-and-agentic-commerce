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
      subheadline: "High-performance compute paired with precision 4K display",
      primary: {
        id: "prod_cat_1002",
        name: "Apple MacBook Pro 14-inch (M3 Pro)",
        category: "Laptops",
        price: 199400,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&auto=format&fit=crop&q=80",
      },
      secondary: {
        id: "prod_cat_1004",
        name: "Dell UltraSharp 27 4K USB-C Hub Monitor",
        category: "Accessories",
        price: 45490,
        image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800&auto=format&fit=crop&q=80",
      },
      discountPercent: 8,
      aiRationale: "Merchant Cross-Sell Agent identified that developers purchasing this laptop require high-speed external display expansion. Formulated an 8% bundle incentive.",
    },
    {
      bundleId: "bundle_creator_pack",
      badge: "AI Creator Favorite",
      badgeColor: "from-indigo-600 to-violet-700",
      headline: "The Flagship Mobile & Audio Kit",
      subheadline: "Cinema optical clarity with spatial audio capture",
      primary: {
        id: "prod_cat_1001",
        name: "Apple iPhone 15 Pro Max",
        category: "Phones",
        price: 153900,
        image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80",
      },
      secondary: {
        id: "prod_cat_1003",
        name: "Apple AirPods Pro (2nd Gen with USB-C)",
        category: "Audio",
        price: 24900,
        image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
      },
      discountPercent: 10,
      aiRationale: "Cross-Sell Agent analyzed audio-visual purchase patterns: 74% of flagship smartphone buyers pair their device with companion ANC AirPods. Bounded 10% discount applied.",
    },
    {
      bundleId: "bundle_fitness_pack",
      badge: "High Velocity Match",
      badgeColor: "from-amber-600 to-rose-700",
      headline: "The Active Lifestyle & Health Suite",
      subheadline: "Continuous biometric telemetry with deep bass audio companion",
      primary: {
        id: "prod_cat_1005",
        name: "Garmin Forerunner 965 AMOLED GPS Watch",
        category: "Wearables",
        price: 68490,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80",
      },
      secondary: {
        id: "prod_cat_1063",
        name: "boAt Rockerz 550 Over-Ear Wireless Headphones",
        category: "Audio",
        price: 1999,
        image: "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80",
      },
      discountPercent: 6,
      aiRationale: "Autonomous Campaign Orchestrator generated bundle affinity based on workout telemetry, offering 6% savings on companion audio gear.",
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
