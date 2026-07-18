import { Link } from "react-router-dom";
import {
  ArrowRight,
  MapPinned,
  RefreshCcw,
  ShoppingBasket,
  UtensilsCrossed,
} from "lucide-react";

import { useLanguage } from "../i18n/LanguageContext";

import "./LocalServices.css";

const localServices = [
  {
    key: "supermarket",
    path: "/local/supermarket",
    Icon: ShoppingBasket,
  },
  {
    key: "restaurants",
    path: "/local/restaurants",
    Icon: UtensilsCrossed,
  },
  {
    key: "secondHand",
    path: "/local/second-hand",
    Icon: RefreshCcw,
  },
  {
    key: "nearby",
    path: "/local/nearby",
    Icon: MapPinned,
  },
];

function LocalHub() {
  const { t } = useLanguage();

  return (
    <main className="localServicesPage">
      <section className="localServicesHero">
        <span className="localServicesEyebrow">{t("localPage.eyebrow")}</span>
        <h1>{t("localPage.title")}</h1>
        <p>{t("localPage.text")}</p>
      </section>

      <section className="localServicesGrid" aria-label={t("nav.local")}>
        {localServices.map(({ key, path, Icon }) => (
          <Link className="localServiceCard" key={key} to={path}>
            <span className="localServiceCardIcon" aria-hidden="true">
              <Icon size={28} />
            </span>

            <span className="localServiceCardStatus">
              {t("localPage.comingSoon")}
            </span>

            <h2>{t(`localPage.services.${key}.title`)}</h2>
            <p>{t(`localPage.services.${key}.description`)}</p>

            <span className="localServiceCardLink">
              {t("localPage.explore")}
              <ArrowRight size={17} />
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}

export default LocalHub;
