"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

import { translate, translations } from "../lib/translations";

const LanguageContext = createContext(null);

const STORAGE_KEY = "autoconnect-language";

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState("en");
  const [isLanguageReady, setIsLanguageReady] = useState(false);

  // Load previously selected language
  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(STORAGE_KEY);

      if (savedLanguage && translations[savedLanguage]) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error("Unable to load language:", error);
    }

    setIsLanguageReady(true);
  }, []);

  // Change and save language
  const setLanguage = useCallback((newLanguage) => {
    if (!translations[newLanguage]) {
      return;
    }

    setLanguageState(newLanguage);

    try {
      localStorage.setItem(STORAGE_KEY, newLanguage);
    } catch (error) {
      console.error("Unable to save language:", error);
    }
  }, []);

  // Update browser language attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // Translation function
  const t = useCallback(
    (key, variables = {}) => {
      return translate(language, key, variables);
    },
    [language]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      isLanguageReady,
      t,
    }),
    [language, setLanguage, isLanguageReady, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook
export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage must be used inside LanguageProvider"
    );
  }

  return context;
}