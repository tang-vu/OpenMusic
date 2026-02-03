import { WaveformDisplay } from './waveform-display';
import { TransportControls } from './transport-controls';
import { Playlist } from './playlist';

export function AudioPlayer() {
  return (
    <div className="h-full flex flex-col gap-4">
      <div className="bg-surface-800 border border-surface-700 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Audio Player</h2>
        <WaveformDisplay />
      </div>

      <TransportControls />

      <Playlist />
    </div>
  );
}
