import React from 'react';
import { usePlayerStore } from '../../stores/player-store';

export function ProgressBar() {
  const { position, currentTrack, setPosition } = usePlayerStore();
  const duration = currentTrack?.duration || 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    setPosition(percent * duration);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-400 w-12 text-right">{formatTime(position)}</span>
      <div
        className="flex-1 h-2 bg-surface-700 rounded-full cursor-pointer relative group"
        onClick={handleSeek}
      >
        <div
          className="h-full bg-primary-500 rounded-full transition-all"
          style={{ width: `${duration > 0 ? (position / duration) * 100 : 0}%` }}
        />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ left: `${duration > 0 ? (position / duration) * 100 : 0}%`, marginLeft: '-6px' }}
        />
      </div>
      <span className="text-sm text-gray-400 w-12">{formatTime(duration)}</span>
    </div>
  );
}
