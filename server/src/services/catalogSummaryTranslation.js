import {
  applyCachedCatalogTranslation,
  normalizeCatalogLanguage,
} from "./catalogTranslation.js";

const CATEGORY_LABELS = {
  tr: {
    electronics: "Elektronik",
    mobile: "Telefon ve Aksesuar",
    home: "Ev ve Yaşam",
    fashion: "Moda",
    beauty: "Güzellik ve Bakım",
    sports: "Spor ve Outdoor",
    toys: "Oyuncak",
    gaming: "Oyun",
    office: "Ofis",
    tools: "Yapı ve El Aletleri",
    appliances: "Ev Aletleri",
    pets: "Evcil Hayvan",
    automotive: "Otomotiv",
    baby: "Bebek",
  },
  ru: {
    electronics: "Электроника",
    mobile: "Телефоны и аксессуары",
    home: "Дом и быт",
    fashion: "Мода",
    beauty: "Красота и уход",
    sports: "Спорт и отдых",
    toys: "Игрушки",
    gaming: "Игры",
    office: "Офис",
    tools: "Инструменты",
    appliances: "Бытовая техника",
    pets: "Товары для животных",
    automotive: "Автотовары",
    baby: "Товары для детей",
  },
  ar: {
    electronics: "الإلكترونيات",
    mobile: "الهواتف وملحقاتها",
    home: "المنزل والمعيشة",
    fashion: "الأزياء",
    beauty: "الجمال والعناية",
    sports: "الرياضة والأنشطة الخارجية",
    toys: "الألعاب",
    gaming: "ألعاب الفيديو",
    office: "المكتب",
    tools: "الأدوات",
    appliances: "الأجهزة المنزلية",
    pets: "مستلزمات الحيوانات الأليفة",
    automotive: "السيارات",
    baby: "مستلزمات الأطفال",
  },
  zh: {
    electronics: "电子产品",
    mobile: "手机及配件",
    home: "家居生活",
    fashion: "时尚",
    beauty: "美容护理",
    sports: "运动户外",
    toys: "玩具",
    gaming: "游戏",
    office: "办公用品",
    tools: "工具",
    appliances: "家用电器",
    pets: "宠物用品",
    automotive: "汽车用品",
    baby: "母婴用品",
  },
};

const TITLE_REPLACEMENTS = {
  tr: [
    ["wireless bluetooth", "kablosuz Bluetooth"],
    ["noise cancelling", "gürültü engelleme özellikli"],
    ["noise canceling", "gürültü engelleme özellikli"],
    ["screen protector", "ekran koruyucu"],
    ["charging station", "şarj istasyonu"],
    ["fast charger", "hızlı şarj cihazı"],
    ["gaming headset", "oyuncu kulaklığı"],
    ["gaming keyboard", "oyuncu klavyesi"],
    ["gaming mouse", "oyuncu faresi"],
    ["smart watch", "akıllı saat"],
    ["smartwatch", "akıllı saat"],
    ["earbuds", "kulak içi kulaklık"],
    ["headphones", "kulaklık"],
    ["headset", "kulaklık"],
    ["phone case", "telefon kılıfı"],
    ["protective case", "koruyucu kılıf"],
    ["power bank", "taşınabilir şarj cihazı"],
    ["wall charger", "duvar tipi şarj cihazı"],
    ["car charger", "araç şarj cihazı"],
    ["charging cable", "şarj kablosu"],
    ["usb cable", "USB kablosu"],
    ["phone holder", "telefon tutucu"],
    ["laptop stand", "dizüstü bilgisayar standı"],
    ["vacuum cleaner", "elektrikli süpürge"],
    ["coffee maker", "kahve makinesi"],
    ["air fryer", "sıcak hava fritözü"],
    ["water bottle", "su şişesi"],
    ["storage organizer", "saklama düzenleyici"],
    ["kitchen set", "mutfak seti"],
    ["tool set", "alet seti"],
    ["shower curtain", "duş perdesi"],
    ["bed sheet", "çarşaf"],
    ["running shoes", "koşu ayakkabısı"],
    ["sports shoes", "spor ayakkabı"],
    ["women's", "kadın"],
    ["womens", "kadın"],
    ["men's", "erkek"],
    ["mens", "erkek"],
    ["kids", "çocuk"],
    ["baby", "bebek"],
    ["portable", "taşınabilir"],
    ["rechargeable", "şarj edilebilir"],
    ["waterproof", "su geçirmez"],
    ["adjustable", "ayarlanabilir"],
    ["foldable", "katlanabilir"],
    ["lightweight", "hafif"],
    ["stainless steel", "paslanmaz çelik"],
    ["set of", "set"],
    ["pack of", "paket"],
    ["with", "ile"],
    ["for", "için"],
  ],
  ru: [
    ["wireless bluetooth", "беспроводной Bluetooth"],
    ["noise cancelling", "с шумоподавлением"],
    ["screen protector", "защитное стекло"],
    ["fast charger", "быстрое зарядное устройство"],
    ["gaming headset", "игровая гарнитура"],
    ["smart watch", "умные часы"],
    ["smartwatch", "умные часы"],
    ["earbuds", "беспроводные наушники"],
    ["headphones", "наушники"],
    ["phone case", "чехол для телефона"],
    ["power bank", "внешний аккумулятор"],
    ["charging cable", "зарядный кабель"],
    ["portable", "портативный"],
    ["waterproof", "водонепроницаемый"],
    ["adjustable", "регулируемый"],
    ["with", "с"],
    ["for", "для"],
  ],
  ar: [
    ["wireless bluetooth", "بلوتوث لاسلكي"],
    ["noise cancelling", "بخاصية إلغاء الضوضاء"],
    ["screen protector", "واقي شاشة"],
    ["fast charger", "شاحن سريع"],
    ["gaming headset", "سماعة ألعاب"],
    ["smart watch", "ساعة ذكية"],
    ["smartwatch", "ساعة ذكية"],
    ["earbuds", "سماعات أذن"],
    ["headphones", "سماعات رأس"],
    ["phone case", "غطاء هاتف"],
    ["power bank", "بطارية محمولة"],
    ["charging cable", "كابل شحن"],
    ["portable", "محمول"],
    ["waterproof", "مقاوم للماء"],
    ["adjustable", "قابل للتعديل"],
    ["with", "مع"],
    ["for", "لـ"],
  ],
  zh: [
    ["wireless bluetooth", "无线蓝牙"],
    ["noise cancelling", "降噪"],
    ["screen protector", "屏幕保护膜"],
    ["fast charger", "快速充电器"],
    ["gaming headset", "游戏耳机"],
    ["smart watch", "智能手表"],
    ["smartwatch", "智能手表"],
    ["earbuds", "入耳式耳机"],
    ["headphones", "耳机"],
    ["phone case", "手机壳"],
    ["power bank", "充电宝"],
    ["charging cable", "充电线"],
    ["portable", "便携式"],
    ["waterproof", "防水"],
    ["adjustable", "可调节"],
    ["with", "配有"],
    ["for", "适用于"],
  ],
};

const PROTECTED_NAMES = [
  "AirPods",
  "Apple Watch",
  "Galaxy",
  "iPhone",
  "iPad",
  "MacBook",
  "PlayStation",
  "Xbox",
  "Kindle",
  "Chromebook",
];

function normalizeText(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compactTitle(value) {
  return normalizeText(value)
    .replace(/\s*[|;]\s*.*$/, "")
    .replace(/\s*\([^)]*(?:best seller|new arrival|hot sale)[^)]*\)/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150);
}

function protectTitleTokens(value) {
  const protectedValues = [];
  let output = value;

  const candidates = [
    ...PROTECTED_NAMES,
    ...(value.match(/\b(?=[A-Za-z0-9._/-]*[A-Za-z])(?=[A-Za-z0-9._/-]*\d)[A-Za-z0-9][A-Za-z0-9._/-]*\b/g) || []),
    ...(value.match(/\b[A-Z]{2,}(?:-[A-Z0-9]+)*\b/g) || []),
  ];

  [...new Set(candidates)]
    .sort((left, right) => right.length - left.length)
    .forEach((token) => {
      const placeholder = `KRMODEL${protectedValues.length}TOKEN`;
      const pattern = new RegExp(escapeRegExp(token), "gi");

      if (pattern.test(output)) {
        protectedValues.push(token);
        output = output.replace(pattern, placeholder);
      }
    });

  return { output, protectedValues };
}

function restoreTitleTokens(value, protectedValues) {
  return protectedValues.reduce((result, token, index) => {
    return result.replace(new RegExp(`KRMODEL${index}TOKEN`, "g"), token);
  }, value);
}

function removeBrandPrefix(title, brand) {
  if (!brand) return title;

  const pattern = new RegExp(`^${escapeRegExp(brand)}(?:\\s+|[-:–—]+\\s*)`, "i");
  return title.replace(pattern, "").trim();
}

function localizeTitle(product, language) {
  const originalTitle = compactTitle(product.title);
  const brand = normalizeText(product.brand);
  const withoutBrand = removeBrandPrefix(originalTitle, brand);
  const { output, protectedValues } = protectTitleTokens(withoutBrand || originalTitle);

  let localized = output;
  const replacements = [...(TITLE_REPLACEMENTS[language] || [])].sort(
    (left, right) => right[0].length - left[0].length
  );

  for (const [source, target] of replacements) {
    localized = localized.replace(
      new RegExp(`\\b${escapeRegExp(source)}\\b`, "gi"),
      target
    );
  }

  localized = restoreTitleTokens(localized, protectedValues)
    .replace(/\s+([,.;:])/g, "$1")
    .replace(/\s{2,}/g, " ")
    .trim();

  const hasBrand = brand && localized.toLowerCase().startsWith(brand.toLowerCase());
  const result = brand && !hasBrand ? `${brand} ${localized}` : localized;

  return normalizeText(result || originalTitle).slice(0, 140);
}

function localizeCategory(product, language) {
  return (
    CATEGORY_LABELS[language]?.[product.categoryKey] ||
    product.categoryLabel ||
    product.categoryKey
  );
}

function localizeProductSummary(product, language) {
  const fullTranslation = product.translations?.[language];

  if (fullTranslation?.title) {
    return applyCachedCatalogTranslation(product, language);
  }

  return {
    ...product,
    title: localizeTitle(product, language),
    categoryLabel: localizeCategory(product, language),
    translationLanguage: language,
    translationSource: "local-catalog-title-v2",
  };
}

export async function localizeCatalogProductSummaries(
  products,
  requestedLanguage
) {
  const language = normalizeCatalogLanguage(requestedLanguage);

  if (language === "en" || products.length === 0) return products;
  return products.map((product) => localizeProductSummary(product, language));
}

export function applyCachedCatalogSummaryTranslation(
  product,
  requestedLanguage
) {
  const language = normalizeCatalogLanguage(requestedLanguage);
  if (language === "en") return product;
  return localizeProductSummary(product, language);
}
