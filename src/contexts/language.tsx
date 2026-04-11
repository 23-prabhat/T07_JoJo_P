"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Lang, translations, Translations } from "@/lib/i18n";

const LanguageContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}>({
  lang: "en",
  setLang: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored && stored in translations) {
      setLangState(stored);
    }
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("lang", l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
