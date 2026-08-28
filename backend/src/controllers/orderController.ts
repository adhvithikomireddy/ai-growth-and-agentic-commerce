import { Response } from "express";
import { Order } from "../models/Order.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const getMyOrders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Login required" } });
      return;
    }

    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { orders },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "ORDERS_FETCH_FAILED", message: error.message },
    });
  }
};

export const getOrderById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Login required" } });
      return;
    }

    const order = await Order.findOne({ orderId: req.params.id, userId: req.user._id });
    if (!order) {
      res.status(404).json({
        success: false,
        data: null,
        error: { code: "ORDER_NOT_FOUND", message: "Order not found." },
      });
      return;
    }

    res.json({
      success: true,
      data: { order },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "ORDER_FETCH_FAILED", message: error.message },
    });
  }
};
