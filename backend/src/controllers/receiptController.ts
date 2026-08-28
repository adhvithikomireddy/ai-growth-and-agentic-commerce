import { Request, Response } from "express";
import { Order } from "../models/Order.js";
import { Merchant } from "../models/Merchant.js";
import { User } from "../models/User.js";

export const getReceipt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({ orderId });
    if (!order) {
      res.status(404).json({
        success: false,
        data: null,
        error: { code: "RECEIPT_NOT_FOUND", message: `Order #${orderId} does not exist.` },
      });
      return;
    }

    const [merchant, user] = await Promise.all([
      Merchant.findOne({ merchantId: order.merchantId }),
      User.findById(order.userId).select("name email"),
    ]);

    const receipt = {
      receiptNumber: `REC-${order.orderId}`,
      issuedAt: order.createdAt,
      orderId: order.orderId,
      merchant: {
        businessName: merchant?.businessName || "Apex Nova Lifestyle & Tech",
        gstin: merchant?.gstin || "29AABCU9603R1ZM",
        category: merchant?.category || "Electronics & Lifestyle",
        currency: order.currency,
      },
      customer: {
        name: user?.name || "Customer",
        email: user?.email || "",
        shippingAddress: order.shippingAddress,
      },
      items: order.items.map(item => ({
        productId: item.productId,
        name: item.name,
        unitPrice: item.price,
        quantity: item.quantity,
        discount: item.discount,
        subtotal: item.subtotal - (item.discount || 0),
      })),
      pricing: {
        subtotal: order.subtotal,
        discountTotal: order.discountTotal,
        tax: order.tax,
        finalAmount: order.finalAmount,
        currency: order.currency,
      },
      payment: {
        provider: "Razorpay Payment Gateway (Test Mode)",
        paymentStatus: order.paymentStatus,
        razorpayOrderId: order.razorpayOrderId,
        razorpayPaymentId: order.razorpayPaymentId || "PENDING",
        authorizationMethod: order.authorizationMetadata?.authorizationMethod || "AUTONOMOUS_LIMIT",
        authorizedAt: order.authorizationMetadata?.authorizedAt || order.createdAt,
      },
    };

    res.json({
      success: true,
      data: { receipt },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "RECEIPT_ERROR", message: error.message },
    });
  }
};
