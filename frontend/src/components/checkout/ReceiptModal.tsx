import React, { useState } from "react";
import { Printer, Copy, Check, CheckCircle2, FileText, Download } from "lucide-react";
import { Modal } from "../ui/Modal.js";
import { Button } from "../ui/Button.js";
import { Badge } from "../ui/Badge.js";

interface ReceiptModalProps {
  receipt: any;
  draftedMessage?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  receipt,
  draftedMessage,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyDraft = () => {
    if (draftedMessage) {
      navigator.clipboard.writeText(draftedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Official Receipt #${receipt.receiptNumber}`}
      maxWidth="xl"
    >
      <div className="space-y-6 print:m-0 print:p-0">
        {/* Success Status Banner */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-[#DCFCE7]/70 border border-[#BBF7D0]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#166534] text-white flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#166534]">Payment Verified Server-Side</h4>
              <p className="text-xs text-[#14532D]">Order placed successfully in MongoDB Atlas.</p>
            </div>
          </div>
          <Badge variant="success" size="md">
            PAID IN FULL
          </Badge>
        </div>

        {/* Receipt Header Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs p-4 rounded-xl bg-neutral-50 border border-[#E2E8F0]">
          <div>
            <span className="font-bold text-[#172018] block text-sm">{receipt.merchant?.businessName}</span>
            <p className="text-[#667067]">GSTIN: {receipt.merchant?.gstin}</p>
            <p className="text-[#667067]">Category: {receipt.merchant?.category}</p>
          </div>
          <div className="text-right">
            <span className="font-semibold text-[#172018] block">Order #{receipt.orderId}</span>
            <p className="text-[#667067]">{new Date(receipt.issuedAt).toLocaleString()}</p>
            <p className="text-[#166534] font-mono font-medium">Txn ID: {receipt.payment?.razorpayPaymentId}</p>
          </div>
        </div>

        {/* Itemized Table */}
        <div className="overflow-x-auto border border-[#E2E8F0] rounded-xl">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-neutral-100/70 border-b border-[#E2E8F0] text-[#667067]">
              <tr>
                <th className="p-3">Product Description</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Discount</th>
                <th className="p-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {receipt.items?.map((item: any, i: number) => (
                <tr key={i}>
                  <td className="p-3 font-medium text-[#172018]">{item.name}</td>
                  <td className="p-3 text-right">₹{item.unitPrice?.toLocaleString("en-IN")}</td>
                  <td className="p-3 text-center">{item.quantity}</td>
                  <td className="p-3 text-right text-[#166534]">
                    {item.discount > 0 ? `- ₹${item.discount?.toLocaleString("en-IN")}` : "₹0"}
                  </td>
                  <td className="p-3 text-right font-bold text-[#172018]">
                    ₹{item.subtotal?.toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pricing Summary */}
        <div className="p-4 rounded-xl bg-neutral-50 border border-[#E2E8F0] space-y-1.5 text-xs">
          <div className="flex justify-between text-[#667067]">
            <span>Subtotal:</span>
            <span>₹{receipt.pricing?.subtotal?.toLocaleString("en-IN")}</span>
          </div>
          {receipt.pricing?.discountTotal > 0 && (
            <div className="flex justify-between text-[#166534] font-medium">
              <span>Agentic Discount Total:</span>
              <span>- ₹{receipt.pricing?.discountTotal?.toLocaleString("en-IN")}</span>
            </div>
          )}
          <div className="flex justify-between text-[#667067]">
            <span>Taxes (Included):</span>
            <span>₹0 (GST included)</span>
          </div>
          <div className="pt-2 border-t border-[#E2E8F0] flex justify-between text-base font-bold text-[#172018]">
            <span>Total Amount Paid:</span>
            <span className="text-[#166534]">₹{receipt.pricing?.finalAmount?.toLocaleString("en-IN")}</span>
          </div>
        </div>

        {/* AI Multilingual Draft Message (Requirement #31) */}
        {draftedMessage && (
          <div className="p-4 rounded-xl bg-white border border-[#BBF7D0] shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#166534] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                AI Multilingual Confirmation Draft
              </span>
              <button
                onClick={handleCopyDraft}
                className="text-xs text-[#166534] hover:underline flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "Copied!" : "Copy Draft"}
              </button>
            </div>
            <pre className="p-3 bg-neutral-50 rounded-lg text-xs text-[#172018] font-sans whitespace-pre-wrap border border-[#E2E8F0] leading-relaxed">
              {draftedMessage}
            </pre>
            <p className="text-[10px] text-[#667067] italic">
              * Note: Separated as DRAFT per safety requirements. Can be reviewed and approved by merchant/customer.
            </p>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
          <Button variant="secondary" size="sm" icon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            Print Receipt
          </Button>
          <Button variant="primary" size="sm" onClick={onClose}>
            Done Shopping
          </Button>
        </div>
      </div>
    </Modal>
  );
};
