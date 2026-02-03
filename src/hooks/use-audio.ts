import { audioApi } from '@/lib/tauri-api';
import { usePlayerStore } from '@/stores/player-store';
import { useCallback } from 'react';

export function useAudio() {
  const { setPlaying, setVolume: setStoreVolume } = usePlayerStore();

  const play = useCallback(async (path: string) => {
    try {
      await audioApi.play(path);
      setPlaying(true);
    } catch (error) {
      console.error('Audio play error:', error);
      throw error;
    }
  }, [setPlaying]);

  const pause = useCallback(async () => {
    await audioApi.pause();
    setPlaying(false);
  }, [setPlaying]);

  const resume = useCallback(async () => {
    await audioApi.resume();
    setPlaying(true);
  }, [setPlaying]);

  const stop = useCallback(async () => {
    await audioApi.stop();
    setPlaying(false);
  }, [setPlaying]);

  const setVolume = useCallback(async (vol: number) => {
    await audioApi.setVolume(vol / 100); // Convert 0-100 to 0-1
    setStoreVolume(vol / 100);
  }, [setStoreVolume]);

  return { play, pause, resume, stop, setVolume };
}
