import { usePlayerStore } from '../../stores/player-store';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export function Playlist() {
  const { currentTrack } = usePlayerStore();

  const handleAddTrack = () => {
    // Placeholder for adding tracks (Phase 06 with IPC)
    alert('Track selection will be available in Phase 06');
  };

  return (
    <Card title="Playlist" className="flex-1">
      {!currentTrack ? (
        <div className="flex flex-col items-center justify-center h-48 gap-4">
          <p className="text-gray-400">No tracks added</p>
          <Button onClick={handleAddTrack}>Add Track</Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="p-3 bg-surface-700 rounded flex items-center justify-between">
            <div>
              <p className="font-medium">{currentTrack.title}</p>
              {currentTrack.artist && (
                <p className="text-sm text-gray-400">{currentTrack.artist}</p>
              )}
            </div>
            <span className="text-sm text-gray-400">
              {currentTrack.duration ? `${Math.floor(currentTrack.duration / 60)}:${String(Math.floor(currentTrack.duration % 60)).padStart(2, '0')}` : '--:--'}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
