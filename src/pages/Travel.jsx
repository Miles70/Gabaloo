import { useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  CarFront,
  Hotel,
  MapPin,
  MapPinned,
  Plane,
  Search,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WalletCards,
} from "lucide-react";

import { useLanguage } from "../i18n/LanguageContext";
import "./Travel.css";
import "./TravelHeader.css";

const services = [
  { key: "hotels", icon: Hotel },
  { key: "flights", icon: Plane },
  { key: "cars", icon: CarFront },
  { key: "activities", icon: MapPinned },
];

const routeCards = [
  { key: "antalya", icon: Hotel },
  { key: "istanbul", icon: Plane },
  { key: "freedom", icon: CarFront },
];

function Travel() {
  const [activeService, setActiveService] = useState("hotels");
  const { t } = useLanguage();
  const activeServiceKey = `travelPage.services.${activeService}`;

  function handleSearch(event) {
    event.preventDefault();
  }

  return (
    <main className="travelPage">
      <section className="travelHero">
        <div className="travelHeroGlow travelHeroGlow--one" />
        <div className="travelHeroGlow travelHeroGlow--two" />

        <div className="travelContainer travelHeroContent">
          <div className="travelIntro">
            <div className="travelBrandBlock">
              <span className="travelBrandMark">R</span>
              <div>
                <div className="travelBrandName" aria-label="Master OTA">
                  <strong>MASTER</strong>
                  <span>OTA</span>
                </div>
                <small>{t("travelPage.onlineTravelAgency")}</small>
              </div>
            </div>

            <span className="travelPill">
              <Sparkles size={15} />
              {t("travelPage.pill")}
            </span>

            <h1>
              {t("travelPage.heroTitle")} <span>{t("travelPage.heroAccent")}</span>
            </h1>

            <p>{t("travelPage.heroText")}</p>

            <div className="travelTrustRow">
              <span>
                <ShieldCheck size={17} /> {t("travelPage.trustSecure")}
              </span>
              <span>
                <WalletCards size={17} /> {t("travelPage.trustPayment")}
              </span>
            </div>
          </div>

          <div className="travelSearchShell">
            <div
              className="travelServiceTabs"
              role="tablist"
              aria-label={t("travelPage.servicesLabel")}
            >
              {services.map(({ key, icon: Icon }) => (
                <button
                  type="button"
                  key={key}
                  role="tab"
                  aria-selected={activeService === key}
                  className={activeService === key ? "active" : ""}
                  onClick={() => setActiveService(key)}
                >
                  <Icon size={18} />
                  <span>{t(`travelPage.services.${key}.label`)}</span>
                </button>
              ))}
            </div>

            <form className="travelSearchCard" onSubmit={handleSearch}>
              <div className="travelSearchHeading">
                <span>{t(`${activeServiceKey}.eyebrow`)}</span>
                <h2>{t(`${activeServiceKey}.title`)}</h2>
              </div>

              <div className="travelSearchGrid">
                <label className="travelField travelField--wide">
                  <span>{t(`${activeServiceKey}.locationLabel`)}</span>
                  <div>
                    <MapPin size={18} />
                    <input
                      type="text"
                      placeholder={t(`${activeServiceKey}.locationPlaceholder`)}
                    />
                  </div>
                </label>

                <label className="travelField">
                  <span>{t("travelPage.search.start")}</span>
                  <div>
                    <CalendarDays size={18} />
                    <input type="date" />
                  </div>
                </label>

                <label className="travelField">
                  <span>{t("travelPage.search.end")}</span>
                  <div>
                    <CalendarDays size={18} />
                    <input type="date" />
                  </div>
                </label>

                <label className="travelField">
                  <span>{t("travelPage.search.guests")}</span>
                  <div>
                    <UsersRound size={18} />
                    <select defaultValue="2">
                      <option value="1">{t("travelPage.search.people1")}</option>
                      <option value="2">{t("travelPage.search.people2")}</option>
                      <option value="3">{t("travelPage.search.people3")}</option>
                      <option value="4">{t("travelPage.search.people4")}</option>
                      <option value="5">{t("travelPage.search.people5")}</option>
                    </select>
                  </div>
                </label>

                <button className="travelSearchButton" type="submit">
                  <Search size={19} />
                  {t(`${activeServiceKey}.button`)}
                </button>
              </div>

              <p className="travelPrototypeNote">
                {t("travelPage.prototypeNote")}
              </p>
            </form>
          </div>
        </div>
      </section>

      <section className="travelRoutesSection">
        <div className="travelContainer">
          <div className="travelSectionHeading">
            <div>
              <span>{t("travelPage.routesEyebrow")}</span>
              <h2>{t("travelPage.routesTitle")}</h2>
            </div>
            <p>{t("travelPage.routesText")}</p>
          </div>

          <div className="travelRouteGrid">
            {routeCards.map(({ key, icon: Icon }) => (
              <article className="travelRouteCard" key={key}>
                <div className="travelRouteIcon">
                  <Icon size={24} />
                </div>
                <span>{t(`travelPage.cards.${key}.badge`)}</span>
                <h3>{t(`travelPage.cards.${key}.title`)}</h3>
                <p>{t(`travelPage.cards.${key}.text`)}</p>
                <button type="button">
                  {t("travelPage.exploreRoute")} <ArrowRight size={17} />
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default Travel;
