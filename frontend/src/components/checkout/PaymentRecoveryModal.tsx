import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Clock,
  ShieldCheck,
  CreditCard,
  QrCode,
  ScanFace,
  MessageSquare,
  ArrowRight,
  X,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "../ui/Modal.js";
import { Button } from "../ui/Button.js";

interface PaymentRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onBiometricRetry: () => void;
  errorMessage?: string | null;
  amount: number;
}

export const PaymentRecoveryModal: React.FC<PaymentRecoveryModalProps> = ({
  isOpen,
  onClose,
  onRetry,
  onBiometricRetry,
  errorMessage,
  amount,
}) => {
  // 15-minute price lock countdown
  const [secondsLeft, setSecondsLeft] = useState(900); // 15 mins
  const [discountLocked, setDiscountLocked] = useState(true);
  const [agentHelpOpen, setAgentHelpOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainder.toString().padStart(2, "0")}`;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Payment Assistance & Smart Recovery"
      maxWidth="md"
    >
      <div className="space-y-4">
        {/* Status Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>Transaction Interrupted — No Money Deducted</span>
          </div>
          <p className="text-xs text-amber-800/90 leading-relaxed">
            {errorMessage ||
              "Your bank gateway was dismissed or declined. Your account has NOT been charged, and your items remain safe in your cart."}
          </p>
        </div>

        {/* Discount & Inventory Lock Timer */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-emerald-900 to-[#064e3b] text-white flex items-center justify-between shadow-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <Clock className="w-3.5 h-3.5" />
              <span>Deal & Inventory Lock Active</span>
            </div>
            <p className="text-[11px] text-emerald-100/80">
              Your negotiated price (₹{amount.toLocaleString("en-IN")}) is reserved for you
            </p>
          </div>
          <div className="px-3 py-1 rounded-lg bg-white/10 border border-white/20 font-mono font-bold text-sm text-emerald-300">
            {formatTime(secondsLeft)}
          </div>
        </div>

        {/* Recovery Action Hub */}
        <div className="space-y-2.5">
          <span className="text-[11px] uppercase font-bold text-[#667067] tracking-wider block">
            Recommended Recovery Options
          </span>

          {/* Option 1: Instant Retry */}
          <button
            onClick={onRetry}
            className="w-full p-3 rounded-xl border border-[#BBF7D0] bg-emerald-50/50 hover:bg-emerald-50 hover:border-emerald-500 transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#172018]">Instant Retry with UPI / Card</h4>
                <p className="text-[11px] text-[#667067]">Re-open secure Razorpay gateway with alternative method</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-emerald-700" />
          </button>

          {/* Option 2: Biometric Face Fast-Path */}
          <button
            onClick={onBiometricRetry}
            className="w-full p-3 rounded-xl border border-indigo-100 bg-indigo-50/40 hover:bg-indigo-50 hover:border-indigo-400 transition-all flex items-center justify-between text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <ScanFace className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#172018]">Biometric Face Re-Authorization</h4>
                <p className="text-[11px] text-[#667067]">Bypass SMS delay with instant optical facial verification</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-indigo-700" />
          </button>

          {/* Option 3: Agent Support Assistance */}
          <button
            onClick={() => setAgentHelpOpen(!agentHelpOpen)}
            className="w-full p-3 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300 transition-all flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neutral-200 text-neutral-700 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#172018]">Ask Merchant Recovery Agent</h4>
                <p className="text-[11px] text-[#667067]">Troubleshoot payment issues with your AI commerce assistant</p>
              </div>
            </div>
            <span className="text-xs text-neutral-500 font-semibold">{agentHelpOpen ? "Hide" : "Expand"}</span>
          </button>

          {/* Collapsible Agent Guidance */}
          {agentHelpOpen && (
            <div className="p-3 rounded-xl bg-neutral-100/80 border border-neutral-200 text-xs space-y-2 animate-in fade-in-50">
              <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Merchant Agent Advice:</span>
              </div>
              <ul className="list-disc pl-4 space-y-1 text-[#475548] text-[11px]">
                <li>If using UPI, approve the request within 3 minutes on Google Pay / PhonePe.</li>
                <li>For cards above ₹5,000, ensure your bank account allows online e-commerce transactions.</li>
                <li>You can also test with Razorpay Test UPI ID: <span className="font-mono bg-white px-1.5 py-0.5 rounded border">success@razorpay</span></li>
              </ul>
            </div>
          )}
        </div>

        {/* RBI Guarantee Badge */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-[#667067]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Double-Deduction Guarantee (RBI T+0 Policy)</span>
          </span>
          <button onClick={onClose} className="text-neutral-500 hover:text-neutral-800 underline font-medium">
            Return to Cart
          </button>
        </div>
      </div>
    </Modal>
  );
};
