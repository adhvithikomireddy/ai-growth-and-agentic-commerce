import React, { useEffect, useState } from "react";
import { Package, FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Order } from "../../types/index.js";
import { api } from "../../api/client.js";
import { Card } from "../../components/ui/Card.js";
import { Badge } from "../../components/ui/Badge.js";
import { Button } from "../../components/ui/Button.js";
import { Skeleton } from "../../components/ui/Skeleton.js";
import { ReceiptModal } from "../../components/checkout/ReceiptModal.js";

export const OrdersView: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  useEffect(() => {
    api.getMyOrders()
      .then((data) => setOrders(data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const handleViewReceipt = async (orderId: string) => {
    try {
      const data = await api.getReceipt(orderId);
      setSelectedReceipt(data.receipt);
      setReceiptModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 text-center bg-white rounded-2xl border border-[#E2E8F0] shadow-xs">
        <Package className="w-10 h-10 text-[#667067] mx-auto mb-3" />
        <h3 className="text-base font-bold text-[#172018] mb-1">No Orders Yet</h3>
        <p className="text-xs text-[#667067]">Completed purchases and verified receipts will appear here.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <h2 className="text-2xl font-bold text-[#172018]">My Order History</h2>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.orderId} className="p-5 overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-[#172018]">Order #{order.orderId}</span>
                <p className="text-[11px] text-[#667067]">{new Date(order.createdAt).toLocaleString()}</p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant={order.paymentStatus === "PAID" ? "success" : "warning"}>
                  {order.paymentStatus}
                </Badge>
                <Button
                  size="sm"
                  variant="secondary"
                  icon={<FileText className="w-3.5 h-3.5" />}
                  onClick={() => handleViewReceipt(order.orderId)}
                >
                  View Receipt
                </Button>
              </div>
            </div>

            {/* Items */}
            <div className="py-3 divide-y divide-[#E2E8F0]">
              {order.items.map((item, i) => (
                <div key={i} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-[#172018]">{item.name}</p>
                      <span className="text-[10px] text-[#667067]">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-[#172018]">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
              <span className="text-[#667067]">
                Payment: <strong className="font-mono text-[#172018]">{order.razorpayPaymentId || "Verified"}</strong>
              </span>
              <span className="text-base font-bold text-[#166534]">
                Total: ₹{order.finalAmount.toLocaleString("en-IN")}
              </span>
            </div>
          </Card>
        ))}
      </div>

      <ReceiptModal
        isOpen={receiptModalOpen}
        onClose={() => setReceiptModalOpen(false)}
        receipt={selectedReceipt}
      />
    </div>
  );
};
