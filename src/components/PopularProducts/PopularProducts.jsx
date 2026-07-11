import { useEffect, useState } from "react";
import ProductCard from "../ProductCard/ProductCard";
import { useLanguage } from "../../i18n/LanguageContext";
import { getProducts } from "../../services/productsApi";
import "./PopularProducts.css";

const statusTranslations = {
  en: { loading: "Loading products...", error: "Products could not be loaded." },
  tr: { loading: "Ürünler yükleniyor...", error: "Ürünler yüklenemedi." },
  ru: { loading: "Загрузка товаров...", error: "Не удалось загрузить товары." },
  ar: { loading: "جارٍ تحميل المنتجات...", error: "تعذر تحميل المنتجات." },
  zh: { loading: "正在加载商品...", error: "无法加载商品。" },
};

function PopularProducts() {
  const { t, language } = useLanguage();
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const copy = statusTranslations[language] || statusTranslations.en;

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      try {
        setStatus("loading");
        const payload = await getProducts(
          { page: 1, limit: 100, sort: "popular" },
          { signal: controller.signal }
        );
        setProducts(payload.products || []);
        setStatus("success");
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error(error);
        setStatus("error");
      }
    }

    loadProducts();
    return () => controller.abort();
  }, []);

  return (
    <section className="popularProducts">
      <div className="popularProductsHeader">
        <span>{t("popularProducts.tag")}</span>
        <h2>{t("popularProducts.title")}</h2>
        <p>{t("popularProducts.text")}</p>
      </div>

      {status === "loading" && (
        <p className="popularProductsStatus">{copy.loading}</p>
      )}

      {status === "error" && (
        <p className="popularProductsStatus">{copy.error}</p>
      )}

      {status === "success" && (
        <div className="popularProductsGrid">
          {products.map((product) => (
            <ProductCard key={product.key} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}

export default PopularProducts;
