import en from "./locales/en";
import tr from "./locales/tr";
import ru from "./locales/ru";
import ar from "./locales/ar";
import zh from "./locales/zh";
import paymentTranslations from "./paymentTranslations";

function withPaymentTranslations(baseTranslations, language) {
  const payment = paymentTranslations[language] || paymentTranslations.en;

  return {
    ...baseTranslations,
    checkoutPage: {
      ...baseTranslations.checkoutPage,
      ...payment.checkoutPage,
    },
    orderSuccessPage: {
      ...baseTranslations.orderSuccessPage,
      ...payment.orderSuccessPage,
    },
  };
}

const translations = {
  en: withPaymentTranslations(en, "en"),
  tr: withPaymentTranslations(tr, "tr"),
  ru: withPaymentTranslations(ru, "ru"),
  ar: withPaymentTranslations(ar, "ar"),
  zh: withPaymentTranslations(zh, "zh"),
};

export default translations;
