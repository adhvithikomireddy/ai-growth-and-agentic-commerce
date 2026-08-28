import React from "react";
import { X, CheckCircle2, ShoppingCart } from "lucide-react";
import { Product } from "../../types/index.js";
import { Modal } from "../ui/Modal.js";
import { Button } from "../ui/Button.js";
import { useCart } from "../../context/CartContext.js";

interface ProductComparisonModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onRemoveFromCompare: (productId: string) => void;
}

export const ProductComparisonModal: React.FC<ProductComparisonModalProps> = ({
  products,
  isOpen,
  onClose,
  onRemoveFromCompare,
}) => {
  const { addToCart } = useCart();

  if (products.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Side-by-Side Product Comparison"
      maxWidth="xl"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr>
              <th className="p-3 text-left bg-neutral-50 text-[#667067] font-semibold border-b border-[#E2E8F0] w-1/4">
                Attribute
              </th>
              {products.map((p) => (
                <th
                  key={p.productId}
                  className="p-3 text-left bg-neutral-50 border-b border-[#E2E8F0] w-3/8"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#172018] line-clamp-1">{p.name}</span>
                    <button
                      onClick={() => onRemoveFromCompare(p.productId)}
                      className="text-[#667067] hover:text-red-600 p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            <tr>
              <td className="p-3 font-semibold text-[#475548]">Preview</td>
              {products.map((p) => (
                <td key={p.productId} className="p-3">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-20 h-16 object-cover rounded-lg border border-[#E2E8F0]"
                  />
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#475548]">Price</td>
              {products.map((p) => (
                <td key={p.productId} className="p-3 font-bold text-sm text-[#166534]">
                  ₹{p.price.toLocaleString("en-IN")}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#475548]">Category</td>
              {products.map((p) => (
                <td key={p.productId} className="p-3 text-[#172018]">
                  {p.category}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#475548]">Rating</td>
              {products.map((p) => (
                <td key={p.productId} className="p-3 text-[#172018]">
                  ★ {p.rating} ({p.reviewCount} reviews)
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#475548]">Stock Availability</td>
              {products.map((p) => (
                <td key={p.productId} className="p-3">
                  <span className={p.stock > 0 ? "text-emerald-700 font-semibold" : "text-rose-600 font-semibold"}>
                    {p.stock > 0 ? `In Stock (${p.stock})` : "Out of Stock"}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#475548]">Key Specifications</td>
              {products.map((p) => (
                <td key={p.productId} className="p-3 space-y-1">
                  {Object.entries(p.specifications || {}).map(([k, v], i) => (
                    <div key={i} className="text-[11px]">
                      <span className="text-[#667067]">{k}:</span> <span className="font-medium text-[#172018]">{v}</span>
                    </div>
                  ))}
                </td>
              ))}
            </tr>
            <tr>
              <td className="p-3 font-semibold text-[#475548]">Action</td>
              {products.map((p) => (
                <td key={p.productId} className="p-3">
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full"
                    icon={<ShoppingCart className="w-3.5 h-3.5" />}
                    onClick={() => addToCart(p.productId, 1, p.discountPercent)}
                  >
                    Select & Add
                  </Button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </Modal>
  );
};
