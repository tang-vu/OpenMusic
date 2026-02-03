# OpenMusic Tech Stack

## Overview
Desktop music creation app - Tauri 2.0 + React TypeScript + Rust audio backend + AI assistance.

---

## Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | 5.x | Type safety |
| Vite | 5.x | Build tool |
| TailwindCSS | 3.x | Styling |
| Zustand | 4.x | State management |
| TanStack Query | 5.x | Async state |
| Web Audio API | - | Visualization, previews |

---

## Backend (Tauri/Rust)

| Crate | Version | Purpose |
|-------|---------|---------|
| tauri | 2.x | Desktop framework |
| cpal | 0.15 | Low-level audio I/O |
| rodio | 0.18 | High-level playback |
| symphonia | 0.5 | Audio decoding (MP3, FLAC, WAV, OGG) |
| hound | 3.5 | WAV read/write |
| midir | 0.9 | MIDI I/O |
| midly | 0.5 | MIDI file parsing |
| fundsp | 0.18 | DSP/synthesis |
| ringbuf | 0.3 | Lock-free audio buffers |
| crossbeam | 0.8 | Threading utilities |
| serde | 1.x | Serialization |
| tokio | 1.x | Async runtime |

---

## AI Integration

| Provider | Use Case | Priority |
|----------|----------|----------|
| Ollama (local) | Offline lyrics, suggestions | 1 (default) |
| OpenAI | Cloud lyrics, composition | 2 |
| Claude | Emotional nuance, long context | 3 |
| Gemini | Cost-effective, multilingual | 4 |
| MusicGen (local) | Audio generation | Future |

**Architecture:** Provider abstraction layer with fallback support.

---

## Audio Architecture

```
[React UI] <--IPC--> [Rust Backend]
     |                      |
Web Audio API          cpal/rodio
(visualization)        (processing)
```

**Web Audio:** Waveform display, metronome, previews
**Rust:** File encoding/decoding, beat generation, effects, MIDI

---

## Data Storage

| Type | Technology |
|------|------------|
| App Config | JSON (tauri-plugin-store) |
| Projects | SQLite |
| Audio Files | Local filesystem |
| AI Settings | Encrypted JSON |

---

## Build & Deploy

| Platform | Target |
|----------|--------|
| Windows | MSVC x64 |
| macOS | Universal (x64 + ARM) |
| Linux | AppImage, .deb |

---

## Tauri Plugins

- `tauri-plugin-fs` - File system access
- `tauri-plugin-dialog` - File picker
- `tauri-plugin-store` - Persistent storage
- `tauri-plugin-shell` - External tools (ffmpeg)
