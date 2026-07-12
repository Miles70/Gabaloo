import { Router } from "express";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { Product } from "../models/Product.js";

export const adminProductListRouter = Router();

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

adminProductListRouter.get("/", requireAdmin, async (request, response, next) => {
  try {
    const requestedPage = Number.parseInt(request.query.page, 10) || 1;
    const requestedLimit = Number.parseInt(request.query.limit, 10) || 20;
    const limit = Math.min(Math.max(requestedLimit, 5), 50);
    const search = String(request.query.search || "").trim();
    const filter = {};

    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { key: pattern },
        { title: pattern },
        { categoryKey: pattern },
      ];
    }

    const [total, catalogTotal, activeTotal] = await Promise.all([
      Product.countDocuments(filter),
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const page = Math.min(Math.max(requestedPage, 1), totalPages);
    const skip = (page - 1) * limit;

    const products = await Product.find(filter)
      .sort({ createdAt: -1, key: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    response.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        catalogTotal,
        activeTotal,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
});
