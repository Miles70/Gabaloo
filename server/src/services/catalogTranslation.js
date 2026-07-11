import { createHash } from "node:crypto";

export const CATALOG_LANGUAGES = Object.freeze(["en", "tr", "ru", "ar", "zh"]);
export const TRANSLATABLE_CATALOG_LANGUAGES = Object.freeze([
  "tr",
  "ru",
  "ar",
  "zh",
]);
export const CATALOG_TRANSLATION_SCHEMA_VERSION = 2;

const SUPPORTED_LANGUAGE_SET = new Set(CATALOG_LANGUAGES);
const DEEPL_TARGET_LANGUAGES = {
  tr: "TR",
  ru: "RU",
  ar: "AR",
  zh: "ZH-HANS",
};

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeStringList(value, limit = 12) {
  if (!Array.isArray(value)) return [];

  return value
    .map(normalizeText)
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeDetails(value, limit = 16) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, detailValue]) => [
        normalizeText(key),
        normalizeText(detailValue),
      ])
      .filter(([key, detailValue]) => key && detailValue)
      .slice(0, limit)
  );
}

export function normalizeCatalogLanguage(value) {
  const normalized = String(value || "en")
    .trim()
    .toLowerCase()
    .split("-")[0];

  return SUPPORTED_LANGUAGE_SET.has(normalized) ? normalized : "en";
}

export function buildCatalogSourceSnapshot(product) {
  return {
    sourceLanguage: normalizeCatalogLanguage(product.sourceLanguage || "en"),
    title: normalizeText(product.title),
    description: normalizeText(product.description),
    categoryLabel: normalizeText(product.categoryLabel),
    brand: normalizeText(product.brand),
    features: normalizeStringList(product.features),
    details: normalizeDetails(product.details),
  };
}

export function calculateProductSourceHash(product) {
  const snapshot = buildCatalogSourceSnapshot(product);
  return createHash("sha256")
    .update(JSON.stringify(snapshot))
    .digest("hex");
}

function getProductSourceHash(product) {
  return calculateProductSourceHash(product);
}

function getTranslationMeta(product, language) {
  const meta = product.translationMeta?.[language];
  return meta && typeof meta === "object" ? meta : {};
}

function isReadyTranslation(product, language) {
  if (language === "en") return true;

  const sourceHash = getProductSourceHash(product);
  const translation = product.translations?.[language];
  const meta = getTranslationMeta(product, language);

  return Boolean(
    translation?.title &&
      meta.status === "ready" &&
      meta.sourceHash === sourceHash &&
      Number(meta.schemaVersion) === CATALOG_TRANSLATION_SCHEMA_VERSION
  );
}

export function getCatalogTranslationState(product, requestedLanguage) {
  const language = normalizeCatalogLanguage(requestedLanguage);

  if (language === "en") {
    return {
      language,
      status: "ready",
      sourceHash: getProductSourceHash(product),
      available: true,
    };
  }

  const meta = getTranslationMeta(product, language);
  return {
    language,
    status: isReadyTranslation(product, language)
      ? "ready"
      : meta.status || "missing",
    sourceHash: meta.sourceHash || "",
    available: isReadyTranslation(product, language),
    error: meta.error || "",
  };
}

function mergeCatalogTranslation(product, translation, language) {
  const { translations, translationMeta, ...publicProduct } = product;

  return {
    ...publicProduct,
    title: translation.title || publicProduct.title,
    description: translation.description || publicProduct.description,
    categoryLabel: translation.categoryLabel || publicProduct.categoryLabel,
    features: Array.isArray(translation.features)
      ? translation.features
      : publicProduct.features,
    details:
      translation.details && typeof translation.details === "object"
        ? translation.details
        : publicProduct.details,
    requestedLanguage: language,
    translationLanguage: language,
    translationStatus: "ready",
  };
}

export function applyCachedCatalogTranslation(productValue, requestedLanguage) {
  const language = normalizeCatalogLanguage(requestedLanguage);
  const product =
    typeof productValue?.toObject === "function"
      ? productValue.toObject()
      : productValue;

  if (!product) return product;

  if (language === "en") {
    const { translations, translationMeta, ...publicProduct } = product;
    return {
      ...publicProduct,
      requestedLanguage: language,
      translationLanguage: "en",
      translationStatus: "ready",
    };
  }

  if (isReadyTranslation(product, language)) {
    return mergeCatalogTranslation(
      product,
      product.translations[language],
      language
    );
  }

  const { translations, translationMeta, ...publicProduct } = product;
  return {
    ...publicProduct,
    requestedLanguage: language,
    translationLanguage: "en",
    translationStatus: getTranslationMeta(product, language).status || "missing",
  };
}

function getDeepLApiKey() {
  const apiKey = normalizeText(
    process.env.DEEPL_API_KEY || process.env.TRANSLATION_API_KEY
  );

  if (!apiKey) {
    throw new Error(
      "DEEPL_API_KEY is missing. Add it to server/.env before translating the catalog."
    );
  }

  return apiKey;
}

function getDeepLEndpoint(apiKey) {
  const configured = normalizeText(
    process.env.DEEPL_API_URL || process.env.TRANSLATION_API_URL
  );

  if (configured) return configured.replace(/\/$/, "");
  return apiKey.endsWith(":fx")
    ? "https://api-free.deepl.com/v2/translate"
    : "https://api.deepl.com/v2/translate";
}

function getDeepLGlossaryId(language) {
  const environmentKey = `DEEPL_GLOSSARY_ID_${language.toUpperCase()}`;
  return normalizeText(process.env[environmentKey]);
}

function collectProtectedTerms(product) {
  const source = buildCatalogSourceSnapshot(product);
  const combined = [
    source.title,
    source.description,
    ...source.features,
    ...Object.values(source.details),
  ].join(" ");

  const detectedTerms = [
    ...(combined.match(
      /\b(?=[A-Za-z0-9._/+%-]*[A-Za-z])(?=[A-Za-z0-9._/+%-]*\d)[A-Za-z0-9][A-Za-z0-9._/+%-]*\b/g
    ) || []),
    ...(combined.match(/\b[A-Z]{2,}(?:-[A-Z0-9]+)*\b/g) || []),
    ...(combined.match(/\b\d+(?:[.,]\d+)?\s?(?:mm|cm|m|km|g|kg|ml|l|v|w|hz|mah|gb|tb|inch|in)\b/gi) || []),
  ];

  const protectedBrand =
    source.brand &&
    source.brand.toLowerCase() !== source.categoryLabel.toLowerCase()
      ? source.brand
      : "";

  return [...new Set([protectedBrand, ...detectedTerms].filter(Boolean))]
    .sort((left, right) => right.length - left.length)
    .slice(0, 80);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function protectText(value, protectedTerms) {
  let text = normalizeText(value);
  const replacements = [];

  protectedTerms.forEach((term) => {
    const pattern = new RegExp(escapeRegExp(term), "gi");

    if (!pattern.test(text)) return;

    const placeholder = `KRPROTECTED${replacements.length}TOKEN`;
    replacements.push(term);
    text = text.replace(pattern, placeholder);
  });

  return { text, replacements };
}

function restoreProtectedText(value, replacements) {
  return replacements.reduce((result, term, index) => {
    const pattern = new RegExp(
      `KR\\s*PROTECTED\\s*${index}\\s*TOKEN`,
      "gi"
    );
    return result.replace(pattern, term);
  }, normalizeText(value));
}

function shouldTranslateDetailValue(value) {
  const text = normalizeText(value);
  if (text.length < 3) return false;
  if (/^https?:\/\//i.test(text)) return false;
  if (/^[\d\s.,:/+%°\-"'×x()]+$/.test(text)) return false;

  const letters = (text.match(/\p{L}/gu) || []).length;
  const digits = (text.match(/\d/g) || []).length;
  return letters >= 3 && letters >= digits;
}

function createTranslationItems(product) {
  const source = buildCatalogSourceSnapshot(product);
  const items = [
    { type: "title", value: source.title },
    { type: "description", value: source.description },
    { type: "categoryLabel", value: source.categoryLabel },
  ];

  source.features.forEach((feature, index) => {
    items.push({ type: "feature", index, value: feature });
  });

  Object.entries(source.details).forEach(([label, value], index) => {
    items.push({ type: "detailLabel", index, label, value: label });

    if (shouldTranslateDetailValue(value)) {
      items.push({ type: "detailValue", index, label, value });
    }
  });

  return {
    source,
    items: items.filter((item) => item.value),
  };
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeoutMs = Math.max(
    5000,
    Number(process.env.TRANSLATION_TIMEOUT_MS || 30000)
  );
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...options.headers,
      },
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message =
        payload.message ||
        payload.detail ||
        payload.error ||
        `Translation request failed (${response.status}).`;
      const error = new Error(message);
      error.status = response.status;
      throw error;
    }

    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

async function translateWithDeepL({
  texts,
  targetLanguage,
  context,
  glossaryId,
}) {
  const apiKey = getDeepLApiKey();
  const endpoint = getDeepLEndpoint(apiKey);
  const targetLang = DEEPL_TARGET_LANGUAGES[targetLanguage];

  if (!targetLang) {
    throw new Error(`DeepL target language is not configured: ${targetLanguage}`);
  }

  const body = {
    text: texts,
    source_lang: "EN",
    target_lang: targetLang,
    preserve_formatting: true,
    split_sentences: "nonewlines",
  };

  if (context) body.context = context;
  if (glossaryId) body.glossary_id = glossaryId;

  const payload = await fetchJson(endpoint, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const translatedTexts = Array.isArray(payload.translations)
    ? payload.translations.map((item) => normalizeText(item?.text))
    : [];

  if (translatedTexts.length !== texts.length || translatedTexts.some((text) => !text)) {
    throw new Error("DeepL returned an incomplete translation batch.");
  }

  return translatedTexts;
}

async function translateTexts({ texts, targetLanguage, context }) {
  const provider = normalizeText(
    process.env.TRANSLATION_PROVIDER || "deepl"
  ).toLowerCase();

  if (provider !== "deepl") {
    throw new Error(
      `Unsupported production translation provider: ${provider}. Use TRANSLATION_PROVIDER=deepl.`
    );
  }

  return translateWithDeepL({
    texts,
    targetLanguage,
    context,
    glossaryId: getDeepLGlossaryId(targetLanguage),
  });
}

function buildTranslationPayload(product, language, items, translatedValues) {
  const source = buildCatalogSourceSnapshot(product);
  const detailEntries = Object.entries(source.details);
  const payload = {
    title: source.title,
    description: source.description,
    categoryLabel: source.categoryLabel,
    features: [...source.features],
    details: { ...source.details },
  };

  items.forEach((item, index) => {
    const translatedValue = translatedValues[index] || item.value;

    if (item.type === "title") payload.title = translatedValue;
    if (item.type === "description") payload.description = translatedValue;
    if (item.type === "categoryLabel") payload.categoryLabel = translatedValue;
    if (item.type === "feature") payload.features[item.index] = translatedValue;

    if (item.type === "detailLabel") {
      const [, originalValue] = detailEntries[item.index] || [];
      delete payload.details[item.label];
      payload.details[translatedValue] = originalValue || "";
    }

    if (item.type === "detailValue") {
      const [originalLabel] = detailEntries[item.index] || [];
      const translatedLabelItem = items.find(
        (candidate) =>
          candidate.type === "detailLabel" && candidate.index === item.index
      );
      const translatedLabelIndex = items.indexOf(translatedLabelItem);
      const translatedLabel =
        translatedValues[translatedLabelIndex] || originalLabel || item.label;

      payload.details[translatedLabel] = translatedValue;
    }
  });

  return {
    ...payload,
    language,
    sourceLanguage: "en",
  };
}

function countTargetScriptCharacters(text, language) {
  const patterns = {
    ru: /[\u0400-\u04FF]/g,
    ar: /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/g,
    zh: /[\u3400-\u4DBF\u4E00-\u9FFF]/g,
  };

  const pattern = patterns[language];
  return pattern ? (String(text).match(pattern) || []).length : 0;
}

function validateTranslation(product, language, translation) {
  const source = buildCatalogSourceSnapshot(product);
  const translatedCombined = [
    translation.title,
    translation.description,
    ...translation.features,
    ...Object.keys(translation.details || {}),
    ...Object.values(translation.details || {}),
  ].join(" ");

  if (!normalizeText(translation.title)) {
    throw new Error("Translated title is empty.");
  }

  if (
    source.description &&
    !normalizeText(translation.description)
  ) {
    throw new Error("Translated description is empty.");
  }

  const sourceComparable = normalizeText(
    `${source.title} ${source.description}`
  ).toLowerCase();
  const translatedComparable = normalizeText(
    `${translation.title} ${translation.description}`
  ).toLowerCase();

  if (
    sourceComparable.length > 40 &&
    sourceComparable === translatedComparable
  ) {
    throw new Error("Provider returned the original English content.");
  }

  if (["ru", "ar", "zh"].includes(language)) {
    const targetCharacters = countTargetScriptCharacters(
      translatedCombined,
      language
    );

    if (translatedCombined.length > 60 && targetCharacters < 4) {
      throw new Error(
        `Translation validation failed for ${language}: target script was not detected.`
      );
    }
  }

  if (/KR\s*PROTECTED\s*\d+\s*TOKEN/i.test(translatedCombined)) {
    throw new Error("A protected product token could not be restored.");
  }
}

export async function createCatalogTranslation(product, requestedLanguage) {
  const language = normalizeCatalogLanguage(requestedLanguage);

  if (!TRANSLATABLE_CATALOG_LANGUAGES.includes(language)) {
    throw new Error(`Catalog translation language is not supported: ${language}`);
  }

  const sourceHash = getProductSourceHash(product);
  const { source, items } = createTranslationItems(product);
  const protectedTerms = collectProtectedTerms(product);
  const protectedItems = items.map((item) =>
    protectText(item.value, protectedTerms)
  );

  const translatedValues = await translateTexts({
    texts: protectedItems.map((item) => item.text),
    targetLanguage: language,
    context: normalizeText(
      `E-commerce product catalog. Brand: ${source.brand || "unknown"}. Category: ${source.categoryLabel || "general"}. Preserve brand names, model numbers, units, technical codes and compatibility names exactly.`
    ),
  });

  const restoredValues = translatedValues.map((value, index) =>
    restoreProtectedText(value, protectedItems[index].replacements)
  );
  const translation = buildTranslationPayload(
    product,
    language,
    items,
    restoredValues
  );

  validateTranslation(product, language, translation);

  return {
    ...translation,
    sourceHash,
    schemaVersion: CATALOG_TRANSLATION_SCHEMA_VERSION,
    provider: "deepl",
    translatedAt: new Date().toISOString(),
    reviewed: false,
  };
}

export async function translateCatalogProductDocument(
  productDocument,
  requestedLanguage,
  options = {}
) {
  const language = normalizeCatalogLanguage(requestedLanguage);
  const force = Boolean(options.force);
  const product = productDocument.toObject();
  const sourceHash = calculateProductSourceHash(product);

  if (!force && isReadyTranslation({ ...product, sourceHash }, language)) {
    return {
      status: "skipped",
      product: applyCachedCatalogTranslation(
        { ...product, sourceHash },
        language
      ),
    };
  }

  const previousMeta = getTranslationMeta(product, language);
  const attempts = Number(previousMeta.attempts || 0) + 1;

  productDocument.sourceLanguage = "en";
  productDocument.sourceHash = sourceHash;
  productDocument.translationMeta = {
    ...(productDocument.translationMeta || {}),
    [language]: {
      status: "processing",
      sourceHash,
      schemaVersion: CATALOG_TRANSLATION_SCHEMA_VERSION,
      provider: "deepl",
      attempts,
      startedAt: new Date().toISOString(),
      error: "",
    },
  };
  productDocument.markModified("translationMeta");
  await productDocument.save();

  try {
    const translation = await createCatalogTranslation(
      { ...product, sourceHash },
      language
    );

    productDocument.translations = {
      ...(productDocument.translations || {}),
      [language]: translation,
    };
    productDocument.translationMeta = {
      ...(productDocument.translationMeta || {}),
      [language]: {
        status: "ready",
        sourceHash,
        schemaVersion: CATALOG_TRANSLATION_SCHEMA_VERSION,
        provider: translation.provider,
        attempts,
        translatedAt: translation.translatedAt,
        error: "",
      },
    };
    productDocument.markModified("translations");
    productDocument.markModified("translationMeta");
    await productDocument.save();

    return {
      status: "translated",
      product: applyCachedCatalogTranslation(
        productDocument.toObject(),
        language
      ),
    };
  } catch (error) {
    productDocument.translationMeta = {
      ...(productDocument.translationMeta || {}),
      [language]: {
        status: "failed",
        sourceHash,
        schemaVersion: CATALOG_TRANSLATION_SCHEMA_VERSION,
        provider: "deepl",
        attempts,
        failedAt: new Date().toISOString(),
        error: String(error.message || error).slice(0, 500),
      },
    };
    productDocument.markModified("translationMeta");
    await productDocument.save();

    throw error;
  }
}
