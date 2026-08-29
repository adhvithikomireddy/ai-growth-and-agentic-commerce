import { Response } from "express";
import { Cart } from "../models/Cart.js";
import { Product } from "../models/Product.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const getCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Log in required" } });
      return;
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
      await cart.save();
    }

    // Re-verify authoritative prices from Product collection
    let subtotal = 0;
    let discountTotal = 0;
    const validatedItems: any[] = [];

    for (const item of cart.items) {
      const product = await Product.findOne({ productId: item.productId });
      if (product && product.stock > 0) {
        const livePrice = product.price;
        const discountAmount = Math.round((livePrice * (item.discountApplied || 0)) / 100);
        const effectivePrice = livePrice - discountAmount;

        subtotal += livePrice * item.quantity;
        discountTotal += discountAmount * item.quantity;

        validatedItems.push({
          productId: item.productId,
          name: product.name,
          price: livePrice,
          effectivePrice,
          quantity: item.quantity,
          discountApplied: item.discountApplied || 0,
          imageUrl: product.imageUrl,
          stock: product.stock,
          inStock: product.stock >= item.quantity,
        });
      }
    }

    if (validatedItems.length !== cart.items.length) {
      cart.items = cart.items.filter(item => validatedItems.some(v => v.productId === item.productId));
      await cart.save();
    }

    const finalAmount = Math.max(0, subtotal - discountTotal);

    res.json({
      success: true,
      data: {
        items: validatedItems,
        subtotal,
        discountTotal,
        finalAmount,
        negotiatedDiscountPercent: cart.negotiatedDiscountPercent || 0,
      },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "CART_FETCH_FAILED", message: error.message },
    });
  }
};

export const addToCart = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Log in required" } });
      return;
    }

    const { productId, quantity = 1, discountPercent = 0 } = req.body;
    const product = await Product.findOne({ productId });

    if (!product) {
      res.status(404).json({
        success: false,
        data: null,
        error: { code: "PRODUCT_NOT_FOUND", message: "Selected product does not exist." },
      });
      return;
    }

    if (product.stock < quantity) {
      res.status(400).json({
        success: false,
        data: null,
        error: { code: "INSUFFICIENT_STOCK", message: `Only ${product.stock} units available.` },
      });
      return;
    }

    let cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      cart = new Cart({ userId: req.user._id, items: [] });
    }

    const existingIndex = cart.items.findIndex(i => i.productId === productId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
      if (discountPercent > 0) {
        cart.items[existingIndex].discountApplied = discountPercent;
      }
    } else {
      cart.items.push({
        productId: product.productId,
        name: product.name,
        price: product.price,
        quantity,
        discountApplied: discountPercent,
        imageUrl: product.imageUrl,
      });
    }

    await cart.save();

    res.json({
      success: true,
      data: { message: `Added ${product.name} to cart.`, cart },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "ADD_TO_CART_FAILED", message: error.message },
    });
  }
};

export const updateCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Log in required" } });
      return;
    }

    const { productId, quantity } = req.body;
    const cart = await Cart.findOne({ userId: req.user._id });

    if (!cart) {
      res.status(404).json({ success: false, data: null, error: { code: "CART_NOT_FOUND", message: "Cart not found." } });
      return;
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.productId !== productId) as any;
    } else {
      const item = cart.items.find(i => i.productId === productId);
      if (item) item.quantity = quantity;
    }

    await cart.save();
    res.json({ success: true, data: { cart }, error: null });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "UPDATE_CART_FAILED", message: error.message },
    });
  }
};

export const removeCartItem = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Log in required" } });
      return;
    }

    const { productId } = req.params;
    const cart = await Cart.findOne({ userId: req.user._id });
    if (cart) {
      cart.items = cart.items.filter(i => i.productId !== productId) as any;
      await cart.save();
    }

    res.json({ success: true, data: { message: "Item removed." }, error: null });
  } catch (error: any) {
    res.status(500).json({ success: false, data: null, error: { code: "REMOVE_FAILED", message: error.message } });
  }
};

export const applyNegotiatedOffer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Log in required" } });
      return;
    }

    const { productId, discountPercent, offerToken } = req.body;
    if (!productId || !discountPercent) {
      res.status(400).json({ success: false, data: null, error: { code: "INVALID_REQUEST", message: "Missing offer details." } });
      return;
    }

    // Enforce max discount threshold (10%) server-side
    const sanitizedDiscount = Math.min(Number(discountPercent), 10);

    const cart = await Cart.findOne({ userId: req.user._id });
    if (!cart) {
      res.status(404).json({ success: false, data: null, error: { code: "CART_NOT_FOUND", message: "Cart not found." } });
      return;
    }

    const item = cart.items.find(i => i.productId === productId);
    if (item) {
      item.discountApplied = sanitizedDiscount;
      cart.negotiatedDiscountPercent = sanitizedDiscount;
      await cart.save();
    }

    res.json({
      success: true,
      data: { message: `Applied ${sanitizedDiscount}% discount to product.`, discountPercent: sanitizedDiscount },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, data: null, error: { code: "OFFER_APPLY_FAILED", message: error.message } });
  }
};
