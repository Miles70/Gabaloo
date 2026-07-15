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

import "./Travel.css";

const services = [
  { key: "hotels", label: "Oteller", icon: Hotel },
  { key: "flights", label: "Uçuşlar", icon: Plane },
  { key: "cars", label: "Araç Kiralama", icon: CarFront },
  { key: "activities", label: "Aktiviteler", icon: MapPinned },
];

const serviceContent = {
  hotels: {
    eyebrow: "Konaklama rotanı bul",
    title: "Nereye gitmek istiyorsun?",
    locationLabel: "Destinasyon",
    locationPlaceholder: "Antalya, İstanbul, Roma...",
    button: "Otel Ara",
  },
  flights: {
    eyebrow: "Uçuş rotanı planla",
    title: "Sıradaki yolculuğun nerede başlıyor?",
    locationLabel: "Kalkış ve varış",
    locationPlaceholder: "Antalya → Moskova",
    button: "Uçuş Ara",
  },
  cars: {
    eyebrow: "Yolculuğuna özgürlük kat",
    title: "Aracını nereden teslim almak istiyorsun?",
    locationLabel: "Teslim alma noktası",
    locationPlaceholder: "Antalya Havalimanı",
    button: "Araç Ara",
  },
  activities: {
    eyebrow: "Şehri gerçekten keşfet",
    title: "Hangi şehirde deneyim arıyorsun?",
    locationLabel: "Şehir veya bölge",
    locationPlaceholder: "Kapadokya, Dubai, Phuket...",
    button: "Aktivite Ara",
  },
};

const routeCards = [
  {
    title: "Antalya Rotası",
    text: "Sahil otelleri, transfer ve yaz deneyimleri.",
    icon: Hotel,
    badge: "Popüler",
  },
  {
    title: "İstanbul Rotası",
    text: "Şehir otelleri, uçuşlar ve özel aktiviteler.",
    icon: Plane,
    badge: "Şehir",
  },
  {
    title: "Özgür Yolculuk",
    text: "Araç kirala, kendi rotanı kendin oluştur.",
    icon: CarFront,
    badge: "Yakında",
  },
];

function Travel() {
  const [activeService, setActiveService] = useState("hotels");
  const activeContent = serviceContent[activeService];

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
                <small>ONLINE TRAVEL AGENCY</small>
              </div>
            </div>

            <span className="travelPill">
              <Sparkles size={15} />
              Masterota Travel
            </span>

            <h1>
              Tatil rotanı tek yerde <span>oluştur.</span>
            </h1>

            <p>
              Otelini bul, uçuşunu planla, aracını kirala ve deneyimlerini
              yolculuğuna ekle. Yakında kart veya kripto ile tek platformdan.
            </p>

            <div className="travelTrustRow">
              <span>
                <ShieldCheck size={17} /> Güvenli rezervasyon altyapısı
              </span>
              <span>
                <WalletCards size={17} /> Kart ve Web3 ödeme vizyonu
              </span>
            </div>
          </div>

          <div className="travelSearchShell">
            <div className="travelServiceTabs" role="tablist" aria-label="Travel services">
              {services.map(({ key, label, icon: Icon }) => (
                <button
                  type="button"
                  key={key}
                  role="tab"
                  aria-selected={activeService === key}
                  className={activeService === key ? "active" : ""}
                  onClick={() => setActiveService(key)}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <form className="travelSearchCard" onSubmit={handleSearch}>
              <div className="travelSearchHeading">
                <span>{activeContent.eyebrow}</span>
                <h2>{activeContent.title}</h2>
              </div>

              <div className="travelSearchGrid">
                <label className="travelField travelField--wide">
                  <span>{activeContent.locationLabel}</span>
                  <div>
                    <MapPin size={18} />
                    <input
                      type="text"
                      placeholder={activeContent.locationPlaceholder}
                    />
                  </div>
                </label>

                <label className="travelField">
                  <span>Başlangıç</span>
                  <div>
                    <CalendarDays size={18} />
                    <input type="date" />
                  </div>
                </label>

                <label className="travelField">
                  <span>Bitiş</span>
                  <div>
                    <CalendarDays size={18} />
                    <input type="date" />
                  </div>
                </label>

                <label className="travelField">
                  <span>Misafir / Yolcu</span>
                  <div>
                    <UsersRound size={18} />
                    <select defaultValue="2">
                      <option value="1">1 kişi</option>
                      <option value="2">2 kişi</option>
                      <option value="3">3 kişi</option>
                      <option value="4">4 kişi</option>
                      <option value="5">5+ kişi</option>
                    </select>
                  </div>
                </label>

                <button className="travelSearchButton" type="submit">
                  <Search size={19} />
                  {activeContent.button}
                </button>
              </div>

              <p className="travelPrototypeNote">
                Arama ekranı hazır. Gerçek fiyat ve müsaitlik sonuçları travel
                API bağlantısıyla burada açılacak.
              </p>
            </form>
          </div>
        </div>
      </section>

      <section className="travelRoutesSection">
        <div className="travelContainer">
          <div className="travelSectionHeading">
            <div>
              <span>MASTEROTA ROTALARI</span>
              <h2>Alışveriş rotandan tatil rotana.</h2>
            </div>
            <p>
              Travel bölümü mağazadan ayrı çalışır; hesap, dil ve ödeme
              deneyimi Masterota çatısı altında kalır.
            </p>
          </div>

          <div className="travelRouteGrid">
            {routeCards.map(({ title, text, icon: Icon, badge }) => (
              <article className="travelRouteCard" key={title}>
                <div className="travelRouteIcon">
                  <Icon size={24} />
                </div>
                <span>{badge}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <button type="button">
                  Rotayı keşfet <ArrowRight size={17} />
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
