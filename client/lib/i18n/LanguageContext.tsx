"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import Image from "next/image";
import { Loader2 } from "lucide-react";
import { bn, TranslationType } from "@/locales/bn";
import { en } from "@/locales/en";

export type Language = "bn" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
  isHydrated: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Language, TranslationType> = {
  bn,
  en,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("bn");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const savedLang = (localStorage.getItem("rupzon_lang") || localStorage.getItem("commercecore_lang")) as Language | null;
    if (savedLang === "bn" || savedLang === "en") {
      setLanguageState(savedLang);
    } else {
      setLanguageState("bn");
    }
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem("rupzon_lang", language);
      document.documentElement.lang = language;
    }
  }, [language, isHydrated]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = translations[language] || bn;

  if (!isHydrated) {
    return (
      <div className="fixed inset-0 bg-maroon-900 text-white flex flex-col items-center justify-center font-sans z-50">
        <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-200">
          <div className="p-6 bg-white/10 border border-maroon-700/60 rounded-[2.5rem] backdrop-blur-md shadow-2xl">
            <Image
              src="/logo.png"
              alt="Rupzon Collection"
              width={180}
              height={180}
              className="w-36 h-36 sm:w-44 sm:h-44 object-contain animate-pulse"
              priority
            />
          </div>
          <div className="flex items-center space-x-3 text-cream tracking-wider">
            <Loader2 className="w-5 h-5 animate-spin text-cream" />
            <span className="font-serif text-xl sm:text-2xl font-bold">Rupzon Collection</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isHydrated }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
