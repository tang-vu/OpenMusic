import { usePlayerStore } from '../../stores/player-store';
import { useAudio } from '@/hooks/use-audio';

export function VolumeSlider() {
  const { volume } = usePlayerStore();
  const { setVolume } = useAudio();

  const handleVolumeChange = async (newVolume: number) => {
    try {
      await setVolume(newVolume);
    } catch (error) {
      console.error('Volume change error:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
      </svg>
      <input
        type="range"
        min="0"
        max="100"
        value={volume * 100}
        onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
        className="w-24 h-2 bg-surface-700 rounded-lg appearance-none cursor-pointer slider-thumb"
      />
      <span className="text-sm text-gray-400 w-10">{Math.round(volume * 100)}%</span>
      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 12px;
          height: 12px;
          background: rgb(139, 92, 246);
          border-radius: 50%;
          cursor: pointer;
        }
        .slider-thumb::-moz-range-thumb {
          width: 12px;
          height: 12px;
          background: rgb(139, 92, 246);
          border-radius: 50%;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}
