import { useRef, useEffect } from 'react';

export function WaveformDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'rgb(30, 30, 46)';
    ctx.fillRect(0, 0, width, height);

    // Draw placeholder waveform
    ctx.strokeStyle = 'rgb(139, 92, 246)';
    ctx.lineWidth = 2;
    ctx.beginPath();

    const barWidth = 4;
    const barGap = 2;
    const barCount = Math.floor(width / (barWidth + barGap));

    for (let i = 0; i < barCount; i++) {
      const x = i * (barWidth + barGap);
      const barHeight = Math.random() * height * 0.6 + height * 0.2;
      const y = (height - barHeight) / 2;

      ctx.fillStyle = i < barCount / 3 ? 'rgb(139, 92, 246)' : 'rgb(55, 65, 81)';
      ctx.fillRect(x, y, barWidth, barHeight);
    }
  }, []);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={800}
        height={120}
        className="w-full h-32 rounded bg-surface-900"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <p className="text-gray-500 text-sm">Waveform visualization (Phase 06)</p>
      </div>
    </div>
  );
}
