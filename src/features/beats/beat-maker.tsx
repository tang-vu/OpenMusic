/**
 * Beat Maker Component
 * Main beat sequencer with pattern grid and AI assistance
 */

import { useState } from 'react';
import { PatternGrid } from './pattern-grid';
import { BPMControl } from './bpm-control';
import { SampleBrowser } from './sample-browser';
import { BeatsAIPanel } from './beats-ai-panel';

export function BeatMaker() {
  const [bpm, setBpm] = useState(120);
  const [showAIPanel, setShowAIPanel] = useState(true);
  const [pattern, setPattern] = useState<boolean[][]>(
    Array(8).fill(null).map(() => Array(16).fill(false))
  );

  const handleCellToggle = (row: number, col: number) => {
    setPattern((prev) => {
      const newPattern = prev.map((r) => [...r]);
      newPattern[row][col] = !newPattern[row][col];
      return newPattern;
    });
  };

  const handleClear = () => {
    setPattern(Array(8).fill(null).map(() => Array(16).fill(false)));
  };

  const handlePatternGenerated = (
    grid: boolean[][],
    patternInfo?: { name?: string; bpm?: number }
  ) => {
    setPattern(grid);
    // Optionally update BPM if pattern suggests one
    if (patternInfo?.bpm && patternInfo.bpm !== bpm) {
      setBpm(patternInfo.bpm);
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between p-4 bg-surface-800 border border-surface-700 rounded-lg">
        <h2 className="text-xl font-semibold">Beat Maker</h2>
        <div className="flex items-center gap-4">
          <BPMControl bpm={bpm} onChange={setBpm} />
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              showAIPanel
                ? 'bg-primary-500 text-white'
                : 'bg-surface-700 text-gray-300 hover:bg-surface-600'
            }`}
          >
            AI
          </button>
        </div>
      </div>

      <div className="flex gap-4 flex-1">
        <div className="flex-1 flex flex-col gap-4">
          <PatternGrid pattern={pattern} onCellToggle={handleCellToggle} />
          <div className="flex gap-2">
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-surface-700 hover:bg-surface-600 text-white rounded transition-colors"
            >
              Clear Pattern
            </button>
            <button
              className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded transition-colors"
              disabled
            >
              Play (Phase 06)
            </button>
          </div>
        </div>

        {showAIPanel && (
          <BeatsAIPanel
            currentBpm={bpm}
            onPatternGenerated={handlePatternGenerated}
            onClose={() => setShowAIPanel(false)}
          />
        )}

        <SampleBrowser />
      </div>
    </div>
  );
}
