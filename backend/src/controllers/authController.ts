import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { Merchant } from "../models/Merchant.js";
import { env } from "../config/env.js";
import { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role = "CUSTOMER", language = "en" } = req.body;

    if (!email || !password || !name) {
      res.status(400).json({
        success: false,
        data: null,
        error: { code: "VALIDATION_ERROR", message: "Email, password, and name are required." },
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        data: null,
        error: { code: "WEAK_PASSWORD", message: "Password must be at least 6 characters." },
      });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409).json({
        success: false,
        data: null,
        error: { code: "USER_ALREADY_EXISTS", message: "An account with this email already exists." },
      });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const defaultPinHash = await bcrypt.hash("1234", salt);

    const userRole = role === "MERCHANT" ? "MERCHANT" : "CUSTOMER";
    const merchantId = userRole === "MERCHANT" ? `merch_${Date.now()}` : undefined;

    const user = new User({
      email: email.toLowerCase(),
      passwordHash,
      name,
      role: userRole,
      merchantId,
      language,
      spendingControls: {
        autonomousLimit: 2000,
        requirePinAbove: 2000,
        transactionPinHash: defaultPinHash,
        maxDailySpend: 100000,
        spentToday: 0,
        lastSpendReset: new Date(),
      },
    });

    await user.save();

    if (userRole === "MERCHANT" && merchantId) {
      const merchant = new Merchant({
        merchantId,
        businessName: `${name}'s Store`,
        ownerUserId: user._id,
        capabilities: [
          "catalog_search",
          "stock_verification",
          "price_verification",
          "bounded_negotiation",
          "order_preparation",
        ],
      });
      await merchant.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          merchantId: user.merchantId,
          language: user.language,
          spendingControls: {
            autonomousLimit: user.spendingControls.autonomousLimit,
            requirePinAbove: user.spendingControls.requirePinAbove,
            maxDailySpend: user.spendingControls.maxDailySpend,
            hasPinSet: Boolean(user.spendingControls.transactionPinHash),
          },
        },
      },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "SIGNUP_FAILED", message: error.message || "Failed to create account." },
    });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        data: null,
        error: { code: "VALIDATION_ERROR", message: "Email and password are required." },
      });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(401).json({
        success: false,
        data: null,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        data: null,
        error: { code: "INVALID_CREDENTIALS", message: "Invalid email or password." },
      });
      return;
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          merchantId: user.merchantId,
          language: user.language,
          spendingControls: {
            autonomousLimit: user.spendingControls.autonomousLimit,
            requirePinAbove: user.spendingControls.requirePinAbove,
            maxDailySpend: user.spendingControls.maxDailySpend,
            hasPinSet: Boolean(user.spendingControls.transactionPinHash),
          },
        },
      },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "LOGIN_FAILED", message: error.message || "Failed to log in." },
    });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Not logged in" } });
    return;
  }

  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        email: req.user.email,
        name: req.user.name,
        role: req.user.role,
        merchantId: req.user.merchantId,
        language: req.user.language,
        spendingControls: {
          autonomousLimit: req.user.spendingControls.autonomousLimit,
          requirePinAbove: req.user.spendingControls.requirePinAbove,
          maxDailySpend: req.user.spendingControls.maxDailySpend,
          hasPinSet: Boolean(req.user.spendingControls.transactionPinHash),
        },
        address: req.user.address,
      },
    },
    error: null,
  });
};

export const updatePreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Not logged in" } });
    return;
  }

  const { language } = req.body;
  if (language && ["en", "hi", "te"].includes(language)) {
    req.user.language = language;
    await req.user.save();
  }

  res.json({
    success: true,
    data: { language: req.user.language },
    error: null,
  });
};

export const updateSpendingControls = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ success: false, data: null, error: { code: "UNAUTHORIZED", message: "Not logged in" } });
    return;
  }

  const { autonomousLimit, requirePinAbove, maxDailySpend, newPin } = req.body;

  if (autonomousLimit !== undefined) req.user.spendingControls.autonomousLimit = Number(autonomousLimit);
  if (requirePinAbove !== undefined) req.user.spendingControls.requirePinAbove = Number(requirePinAbove);
  if (maxDailySpend !== undefined) req.user.spendingControls.maxDailySpend = Number(maxDailySpend);

  if (newPin && typeof newPin === "string" && newPin.length === 4) {
    const salt = await bcrypt.genSalt(10);
    req.user.spendingControls.transactionPinHash = await bcrypt.hash(newPin, salt);
  }

  await req.user.save();

  res.json({
    success: true,
    data: {
      spendingControls: {
        autonomousLimit: req.user.spendingControls.autonomousLimit,
        requirePinAbove: req.user.spendingControls.requirePinAbove,
        maxDailySpend: req.user.spendingControls.maxDailySpend,
        hasPinSet: Boolean(req.user.spendingControls.transactionPinHash),
      },
    },
    error: null,
  });
};
