/**
 * Tab Navigation Component
 * Main navigation tabs with i18n support
 */

import { useUIStore, type ActiveTab } from '@/stores/ui-store';
import { useTranslation } from '@/lib/i18n';

const tabIds: ActiveTab[] = ['lyrics', 'beats', 'player', 'ai', 'settings'];

export function TabNavigation() {
  const { activeTab, setActiveTab } = useUIStore();
  const { t } = useTranslation();

  const getTabLabel = (id: ActiveTab): string => {
    switch (id) {
      case 'lyrics': return t('nav.lyrics');
      case 'beats': return t('nav.beats');
      case 'player': return t('nav.player');
      case 'ai': return t('nav.ai');
      case 'settings': return t('nav.settings');
      default: return id;
    }
  };

  return (
    <nav className="flex gap-1">
      {tabIds.map((id) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${
              activeTab === id
                ? 'bg-primary-500 text-white'
                : 'bg-surface-700 text-gray-300 hover:bg-surface-600'
            }
          `}
        >
          {getTabLabel(id)}
        </button>
      ))}
    </nav>
  );
}
