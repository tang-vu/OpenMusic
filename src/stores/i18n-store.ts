/**
 * Internationalization Store
 * Manages app language selection and persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Supported language codes */
export type LanguageCode = 'en' | 'vi' | 'zh' | 'es' | 'fr' | 'de' | 'ja' | 'ko' | 'pt' | 'ru';

/** Language metadata */
export interface Language {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

/** All supported languages */
export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' },
  { code: 'ko', name: 'Korean', nativeName: '한국어' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' },
];

interface I18nState {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
}

export const useI18nStore = create<I18nState>()(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'openmusic-i18n',
    }
  )
);

/** Get language by code */
export function getLanguageByCode(code: LanguageCode): Language | undefined {
  return SUPPORTED_LANGUAGES.find((lang) => lang.code === code);
}
