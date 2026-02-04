# Project Overview & Product Requirements

## Overview

**OpenMusic** is a cross-platform desktop application for AI-powered music composition. It combines a lyrics editor, beat maker, audio player, and AI chat into a unified creative workspace.

## Vision

Democratize music creation by providing intuitive tools enhanced with AI capabilities, accessible to both beginners and professionals.

## Target Users

- Musicians seeking AI-assisted composition
- Songwriters needing lyrics generation/editing
- Producers creating beats and patterns
- Hobbyists exploring music creation

---

## Functional Requirements

### FR-1: AI Integration

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1.1 | Support multiple AI providers (Claude, Gemini, Codex) | High |
| FR-1.2 | CLIProxyAPI server management (start/stop/configure) | High |
| FR-1.3 | Real-time AI chat interface | High |
| FR-1.4 | Provider availability checking | Medium |
| FR-1.5 | Auto-download CLIProxyAPI binary | Medium |

### FR-2: Lyrics Editor

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-2.1 | Text editing with formatting | High |
| FR-2.2 | AI-powered suggestions panel | High |
| FR-2.3 | Lyrics toolbar with actions | Medium |
| FR-2.4 | Save/load lyrics files | Medium |

### FR-3: Beat Maker

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-3.1 | Pattern grid for beat sequencing | High |
| FR-3.2 | BPM control with precise adjustment | High |
| FR-3.3 | Sample browser for sounds | Medium |
| FR-3.4 | Multiple track support | Medium |

### FR-4: Audio Player

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-4.1 | Play/pause/stop controls | High |
| FR-4.2 | Volume control with slider | High |
| FR-4.3 | Progress bar with seek | High |
| FR-4.4 | Waveform visualization | Medium |
| FR-4.5 | Playlist management | Low |

### FR-5: MIDI Support

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-5.1 | List available MIDI ports | High |
| FR-5.2 | Connect to MIDI input devices | High |
| FR-5.3 | Send MIDI output | Medium |
| FR-5.4 | MIDI file parsing | Low |

### FR-6: Settings

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-6.1 | Theme switching (light/dark) | Medium |
| FR-6.2 | CLIProxyAPI server configuration | High |
| FR-6.3 | Persistent settings storage | High |

---

## Non-Functional Requirements

### NFR-1: Performance

- Audio latency < 10ms for real-time playback
- UI renders at 60fps
- App startup < 3 seconds

### NFR-2: Reliability

- Graceful error handling for all Tauri commands
- Auto-cleanup of CLIProxyAPI on app close
- State persistence across sessions

### NFR-3: Security

- OAuth authentication for AI providers
- No hardcoded API keys
- Secure IPC between frontend and backend

### NFR-4: Usability

- Intuitive navigation with tab-based UI
- Responsive layout for different window sizes
- Keyboard shortcuts for common actions

### NFR-5: Maintainability

- Modular architecture with clear separation
- TypeScript for frontend type safety
- Rust error handling with thiserror/anyhow

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Audio playback latency | < 10ms |
| App startup time | < 3s |
| AI response time | < 2s (network dependent) |
| Code coverage | > 70% |

---

## Constraints

- **Platform**: Windows, macOS, Linux (via Tauri)
- **Runtime**: Requires Rust toolchain for backend
- **AI**: Requires CLIProxyAPI server for AI features
- **Audio**: Requires audio device access

---

## Dependencies

### Frontend
- React 18, TypeScript, Vite
- TailwindCSS, Zustand
- @tauri-apps/api, Tauri plugins

### Backend
- Tauri 2.0, tokio, serde
- rodio, cpal (audio)
- midir, midly (MIDI)
- reqwest (HTTP client)

---

## Glossary

| Term | Definition |
|------|------------|
| CLIProxyAPI | Local server proxying CLI AI tools (Claude Code, Gemini CLI) |
| Tauri | Rust-based framework for cross-platform desktop apps |
| Zustand | Lightweight React state management library |
| rodio | Rust audio playback library |
| MIDI | Musical Instrument Digital Interface protocol |
