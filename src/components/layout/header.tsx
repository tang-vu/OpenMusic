/**
 * Header Component
 * App header with logo, project selector, and navigation
 */

import { TabNavigation } from './tab-navigation';
import { ProjectSelector } from '@/components/project/project-selector';

export function Header() {
  return (
    <header className="h-16 bg-surface-800 border-b border-surface-700 flex items-center px-6">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-primary-500">OpenMusic</h1>
          <ProjectSelector />
        </div>
        <TabNavigation />
      </div>
    </header>
  );
}
