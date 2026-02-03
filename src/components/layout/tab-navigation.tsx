import { useUIStore, type ActiveTab } from '../../stores/ui-store';

const tabs: { id: ActiveTab; label: string }[] = [
  { id: 'lyrics', label: 'Lyrics' },
  { id: 'beats', label: 'Beats' },
  { id: 'player', label: 'Player' },
  { id: 'ai', label: 'AI' },
  { id: 'settings', label: 'Settings' },
];

export function TabNavigation() {
  const { activeTab, setActiveTab } = useUIStore();

  return (
    <nav className="flex gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            px-6 py-2 rounded-lg font-medium transition-colors
            ${
              activeTab === tab.id
                ? 'bg-primary-500 text-white'
                : 'bg-surface-700 text-gray-300 hover:bg-surface-600'
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
