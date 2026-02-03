import { usePlayerStore } from '../../stores/player-store';

export function PlayerBar() {
  const { currentTrack, isPlaying, volume, position, play, pause, setVolume } = usePlayerStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-20 bg-surface-800 border-t border-surface-700 px-6 flex items-center gap-6">
      {/* Track Info */}
      <div className="flex-1 min-w-0">
        {currentTrack ? (
          <div>
            <p className="text-white font-medium truncate">{currentTrack.title}</p>
            {currentTrack.artist && (
              <p className="text-gray-400 text-sm truncate">{currentTrack.artist}</p>
            )}
          </div>
        ) : (
          <p className="text-gray-500">No track selected</p>
        )}
      </div>

      {/* Play Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={isPlaying ? pause : play}
          disabled={!currentTrack}
          className={`
            p-3 rounded-full transition-colors
            ${
              currentTrack
                ? 'bg-primary-500 hover:bg-primary-600 text-white'
                : 'bg-surface-700 text-gray-500 cursor-not-allowed'
            }
          `}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Progress Bar */}
        <div className="flex items-center gap-2 w-64">
          <span className="text-xs text-gray-400 w-12 text-right">
            {formatTime(position)}
          </span>
          <div className="flex-1 h-1 bg-surface-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all"
              style={{
                width: currentTrack?.duration
                  ? `${(position / currentTrack.duration) * 100}%`
                  : '0%',
              }}
            />
          </div>
          <span className="text-xs text-gray-400 w-12">
            {currentTrack?.duration ? formatTime(currentTrack.duration) : '0:00'}
          </span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3 w-32">
        <svg
          className="w-5 h-5 text-gray-400"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
        </svg>
        <input
          type="range"
          min="0"
          max="100"
          value={volume * 100}
          onChange={(e) => setVolume(Number(e.target.value) / 100)}
          className="flex-1 h-1 bg-surface-700 rounded-full appearance-none cursor-pointer
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-3
                     [&::-webkit-slider-thumb]:h-3
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:bg-primary-500
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-moz-range-thumb]:w-3
                     [&::-moz-range-thumb]:h-3
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:bg-primary-500
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:cursor-pointer"
          aria-label="Volume"
        />
      </div>
    </div>
  );
}
