import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import { defaultLocale, localeNames, translations } from '../lib/i18n';
import type { Locale, TranslationKey } from '../lib/i18n';

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  localeNames: typeof localeNames;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(defaultLocale);

  function t(key: TranslationKey, vars?: Record<string, string>): string {
    let str: string = translations[locale][key];
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, v);
      }
    }
    return str;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, localeNames, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useT must be used within I18nProvider');
  return ctx;
}
