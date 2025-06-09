import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    debug: true,
    lng: 'ar',
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false, // not needed for react
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json', // default
    },
    // Remove "resources" here!
    // Don't add resources when using backend loader
  });

export default i18n;
