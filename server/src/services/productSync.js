import products from "../../../src/data/products.js";
import { Product } from "../models/Product.js";

function normalizeProduct(product) {
  return {
    key: product.key,
    title: product.title,
    categoryKey: product.categoryKey,
    price: Number(product.price),
    oldPrice: product.oldPrice ? Number(product.oldPrice) : null,
    badge: product.badge || null,
    image: product.image || "🛍️",
    imageUrl: product.imageUrl || "",
    images: Array.isArray(product.images) ? product.images : [],
    stock: Number.isFinite(Number(product.stock)) ? Number(product.stock) : 100,
    isActive: product.isActive !== false,
  };
}

export async function syncProductsFromCatalog() {
  const operations = products.map((product) => {
    const normalizedProduct = normalizeProduct(product);

    return {
      updateOne: {
        filter: { key: normalizedProduct.key },
        update: { $set: normalizedProduct },
        upsert: true,
      },
    };
  });

  if (operations.length === 0) {
    return { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };
  }

  return Product.bulkWrite(operations, { ordered: false });
}
