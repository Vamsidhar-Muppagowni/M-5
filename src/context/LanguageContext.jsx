import React, { createContext, useState, useContext, useEffect } from 'react';
import en from '../i18/en.json';

const LanguageContext = createContext();

const languages = { en };

export const LanguageProvider = ({ children }) => {
  /* 
     For Automated Google Translation to work best, we force the base app 
     to always render in English. The Google Translate script will handle 
     the actual translation on top of this.
  */
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState(en);

  const switchLanguage = (lang) => {
    // We only update state to 'en' internally to keep React app in English
    // The actual visual translation is handled by Google Translate cookie
    setLanguage('en');
    setTranslations(en);
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage, t: (key) => translations[key] || key }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
