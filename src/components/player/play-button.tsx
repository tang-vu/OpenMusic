import { usePlayerStore } from '../../stores/player-store';
import { useAudio } from '@/hooks/use-audio';

export function PlayButton() {
  const { isPlaying, currentTrack } = usePlayerStore();
  const { pause, resume } = useAudio();

  const handleToggle = async () => {
    try {
      if (isPlaying) {
        await pause();
      } else {
        if (currentTrack) {
          // If we have a track, resume or play it
          await resume();
        } else {
          // No track loaded, could show file picker here
          console.warn('No track loaded');
        }
      }
    } catch (error) {
      console.error('Play/Pause error:', error);
    }
  };

  return (
    <button
      onClick={handleToggle}
      className="w-12 h-12 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center text-white transition-colors"
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isPlaying ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
        </svg>
      ) : (
        <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}
