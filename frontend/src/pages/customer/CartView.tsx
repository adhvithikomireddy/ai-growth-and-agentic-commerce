import React, { useState } from "react";
import { Trash2, Plus, Minus, Shield, ArrowRight, ShoppingBag, Sparkles, Zap, Check } from "lucide-react";
import { useCart } from "../../context/CartContext.js";
import { useAuth } from "../../context/AuthContext.js";
import { useLanguage } from "../../context/LanguageContext.js";
import { Button } from "../../components/ui/Button.js";
import { Card } from "../../components/ui/Card.js";
import { ActionPreviewModal } from "../../components/checkout/ActionPreviewModal.js";
import { ReceiptModal } from "../../components/checkout/ReceiptModal.js";
import { api } from "../../api/client.js";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const CartView: React.FC<{ onExplore: () => void; onOpenAuth: () => void }> = ({
  onExplore,
  onOpenAuth,
}) => {
  const { cart, updateQuantity, removeFromCart, addToCart, refreshCart } = useCart();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [previewOpen, setPreviewOpen] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [completedReceipt, setCompletedReceipt] = useState<any>(null);
  const [draftedMessage, setDraftedMessage] = useState<string>("");

  const [addedUpsellId, setAddedUpsellId] = useState<string | null>(null);

  const upsellItems = [
    {
      id: "prod_cat_1024",
      name: "Razer Fast NVMe External SSD 850",
      category: "Accessories",
      price: 28799,
      discountPercent: 5,
      image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "prod_cat_1023",
      name: "Anker Soundcore Bluetooth Speaker 311",
      category: "Audio",
      price: 24799,
      discountPercent: 5,
      image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80",
    },
    {
      id: "prod_cat_1025",
      name: "Garmin Fitness Smart Tracker Band 283",
      category: "Wearables",
      price: 75199,
      discountPercent: 5,
      image: "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80",
    },
  ];

  const handleAddUpsell = async (item: any) => {
    await addToCart(item.id, 1, item.discountPercent);
    setAddedUpsellId(item.id);
    setTimeout(() => setAddedUpsellId(null), 2000);
  };

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 text-center bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div className="w-14 h-14 rounded-full bg-[#DCFCE7] text-[#166534] flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-[#172018] mb-1">{t("cart_title")}</h3>
        <p className="text-xs text-[#667067] mb-6">{t("cart_empty")}</p>
        <Button variant="primary" onClick={onExplore}>
          Start AI Shopping
        </Button>
      </div>
    );
  }

  const handleCheckoutClick = () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    setAuthError(null);
    setPreviewOpen(true);
  };

  const handleAuthorizeAndPay = async (pin?: string) => {
    try {
      setLoadingPayment(true);
      setAuthError(null);

      // Step 1: Create Razorpay Order with authoritative server-side amount & PIN verification
      const orderData = await api.createRazorpayOrder(pin, user?.address);

      // Step 2: Initialize Razorpay Standard Checkout
      if (!window.Razorpay) {
        throw new Error("Razorpay SDK is not loaded in the browser. Check your internet connection.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Apex Nova Lifestyle & Tech",
        description: `Order #${orderData.orderId}`,
        order_id: orderData.razorpayOrderId,
        prefill: {
          name: orderData.customer?.name || "Customer",
          email: orderData.customer?.email || "customer@example.com",
        },
        theme: {
          color: "#166534",
        },
        handler: async (response: any) => {
          try {
            // Step 3: Server-side cryptographic HMAC-SHA256 signature verification
            const verifyRes = await api.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: orderData.orderId,
            });

            // Step 4: Fetch authoritative receipt
            const receiptData = await api.getReceipt(orderData.orderId);
            setCompletedReceipt(receiptData.receipt);
            setDraftedMessage(verifyRes.draftedMessage || "");

            setPreviewOpen(false);
            setReceiptModalOpen(true);
            await refreshCart();
          } catch (err: any) {
            setAuthError(err.message || "Payment verification failed.");
          } finally {
            setLoadingPayment(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoadingPayment(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setAuthError(err.message || "Failed to initialize payment.");
      setLoadingPayment(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-[#172018] mb-6">{t("cart_title")}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <Card key={item.productId} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover border border-[#E2E8F0]"
                />
                <div>
                  <h4 className="text-sm font-semibold text-[#172018] line-clamp-1">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-[#166534]">
                      ₹{item.price.toLocaleString("en-IN")}
                    </span>
                    {item.discountApplied > 0 && (
                      <span className="text-[10px] font-semibold bg-[#DCFCE7] text-[#166534] px-1.5 py-0.5 rounded">
                        {item.discountApplied}% Negotiated Discount
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#E2E8F0] rounded-lg bg-neutral-50 p-0.5">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 text-[#475548] hover:text-[#172018]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 text-[#475548] hover:text-[#172018]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-1.5 text-[#94A3B8] hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}

          {/* AI Upsell & Companion Add-on Accelerator */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-teal-50 border border-emerald-200/90 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-950">
                    AI Cross-Sell Accelerator
                  </h4>
                  <p className="text-[11px] text-emerald-800">
                    Frequently bundled companion items with an instant 5% bundle discount
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Active Offer
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {upsellItems.map((uItem) => {
                const discountedPrice = Math.round(uItem.price * 0.95);
                const isAdded = addedUpsellId === uItem.id;

                return (
                  <div
                    key={uItem.id}
                    className="p-3 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 transition-all flex flex-col justify-between space-y-2.5 shadow-xs group"
                  >
                    <div className="space-y-2">
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-neutral-100 border border-neutral-100">
                        <img
                          src={uItem.image}
                          alt={uItem.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-1 left-1 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                          5% OFF
                        </span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#172018] line-clamp-1">
                          {uItem.name}
                        </p>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-xs font-bold text-emerald-700">
                            ₹{discountedPrice.toLocaleString("en-IN")}
                          </span>
                          <span className="text-[10px] text-neutral-400 line-through">
                            ₹{uItem.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddUpsell(uItem)}
                      disabled={isAdded}
                      className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-center gap-1 ${
                        isAdded
                          ? "bg-emerald-600 text-white"
                          : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Cart</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary Box */}
        <div>
          <Card className="p-5 space-y-4 sticky top-24">
            <h3 className="text-base font-bold text-[#172018] border-b border-[#E2E8F0] pb-3">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#667067]">
                <span>{t("subtotal")}</span>
                <span className="font-semibold text-[#172018]">₹{cart.subtotal.toLocaleString("en-IN")}</span>
              </div>

              {cart.discountTotal > 0 && (
                <div className="flex justify-between text-[#166534] font-medium">
                  <span>{t("discount")}</span>
                  <span>- ₹{cart.discountTotal.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="flex justify-between text-[#667067]">
                <span>GST & Taxes</span>
                <span className="text-[#172018]">Included</span>
              </div>

              <div className="pt-3 border-t border-[#E2E8F0] flex justify-between text-base font-bold text-[#172018]">
                <span>{t("total")}</span>
                <span className="text-lg text-[#166534]">₹{cart.finalAmount.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* Autonomous Spending Policy Notice */}
            {user && (
              <div className="p-3 rounded-xl bg-neutral-50 border border-[#E2E8F0] text-[11px] text-[#475548] space-y-1">
                <div className="flex items-center gap-1 font-semibold text-[#172018]">
                  <Shield className="w-3.5 h-3.5 text-[#166534]" />
                  <span>Autonomous Policy Guard</span>
                </div>
                {cart.finalAmount <= (user.spendingControls?.autonomousLimit || 2000) ? (
                  <p className="text-emerald-700">✓ Within your ₹{user.spendingControls?.autonomousLimit} autonomous limit.</p>
                ) : (
                  <p className="text-amber-800">Requires 4-digit PIN authorization (exceeds ₹{user.spendingControls?.autonomousLimit}).</p>
                )}
              </div>
            )}

            <Button
              variant="primary"
              className="w-full py-2.5"
              icon={<ArrowRight className="w-4 h-4" />}
              onClick={handleCheckoutClick}
            >
              {t("proceed_to_checkout")}
            </Button>
          </Card>
        </div>
      </div>

      {/* AI Action Preview Modal */}
      <ActionPreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        cartItems={cart.items}
        subtotal={cart.subtotal}
        discountTotal={cart.discountTotal}
        finalAmount={cart.finalAmount}
        onAuthorize={handleAuthorizeAndPay}
        loading={loadingPayment}
        error={authError}
      />

      {/* Official Receipt & Multilingual Confirmation Modal */}
      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          onExplore();
        }}
        receipt={completedReceipt}
        draftedMessage={draftedMessage}
      />
    </div>
  );
};
