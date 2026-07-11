import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import ProductCard from "../components/ProductCard/ProductCard";
import { useCart } from "../context/CartContext";
import products from "../data/products";
import { useLanguage } from "../i18n/LanguageContext";
import "./ProductDetails.css";

const detailTranslations = {
  en: {
    back: "Back to products",
    home: "Home",
    products: "Products",
    new: "New",
    inStock: "In stock",
    quantity: "Quantity",
    add: "Add to cart",
    added: "Added to cart",
    total: "Total",
    save: "You save",
    highlights: "Product highlights",
    delivery: "Fast delivery",
    deliveryText: "Prepared quickly and shipped with tracking.",
    payment: "Secure payment",
    paymentText: "Protected checkout and Web3-ready infrastructure.",
    returns: "Easy returns",
    returnsText: "Simple return support for eligible orders.",
    related: "You may also like",
    relatedText: "More selected products from the same category.",
    notFound: "Product not found",
    notFoundText: "This product may have been removed or the address may be incorrect.",
    browse: "Browse all products",
    descriptions: {
      electronics: "A carefully selected technology product designed for modern performance, daily reliability and a premium user experience.",
      fashion: "A versatile fashion essential selected for comfort, clean style and effortless everyday use.",
      home: "A functional home product that combines modern design, practical use and lasting comfort.",
      gaming: "A performance-focused gaming product built for responsive control, immersive sessions and a cleaner setup.",
    },
    features: {
      electronics: ["Modern performance", "Premium build quality", "Reliable everyday use"],
      fashion: ["Comfortable everyday fit", "Versatile modern style", "Selected durable materials"],
      home: ["Functional modern design", "Easy daily use", "Built for lasting comfort"],
      gaming: ["Responsive performance", "Comfort for long sessions", "Setup-ready design"],
    },
  },
  tr: {
    back: "Ürünlere dön",
    home: "Ana Sayfa",
    products: "Ürünler",
    new: "Yeni",
    inStock: "Stokta",
    quantity: "Adet",
    add: "Sepete ekle",
    added: "Sepete eklendi",
    total: "Toplam",
    save: "Kazancın",
    highlights: "Ürün özellikleri",
    delivery: "Hızlı teslimat",
    deliveryText: "Hızla hazırlanır ve takipli olarak gönderilir.",
    payment: "Güvenli ödeme",
    paymentText: "Korumalı ödeme ve Web3'e hazır altyapı.",
    returns: "Kolay iade",
    returnsText: "Uygun siparişlerde basit iade desteği.",
    related: "Bunları da beğenebilirsin",
    relatedText: "Aynı kategoriden seçilmiş diğer ürünler.",
    notFound: "Ürün bulunamadı",
    notFoundText: "Bu ürün kaldırılmış veya bağlantı hatalı olabilir.",
    browse: "Tüm ürünleri gör",
    descriptions: {
      electronics: "Modern performans, günlük güvenilirlik ve premium kullanım deneyimi için özenle seçilmiş bir teknoloji ürünü.",
      fashion: "Konfor, sade stil ve günlük kullanım için seçilmiş çok yönlü bir moda ürünü.",
      home: "Modern tasarımı, pratik kullanımı ve kalıcı konforu bir araya getiren işlevsel bir ev ürünü.",
      gaming: "Hızlı kontrol, sürükleyici oyun deneyimi ve temiz kurulum için geliştirilmiş performans odaklı bir ürün.",
    },
    features: {
      electronics: ["Modern performans", "Premium yapı kalitesi", "Güvenilir günlük kullanım"],
      fashion: ["Konforlu günlük kalıp", "Çok yönlü modern stil", "Seçilmiş dayanıklı malzemeler"],
      home: ["İşlevsel modern tasarım", "Kolay günlük kullanım", "Uzun süreli konfor"],
      gaming: ["Hızlı tepki performansı", "Uzun kullanımda konfor", "Kuruluma hazır tasarım"],
    },
  },
  ru: {
    back: "Назад к товарам",
    home: "Главная",
    products: "Товары",
    new: "Новинка",
    inStock: "В наличии",
    quantity: "Количество",
    add: "Добавить в корзину",
    added: "Добавлено в корзину",
    total: "Итого",
    save: "Ваша экономия",
    highlights: "Особенности товара",
    delivery: "Быстрая доставка",
    deliveryText: "Быстрая подготовка и отправка с отслеживанием.",
    payment: "Безопасная оплата",
    paymentText: "Защищённое оформление и готовая к Web3 инфраструктура.",
    returns: "Простой возврат",
    returnsText: "Удобная поддержка возврата для подходящих заказов.",
    related: "Вам также может понравиться",
    relatedText: "Другие выбранные товары из этой категории.",
    notFound: "Товар не найден",
    notFoundText: "Товар мог быть удалён или адрес указан неверно.",
    browse: "Смотреть все товары",
    descriptions: {
      electronics: "Технологичный продукт, выбранный для современной производительности, надёжности и премиального опыта.",
      fashion: "Универсальный модный товар для комфорта, современного стиля и ежедневного использования.",
      home: "Функциональный товар для дома, сочетающий современный дизайн, практичность и комфорт.",
      gaming: "Игровой продукт для быстрого управления, длительных сессий и аккуратной игровой зоны.",
    },
    features: {
      electronics: ["Современная производительность", "Премиальное качество", "Надёжность каждый день"],
      fashion: ["Комфортная посадка", "Современный универсальный стиль", "Прочные материалы"],
      home: ["Функциональный дизайн", "Простое использование", "Долговечный комфорт"],
      gaming: ["Быстрый отклик", "Комфорт в долгих сессиях", "Готово для игровой зоны"],
    },
  },
  ar: {
    back: "العودة إلى المنتجات",
    home: "الرئيسية",
    products: "المنتجات",
    new: "جديد",
    inStock: "متوفر",
    quantity: "الكمية",
    add: "أضف إلى السلة",
    added: "تمت الإضافة إلى السلة",
    total: "الإجمالي",
    save: "قيمة التوفير",
    highlights: "مميزات المنتج",
    delivery: "توصيل سريع",
    deliveryText: "تجهيز سريع وشحن مع إمكانية التتبع.",
    payment: "دفع آمن",
    paymentText: "دفع محمي وبنية جاهزة لتقنيات Web3.",
    returns: "إرجاع سهل",
    returnsText: "دعم مبسط لإرجاع الطلبات المؤهلة.",
    related: "قد يعجبك أيضاً",
    relatedText: "منتجات مختارة أخرى من الفئة نفسها.",
    notFound: "المنتج غير موجود",
    notFoundText: "ربما تمت إزالة المنتج أو أن الرابط غير صحيح.",
    browse: "تصفح كل المنتجات",
    descriptions: {
      electronics: "منتج تقني مختار بعناية للأداء الحديث والاعتمادية اليومية وتجربة استخدام مميزة.",
      fashion: "قطعة أزياء متعددة الاستخدامات تجمع الراحة والأناقة وسهولة الاستخدام اليومي.",
      home: "منتج منزلي عملي يجمع التصميم الحديث وسهولة الاستخدام والراحة الدائمة.",
      gaming: "منتج ألعاب يركز على الأداء والاستجابة السريعة والراحة أثناء الجلسات الطويلة.",
    },
    features: {
      electronics: ["أداء حديث", "جودة تصنيع مميزة", "استخدام يومي موثوق"],
      fashion: ["راحة للاستخدام اليومي", "أسلوب عصري متعدد الاستخدامات", "مواد مختارة ومتينة"],
      home: ["تصميم عصري عملي", "استخدام يومي سهل", "راحة تدوم طويلاً"],
      gaming: ["استجابة سريعة", "راحة للجلسات الطويلة", "تصميم جاهز للإعداد"],
    },
  },
  zh: {
    back: "返回产品列表",
    home: "首页",
    products: "产品",
    new: "新品",
    inStock: "有货",
    quantity: "数量",
    add: "加入购物车",
    added: "已加入购物车",
    total: "总计",
    save: "节省",
    highlights: "产品亮点",
    delivery: "快速配送",
    deliveryText: "快速备货并提供物流追踪。",
    payment: "安全支付",
    paymentText: "受保护的结账流程和 Web3 就绪基础设施。",
    returns: "轻松退货",
    returnsText: "符合条件的订单可获得便捷退货支持。",
    related: "你可能还喜欢",
    relatedText: "同一分类中的更多精选产品。",
    notFound: "未找到产品",
    notFoundText: "该产品可能已下架，或链接地址不正确。",
    browse: "浏览所有产品",
    descriptions: {
      electronics: "为现代性能、日常可靠性和高端使用体验精心挑选的科技产品。",
      fashion: "兼顾舒适、简洁风格和日常穿搭的多用途时尚单品。",
      home: "融合现代设计、实用功能和持久舒适感的家居产品。",
      gaming: "面向快速响应、沉浸体验和整洁桌面的高性能游戏产品。",
    },
    features: {
      electronics: ["现代性能", "高品质做工", "可靠日常使用"],
      fashion: ["舒适日常版型", "现代百搭风格", "精选耐用材质"],
      home: ["实用现代设计", "轻松日常使用", "持久舒适体验"],
      gaming: ["快速响应性能", "长时间使用舒适", "适合游戏桌面"],
    },
  },
};

function ProductDetails() {
  const { productKey } = useParams();
  const { language, t } = useLanguage();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const labels = detailTranslations[language] || detailTranslations.en;
  const product = products.find((item) => item.key === productKey);

  const relatedProducts = useMemo(() => {
    if (!product) return [];

    return products
      .filter(
        (item) => item.categoryKey === product.categoryKey && item.key !== product.key,
      )
      .slice(0, 4);
  }, [product]);

  function formatPrice(price) {
    return `$${Number(price || 0).toLocaleString("en-US")}`;
  }

  function handleImageError(event) {
    event.currentTarget.classList.add("imageError");
  }

  function handleAddToCart() {
    addToCart(product, quantity);
    setIsAdded(true);

    window.setTimeout(() => {
      setIsAdded(false);
    }, 1100);
  }

  function getBadgeLabel() {
    if (!product) return "";

    if (product.badge === "sale" && product.oldPrice > product.price) {
      const discount = Math.round(
        ((product.oldPrice - product.price) / product.oldPrice) * 100,
      );

      return `-${discount}%`;
    }

    if (product.badge === "new") return labels.new;
    if (product.badge === "stock") return labels.inStock;

    return "";
  }

  if (!product) {
    return (
      <main className="productDetailsPage">
        <section className="productDetailsNotFound">
          <span>404</span>
          <h1>{labels.notFound}</h1>
          <p>{labels.notFoundText}</p>
          <Link to="/products">{labels.browse}</Link>
        </section>
      </main>
    );
  }

  const categoryTitle = t(`categories.${product.categoryKey}.title`);
  const description = labels.descriptions[product.categoryKey];
  const features = labels.features[product.categoryKey] || [];
  const savings = Math.max(0, Number(product.oldPrice || 0) - Number(product.price || 0));
  const badgeLabel = getBadgeLabel();
  const fallbackLetter = product.title?.charAt(0)?.toUpperCase() || "K";

  return (
    <main className="productDetailsPage">
      <nav className="productDetailsBreadcrumb" aria-label="Breadcrumb">
        <Link to="/">{labels.home}</Link>
        <span>/</span>
        <Link to="/products">{labels.products}</Link>
        <span>/</span>
        <strong>{product.title}</strong>
      </nav>

      <Link className="productDetailsBack" to="/products">
        <span aria-hidden="true">←</span>
        {labels.back}
      </Link>

      <section className="productDetailsHero">
        <div className="productDetailsVisual">
          <span className="productDetailsFallback" aria-hidden="true">
            {fallbackLetter}
          </span>

          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.title}
              onError={handleImageError}
            />
          )}

          {badgeLabel && (
            <span className={`productDetailsBadge ${product.badge}`}>
              {product.badge === "stock" && (
                <span className="productDetailsBadgeDot" aria-hidden="true" />
              )}
              {badgeLabel}
            </span>
          )}
        </div>

        <div className="productDetailsContent">
          <p className="productDetailsCategory">{categoryTitle}</p>
          <h1>{product.title}</h1>
          <p className="productDetailsDescription">{description}</p>

          <div className="productDetailsPriceRow">
            <strong>{formatPrice(product.price)}</strong>
            {product.oldPrice && product.oldPrice > product.price && (
              <del>{formatPrice(product.oldPrice)}</del>
            )}
          </div>

          {savings > 0 && (
            <p className="productDetailsSavings">
              {labels.save}: <strong>{formatPrice(savings)}</strong>
            </p>
          )}

          <div className="productDetailsStock">
            <span aria-hidden="true" />
            {labels.inStock}
          </div>

          <div className="productDetailsHighlights">
            <h2>{labels.highlights}</h2>
            <ul>
              {features.map((feature) => (
                <li key={feature}>
                  <span aria-hidden="true">✓</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="productDetailsPurchase">
            <div className="productDetailsQuantityBlock">
              <span>{labels.quantity}</span>
              <div className="productDetailsQuantity">
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  aria-label="Decrease quantity"
                >
                  −
                </button>
                <strong>{quantity}</strong>
                <button
                  type="button"
                  onClick={() => setQuantity((current) => Math.min(10, current + 1))}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            <div className="productDetailsTotal">
              <span>{labels.total}</span>
              <strong>{formatPrice(product.price * quantity)}</strong>
            </div>
          </div>

          <button
            type="button"
            className={
              isAdded
                ? "productDetailsAddButton added"
                : "productDetailsAddButton"
            }
            onClick={handleAddToCart}
          >
            <span aria-hidden="true">{isAdded ? "✓" : "🛒"}</span>
            {isAdded ? labels.added : labels.add}
          </button>
        </div>
      </section>

      <section className="productDetailsBenefits">
        <article>
          <span aria-hidden="true">🚚</span>
          <div>
            <h3>{labels.delivery}</h3>
            <p>{labels.deliveryText}</p>
          </div>
        </article>

        <article>
          <span aria-hidden="true">🔒</span>
          <div>
            <h3>{labels.payment}</h3>
            <p>{labels.paymentText}</p>
          </div>
        </article>

        <article>
          <span aria-hidden="true">↩️</span>
          <div>
            <h3>{labels.returns}</h3>
            <p>{labels.returnsText}</p>
          </div>
        </article>
      </section>

      {relatedProducts.length > 0 && (
        <section className="productDetailsRelated">
          <div className="productDetailsRelatedHeader">
            <div>
              <span>{categoryTitle}</span>
              <h2>{labels.related}</h2>
            </div>
            <p>{labels.relatedText}</p>
          </div>

          <div className="productDetailsRelatedGrid">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.key} product={relatedProduct} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default ProductDetails;
