import React from "react";
import { Star, ShieldCheck, ShoppingCart, Percent, Layers, Check, Sparkles } from "lucide-react";
import { Product } from "../../types/index.js";
import { useCart } from "../../context/CartContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { Button } from "../ui/Button.js";
import { Badge } from "../ui/Badge.js";
import { Card } from "../ui/Card.js";

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onNegotiate: (product: Product) => void;
  onCompareToggle?: (product: Product) => void;
  isCompared?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewDetails,
  onNegotiate,
  onCompareToggle,
  isCompared = false,
}) => {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [added, setAdded] = React.useState(false);

  const handleAdd = async () => {
    await addToCart(product.productId, 1, product.discountPercent);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const specsList = Object.entries(product.specifications || {}).slice(0, 3);

  return (
    <Card className="flex flex-col h-full overflow-hidden hover:shadow-md hover:border-[#BBF7D0] transition-all group">
      {/* Product Image Area */}
      <div className="relative w-full aspect-16/10 bg-neutral-100 overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Availability Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {product.stock > 0 ? (
            <Badge variant="success" size="sm">
              {t("in_stock")} ({product.stock})
            </Badge>
          ) : (
            <Badge variant="danger" size="sm">
              {t("out_of_stock")}
            </Badge>
          )}

          {product.discountPercent > 0 && (
            <span className="bg-[#166534] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
              {product.discountPercent}% OFF
            </span>
          )}
        </div>

        {/* Compare Checkbox Button */}
        {onCompareToggle && (
          <button
            onClick={() => onCompareToggle(product)}
            className={`absolute top-3 right-3 p-1.5 rounded-lg border backdrop-blur-xs transition-colors flex items-center gap-1 text-[11px] font-medium ${
              isCompared
                ? "bg-[#166534] text-white border-[#166534]"
                : "bg-white/90 text-[#475548] border-[#E2E8F0] hover:bg-white"
            }`}
            title="Compare with another product"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isCompared ? "Comparing" : "Compare"}</span>
          </button>
        )}
      </div>

      {/* Product Content Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-[#667067] mb-1.5">
            <span className="uppercase tracking-wider font-semibold text-[10px] text-[#166534]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-amber-600 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>{product.rating}</span>
              <span className="text-[#94A3B8] font-normal">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            onClick={() => onViewDetails(product)}
            className="text-base font-semibold text-[#172018] group-hover:text-[#166534] transition-colors cursor-pointer line-clamp-1"
          >
            {product.name}
          </h3>

          {/* AI Recommendation Reason */}
          {product.recommendationReason ? (
            <div className="my-2.5 p-2.5 rounded-xl bg-[#F0FDF4] border border-[#86EFAC] text-xs text-[#14532D] leading-relaxed shadow-xs">
              <div className="flex items-center gap-1 font-bold text-[10px] uppercase tracking-wider text-[#166534] mb-1">
                <Sparkles className="w-3 h-3 text-[#166534]" />
                <span>AI Recommendation Reason:</span>
              </div>
              <p className="text-[11px] text-[#166534] font-medium leading-relaxed">
                {product.recommendationReason}
              </p>
            </div>
          ) : null}

          {/* Specifications Pills */}
          {specsList.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {specsList.map(([key, val], i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-neutral-100 rounded text-[11px] text-[#475548]"
                >
                  <strong className="font-medium text-[#172018]">{key}:</strong> {val}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Pricing and Action Buttons */}
        <div className="mt-4 pt-3 border-t border-[#E2E8F0]">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xl font-bold text-[#172018]">
                ₹{product.price.toLocaleString("en-IN")}
              </span>
              {product.discountPercent > 0 && (
                <span className="ml-2 text-xs text-[#94A3B8] line-through">
                  ₹{Math.round(product.price * (1 + product.discountPercent / 100)).toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <span className="text-[10px] text-[#667067] font-mono">
              Stock: {product.stock}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              size="sm"
              icon={<Percent className="w-3.5 h-3.5 text-[#166534]" />}
              onClick={() => onNegotiate(product)}
              disabled={product.stock <= 0}
            >
              {t("negotiate_price")}
            </Button>

            <Button
              variant="primary"
              size="sm"
              icon={added ? <Check className="w-3.5 h-3.5 text-white" /> : <ShoppingCart className="w-3.5 h-3.5" />}
              onClick={handleAdd}
              disabled={product.stock <= 0}
            >
              {added ? "Added!" : t("add_to_cart")}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
