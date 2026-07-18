import { getCategoryGroupText as getBaseCategoryGroupText } from "./categoryGroups";

const italianCategoryGroups = {
  electronics: {
    title: "Elettronica",
    description: "Smartphone, computer, dispositivi intelligenti e tecnologia gaming.",
  },
  fashion: {
    title: "Moda",
    description: "Abbigliamento, calzature, accessori e stile per tutti i giorni.",
  },
  homeLivingOffice: {
    title: "Casa, vita, cartoleria e ufficio",
    description: "Articoli per la casa, elettrodomestici, cartoleria e prodotti per l'ufficio.",
  },
  autoGardenTools: {
    title: "Auto, giardino e fai da te",
    description: "Prodotti per auto, utensili, riparazioni, giardinaggio e fai da te.",
  },
  motherBabyToys: {
    title: "Mamma, bambino e giocattoli",
    description: "Cura del bambino, prodotti per la famiglia, giocattoli e giochi.",
  },
  sportsOutdoor: {
    title: "Sport e attività all'aperto",
    description: "Allenamento, fitness, attività all'aperto e attrezzatura sportiva.",
  },
  beautyCare: {
    title: "Bellezza e cura personale",
    description: "Cosmetici, cura della pelle, igiene e prodotti per la cura personale.",
  },
  supermarketPets: {
    title: "Supermercato e animali",
    description: "Prodotti essenziali per ogni giorno e articoli per i tuoi animali.",
  },
  booksMusicFilmHobby: {
    title: "Libri, musica, film e hobby",
    description: "Intrattenimento, giochi, collezionismo e prodotti per hobby.",
  },
};

export function getCategoryGroupText(language, groupKey, field = "title") {
  if (language === "it") {
    return (
      italianCategoryGroups[groupKey]?.[field] ||
      getBaseCategoryGroupText("en", groupKey, field)
    );
  }

  return getBaseCategoryGroupText(language, groupKey, field);
}

export default italianCategoryGroups;