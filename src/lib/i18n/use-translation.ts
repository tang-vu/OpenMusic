/**
 * i18n System - Translation Loader and Hook
 * Provides translations based on current language
 */

import { useMemo } from 'react';
import { useI18nStore, type LanguageCode } from '@/stores/i18n-store';

// Import all locale files
import en from './locales/en.json';
import vi from './locales/vi.json';
import zh from './locales/zh.json';
import es from './locales/es.json';
import fr from './locales/fr.json';
import de from './locales/de.json';
import ja from './locales/ja.json';
import ko from './locales/ko.json';
import pt from './locales/pt.json';
import ru from './locales/ru.json';

/** Translation dictionary type */
type TranslationDict = typeof en;

/** All translations mapped by language code */
const translations: Record<LanguageCode, TranslationDict> = {
  en,
  vi,
  zh,
  es,
  fr,
  de,
  ja,
  ko,
  pt,
  ru,
};

/**
 * Get nested value from object by dot-notation path
 */
function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) return path;
    if (typeof current !== 'object') return path;
    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === 'string' ? current : path;
}

/**
 * Hook to get translation function for current language
 *
 * @returns t function that takes a key path and returns translated string
 *
 * @example
 * const { t } = useTranslation();
 * t('nav.lyrics') // Returns "Lyrics" or "Lời bài hát" based on language
 */
export function useTranslation() {
  const language = useI18nStore((s) => s.language);

  const t = useMemo(() => {
    const dict = translations[language] || translations.en;

    return (key: string): string => {
      const value = getNestedValue(dict as unknown as Record<string, unknown>, key);
      // Fallback to English if key not found
      if (value === key && language !== 'en') {
        return getNestedValue(translations.en as unknown as Record<string, unknown>, key);
      }
      return value;
    };
  }, [language]);

  return { t, language };
}

/**
 * Get translation for a specific language (non-hook version)
 */
export function getTranslation(language: LanguageCode, key: string): string {
  const dict = translations[language] || translations.en;
  const value = getNestedValue(dict as unknown as Record<string, unknown>, key);
  if (value === key && language !== 'en') {
    return getNestedValue(translations.en as unknown as Record<string, unknown>, key);
  }
  return value;
}
