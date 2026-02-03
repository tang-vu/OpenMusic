interface BPMControlProps {
  bpm: number;
  onChange: (bpm: number) => void;
}

export function BPMControl({ bpm, onChange }: BPMControlProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm text-gray-400 font-medium">BPM:</label>
      <input
        type="range"
        min="60"
        max="200"
        value={bpm}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-32 h-2 bg-surface-700 rounded-lg appearance-none cursor-pointer slider-thumb"
      />
      <span className="text-lg font-semibold text-white w-12 text-center">{bpm}</span>
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          background: rgb(139, 92, 246);
          border-radius: 50%;
          cursor: pointer;
        }
        .slider-thumb::-moz-range-thumb {
          width: 14px;
          height: 14px;
          background: rgb(139, 92, 246);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
