import { Button } from '../../components/ui/button';

interface LyricsToolbarProps {
  onInsertSection: (section: string) => void;
  onClear: () => void;
}

export function LyricsToolbar({ onInsertSection, onClear }: LyricsToolbarProps) {
  return (
    <div className="flex items-center gap-2 p-4 bg-surface-800 border border-surface-700 rounded-lg">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-sm text-gray-400 font-medium">Insert:</span>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onInsertSection('Verse')}
        >
          Add Verse
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onInsertSection('Chorus')}
        >
          Add Chorus
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onInsertSection('Bridge')}
        >
          Add Bridge
        </Button>
      </div>
      <Button size="sm" variant="ghost" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
