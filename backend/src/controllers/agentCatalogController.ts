import { Request, Response } from "express";
import {
  getCatalogCapabilities,
  searchCatalog,
  getProductById,
  getTrendingProducts,
  getRelatedProducts,
  getCompatibleProducts,
} from "../services/catalogService.js";

export const getCapabilities = async (req: Request, res: Response): Promise<void> => {
  try {
    const capabilities = await getCatalogCapabilities();
    res.json({
      success: true,
      data: capabilities,
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "CAPABILITIES_FAILED", message: error.message },
    });
  }
};

export const searchAgentCatalog = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, category, minPrice, maxPrice, inStockOnly, limit, page, sortBy } = req.body;
    const result = await searchCatalog({
      query,
      category,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      inStockOnly: inStockOnly !== undefined ? Boolean(inStockOnly) : true,
      limit: limit ? Number(limit) : 20,
      page: page ? Number(page) : 1,
      sortBy,
    });

    res.json({
      success: true,
      data: result,
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "SEARCH_FAILED", message: error.message },
    });
  }
};

export const getAgentProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const product = await getProductById(id);
    if (!product) {
      res.status(404).json({
        success: false,
        data: null,
        error: { code: "PRODUCT_NOT_FOUND", message: `Product ${id} does not exist.` },
      });
      return;
    }

    res.json({
      success: true,
      data: product,
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "PRODUCT_FETCH_FAILED", message: error.message },
    });
  }
};

export const getAgentTrending = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 8;
    const trending = await getTrendingProducts(limit);
    res.json({
      success: true,
      data: { products: trending },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "TRENDING_FAILED", message: error.message },
    });
  }
};

export const getAgentRelated = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const related = await getRelatedProducts(id);
    res.json({
      success: true,
      data: { relatedProducts: related },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "RELATED_FAILED", message: error.message },
    });
  }
};

export const getAgentCompatible = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const compatible = await getCompatibleProducts(id);
    res.json({
      success: true,
      data: { compatibleProducts: compatible },
      error: null,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      data: null,
      error: { code: "COMPATIBLE_FAILED", message: error.message },
    });
  }
};
