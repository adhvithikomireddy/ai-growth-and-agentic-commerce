import React, { useState } from "react";
import { Sparkles, ArrowRight, CornerDownLeft, RefreshCw } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext.js";
import { Button } from "../ui/Button.js";

interface AIShoppingBarProps {
  onSearch: (query: string) => void;
  loading: boolean;
}

export const AIShoppingBar: React.FC<AIShoppingBarProps> = ({ onSearch, loading }) => {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState("");

  const samplePrompts = [
    {
      label: "Programming Laptop < ₹80k",
      query: "I need a high-performance laptop with 16GB RAM for programming and Docker",
      lang: "en",
    },
    {
      label: "ఫోన్ < ₹30k (తెలుగు)",
      query: "నాకు ₹30000 లోపు మంచి కెమెరా ఉన్న ఫోన్ కావాలి",
      lang: "te",
    },
    {
      label: "कैमरा फोन < ₹30k (हिंदी)",
      query: "मुझे ₹30,000 के अंदर अच्छा कैमरा वाला फोन चाहिए",
      lang: "hi",
    },
    {
      label: "Quiet Keyboard for Office < ₹5k",
      query: "I need a quiet wireless keyboard for office typing under 5000",
      lang: "en",
    },
    {
      label: "Air Fryer for Cooking < ₹10k",
      query: "Show me a digital air fryer for healthy baking and cooking under 10000",
      lang: "en",
    },
    {
      label: "Drawing Tablet Gift < ₹5k",
      query: "Creative digital drawing tablet gift for an artist under 5000",
      lang: "en",
    },
    {
      label: "4K Camera / Drone for Travel",
      query: "4K waterproof camera or drone for travel vlog photography",
      lang: "en",
    },
    {
      label: "What's Trending?",
      query: "Show me what's trending in the store right now",
      lang: "en",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onSearch(query.trim());
  };

  const handleChipClick = (sampleQuery: string) => {
    setQuery(sampleQuery);
    onSearch(sampleQuery);
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-6 px-4">
      {/* Conversational Search Input Box */}
      <form
        onSubmit={handleSubmit}
        className="relative bg-white rounded-2xl border border-[#E2E8F0] shadow-sm hover:border-[#166534]/50 focus-within:border-[#166534] focus-within:ring-4 focus-within:ring-[#DCFCE7]/60 transition-all p-2"
      >
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="p-2 rounded-xl bg-[#DCFCE7] text-[#166534] flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("search_placeholder")}
            disabled={loading}
            className="w-full text-base sm:text-lg text-[#172018] placeholder-[#94A3B8] bg-transparent focus:outline-none disabled:opacity-50"
          />

          <Button
            type="submit"
            size="md"
            variant="primary"
            loading={loading}
            icon={<ArrowRight className="w-4 h-4" />}
            className="flex-shrink-0"
          >
            <span className="hidden sm:inline">{t("ask_ai_button")}</span>
          </Button>
        </div>
      </form>

      {/* Suggested Natural Language Prompts */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#667067]">Try asking:</span>
        {samplePrompts.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleChipClick(item.query)}
            disabled={loading}
            className="text-xs px-2.5 py-1 rounded-full bg-white border border-[#E2E8F0] text-[#475548] hover:border-[#166534] hover:text-[#166534] hover:bg-[#DCFCE7]/20 transition-colors disabled:opacity-50"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
