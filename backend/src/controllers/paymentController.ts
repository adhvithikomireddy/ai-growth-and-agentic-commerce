import { Response } from "express";
import crypto from "crypto";
import { getRazorpayInstance, isRazorpayConfigured } from "../config/razorpay.js";
import { env } from "../config/env.js";
import { Order } from "../models/Order.js";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { AuditLog } from "../models/AuditLog.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import { evaluateSpendingPolicy, verifyTransactionPin } from "../security/policyEngine.js";
import { broadcastA2AEvent } from "../a2a/a2aProtocol.js";
import { draftCommerceMessage } from "../ai/aiService.js";
import { logger } from "../utils/logger.js";

export const createRazorpayOrder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Login required" } });
      return;
    }

    const { transactionPin, shippingAddress } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart || cart.items.length === 0) {
      res.status(400).json({
        success: false,
        data: null,
        error: { code: "EMPTY_CART", message: "Your cart is empty." },
      });
      return;
    }

    // Authoritative Database Revalidation
    let subtotal = 0;
    let discountTotal = 0;
    const verifiedOrderItems = [];

    for (const item of cart.items) {
      const product = await Product.findOne({ productId: item.productId });

      if (!product) {
        continue;
      }

      if (product.stock < item.quantity) {
        res.status(400).json({
          success: false,
          data: null,
          error: {
            code: "PRODUCT_OUT_OF_STOCK",
            message: `Product "${product.name}" is no longer available in the requested quantity.`,
          },
        });
        return;
      }

      const livePrice = product.price;
      const discountPercent = item.discountApplied || 0;
      const discountAmount = Math.round((livePrice * discountPercent) / 100);

      subtotal += livePrice * item.quantity;
      discountTotal += discountAmount * item.quantity;

      verifiedOrderItems.push({
        productId: product.productId,
        name: product.name,
        price: livePrice,
        quantity: item.quantity,
        subtotal: livePrice * item.quantity,
        discount: discountAmount * item.quantity,
        imageUrl: product.imageUrl,
      });
    }

    const finalAmount = Math.max(0, subtotal - discountTotal);
    const orderId = `ORD_${Date.now()}_${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
    const requestId = `req_pay_${Date.now()}`;

    // Spending Policy Check
    const policyResult = await evaluateSpendingPolicy(req.user, finalAmount, requestId);
    if (!policyResult.allowed) {
      res.status(403).json({
        success: false,
        data: null,
        error: { code: "SPENDING_LIMIT_EXCEEDED", message: policyResult.reason },
      });
      return;
    }

    // Require PIN check if amount exceeds autonomous limit
    if (policyResult.requiresPin) {
      if (!transactionPin) {
        res.status(403).json({
          success: false,
          data: {
            requiresPin: true,
            amount: finalAmount,
            autonomousLimit: policyResult.autonomousLimit,
          },
          error: {
            code: "AUTHORIZATION_REQUIRED",
            message: policyResult.reason,
          },
        });
        return;
      }

      const isPinValid = await verifyTransactionPin(req.user, transactionPin);
      if (!isPinValid) {
        res.status(401).json({
          success: false,
          data: null,
          error: { code: "INVALID_PIN", message: "Incorrect transaction PIN. Authorization failed." },
        });
        return;
      }
    }

    // Initialize Razorpay Order
    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      res.status(500).json({
        success: false,
        data: null,
        error: {
          code: "RAZORPAY_NOT_CONFIGURED",
          message: "Razorpay test credentials are not configured in backend/.env.",
        },
      });
      return;
    }

    const amountInPaise = Math.round(finalAmount * 100);

    const rzpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: orderId,
      notes: {
        userId: req.user._id.toString(),
        orderId,
        itemsCount: verifiedOrderItems.length.toString(),
      },
    });

    // Save pending Order
    const order = new Order({
      orderId,
      userId: req.user._id,
      merchantId: "merch_apex_001",
      items: verifiedOrderItems,
      subtotal,
      discountTotal,
      tax: 0,
      finalAmount,
      currency: "INR",
      razorpayOrderId: rzpOrder.id,
      paymentStatus: "PENDING",
      orderStatus: "CONFIRMED",
      shippingAddress: shippingAddress || req.user.address,
      authorizationMetadata: {
        authorizedAt: new Date(),
        authorizationMethod: policyResult.requiresPin ? "EXPLICIT_PIN" : "AUTONOMOUS_LIMIT",
        actor: req.user.name,
      },
      aiAssisted: true,
    });

    await order.save();

    broadcastA2AEvent({
      id: `evt_${Date.now()}_rzp_created`,
      timestamp: new Date().toISOString(),
      requestId,
      agent: "Policy Engine",
      action: "RAZORPAY_ORDER_CREATED",
      description: `Razorpay TEST order created for ?${finalAmount.toLocaleString("en-IN")} (${rzpOrder.id}).`,
      status: "completed",
      details: { orderId, razorpayOrderId: rzpOrder.id, finalAmount },
    });

    res.json({
      success: true,
      data: {
        orderId: order.orderId,
        razorpayOrderId: rzpOrder.id,
        amount: amountInPaise,
        currency: "INR",
        keyId: env.RAZORPAY_KEY_ID,
        finalAmount,
        customer: {
          name: req.user.name,
          email: req.user.email,
        },
      },
      error: null,
    });
  } catch (error: any) {
    logger.error("Failed to create Razorpay order:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "PAYMENT_INITIATION_FAILED", message: error.message },
    });
  }
};

export const verifyPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Login required" } });
      return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      res.status(400).json({
        success: false,
        data: null,
        error: { code: "MISSING_SIGNATURE_PARAMS", message: "Payment verification parameters missing." },
      });
      return;
    }

    // Cryptographic HMAC-SHA256 Server-Side Verification
    const secret = env.RAZORPAY_KEY_SECRET;
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto.createHmac("sha256", secret).update(body).digest("hex");

    let isAuthentic = false;
    try {
      isAuthentic = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, "utf-8"),
        Buffer.from(razorpay_signature, "utf-8")
      );
    } catch {
      isAuthentic = false;
    }

    const order = await Order.findOne({ orderId, userId: req.user._id });
    if (!order) {
      res.status(404).json({
        success: false,
        data: null,
        error: { code: "ORDER_NOT_FOUND", message: "Order could not be found." },
      });
      return;
    }

    if (!isAuthentic) {
      order.paymentStatus = "FAILED";
      await order.save();

      res.status(400).json({
        success: false,
        data: null,
        error: {
          code: "PAYMENT_VERIFICATION_FAILED",
          message: "Cryptographic payment verification failed. Unauthorized signature.",
        },
      });
      return;
    }

    // Atomically decrement stock and mark paid
    for (const item of order.items) {
      await Product.updateOne(
        { productId: item.productId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, salesCount: item.quantity } }
      );
    }

    order.paymentStatus = "PAID";
    order.razorpayPaymentId = razorpay_payment_id;
    order.razorpaySignature = razorpay_signature;
    await order.save();

    // Update user spend today
    req.user.spendingControls.spentToday = (req.user.spendingControls.spentToday || 0) + order.finalAmount;
    await req.user.save();

    // Clear cart
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [], negotiatedDiscountPercent: 0 });

    // Draft Multilingual Confirmation Message
    const draftedMessage = draftCommerceMessage("ORDER_CONFIRMATION", order, req.user.language || "en");

    // Audit Log
    const audit = new AuditLog({
      logId: `aud_${Date.now()}`,
      actor: req.user.email,
      userId: req.user._id.toString(),
      agent: "Policy Engine & Razorpay Gateway",
      action: "PAYMENT_VERIFIED_AND_ORDER_FINALIZED",
      requestId: `req_${Date.now()}`,
      orderId: order.orderId,
      amount: order.finalAmount,
      policyResult: "PASSED",
      authorizationResult: "AUTHORIZED",
      paymentResult: "SUCCESS",
      status: "SUCCESS",
      reason: "Cryptographic HMAC-SHA256 verified successfully.",
      metadata: { razorpayPaymentId: razorpay_payment_id, razorpayOrderId: razorpay_order_id },
    });
    await audit.save();

    broadcastA2AEvent({
      id: `evt_${Date.now()}_verified`,
      timestamp: new Date().toISOString(),
      requestId: `req_${Date.now()}`,
      agent: "Policy Engine",
      action: "PAYMENT_CONFIRMED",
      description: `Payment of ?${order.finalAmount.toLocaleString("en-IN")} verified server-side. Order #${order.orderId} finalized.`,
      status: "verified",
      details: { orderId: order.orderId, paymentId: razorpay_payment_id },
    });

    res.json({
      success: true,
      data: {
        order,
        draftedMessage,
        receiptUrl: `/api/receipts/${order.orderId}`,
      },
      error: null,
    });
  } catch (error: any) {
    logger.error("Payment verification failed:", error);
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "VERIFICATION_ERROR", message: error.message },
    });
  }
};
