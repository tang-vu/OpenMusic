import { useUIStore } from '../../stores/ui-store';

export function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();

  if (!sidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="w-12 bg-surface-800 border-r border-surface-700 flex items-center justify-center hover:bg-surface-700 transition-colors"
        aria-label="Open sidebar"
      >
        <svg
          className="w-6 h-6 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </button>
    );
  }

  return (
    <aside className="w-64 bg-surface-800 border-r border-surface-700 flex flex-col">
      <div className="p-4 border-b border-surface-700 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">Navigation</h2>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-surface-700 transition-colors"
          aria-label="Close sidebar"
        >
          <svg
            className="w-5 h-5 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
      <nav className="flex-1 p-4">
        <p className="text-gray-400 text-sm">Navigation items (optional for now)</p>
      </nav>
    </aside>
  );
}
