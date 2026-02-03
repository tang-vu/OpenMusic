import { AppShell } from './components/layout/app-shell';
import { useTheme } from './hooks/use-theme';
import { useUIStore } from './stores/ui-store';
import { LyricsEditor } from './features/lyrics/lyrics-editor';
import { BeatMaker } from './features/beats/beat-maker';
import { AudioPlayer } from './features/player/audio-player';
import { AIChat } from './features/ai/ai-chat';
import { SettingsPanel } from './features/settings/settings-panel';

export default function App() {
  useTheme();
  const { activeTab } = useUIStore();

  return (
    <AppShell>
      <div className="p-8 h-full">
        {activeTab === 'lyrics' && <LyricsEditor />}
        {activeTab === 'beats' && <BeatMaker />}
        {activeTab === 'player' && <AudioPlayer />}
        {activeTab === 'ai' && <AIChat />}
        {activeTab === 'settings' && <SettingsPanel />}
      </div>
    </AppShell>
  );
}
