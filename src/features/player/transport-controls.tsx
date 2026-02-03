import { PlayButton } from '../../components/player/play-button';
import { VolumeSlider } from '../../components/player/volume-slider';
import { ProgressBar } from '../../components/player/progress-bar';
import { usePlayerStore } from '../../stores/player-store';
import { useAudio } from '@/hooks/use-audio';

export function TransportControls() {
  const { setPosition } = usePlayerStore();
  const { stop } = useAudio();

  const handleStop = async () => {
    try {
      await stop();
      setPosition(0);
    } catch (error) {
      console.error('Stop error:', error);
    }
  };

  const handleSkipBack = () => {
    setPosition(0);
  };

  const handleSkipForward = () => {
    // Placeholder for skip to next track
  };

  return (
    <div className="bg-surface-800 border border-surface-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={handleSkipBack}
          className="w-10 h-10 rounded-full bg-surface-700 hover:bg-surface-600 flex items-center justify-center text-white transition-colors"
          aria-label="Skip back"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
          </svg>
        </button>

        <PlayButton />

        <button
          onClick={handleStop}
          className="w-10 h-10 rounded-full bg-surface-700 hover:bg-surface-600 flex items-center justify-center text-white transition-colors"
          aria-label="Stop"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 6h12v12H6z" />
          </svg>
        </button>

        <button
          onClick={handleSkipForward}
          className="w-10 h-10 rounded-full bg-surface-700 hover:bg-surface-600 flex items-center justify-center text-white transition-colors"
          aria-label="Skip forward"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M6 18l8.5-6L6 6v12zm10-12v12h2V6h-2z" />
          </svg>
        </button>
      </div>

      <ProgressBar />

      <div className="flex items-center justify-end">
        <VolumeSlider />
      </div>
    </div>
  );
}
