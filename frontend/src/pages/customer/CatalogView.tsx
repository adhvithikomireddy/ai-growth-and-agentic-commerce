import React, { useEffect, useState } from "react";
import { Search, Filter, SlidersHorizontal } from "lucide-react";
import { Product } from "../../types/index.js";
import { api } from "../../api/client.js";
import { ProductCard } from "../../components/customer/ProductCard.js";
import { Skeleton } from "../../components/ui/Skeleton.js";

interface CatalogViewProps {
  onViewDetails: (product: Product) => void;
  onNegotiate: (product: Product) => void;
  onCompareToggle: (product: Product) => void;
  comparedProducts: Product[];
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  onViewDetails,
  onNegotiate,
  onCompareToggle,
  comparedProducts,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories()
      .then((cats) => setCategories(["All", ...cats]))
      .catch(() => setCategories(["All"]));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: any = { sortBy };
    if (selectedCategory !== "All") params.category = selectedCategory;
    if (query.trim()) params.query = query.trim();

    api.getProducts(params)
      .then((data) => setProducts(data.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [selectedCategory, query, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-xs">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter catalog by name, tag, or specification..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-neutral-50 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#166534] focus:bg-white"
          />
        </div>

        {/* Sort selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[#667067] flex-shrink-0">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs font-medium bg-neutral-50 border border-[#E2E8F0] rounded-xl px-3 py-2 text-[#172018] focus:outline-none focus:ring-2 focus:ring-[#166534]"
          >
            <option value="relevance">Most Relevant</option>
            <option value="trending">Popular & Trending</option>
            <option value="rating">Highest Rated</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex-shrink-0 transition-colors ${
              selectedCategory === cat
                ? "bg-[#166534] text-white shadow-xs"
                : "bg-white border border-[#E2E8F0] text-[#475548] hover:bg-neutral-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="space-y-3 bg-white p-4 rounded-xl border border-[#E2E8F0]">
              <Skeleton className="h-44 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#E2E8F0]">
          <p className="text-sm text-[#667067]">No products found matching the criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((prod) => (
            <ProductCard
              key={prod.productId}
              product={prod}
              onViewDetails={onViewDetails}
              onNegotiate={onNegotiate}
              onCompareToggle={onCompareToggle}
              isCompared={comparedProducts.some((cp) => cp.productId === prod.productId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
