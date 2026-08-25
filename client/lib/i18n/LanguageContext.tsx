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
    let resolvedLang: Language = "bn";
    try {
      const rupzonVal = localStorage.getItem("rupzon_lang");
      if (rupzonVal === "bn" || rupzonVal === "en") {
        resolvedLang = rupzonVal;
      }
    } catch {
      // fallback to bn
    }

    setLanguageState(resolvedLang);
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
      <div className="fixed inset-0 bg-maroon-900 text-white flex flex-col items-center justify-center font-sans z-50 overflow-hidden">
        <div className="absolute w-96 h-96 bg-maroon-800 rounded-full blur-3xl opacity-40 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-6 animate-in fade-in duration-200">
          <Image
            src="/logo.png"
            alt="Rupzon Collection"
            width={260}
            height={260}
            className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 object-contain drop-shadow-2xl animate-pulse"
            priority
          />
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
