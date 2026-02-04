import { ReactNode } from 'react';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { PlayerBar } from './player-bar';
import { AICommandPalette } from '@/components/ai/ai-command-palette';
import { AICommandPaletteTrigger } from '@/components/ai/ai-command-palette-trigger';

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-screen flex flex-col bg-surface-900 text-white">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
      <PlayerBar />
      <AICommandPalette />
      <AICommandPaletteTrigger />
    </div>
  );
}
