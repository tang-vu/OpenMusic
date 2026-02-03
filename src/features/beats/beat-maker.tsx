import { useState } from 'react';
import { PatternGrid } from './pattern-grid';
import { BPMControl } from './bpm-control';
import { SampleBrowser } from './sample-browser';

export function BeatMaker() {
  const [bpm, setBpm] = useState(120);
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

  return (
    <div className="h-full flex flex-col gap-4">
      <div className="flex items-center justify-between p-4 bg-surface-800 border border-surface-700 rounded-lg">
        <h2 className="text-xl font-semibold">Beat Maker</h2>
        <BPMControl bpm={bpm} onChange={setBpm} />
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

        <SampleBrowser />
      </div>
    </div>
  );
}
