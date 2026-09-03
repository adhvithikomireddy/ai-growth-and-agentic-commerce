import { Request, Response } from "express";
import {
  analyzeReverseShoppingGoal,
  refineReverseShoppingSolution,
} from "../services/reverseShoppingService.js";
import { Product } from "../models/Product.js";

export const handleAnalyzeGoal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { goal, language = "en", budget, exclusions = [] } = req.body;

    if (!goal || typeof goal !== "string") {
      res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_GOAL", message: "Goal statement is required." },
      });
      return;
    }

    const result = await analyzeReverseShoppingGoal(goal, language, budget, exclusions);

    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "REVERSE_ANALYSIS_FAILED", message: error.message },
    });
  }
};

export const handleRefineSolution = async (req: Request, res: Response): Promise<void> => {
  try {
    const { currentSolution, instruction } = req.body;

    if (!currentSolution || !instruction) {
      res.status(400).json({
        success: false,
        data: null,
        error: { code: "INVALID_PAYLOAD", message: "Current solution and instruction are required." },
      });
      return;
    }

    const result = await refineReverseShoppingSolution(currentSolution, instruction);

    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "REFINE_FAILED", message: error.message },
    });
  }
};

export const handleGetAlternatives = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, currentProductId, maxPrice } = req.body;

    const filter: any = {
      stock: { $gt: 0 },
    };

    if (currentProductId) {
      filter.productId = { $ne: currentProductId };
    }

    if (category) {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    if (maxPrice) {
      filter.price = { $lte: maxPrice * 1.3 }; // allow reasonable window
    }

    const alternatives = await Product.find(filter).sort({ salesCount: -1, rating: -1 }).limit(10);

    res.json({
      success: true,
      data: { alternatives },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "GET_ALTERNATIVES_FAILED", message: error.message },
    });
  }
};
