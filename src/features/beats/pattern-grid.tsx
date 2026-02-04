/**
 * Pattern Grid Component
 * Displays 8x16 beat grid with active step indicator
 */

interface PatternGridProps {
  pattern: boolean[][];
  onCellToggle: (row: number, col: number) => void;
  activeStep?: number;
}

const SAMPLE_NAMES = ['Kick', 'Snare', 'HiHat', 'Tom 1', 'Tom 2', 'Clap', 'Cymbal', 'Perc'];

export function PatternGrid({ pattern, onCellToggle, activeStep = -1 }: PatternGridProps) {
  return (
    <div className="bg-surface-800 border border-surface-700 rounded-lg p-4">
      <div className="flex gap-2">
        <div className="w-20 flex flex-col gap-1">
          {SAMPLE_NAMES.map((name, idx) => (
            <div
              key={idx}
              className="h-8 flex items-center justify-end pr-2 text-xs text-gray-400 font-medium"
            >
              {name}
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col gap-1">
          {pattern.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-1">
              {row.map((active, colIdx) => (
                <button
                  key={colIdx}
                  onClick={() => onCellToggle(rowIdx, colIdx)}
                  className={`flex-1 h-8 rounded transition-colors ${
                    colIdx === activeStep
                      ? active
                        ? 'bg-yellow-400 hover:bg-yellow-500'
                        : 'bg-surface-500 hover:bg-surface-400'
                      : active
                        ? 'bg-primary-500 hover:bg-primary-600'
                        : 'bg-surface-700 hover:bg-surface-600'
                  }`}
                  aria-label={`Toggle ${SAMPLE_NAMES[rowIdx]} at step ${colIdx + 1}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
