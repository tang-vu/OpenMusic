import React from 'react';
import ReactDOM from 'react-dom/client';
import { ProjectSelector } from '../../src/components/project/project-selector';
import { LyricsEditor } from '../../src/features/lyrics/lyrics-editor';
import { BPMControl } from '../../src/features/beats/bpm-control';
import { PatternGrid } from '../../src/features/beats/pattern-grid';
import { useBeatsStore } from '../../src/stores/beats-store';
import '../../src/index.css';

// Real frontend components and stores; no Tauri app, player or sequencer is mounted.
function WorkspaceFixture() {
  const { bpm, pattern, setBpm, toggleCell } = useBeatsStore();
  return (
    <main className="min-h-screen bg-surface-900 text-white p-6 space-y-5" style={{ padding: 24 }}>
      <header className="flex items-center gap-6">
        <h1 className="text-xl font-semibold">OpenMusic workspace preservation</h1>
        <ProjectSelector />
      </header>
      <p className="text-sm text-gray-400">Synthetic offline test data</p>
      <section style={{ height: 520 }} aria-label="Lyrics"><LyricsEditor /></section>
      <section className="space-y-3" aria-label="Beats">
        <BPMControl bpm={bpm} onChange={setBpm} />
        <PatternGrid pattern={pattern} onCellToggle={toggleCell} />
      </section>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode><WorkspaceFixture /></React.StrictMode>
);
