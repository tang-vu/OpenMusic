/**
 * i18n System - Public API
 */

export { useTranslation, getTranslation } from './use-translation';
export {
  useI18nStore,
  SUPPORTED_LANGUAGES,
  getLanguageByCode,
  type LanguageCode,
  type Language,
} from '@/stores/i18n-store';
