import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';
type TranslationKey = 'login.title' | 'login.google' | 'login.error';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

const translations: Record<Language, Record<TranslationKey, string>> = {
  es: {
    // Agrega aquí tus traducciones en español
    'login.title': 'Iniciar Sesión',
    'login.google': 'Continuar con Google',
    'login.error': 'Error al iniciar sesión',
    // ... más traducciones
  },
  en: {
    // Agrega aquí tus traducciones en inglés
    'login.title': 'Login',
    'login.google': 'Continue with Google',
    'login.error': 'Login failed',
    // ... más traducciones
  }
};

export const TranslationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}; 