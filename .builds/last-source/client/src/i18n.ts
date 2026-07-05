import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';

const getCurrentLang = (): string => {
  // Check localStorage first
  const stored = localStorage.getItem('language');
  if (stored) return stored;
  
  // Check browser language
  const browserLang = navigator.language.split('-')[0];
  if (['en', 'es'].includes(browserLang)) {
    return browserLang;
  }
  
  // Default to English
  return 'en';
};

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    lng: getCurrentLang(),
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    
    interpolation: {
      escapeValue: false,
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    ns: ['translation'],
    defaultNS: 'translation',
  });

export const changeLanguage = (lng: string) => {
  localStorage.setItem('language', lng);
  i18n.changeLanguage(lng);
};

export default i18n;