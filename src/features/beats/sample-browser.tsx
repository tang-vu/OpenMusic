import { Card } from '../../components/ui/card';

const SAMPLE_CATEGORIES = [
  { name: 'Kick Drums', count: 12 },
  { name: 'Snare Drums', count: 15 },
  { name: 'Hi-Hats', count: 18 },
  { name: 'Toms', count: 8 },
  { name: 'Claps', count: 6 },
  { name: 'Cymbals', count: 10 },
  { name: 'Percussion', count: 20 },
  { name: 'FX', count: 14 },
];

export function SampleBrowser() {
  return (
    <div className="w-64 flex flex-col gap-4">
      <h3 className="text-lg font-semibold">Sample Browser</h3>
      <Card className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {SAMPLE_CATEGORIES.map((category, idx) => (
            <button
              key={idx}
              className="w-full p-3 bg-surface-700 hover:bg-surface-600 rounded text-left transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{category.name}</span>
                <span className="text-xs text-gray-400">{category.count}</span>
              </div>
            </button>
          ))}
        </div>
      </Card>
      <p className="text-xs text-gray-400 text-center">
        Sample playback in Phase 06
      </p>
    </div>
  );
}
