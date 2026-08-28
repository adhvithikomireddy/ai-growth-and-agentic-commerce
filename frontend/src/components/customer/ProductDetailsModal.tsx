import React, { useEffect, useState } from "react";
import { Star, ShieldCheck, ShoppingCart, Plus, Check } from "lucide-react";
import { Product } from "../../types/index.js";
import { Modal } from "../ui/Modal.js";
import { Button } from "../ui/Button.js";
import { Badge } from "../ui/Badge.js";
import { api } from "../../api/client.js";
import { useCart } from "../../context/CartContext.js";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addToCart } = useCart();
  const [accessories, setAccessories] = useState<Product[]>([]);
  const [loadingAccessories, setLoadingAccessories] = useState(false);
  const [addedCombo, setAddedCombo] = useState(false);

  useEffect(() => {
    if (product && isOpen) {
      setLoadingAccessories(true);
      api.getProducts({ category: "Accessories", limit: 3 })
        .then((data) => setAccessories(data.products || []))
        .catch(() => setAccessories([]))
        .finally(() => setLoadingAccessories(false));
    }
  }, [product, isOpen]);

  if (!product) return null;

  const handleAddCombo = async (accProduct: Product) => {
    await addToCart(product.productId, 1, product.discountPercent);
    await addToCart(accProduct.productId, 1, 5); // 5% bundle savings
    setAddedCombo(true);
    setTimeout(() => setAddedCombo(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product.name}
      maxWidth="xl"
    >
      <div className="space-y-6">
        {/* Top Area: Image & Core Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="aspect-square rounded-xl bg-neutral-100 overflow-hidden border border-[#E2E8F0]">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="success">{product.category}</Badge>
                <Badge variant={product.stock > 0 ? "success" : "danger"}>
                  {product.stock > 0 ? `In Stock (${product.stock} units)` : "Out of Stock"}
                </Badge>
              </div>

              <h2 className="text-xl font-bold text-[#172018]">{product.name}</h2>
              <p className="text-xs text-[#667067] mt-1">SKU: {product.sku}</p>

              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-xs font-semibold ml-1 text-[#172018]">{product.rating}</span>
                </div>
                <span className="text-xs text-[#94A3B8]">({product.reviewCount} customer reviews)</span>
              </div>

              <div className="mt-4">
                <span className="text-2xl font-bold text-[#172018]">
                  ₹{product.price.toLocaleString("en-IN")}
                </span>
                {product.discountPercent > 0 && (
                  <span className="ml-2 text-xs font-semibold text-[#166534] bg-[#DCFCE7] px-2 py-0.5 rounded-full">
                    {product.discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>

            <Button
              variant="primary"
              className="w-full"
              icon={<ShoppingCart className="w-4 h-4" />}
              onClick={() => addToCart(product.productId, 1, product.discountPercent)}
              disabled={product.stock <= 0}
            >
              Add Product to Cart
            </Button>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#667067] mb-1.5">
            Description
          </h4>
          <p className="text-xs sm:text-sm text-[#475548] leading-relaxed bg-neutral-50 p-3 rounded-xl border border-[#E2E8F0]">
            {product.description}
          </p>
        </div>

        {/* Full Specifications Table */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#667067] mb-2">
              Verified Technical Specifications
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {Object.entries(product.specifications).map(([key, val], i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 border border-[#E2E8F0]"
                >
                  <span className="text-[#667067] font-medium">{key}</span>
                  <span className="text-[#172018] font-semibold">{val}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cross-Sell Accessories Recommendations */}
        {accessories.length > 0 && (
          <div className="pt-4 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#166534]">
                Frequently Bought Together (5% Bundle Savings)
              </h4>
              {addedCombo && (
                <span className="text-xs text-[#166534] font-medium flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Bundle Added!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {accessories.map((acc) => (
                <div
                  key={acc.productId}
                  className="p-3 rounded-xl border border-[#E2E8F0] hover:border-[#166534] transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={acc.imageUrl}
                      alt={acc.name}
                      className="w-10 h-10 rounded-md object-cover"
                    />
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-[#172018] truncate">{acc.name}</p>
                      <p className="text-xs font-bold text-[#166534]">₹{acc.price.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="soft"
                    className="w-full mt-2 text-[11px] py-1"
                    icon={<Plus className="w-3 h-3" />}
                    onClick={() => handleAddCombo(acc)}
                  >
                    Add with 5% Off
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
