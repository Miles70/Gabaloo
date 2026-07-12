import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Baby,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Dumbbell,
  House,
  PackageCheck,
  Shirt,
  ShoppingBasket,
  Sparkles,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard/ProductCard";
import categories from "../data/categories";
import { getCategoryGroupText } from "../i18n/categoryGroups";
import { useLanguage } from "../i18n/LanguageContext";
import { getStoreProducts } from "../services/productsApi";
import "./Categories.css";
import "./CategoryCarousel.css";

const pageTranslations = {
  en: {
    tag: "Categories",
    title: "Shop by category.",
    text: "Browse the marketplace through nine clear collections and reach the right products faster.",
    collections: "Collections",
    products: "Products",
    globalStore: "Global Store",
    quickBrowse: "Quick Browse",
    featured: "Featured Picks",
    viewAll: "View All",
    ready: "Ready to explore",
    loading: "Loading categories...",
    previous: "Previous category",
    next: "Next category",
    goTo: "Show category",
  },
  tr: {
    tag: "Kategoriler",
    title: "Kategoriye göre alışveriş yap.",
    text: "Pazaryerini dokuz net koleksiyon üzerinden gez ve aradığın ürünlere daha hızlı ulaş.",
    collections: "Koleksiyon",
    products: "Ürün",
    globalStore: "Global Mağaza",
    quickBrowse: "Hızlı Gezin",
    featured: "Öne Çıkanlar",
    viewAll: "Tümünü Gör",
    ready: "Keşfetmeye hazır",
    loading: "Kategoriler yükleniyor...",
    previous: "Önceki kategori",
    next: "Sonraki kategori",
    goTo: "Kategoriyi göster",
  },
  ru: {
    tag: "Категории",
    title: "Покупайте по категориям.",
    text: "Просматривайте маркетплейс через девять понятных коллекций и быстрее находите нужные товары.",
    collections: "Коллекции",
    products: "Товары",
    globalStore: "Глобальный магазин",
    quickBrowse: "Быстрый просмотр",
    featured: "Избранное",
    viewAll: "Посмотреть все",
    ready: "Готово к просмотру",
    loading: "Категории загружаются...",
    previous: "Предыдущая категория",
    next: "Следующая категория",
    goTo: "Показать категорию",
  },
  ar: {
    tag: "الفئات",
    title: "تسوق حسب الفئة.",
    text: "تصفح السوق عبر تسع مجموعات واضحة واعثر على المنتجات المناسبة بسرعة أكبر.",
    collections: "المجموعات",
    products: "المنتجات",
    globalStore: "متجر عالمي",
    quickBrowse: "تصفح سريع",
    featured: "اختيارات مميزة",
    viewAll: "عرض الكل",
    ready: "جاهز للاستكشاف",
    loading: "جارٍ تحميل الفئات...",
    previous: "الفئة السابقة",
    next: "الفئة التالية",
    goTo: "عرض الفئة",
  },
  zh: {
    tag: "分类",
    title: "按分类购物。",
    text: "通过九个清晰的商品集合浏览市场，更快找到合适的产品。",
    collections: "系列",
    products: "商品",
    globalStore: "全球商店",
    quickBrowse: "快速浏览",
    featured: "精选商品",
    viewAll: "查看全部",
    ready: "随时探索",
    loading: "正在加载分类...",
    previous: "上一个分类",
    next: "下一个分类",
    goTo: "显示分类",
  },
};

const categoryIcons = {
  electronics: Cpu,
  fashion: Shirt,
  homeLivingOffice: House,
  autoGardenTools: Wrench,
  motherBabyToys: Baby,
  sportsOutdoor: Dumbbell,
  beautyCare: Sparkles,
  supermarketPets: ShoppingBasket,
  booksMusicFilmHobby: BookOpen,
};

function Categories() {
  const { t, language } = useLanguage();
  const copy = pageTranslations[language] || pageTranslations.en;
  const [categoryData, setCategoryData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    Promise.allSettled(
      categories.map((category) =>
        getStoreProducts({
          page: 1,
          limit: 8,
          group: category.key,
          sort: "popular",
        }),
      ),
    )
      .then((results) => {
        if (isCancelled) return;

        const nextData = {};
        results.forEach((result, index) => {
          const category = categories[index];
          nextData[category.key] =
            result.status === "fulfilled"
              ? {
                  products: result.value.products || [],
                  total: Number(result.value.pagination?.total || 0),
                }
              : { products: [], total: 0 };
        });

        setCategoryData(nextData);
      })
      .finally(() => {
        if (!isCancelled) setIsLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isCarouselPaused || categories.length < 2) return undefined;

    const timer = window.setTimeout(() => {
      setActiveCategoryIndex((currentIndex) => (currentIndex + 1) % categories.length);
    }, 5200);

    return () => window.clearTimeout(timer);
  }, [activeCategoryIndex, isCarouselPaused]);

  const totalProducts = useMemo(
    () => categories.reduce((sum, category) => sum + Number(categoryData[category.key]?.total || 0), 0),
    [categoryData],
  );

  const activeCategory = categories[activeCategoryIndex] || categories[0];
  const ActiveCategoryIcon = categoryIcons[activeCategory.key] || Sparkles;
  const activeGroupData = categoryData[activeCategory.key] || { products: [], total: 0 };
  const activePreviewProducts = activeGroupData.products.slice(0, 3);
  const activeCategoryTitle = getCategoryGroupText(language, activeCategory.key, "title");
  const activeCategoryDescription = getCategoryGroupText(language, activeCategory.key, "description");
  const activeProductsPath = `/products?group=${activeCategory.key}&page=1`;

  function changeCarousel(direction) {
    setActiveCategoryIndex(
      (currentIndex) => (currentIndex + direction + categories.length) % categories.length,
    );
  }

  return (
    <main className="categoriesPage">
      <section className="categoriesHero">
        <span>{copy.tag}</span>
        <h1>{copy.title}</h1>
        <p>{copy.text}</p>
      </section>

      <section className="categoriesOverview">
        <div className="categoryStat">
          <strong>{categories.length}</strong>
          <span>{copy.collections}</span>
        </div>

        <div className="categoryStat">
          <strong>{isLoading ? "—" : totalProducts.toLocaleString("en-US")}</strong>
          <span>{copy.products}</span>
        </div>

        <div className="categoryStat categoryStatWide">
          <PackageCheck size={22} />
          <div>
            <strong>{copy.globalStore}</strong>
            <span>{isLoading ? copy.loading : copy.ready}</span>
          </div>
        </div>
      </section>

      <section className="categoryQuickBrowse">
        <div className="categoryQuickBrowseHeader">
          <Sparkles size={17} />
          <span>{copy.quickBrowse}</span>
        </div>

        <nav className="categoryQuickNav">
          {categories.map((category, index) => {
            const CategoryIcon = categoryIcons[category.key] || Sparkles;

            return (
              <button
                type="button"
                key={category.key}
                className={index === activeCategoryIndex ? "categoryQuickLink is-active" : "categoryQuickLink"}
                onClick={() => setActiveCategoryIndex(index)}
              >
                <span>
                  <CategoryIcon aria-hidden="true" />
                </span>
                {getCategoryGroupText(language, category.key, "title")}
              </button>
            );
          })}
        </nav>
      </section>

      <section
        className="categoryCarouselSection"
        aria-roledescription="carousel"
        aria-label={activeCategoryTitle}
        onMouseEnter={() => setIsCarouselPaused(true)}
        onMouseLeave={() => setIsCarouselPaused(false)}
        onFocusCapture={() => setIsCarouselPaused(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsCarouselPaused(false);
          }
        }}
      >
        <article
          className="categoryCarouselCard"
          data-category={activeCategory.key}
          key={activeCategory.key}
        >
          <div className="categoryCarouselContent">
            <div className="categoryCarouselIcon">
              <ActiveCategoryIcon aria-hidden="true" />
            </div>
            <span>{copy.featured}</span>
            <h2>{activeCategoryTitle}</h2>
            <p>{activeCategoryDescription}</p>
            <div className="categoryCarouselMeta">
              <strong>{isLoading ? "—" : activeGroupData.total.toLocaleString("en-US")}</strong>
              <span>{t("categoriesPage.items")}</span>
            </div>
            <Link to={activeProductsPath}>
              {copy.viewAll}
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="categoryCarouselVisual" aria-hidden={activePreviewProducts.length === 0}>
            {[0, 1, 2].map((slotIndex) => {
              const product = activePreviewProducts[slotIndex];

              if (!product) {
                return (
                  <div
                    className={`categoryCarouselProduct categoryCarouselProduct${slotIndex + 1} is-placeholder`}
                    key={`placeholder-${slotIndex}`}
                  >
                    <ActiveCategoryIcon aria-hidden="true" />
                  </div>
                );
              }

              return (
                <Link
                  to={`/products/${encodeURIComponent(product.key)}`}
                  className={`categoryCarouselProduct categoryCarouselProduct${slotIndex + 1}`}
                  key={product.key}
                  aria-label={product.title}
                >
                  <img src={product.imageUrl || product.images?.[0] || ""} alt="" loading="lazy" />
                  <span>{product.title}</span>
                </Link>
              );
            })}
          </div>
        </article>

        <div className="categoryCarouselControls">
          <button type="button" onClick={() => changeCarousel(-1)} aria-label={copy.previous}>
            <ChevronLeft size={19} />
          </button>

          <div className="categoryCarouselDots">
            {categories.map((category, index) => (
              <button
                type="button"
                key={category.key}
                className={index === activeCategoryIndex ? "is-active" : ""}
                onClick={() => setActiveCategoryIndex(index)}
                aria-label={`${copy.goTo}: ${getCategoryGroupText(language, category.key, "title")}`}
                aria-current={index === activeCategoryIndex ? "true" : undefined}
              />
            ))}
          </div>

          <span className="categoryCarouselCounter">
            {String(activeCategoryIndex + 1).padStart(2, "0")} / {String(categories.length).padStart(2, "0")}
          </span>

          <button type="button" onClick={() => changeCarousel(1)} aria-label={copy.next}>
            <ChevronRight size={19} />
          </button>
        </div>
      </section>

      <section className="categoryGroups">
        {categories.map((category) => {
          const CategoryIcon = categoryIcons[category.key] || Sparkles;
          const groupData = categoryData[category.key] || { products: [], total: 0 };
          const categoryTitle = getCategoryGroupText(language, category.key, "title");
          const categoryDescription = getCategoryGroupText(language, category.key, "description");
          const productsPath = `/products?group=${category.key}&page=1`;

          return (
            <article
              className="categoryGroup"
              id={`category-${category.key}`}
              data-category={category.key}
              key={category.key}
            >
              <div className="categoryGroupHeader">
                <div className="categoryTitleBox">
                  <div className="categoryIcon">
                    <CategoryIcon aria-hidden="true" />
                  </div>

                  <div>
                    <span>{categoryTitle}</span>
                    <h2>{categoryDescription}</h2>
                  </div>
                </div>

                <div className="categoryGroupActions">
                  <p>
                    {isLoading ? "—" : groupData.total.toLocaleString("en-US")} {t("categoriesPage.items")}
                  </p>
                  <Link to={productsPath}>
                    {copy.viewAll}
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>

              <div className="categoryProductsGrid">
                {groupData.products.map((product) => (
                  <ProductCard key={product.key} product={product} />
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

export default Categories;
