/**
 * Beat Sequencer Hook
 * Web Audio API based beat playback with precise timing
 */

import { useRef, useState, useCallback, useEffect } from 'react';

interface UseBeatSequencerOptions {
  bpm: number;
  pattern: boolean[][];
  onStepChange?: (step: number) => void;
}

export function useBeatSequencer({ bpm, pattern, onStepChange }: UseBeatSequencerOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);

  const audioContextRef = useRef<AudioContext | null>(null);
  const nextNoteTimeRef = useRef(0);
  const currentStepRef = useRef(0);
  const timerIdRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  // Calculate step duration from BPM (16th notes)
  const getStepDuration = useCallback(() => {
    return (60 / bpm) / 4; // 16th note duration
  }, [bpm]);

  // Initialize audio context
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    return audioContextRef.current;
  }, []);

  // Play a single sound using oscillator (placeholder for real samples)
  const playSound = useCallback((frequency: number, time: number, type: 'kick' | 'snare' | 'hihat' | 'other') => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Different sound characteristics
    if (type === 'kick') {
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, time);
      oscillator.frequency.exponentialRampToValueAtTime(30, time + 0.1);
      gainNode.gain.setValueAtTime(0.8, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
      oscillator.start(time);
      oscillator.stop(time + 0.2);
    } else if (type === 'snare') {
      oscillator.type = 'triangle';
      oscillator.frequency.setValueAtTime(frequency, time);
      gainNode.gain.setValueAtTime(0.5, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      oscillator.start(time);
      oscillator.stop(time + 0.1);
      // Add noise for snare
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.1, ctx.sampleRate);
      const noise = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noise.length; i++) {
        noise[i] = Math.random() * 2 - 1;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      noiseSource.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start(time);
    } else if (type === 'hihat') {
      // Use noise for hi-hat
      const noiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const noise = noiseBuffer.getChannelData(0);
      for (let i = 0; i < noise.length; i++) {
        noise[i] = Math.random() * 2 - 1;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 5000;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
      noiseSource.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noiseSource.start(time);
      // Cancel oscillator for hihat
      oscillator.disconnect();
    } else {
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(frequency, time);
      gainNode.gain.setValueAtTime(0.3, time);
      gainNode.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
      oscillator.start(time);
      oscillator.stop(time + 0.1);
    }
  }, []);

  // Get sound type from row index
  const getSoundType = useCallback((row: number): 'kick' | 'snare' | 'hihat' | 'other' => {
    if (row === 0) return 'kick';
    if (row === 1) return 'snare';
    if (row === 2) return 'hihat';
    return 'other';
  }, []);

  // Get frequency for row
  const getFrequencyForRow = useCallback((row: number): number => {
    const frequencies = [60, 200, 800, 100, 80, 400, 600, 300];
    return frequencies[row] || 200;
  }, []);

  // Schedule notes
  const scheduleNote = useCallback((step: number, time: number) => {
    pattern.forEach((row, rowIndex) => {
      if (row[step]) {
        const frequency = getFrequencyForRow(rowIndex);
        const type = getSoundType(rowIndex);
        playSound(frequency, time, type);
      }
    });
  }, [pattern, playSound, getFrequencyForRow, getSoundType]);

  // Scheduler function
  const scheduler = useCallback(() => {
    const ctx = audioContextRef.current;
    if (!ctx || !isPlayingRef.current) return;

    const stepDuration = getStepDuration();
    const scheduleAheadTime = 0.1; // Schedule 100ms ahead

    while (nextNoteTimeRef.current < ctx.currentTime + scheduleAheadTime) {
      scheduleNote(currentStepRef.current, nextNoteTimeRef.current);

      // Update UI step
      const stepToShow = currentStepRef.current;
      setCurrentStep(stepToShow);
      onStepChange?.(stepToShow);

      // Advance step
      currentStepRef.current = (currentStepRef.current + 1) % 16;
      nextNoteTimeRef.current += stepDuration;
    }

    timerIdRef.current = window.setTimeout(scheduler, 25);
  }, [getStepDuration, scheduleNote, onStepChange]);

  // Start playback
  const play = useCallback(() => {
    const ctx = initAudioContext();

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    isPlayingRef.current = true;
    setIsPlaying(true);
    currentStepRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime;

    scheduler();
  }, [initAudioContext, scheduler]);

  // Stop playback
  const stop = useCallback(() => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setCurrentStep(-1);

    if (timerIdRef.current !== null) {
      clearTimeout(timerIdRef.current);
      timerIdRef.current = null;
    }
  }, []);

  // Toggle play/stop
  const toggle = useCallback(() => {
    if (isPlaying) {
      stop();
    } else {
      play();
    }
  }, [isPlaying, play, stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIdRef.current !== null) {
        clearTimeout(timerIdRef.current);
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Stop when pattern changes significantly
  useEffect(() => {
    if (isPlaying) {
      // Keep playing with new pattern
    }
  }, [pattern, isPlaying]);

  return {
    isPlaying,
    currentStep,
    play,
    stop,
    toggle,
  };
}
