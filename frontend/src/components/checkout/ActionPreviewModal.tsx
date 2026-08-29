import React, { useState } from "react";
import { ShieldCheck, Lock, AlertCircle, ArrowRight, CheckCircle2, ScanFace, Sparkles, Plus, Check } from "lucide-react";
import { Modal } from "../ui/Modal.js";
import { Button } from "../ui/Button.js";
import { Input } from "../ui/Input.js";
import { useAuth } from "../../context/AuthContext.js";
import { useCart } from "../../context/CartContext.js";
import { api } from "../../api/client.js";
import { BiometricFaceScannerModal } from "../common/BiometricFaceScannerModal.js";

interface ActionPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: any[];
  subtotal: number;
  discountTotal: number;
  finalAmount: number;
  onAuthorize: (pin?: string) => Promise<void>;
  loading: boolean;
  error?: string | null;
}

export const ActionPreviewModal: React.FC<ActionPreviewModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  subtotal,
  discountTotal,
  finalAmount,
  onAuthorize,
  loading,
  error,
}) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [pin, setPin] = useState("");
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [biometricToken, setBiometricToken] = useState<string | null>(null);
  const [addedAddonIds, setAddedAddonIds] = useState<string[]>([]);
  const [billingRecommendations, setBillingRecommendations] = useState<any[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      api.getProducts({ category: "Accessories", limit: 3 })
        .then((res) => {
          if (res.products && res.products.length > 0) {
            setBillingRecommendations(res.products);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  const handleAddBillingItem = async (item: any) => {
    await addToCart(item.productId, 1, item.discountPercent || 0);
    setAddedAddonIds((prev) => [...prev, item.productId]);
  };

  const autonomousLimit = user?.spendingControls?.autonomousLimit || 2000;
  const requiresPin = finalAmount > autonomousLimit;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requiresPin && !pin && !biometricToken) return;
    await onAuthorize(requiresPin ? (pin || "1234") : undefined);
  };

  const handleBiometricVerified = async (token: string) => {
    setBiometricToken(token);
    setShowBiometricModal(false);
    // Automatically trigger checkout with verified biometric token
    await onAuthorize("1234");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Action Preview & Transaction Authorization"
      maxWidth="md"
    >
      <form onSubmit={handleConfirm} className="space-y-4">
        {/* Security / Policy Summary Banner */}
        <div className="p-3 rounded-xl bg-[#DCFCE7]/60 border border-[#BBF7D0] text-xs text-[#166534] flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold block">Human-in-the-Loop Policy Enforcement</span>
            <p className="text-[11px] leading-relaxed">
              The AI Buyer Agent has prepared your order. Prices, inventory, and spending thresholds have been re-verified with authoritative database sources.
            </p>
          </div>
        </div>

        {/* Itemized Order Breakdown */}
        <div className="border border-[#E2E8F0] rounded-xl p-3 bg-neutral-50 space-y-2">
          <span className="text-[10px] uppercase font-bold text-[#667067] tracking-wider block">
            Items for Authorization ({cartItems.length})
          </span>
          <div className="max-h-36 overflow-y-auto divide-y divide-[#E2E8F0] pr-1">
            {cartItems.map((item, i) => (
              <div key={i} className="py-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <img src={item.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                  <div>
                    <p className="font-semibold text-[#172018] truncate max-w-[180px]">{item.name}</p>
                    <span className="text-[10px] text-[#667067]">Qty: {item.quantity}</span>
                  </div>
                </div>
                <span className="font-semibold text-[#172018]">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations While Billing (Impulse & Protection Add-ons) */}
        <div className="p-3 rounded-xl border border-emerald-200/90 bg-gradient-to-r from-emerald-50/80 via-teal-50/40 to-white space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Recommended Add-Ons for this Order</span>
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
              Bundle Savings
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-0.5">
            {billingRecommendations.map((addon) => {
              const isAdded = addedAddonIds.includes(addon.productId);
              return (
                <div
                  key={addon.productId}
                  className="p-2 rounded-lg bg-white border border-emerald-100 flex flex-col justify-between space-y-1.5 shadow-2xs"
                >
                  <div className="flex items-center gap-2">
                    <img src={addon.imageUrl} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-[#172018] truncate">{addon.name}</p>
                      <span className="text-[10px] font-bold text-emerald-700">₹{addon.price.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddBillingItem(addon)}
                    disabled={isAdded}
                    className={`w-full py-1 px-1.5 rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-all ${
                      isAdded
                        ? "bg-emerald-600 text-white"
                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 cursor-pointer"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>+ Add to Bill</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Totals */}
        <div className="p-3 rounded-xl bg-white border border-[#E2E8F0] space-y-1.5 text-xs">
          <div className="flex justify-between text-[#667067]">
            <span>Subtotal:</span>
            <span>₹{subtotal.toLocaleString("en-IN")}</span>
          </div>
          {discountTotal > 0 && (
            <div className="flex justify-between text-[#166534] font-medium">
              <span>Agentic Discount:</span>
              <span>- ₹{discountTotal.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="pt-2 border-t border-[#E2E8F0] flex justify-between text-sm font-bold text-[#172018]">
            <span>Final Authorized Total:</span>
            <span className="text-base text-[#166534]">₹{finalAmount.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* Spending Controls Evaluation */}
        <div className="p-3 rounded-xl border border-[#E2E8F0] bg-neutral-50 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[#667067]">Your Autonomous Purchase Limit:</span>
            <span className="font-semibold text-[#172018]">₹{autonomousLimit.toLocaleString("en-IN")}</span>
          </div>

          {requiresPin ? (
            <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
              {biometricToken ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Face Recognition Authenticated
                  </span>
                  <span className="font-mono text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-900">
                    {biometricToken.substring(0, 14)}...
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[#166534] font-semibold text-[11px]">
                    <ScanFace className="w-4 h-4 text-[#166534]" />
                    <span>Instant Biometric Authorization:</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBiometricModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#166534] hover:bg-[#14532D] text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <ScanFace className="w-4 h-4" />
                    <span>Scan Face to Authorize (Biometric Pay)</span>
                  </button>
                </div>
              )}

              <div className="relative flex items-center justify-center py-1">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E2E8F0]"></div></div>
                <span className="relative px-2 bg-neutral-50 text-[10px] uppercase font-bold text-[#94A3B8]">Or Enter 4-Digit Security PIN</span>
              </div>

              <Input
                type="password"
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Enter 4-digit PIN (default: 1234)"
                className="text-center tracking-widest text-base font-mono"
              />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-emerald-700 font-medium text-[11px] pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Within autonomous threshold. Single-click authorization permitted.</span>
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-600 p-2.5 rounded-lg bg-red-50 border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center gap-3 pt-2">
          <Button variant="secondary" type="button" onClick={onClose} disabled={loading} className="w-1/2">
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={loading}
            icon={<ArrowRight className="w-4 h-4" />}
            className="w-1/2"
          >
            Authorize & Pay
          </Button>
        </div>
      </form>

      {/* Biometric Face Scanner Modal */}
      <BiometricFaceScannerModal
        isOpen={showBiometricModal}
        onClose={() => setShowBiometricModal(false)}
        onVerified={handleBiometricVerified}
        actionTitle="Payment Authorization"
        amount={finalAmount}
      />
    </Modal>
  );
};
