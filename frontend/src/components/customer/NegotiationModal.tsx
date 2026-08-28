import React, { useState } from "react";
import { Percent, ShieldCheck, ArrowDownRight, Check, AlertCircle } from "lucide-react";
import { Product } from "../../types/index.js";
import { Modal } from "../ui/Modal.js";
import { Button } from "../ui/Button.js";
import { api } from "../../api/client.js";
import { useCart } from "../../context/CartContext.js";

interface NegotiationModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const NegotiationModal: React.FC<NegotiationModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { addToCart, applyDiscount } = useCart();
  const [loading, setLoading] = useState(false);
  const [offerResult, setOfferResult] = useState<any>(null);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!product) return null;

  const handleNegotiate = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.negotiatePrice(product.productId, 10);
      setOfferResult(data);
    } catch (err: any) {
      setError(err.message || "Negotiation failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleApplyOffer = async () => {
    if (!offerResult) return;
    try {
      setLoading(true);
      await addToCart(product.productId, 1, offerResult.discountPercent);
      await applyDiscount(product.productId, offerResult.discountPercent, offerResult.offerToken);
      setApplied(true);
      setTimeout(() => {
        setApplied(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to apply offer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Bounded Agent-to-Agent Negotiation"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Product Snapshot */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-[#E2E8F0]">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-14 h-14 rounded-lg object-cover"
          />
          <div>
            <h4 className="text-sm font-semibold text-[#172018]">{product.name}</h4>
            <span className="text-xs text-[#667067]">Catalog Price: ₹{product.price.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Explanation of Bounded Negotiation */}
        <div className="p-3 rounded-xl bg-[#DCFCE7]/40 border border-[#BBF7D0] text-xs text-[#166534] space-y-1">
          <div className="flex items-center gap-1.5 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Merchant-Bounded Policy Engine</span>
          </div>
          <p className="leading-relaxed">
            Buyer Agent requests a discount. Merchant Agent verifies store profit margin and enforces strict 10% maximum discount ceiling.
          </p>
        </div>

        {/* Negotiation Action or Result */}
        {!offerResult ? (
          <div className="text-center py-4 space-y-3">
            <p className="text-xs text-[#475548]">
              Ready to submit an agentic negotiation request to the Merchant Agent?
            </p>
            <Button
              variant="primary"
              onClick={handleNegotiate}
              loading={loading}
              icon={<Percent className="w-4 h-4" />}
            >
              Request Discount from Merchant Agent
            </Button>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white border border-[#BBF7D0] shadow-xs space-y-3">
            <div className="flex items-center justify-between text-xs text-[#667067]">
              <span>Original Catalog Price:</span>
              <span className="line-through">₹{offerResult.originalPrice?.toLocaleString("en-IN")}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#166534] font-medium">
              <span>Merchant Approved Discount:</span>
              <span>{offerResult.discountPercent}% OFF</span>
            </div>

            <div className="flex items-center justify-between text-xs text-[#166534] font-medium">
              <span>Agentic Savings:</span>
              <span className="font-semibold">- ₹{offerResult.savings?.toLocaleString("en-IN")}</span>
            </div>

            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between">
              <span className="text-sm font-bold text-[#172018]">Final Negotiated Price:</span>
              <span className="text-xl font-bold text-[#166534]">
                ₹{offerResult.offeredPrice?.toLocaleString("en-IN")}
              </span>
            </div>

            <p className="text-[11px] text-[#667067] italic text-center">
              {offerResult.reason}
            </p>

            <Button
              variant="primary"
              className="w-full mt-2"
              onClick={handleApplyOffer}
              loading={loading}
              icon={applied ? <Check className="w-4 h-4 text-white" /> : <ArrowDownRight className="w-4 h-4" />}
            >
              {applied ? "Applied & Added to Cart!" : "Apply Offer & Add to Cart"}
            </Button>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 p-2.5 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};
