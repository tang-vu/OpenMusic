# Code Standards

## General Principles

- **YAGNI** - You Aren't Gonna Need It
- **KISS** - Keep It Simple, Stupid
- **DRY** - Don't Repeat Yourself

---

## File Organization

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| React components | kebab-case | `audio-player.tsx` |
| Hooks | use-prefixed kebab | `use-audio.ts` |
| Stores | kebab-case with -store | `player-store.ts` |
| Rust modules | snake_case | `audio_engine.rs` |
| Types/Interfaces | PascalCase | `PlaybackState` |

### File Size Limits

- **Target**: < 200 lines per file
- **Action**: Split into modules when exceeded
- Use composition over inheritance

---

## TypeScript Standards

### Component Structure

```tsx
// 1. Imports
import { useState } from 'react';
import { usePlayerStore } from '@/stores/player-store';

// 2. Types (if file-specific)
interface Props {
  trackId: string;
  onPlay: () => void;
}

// 3. Component
export function AudioPlayer({ trackId, onPlay }: Props) {
  // Hooks first
  const [isLoading, setIsLoading] = useState(false);
  const { volume } = usePlayerStore();

  // Handlers
  const handlePlay = async () => {
    setIsLoading(true);
    await onPlay();
    setIsLoading(false);
  };

  // Render
  return (
    <div className="audio-player">
      {/* JSX */}
    </div>
  );
}
```

### State Management (Zustand)

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlayerState {
  volume: number;
  isPlaying: boolean;
  setVolume: (volume: number) => void;
  togglePlay: () => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set) => ({
      volume: 0.8,
      isPlaying: false,
      setVolume: (volume) => set({ volume }),
      togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
    }),
    { name: 'player-storage' }
  )
);
```

### Tauri API Calls

```ts
import { invoke } from '@tauri-apps/api/core';

export async function playAudio(path: string): Promise<void> {
  try {
    await invoke('play_audio', { path });
  } catch (error) {
    console.error('Failed to play audio:', error);
    throw error;
  }
}
```

---

## Rust Standards

### Module Structure

```rust
// mod.rs - exports only
pub mod types;
pub mod engine;
pub mod commands;

pub use types::*;
pub use commands::*;
```

### Error Handling

```rust
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AudioError {
    #[error("Failed to open file: {0}")]
    FileOpen(#[from] std::io::Error),

    #[error("Unsupported format: {0}")]
    UnsupportedFormat(String),

    #[error("Device not found")]
    DeviceNotFound,
}

// Use anyhow for command handlers
use anyhow::Result;

#[tauri::command]
pub async fn play_audio(path: String) -> Result<(), String> {
    do_play(&path).map_err(|e| e.to_string())
}
```

### Tauri Commands

```rust
use tauri::State;
use tokio::sync::Mutex;

#[tauri::command]
pub async fn get_playback_state(
    controller: State<'_, Mutex<AudioController>>,
) -> Result<PlaybackState, String> {
    let ctrl = controller.lock().await;
    Ok(ctrl.get_state())
}
```

### Async Patterns

```rust
use tokio::sync::Mutex;
use std::sync::Arc;

// Shared state pattern
let manager = Arc::new(Mutex::new(Manager::new()));

// In command handler
let lock = manager.lock().await;
```

---

## Styling (TailwindCSS)

### Class Organization

```tsx
// Order: layout → sizing → spacing → typography → colors → effects
<div className="flex items-center w-full p-4 text-sm text-gray-700 bg-white rounded-lg shadow-md">
```

### Common Patterns

```tsx
// Buttons
<button className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50">

// Cards
<div className="p-4 bg-white rounded-lg shadow">

// Inputs
<input className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500" />
```

---

## Git Conventions

### Commit Messages

```
<type>: <description>

Types:
- feat: New feature
- fix: Bug fix
- refactor: Code restructure
- docs: Documentation
- style: Formatting
- test: Tests
- chore: Maintenance
```

### Branch Naming

```
feature/add-lyrics-editor
fix/audio-playback-crash
refactor/ai-provider-module
```

---

## Testing

### Frontend (Vitest)

```ts
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AudioPlayer } from './audio-player';

describe('AudioPlayer', () => {
  it('renders play button', () => {
    render(<AudioPlayer />);
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });
});
```

### Backend (Rust)

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_midi() {
        let result = parse_midi("test.mid");
        assert!(result.is_ok());
    }

    #[tokio::test]
    async fn test_async_operation() {
        let result = async_fn().await;
        assert_eq!(result, expected);
    }
}
```

---

## Security

- No hardcoded API keys or secrets
- Use Tauri store plugin for sensitive data
- Validate all IPC inputs
- Sanitize file paths before access
- Use OAuth for AI provider authentication

---

## Performance

- Lazy load heavy components
- Memoize expensive computations
- Use React.memo for pure components
- Debounce frequent updates
- Stream large audio files
