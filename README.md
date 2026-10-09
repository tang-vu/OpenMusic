# OpenMusic

AI-powered desktop application for music composition, beat making, and lyrics creation.

## Features

- **AI Chat Integration** - Multi-provider AI support via CLIProxyAPI (Claude, Gemini, Codex)
- **Lyrics Editor** - Write and edit lyrics with AI-powered suggestions
- **Beat Maker** - Pattern-based beat sequencer with BPM control
- **Audio Player** - Full-featured playback with waveform visualization
- **MIDI Support** - Input/output connectivity for external MIDI devices
- **Settings Panel** - CLIProxyAPI server management and configuration

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Zustand |
| Backend | Rust, Tauri 2.0 |
| AI | CLIProxyAPI (Claude, Gemini, Codex via OAuth) |
| Audio | rodio, cpal |
| MIDI | midir, midly |

## Getting Started

### Prerequisites

- Node.js 18+
- Rust 1.70+
- Tauri CLI

### Installation

```bash
# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build frontend |
| `npm run tauri dev` | Run Tauri in dev mode |
| `npm run tauri build` | Build production app |
| `npm run typecheck` | TypeScript type checking |
| `npm test` | Offline project workspace and component tests |
| `npm run test:browser` | Chromium workspace preservation checks |

### Project workspace preservation

Switching between existing named projects saves the outgoing lyrics, BPM, and beat
pattern before loading the selected project. Selecting the active project keeps
the current draft. Save Project, Create Project, and Close Project retain their
existing save behavior. This does not add file import/export, general autosave,
or recovery for an unassigned "No Project" draft.

### Frontend checks

```bash
npm ci
npm run typecheck
npm test
npm run build
npx playwright install --with-deps chromium
npm run test:browser
```

Browser checks mount the real project selector, lyrics editor, and beat controls
with synthetic localStorage data. They do not launch Tauri, audio playback, MIDI,
or AI services. The Frontend workflow runs these checks and uploads browser
screenshots and reports. Native compilation is a separate check.

## Project Structure

```
OpenMusic/
├── src/                        # React frontend
│   ├── components/             # Reusable UI components
│   │   ├── layout/             # App shell, header, sidebar
│   │   ├── player/             # Playback controls
│   │   └── ui/                 # Button, input, card, etc.
│   ├── features/               # Feature modules
│   │   ├── ai/                 # AI chat, provider selector
│   │   ├── beats/              # Beat maker, pattern grid
│   │   ├── lyrics/             # Lyrics editor, AI suggestions
│   │   ├── player/             # Audio player, playlist
│   │   └── settings/           # Settings panel
│   ├── hooks/                  # React hooks (useAudio, useAI, useTheme)
│   ├── lib/                    # Tauri API bindings
│   └── stores/                 # Zustand state management
│
├── src-tauri/                  # Rust backend
│   └── src/
│       ├── ai/                 # AI providers & CLIProxyAPI
│       ├── audio/              # Audio playback engine
│       ├── midi/               # MIDI I/O handling
│       └── lib.rs              # Tauri entry point
│
└── docs/                       # Project documentation
```

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   React Frontend                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────┐ │
│  │ Lyrics  │ │  Beats  │ │ Player  │ │  AI Chat  │ │
│  └────┬────┘ └────┬────┘ └────┬────┘ └─────┬─────┘ │
│       └───────────┴───────────┴─────────────┘       │
│                    Tauri IPC                         │
└─────────────────────────────────────────────────────┘
                         │
┌─────────────────────────────────────────────────────┐
│                    Rust Backend                      │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────────┐ │
│  │ Audio Engine│ │  MIDI I/O   │ │ AI Providers  │ │
│  │ (rodio/cpal)│ │(midir/midly)│ │ (CLIProxyAPI) │ │
│  └─────────────┘ └─────────────┘ └───────────────┘ │
└─────────────────────────────────────────────────────┘
```

## Documentation

- [Project Overview & PRD](./docs/project-overview-pdr.md)
- [System Architecture](./docs/system-architecture.md)
- [Code Standards](./docs/code-standards.md)
- [Codebase Summary](./docs/codebase-summary.md)
- [Development Roadmap](./docs/project-roadmap.md)

## License

MIT
