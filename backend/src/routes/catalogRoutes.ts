import { Router, Request, Response } from "express";
import { searchCatalog, getProductById, getTrendingProducts } from "../services/catalogService.js";
import { Product } from "../models/Product.js";

const router = Router();

router.get("/products", async (req: Request, res: Response) => {
  try {
    const { query, category, minPrice, maxPrice, inStockOnly, limit, page, sortBy } = req.query;
    const result = await searchCatalog({
      query: query as string,
      category: category as string,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStockOnly: inStockOnly === "true",
      limit: limit ? Number(limit) : 20,
      page: page ? Number(page) : 1,
      sortBy: sortBy as any,
    });
    res.json({ success: true, data: result, error: null });
  } catch (error: any) {
    res.status(500).json({ success: false, data: null, error: { code: "FETCH_FAILED", message: error.message } });
  }
});

router.get("/products/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const product = await getProductById(id);
    if (!product) {
      res.status(404).json({ success: false, data: null, error: { code: "NOT_FOUND", message: "Product not found" } });
      return;
    }
    res.json({ success: true, data: product, error: null });
  } catch (error: any) {
    res.status(500).json({ success: false, data: null, error: { code: "FETCH_FAILED", message: error.message } });
  }
});

router.get("/categories", async (req: Request, res: Response) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ success: true, data: categories, error: null });
  } catch (error: any) {
    res.status(500).json({ success: false, data: null, error: { code: "FETCH_FAILED", message: error.message } });
  }
});

router.get("/trending", async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 8;
    const products = await getTrendingProducts(limit);
    res.json({ success: true, data: products, error: null });
  } catch (error: any) {
    res.status(500).json({ success: false, data: null, error: { code: "FETCH_FAILED", message: error.message } });
  }
});

export default router;
