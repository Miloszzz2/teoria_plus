// LanguageProvider.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from './i18n'; // lub odpowiednia ścieżka do pliku i18n.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageContext = createContext({
  language: 'pl',
  setLanguage: (lang: string) => { },
});

export const LanguageProvider = ({ children }: { children: any }) => {
  const [language, setLanguageState] = useState('pl');

  useEffect(() => {
    AsyncStorage.getItem('app_language').then(lang => {
      if (lang) {
        setLanguageState(lang);
        i18n.locale = lang;
      } else {
        // Ustaw domyślny język na podstawie urządzenia jeśli nie wybrano

        setLanguageState('pl');
        i18n.locale = 'pl';
      }
    });
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    i18n.locale = lang;
    AsyncStorage.setItem('app_language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);