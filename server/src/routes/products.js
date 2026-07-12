import { Router } from "express";
import { Product } from "../models/Product.js";

export const productsRouter = Router();

const QUALITY_SOURCE = "amazon-reviews-2023";

productsRouter.get("/", async (request, response, next) => {
  try {
    const category = String(request.query.category || "").trim();
    const filter = {
      isActive: true,
      source: QUALITY_SOURCE,
    };

    if (category) {
      filter.categoryKey = category;
    }

    const products = await Product.find(filter)
      .sort({ popularity: -1, rating: -1, reviewCount: -1 })
      .limit(100)
      .lean();

    response.json({ products });
  } catch (error) {
    next(error);
  }
});

productsRouter.get("/:productKey", async (request, response, next) => {
  try {
    const product = await Product.findOne({
      key: request.params.productKey,
      isActive: true,
      source: QUALITY_SOURCE,
    }).lean();

    if (!product) {
      return response.status(404).json({ message: "Product not found." });
    }

    return response.json({ product });
  } catch (error) {
    return next(error);
  }
});
