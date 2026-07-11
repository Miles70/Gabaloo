import { Product } from "../models/Product.js";

const TARGET_DEFAULT = 2000;
const PAGE_SIZE = 100;
const PAGE_LIMIT = 10;
const MIN_DELAY = 6100;
const SORT_POOLS = ["unique_scans_n", "created_t", "last_modified_t"];

const DEMO_KEYS = [
  "macbookPro", "smartWatch", "smartphonePro", "mirrorlessCamera",
  "wirelessHeadphones", "tabletPro", "bluetoothSpeaker", "basicTshirt",
  "runningShoes", "classicSunglasses", "urbanBackpack", "premiumHoodie",
  "leatherJacket", "deskLamp", "officeChair", "modernSofa", "coffeeMaker",
  "indoorPlant", "woodenTable", "gamingHeadset", "mechanicalKeyboard",
  "wirelessController", "gamingMouse", "gamingMonitor", "streamingMicrophone",
];

const SOURCES = [
  {
    type: "product",
    baseUrl: "https://world.openproductsfacts.org",
    categoryKey: "marketplace",
    categoryLabel: "Marketplace",
    icon: "📦",
    weight: 0.3,
    minPrice: 8,
    maxPrice: 1200,
  },
  {
    type: "food",
    baseUrl: "https://world.openfoodfacts.org",
    categoryKey: "groceries",
    categoryLabel: "Groceries",
    icon: "🛒",
    weight: 0.35,
    minPrice: 2,
    maxPrice: 80,
  },
  {
    type: "beauty",
    baseUrl: "https://world.openbeautyfacts.org",
    categoryKey: "beauty",
    categoryLabel: "Beauty & Care",
    icon: "✨",
    weight: 0.225,
    minPrice: 5,
    maxPrice: 250,
  },
  {
    type: "petfood",
    baseUrl: "https://world.openpetfoodfacts.org",
    categoryKey: "pet-supplies",
    categoryLabel: "Pet Supplies",
    icon: "🐾",
    weight: 0.125,
    minPrice: 4,
    maxPrice: 150,
  },
];

const FIELDS = [
  "code", "product_name", "product_name_en", "generic_name", "brands",
  "categories", "categories_tags", "quantity", "image_front_url",
  "image_url", "selected_images",
].join(",");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();

function positiveInt(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function hash(value) {
  let result = 2166136261;
  for (const char of String(value)) {
    result ^= char.charCodeAt(0);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function collectUrls(value, output = []) {
  if (!value) return output;
  if (typeof value === "string") {
    if (/^https:\/\//i.test(value)) output.push(value);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectUrls(item, output));
  } else if (typeof value === "object") {
    Object.values(value).forEach((item) => collectUrls(item, output));
  }
  return output;
}

function normalize(remote, source, position) {
  const code = clean(remote.code);
  const title = clean(
    remote.product_name || remote.product_name_en || remote.generic_name
  );
  const images = [
    remote.image_front_url,
    remote.image_url,
    ...collectUrls(remote.selected_images),
  ]
    .filter((url) => /^https:\/\//i.test(String(url || "")))
    .filter((url, index, list) => list.indexOf(url) === index)
    .slice(0, 8);

  if (!code || title.length < 2 || images.length === 0) return null;

  const fingerprint = hash(`${source.type}:${code}`);
  const spread = Math.max(1, source.maxPrice - source.minPrice);
  const price = Number(`${source.minPrice + (fingerprint % spread)}.99`);
  const discount = fingerprint % 4 === 0;
  const oldPrice = discount
    ? Number((price / (1 - (10 + (fingerprint % 26)) / 100)).toFixed(2))
    : null;
  const brand = clean(remote.brands).split(",")[0].trim();
  const quantity = clean(remote.quantity);
  const category =
    clean(remote.categories).split(",")[0].trim() ||
    clean(remote.categories_tags?.[0]).replace(/^[a-z]{2}:/i, "").replace(/-/g, " ");
  const description = [brand, quantity, category].filter(Boolean).join(" • ");

  return {
    key: `openfacts-${source.type}-${code}`,
    title,
    description: description || `Imported from ${source.categoryLabel} catalog.`,
    brand,
    quantity,
    categoryKey: source.categoryKey,
    categoryLabel: source.categoryLabel,
    price,
    oldPrice,
    badge: discount ? "sale" : fingerprint % 3 === 0 ? "new" : "stock",
    image: source.icon,
    imageUrl: images[0],
    images,
    stock: 10 + (fingerprint % 290),
    rating: Number((3.5 + (fingerprint % 15) / 10).toFixed(1)),
    reviewCount: 10 + (fingerprint % 2990),
    popularity: Math.max(1, 100000 - position),
    source: "openfacts",
    sourceType: source.type,
    sourceCode: code,
    sourceUrl: `${source.baseUrl}/product/${encodeURIComponent(code)}`,
    isActive: true,
  };
}

function searchUrl(source, page, sortBy, sorted = true) {
  const url = new URL("/api/v2/search", source.baseUrl);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("page", String(page));
  url.searchParams.set("page_size", String(PAGE_SIZE));
  if (sorted) url.searchParams.set("sort_by", sortBy);
  return url;
}

async function fetchJson(url, headers, attempt = 1) {
  try {
    const response = await fetch(url, { headers });
    if (response.ok) return response.json();

    if ([429, 502, 503, 504].includes(response.status) && attempt < 4) {
      await sleep(15000 * attempt);
      return fetchJson(url, headers, attempt + 1);
    }

    const error = new Error(
      `Open Facts request failed (${response.status}) for ${url.hostname}.`
    );
    error.statusCode = response.status;
    throw error;
  } catch (error) {
    if (error.statusCode) throw error;
    if (attempt < 4) {
      await sleep(15000 * attempt);
      return fetchJson(url, headers, attempt + 1);
    }
    throw error;
  }
}

async function fetchPage(source, page, sortBy, headers) {
  try {
    return await fetchJson(searchUrl(source, page, sortBy), headers);
  } catch (error) {
    if (![400, 404, 422].includes(error.statusCode)) throw error;
    return fetchJson(searchUrl(source, page, sortBy, false), headers);
  }
}

async function collectSource({
  source,
  quota,
  seen,
  delay,
  userAgent,
  startPosition,
}) {
  const products = [];
  const headers = { Accept: "application/json", "User-Agent": userAgent };

  for (const sortBy of SORT_POOLS) {
    for (let page = 1; page <= PAGE_LIMIT; page += 1) {
      let payload;
      try {
        payload = await fetchPage(source, page, sortBy, headers);
      } catch (error) {
        if (error.statusCode === 401) {
          console.warn(
            `[${source.type}/${sortBy}] page ${page} returned 401; switching pool.`
          );
          break;
        }
        throw error;
      }

      const remoteProducts = Array.isArray(payload.products)
        ? payload.products
        : [];
      if (remoteProducts.length === 0) break;

      const before = products.length;
      for (const remote of remoteProducts) {
        const product = normalize(
          remote,
          source,
          startPosition + products.length
        );
        if (!product || seen.has(product.key)) continue;
        seen.add(product.key);
        products.push(product);
        if (products.length >= quota) return products;
      }

      console.log(
        `[${source.type}/${sortBy}] page ${page}: +${products.length - before}, ${products.length}/${quota}`
      );
      if (page < PAGE_LIMIT) await sleep(delay);
    }

    if (products.length < quota) await sleep(delay);
  }

  return products;
}

function allocate(target) {
  let used = 0;
  return SOURCES.map((source, index) => {
    const quota =
      index === SOURCES.length - 1
        ? target - used
        : Math.floor(target * source.weight);
    used += quota;
    return { ...source, quota };
  });
}

async function writeProducts(products) {
  const totals = { matchedCount: 0, modifiedCount: 0, upsertedCount: 0 };

  for (let index = 0; index < products.length; index += 500) {
    const result = await Product.bulkWrite(
      products.slice(index, index + 500).map((product) => ({
        updateOne: {
          filter: { key: product.key },
          update: { $set: product },
          upsert: true,
        },
      })),
      { ordered: false }
    );

    totals.matchedCount += result.matchedCount || 0;
    totals.modifiedCount += result.modifiedCount || 0;
    totals.upsertedCount += result.upsertedCount || 0;
  }

  return totals;
}

export async function importOpenFactsCatalog(options = {}) {
  const target = positiveInt(
    options.target ?? process.env.OPENFACTS_TARGET,
    TARGET_DEFAULT
  );
  const delay = Math.max(
    MIN_DELAY,
    positiveInt(
      options.requestDelayMs ?? process.env.OPENFACTS_REQUEST_DELAY_MS,
      6500
    )
  );
  const userAgent = clean(
    options.userAgent ??
      process.env.OPENFACTS_USER_AGENT ??
      "Kemalreis/0.1 (https://github.com/Miles70/kemalreis)"
  );

  const products = [];
  const seen = new Set();
  const sourceCounts = {};

  for (const source of allocate(target)) {
    try {
      const collected = await collectSource({
        source,
        quota: source.quota,
        seen,
        delay,
        userAgent,
        startPosition: products.length,
      });
      products.push(...collected);
      sourceCounts[source.type] = collected.length;
    } catch (error) {
      sourceCounts[source.type] = 0;
      console.warn(`[${source.type}] source skipped: ${error.message}`);
    }

    if (products.length < target) await sleep(delay);
  }

  if (products.length < target) {
    throw new Error(
      `Open Facts returned only ${products.length} usable products. Existing demo products were not deleted.`
    );
  }

  const finalProducts = products.slice(0, target);
  const result = await writeProducts(finalProducts);
  const activeKeys = finalProducts.map((product) => product.key);

  const [demoDelete, staleDelete] = await Promise.all([
    Product.deleteMany({ key: { $in: DEMO_KEYS } }),
    Product.deleteMany({
      source: "openfacts",
      key: { $nin: activeKeys },
    }),
  ]);

  return {
    target,
    importedCount: finalProducts.length,
    ...result,
    deletedDemoCount: demoDelete.deletedCount || 0,
    deletedStaleCount: staleDelete.deletedCount || 0,
    sourceCounts,
  };
}
