import { legacyDemoProductKeys } from "../data/legacyDemoProductKeys.js";
import { Product } from "../models/Product.js";

export async function syncProductsFromCatalog() {
  const cleanupResult = await Product.deleteMany({
    key: { $in: legacyDemoProductKeys },
  });

  return {
    matchedCount: 0,
    modifiedCount: 0,
    upsertedCount: 0,
    deletedCount: cleanupResult.deletedCount || 0,
  };
}
