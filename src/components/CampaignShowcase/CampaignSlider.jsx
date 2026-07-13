import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/LanguageContext";
import campaignTranslations from "../../i18n/campaignTranslations";
import "./CampaignSlider.css";

const FALLBACK_INTERVAL = 5500;
const localeByLanguage = {
  en: "en-US",
  tr: "tr-TR",
  ru: "ru-RU",
  ar: "ar-SA",
  zh: "zh-CN",
};

function interpolate(value, params = {}) {
  return Object.entries(params).reduce(
    (text, [key, replacement]) => text.replaceAll(`{${key}}`, String(replacement)),
    String(value || ""),
  );
}

function localizeSlide(slide, dictionary) {
  const isCategorySlide = String(slide.id || "").startsWith("category-");

  if (isCategorySlide) {
    return {
      ...slide,
      eyebrow: dictionary.categoryEyebrow,
      description: interpolate(dictionary.categoryDescription, { category: slide.title }),
      buttonLabel: dictionary.shopCategory,
    };
  }

  return {
    ...slide,
    eyebrow:
      slide.eyebrow === "LIMITED-TIME DROP" ? dictionary.defaultEyebrow : slide.eyebrow,
    title:
      slide.title === "Big finds. Better prices." ? dictionary.defaultTitle : slide.title,
    description:
      slide.description === "Discover popular products picked for this week's Gabaloo campaign."
        ? dictionary.defaultDescription
        : slide.description,
    buttonLabel: slide.buttonLabel === "Shop now" ? dictionary.shopNow : slide.buttonLabel,
  };
}

function SlideButton({ slide }) {
  const content = (
    <>
      {slide.buttonLabel}
      <ArrowRight size={18} />
    </>
  );

  if (/^https?:\/\//i.test(slide.buttonUrl || "")) {
    return (
      <a
        className="campaignShowcaseButton"
        href={slide.buttonUrl}
        target="_blank"
        rel="noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link className="campaignShowcaseButton" to={slide.buttonUrl || "/products"}>
      {content}
    </Link>
  );
}

function CampaignSlider({ campaign }) {
  const { language } = useLanguage();
  const dictionary = campaignTranslations[language] || campaignTranslations.en;
  const rawSlides = campaign.slides?.length ? campaign.slides : [campaign];
  const slides = useMemo(
    () => rawSlides.map((slide) => localizeSlide(slide, dictionary.campaignSlider)),
    [dictionary, rawSlides],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const formatMoney = useCallback(
    (value, currency = "USD") =>
      new Intl.NumberFormat(localeByLanguage[language] || "en-US", {
        style: "currency",
        currency,
      }).format(Number(value) || 0),
    [language],
  );

  const moveTo = useCallback(
    (index, nextDirection = 1) => {
      const normalized = (index + slides.length) % slides.length;
      setDirection(nextDirection);
      setActiveIndex(normalized);
    },
    [slides.length],
  );

  useEffect(() => {
    if (activeIndex < slides.length) return;
    setActiveIndex(0);
  }, [activeIndex, slides.length]);

  useEffect(() => {
    if (slides.length < 2 || paused) return undefined;

    const timer = window.setTimeout(
      () => moveTo(activeIndex + 1, 1),
      Number(campaign.slideIntervalMs) || FALLBACK_INTERVAL,
    );

    return () => window.clearTimeout(timer);
  }, [activeIndex, campaign.slideIntervalMs, moveTo, paused, slides.length]);

  const slide = slides[activeIndex] || slides[0];
  const backgroundStyle = slide.backgroundImageUrl
    ? {
        backgroundImage: `linear-gradient(105deg, rgba(30,4,34,.97), rgba(102,15,76,.9), rgba(43,20,91,.86)), url("${slide.backgroundImageUrl}")`,
      }
    : undefined;

  return (
    <section
      className={`campaignShowcase campaignShowcase--${slide.theme || "signature"}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label={dictionary.campaignSlider.campaignsLabel}
    >
      <div
        className="campaignShowcaseBackdrop"
        key={`background-${slide.id || activeIndex}`}
        style={backgroundStyle}
      />
      <div className="campaignShowcaseGlow campaignShowcaseGlowOne" />
      <div className="campaignShowcaseGlow campaignShowcaseGlowTwo" />

      <div
        className={`campaignShowcaseInner campaignSlideEnter campaignSlideEnter--${direction > 0 ? "next" : "previous"}`}
        key={slide.id || activeIndex}
      >
        <div className="campaignShowcaseContent">
          <p className="campaignShowcaseEyebrow">
            <Sparkles size={16} /> {slide.eyebrow}
          </p>
          <h2>{slide.title}</h2>
          <p className="campaignShowcaseDescription">{slide.description}</p>
          <SlideButton slide={slide} />
        </div>

        <div className="campaignProductRail">
          {(slide.products || []).slice(0, 3).map((product, index) => (
            <Link
              className="campaignProductCard"
              to={`/products/${encodeURIComponent(product.key)}`}
              key={product.key}
              style={{ "--campaign-card-index": index }}
            >
              <div className="campaignProductImage">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.title} loading="lazy" />
                ) : (
                  <span>{product.image || "🛍️"}</span>
                )}
              </div>
              <div className="campaignProductMeta">
                <strong>{product.title}</strong>
                <div className="campaignProductPrice">
                  <span>{formatMoney(product.price, product.currency)}</span>
                  {product.oldPrice ? (
                    <del>{formatMoney(product.oldPrice, product.currency)}</del>
                  ) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="campaignCarouselControls">
          <button
            type="button"
            onClick={() => moveTo(activeIndex - 1, -1)}
            aria-label={dictionary.campaignSlider.previous}
          >
            <ChevronLeft size={20} />
          </button>
          <div className="campaignCarouselDots">
            {slides.map((item, index) => (
              <button
                className={index === activeIndex ? "is-active" : ""}
                type="button"
                onClick={() => moveTo(index, index >= activeIndex ? 1 : -1)}
                aria-label={interpolate(dictionary.campaignSlider.showSlide, { title: item.title })}
                key={item.id || index}
              >
                <span />
              </button>
            ))}
          </div>
          <span>
            {String(activeIndex + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={() => moveTo(activeIndex + 1, 1)}
            aria-label={dictionary.campaignSlider.next}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      ) : null}
    </section>
  );
}

export default CampaignSlider;
