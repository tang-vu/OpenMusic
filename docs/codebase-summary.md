# Codebase Summary

## Overview

OpenMusic codebase: ~63 source files (39 TypeScript/TSX frontend, 23 Rust backend).

---

## Frontend (src/)

### Entry Points

| File | Purpose |
|------|---------|
| `main.tsx` | React app entry, renders App component |
| `App.tsx` | Root component with layout and routing |

### Components (src/components/)

#### Layout
| File | Purpose |
|------|---------|
| `app-shell.tsx` | Main layout wrapper |
| `header.tsx` | Top navigation bar |
| `sidebar.tsx` | Side navigation |
| `player-bar.tsx` | Bottom player controls |
| `tab-navigation.tsx` | Tab switching UI |

#### UI Components
| File | Purpose |
|------|---------|
| `button.tsx` | Reusable button component |
| `input.tsx` | Text input component |
| `slider.tsx` | Range slider component |
| `select.tsx` | Dropdown select component |
| `card.tsx` | Card container component |

#### Player Components
| File | Purpose |
|------|---------|
| `play-button.tsx` | Play/pause toggle |
| `volume-slider.tsx` | Volume control |
| `progress-bar.tsx` | Playback progress |

### Features (src/features/)

#### AI Module
| File | Purpose |
|------|---------|
| `ai-chat.tsx` | Main AI chat interface |
| `chat-input.tsx` | Message input field |
| `message-list.tsx` | Chat message display |
| `provider-selector.tsx` | AI provider dropdown |

#### Beats Module
| File | Purpose |
|------|---------|
| `beat-maker.tsx` | Beat maker container |
| `pattern-grid.tsx` | Step sequencer grid |
| `bpm-control.tsx` | Tempo controls |
| `sample-browser.tsx` | Sound sample list |

#### Lyrics Module
| File | Purpose |
|------|---------|
| `lyrics-editor.tsx` | Main text editor |
| `lyrics-toolbar.tsx` | Editor actions |
| `ai-suggestions-panel.tsx` | AI lyric suggestions |

#### Player Module
| File | Purpose |
|------|---------|
| `audio-player.tsx` | Player container |
| `transport-controls.tsx` | Play/stop/pause |
| `playlist.tsx` | Track list |
| `waveform-display.tsx` | Audio visualization |

#### Settings Module
| File | Purpose |
|------|---------|
| `settings-panel.tsx` | Settings UI |
| `index.ts` | Module exports |

### Hooks (src/hooks/)

| File | Purpose |
|------|---------|
| `use-audio.ts` | Audio playback hook |
| `use-ai.ts` | AI provider hook |
| `use-theme.ts` | Theme switching hook |

### Stores (src/stores/)

| File | Purpose |
|------|---------|
| `player-store.ts` | Player state (playback, volume, track) |
| `settings-store.ts` | App settings persistence |
| `ui-store.ts` | UI state (active tab, sidebar) |

### Lib (src/lib/)

| File | Purpose |
|------|---------|
| `tauri-api.ts` | Tauri command wrappers |

---

## Backend (src-tauri/src/)

### Entry Points

| File | Purpose |
|------|---------|
| `lib.rs` | Tauri app initialization, command registration |
| `main.rs` | Binary entry point |

### AI Module (ai/)

| File | Purpose |
|------|---------|
| `mod.rs` | Module exports |
| `types.rs` | AI types (Message, Provider, Config) |
| `provider.rs` | Provider trait definition |
| `manager.rs` | AIProviderManager implementation |
| `commands.rs` | Tauri AI commands |
| `openai.rs` | OpenAI provider |
| `claude_code.rs` | Claude Code CLI integration |
| `gemini_cli.rs` | Gemini CLI integration |
| `cliproxyapi.rs` | CLIProxyAPI client |
| `cliproxyapi_manager.rs` | CLIProxyAPI lifecycle management |
| `cliproxyapi_commands.rs` | CLIProxyAPI Tauri commands |

### Audio Module (audio/)

| File | Purpose |
|------|---------|
| `mod.rs` | Module exports, command registration |
| `types.rs` | Audio types (PlaybackState, Track) |
| `engine.rs` | Audio engine (rodio/cpal) |
| `controller.rs` | AudioController for state management |
| `commands.rs` | Tauri audio commands |

### MIDI Module (midi/)

| File | Purpose |
|------|---------|
| `mod.rs` | Module exports, command registration |
| `types.rs` | MIDI types (Note, Event) |
| `input.rs` | MIDI input handling (midir) |
| `output.rs` | MIDI output handling |
| `commands.rs` | Tauri MIDI commands |

---

## Tauri Commands

### Audio Commands
- `play_audio` - Start playback
- `pause_audio` - Pause playback
- `resume_audio` - Resume playback
- `stop_audio` - Stop playback
- `set_volume` - Adjust volume
- `get_playback_state` - Get current state

### MIDI Commands
- `list_midi_input_ports` - List inputs
- `list_midi_output_ports` - List outputs
- `connect_midi_input` - Connect input
- `connect_midi_output` - Connect output

### AI Commands
- `ai_complete` - Send completion request
- `list_ai_providers` - List available providers
- `set_ai_provider` - Set active provider
- `get_ai_provider` - Get active provider
- `check_ai_provider_availability` - Check provider status

### CLIProxyAPI Commands
- `cliproxyapi_is_installed` - Check installation
- `cliproxyapi_download` - Download binary
- `cliproxyapi_start` - Start server
- `cliproxyapi_stop` - Stop server
- `cliproxyapi_is_running` - Check running status
- `cliproxyapi_get_url` - Get server URL
- `cliproxyapi_get_version` - Get version
- `cliproxyapi_check_update` - Check for updates

---

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Node.js dependencies, scripts |
| `tsconfig.json` | TypeScript config |
| `vite.config.ts` | Vite bundler config |
| `tailwind.config.js` | TailwindCSS config |
| `postcss.config.js` | PostCSS config |
| `src-tauri/Cargo.toml` | Rust dependencies |
| `src-tauri/tauri.conf.json` | Tauri app config |

---

## Key Patterns

1. **State Management**: Zustand stores with persist middleware
2. **IPC**: Tauri invoke() calls to Rust commands
3. **Error Handling**: Rust thiserror/anyhow, frontend try-catch
4. **Async**: tokio runtime in Rust, React Query in frontend
5. **Styling**: TailwindCSS utility classes
