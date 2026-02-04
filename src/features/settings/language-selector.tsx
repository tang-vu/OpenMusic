/**
 * Language Selector Component
 * Dropdown to select app language
 */

import { useI18nStore, SUPPORTED_LANGUAGES, type LanguageCode } from '@/stores/i18n-store';
import { useTranslation } from '@/lib/i18n';

export function LanguageSelector() {
  const { language, setLanguage } = useI18nStore();
  const { t } = useTranslation();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-300">
        {t('settings.language')}
      </label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        className="w-full bg-surface-700 border border-surface-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        {SUPPORTED_LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
    </div>
  );
}
