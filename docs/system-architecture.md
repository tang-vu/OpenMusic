# OpenMusic System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     OpenMusic Desktop App                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │                  React Frontend                      │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │   │
│  │  │  Lyrics  │ │  Beat    │ │  Audio   │ │   AI   │ │   │
│  │  │  Editor  │ │  Maker   │ │  Player  │ │  Chat  │ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │   │
│  │                Web Audio API (Visualization)         │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │ IPC                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                   Rust Backend                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │   │
│  │  │  Audio   │ │   MIDI   │ │    AI    │ │ Project│ │   │
│  │  │  Engine  │ │  Engine  │ │ Provider │ │ Manager│ │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘ │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌─────────┐          ┌─────────┐          ┌─────────┐
   │CLIProxy │          │ Claude  │          │ Local   │
   │  API    │          │ Gemini  │          │  Files  │
   └─────────┘          │ Codex   │          └─────────┘
                        └─────────┘
```

## Mermaid Diagrams

### Component Architecture

```mermaid
graph TB
    subgraph Frontend["React Frontend"]
        UI[UI Components]
        Features[Feature Modules]
        Stores[Zustand Stores]
        Hooks[React Hooks]
    end

    subgraph IPC["Tauri IPC Layer"]
        Commands[Tauri Commands]
    end

    subgraph Backend["Rust Backend"]
        Audio[Audio Engine]
        MIDI[MIDI Handler]
        AI[AI Providers]
    end

    UI --> Features
    Features --> Hooks
    Hooks --> Stores
    Features --> Commands
    Commands --> Audio
    Commands --> MIDI
    Commands --> AI
```

### AI Provider Flow

```mermaid
sequenceDiagram
    participant UI as Chat UI
    participant Tauri as Tauri IPC
    participant Mgr as AI Manager
    participant Proxy as CLIProxyAPI

    UI->>Tauri: invoke('ai_complete')
    Tauri->>Mgr: complete(message)
    Mgr->>Proxy: POST /complete
    Proxy-->>Mgr: AI response
    Mgr-->>Tauri: Ok(response)
    Tauri-->>UI: display message
```

---

## Core Modules

### 1. Audio Engine (Rust)
- **Playback:** rodio for high-level, cpal for low-latency
- **Recording:** cpal input streams
- **Processing:** Separate audio thread, lock-free buffers
- **Format Support:** symphonia (decode), hound (WAV encode)

### 2. MIDI Engine (Rust)
- **I/O:** midir for external controllers
- **File Parsing:** midly for .mid files
- **Sequencer:** Custom timing with Instant

### 3. AI Provider (Rust)
- **Abstraction Layer:** Unified interface for all providers
- **Offline:** Ollama HTTP API (localhost:11434)
- **Cloud:** OpenAI, Claude, Gemini via HTTP
- **Features:** Lyrics, chord suggestions, composition help

### 4. AI Skills System (Frontend)

```mermaid
graph LR
    subgraph Skills["AI Skills Layer"]
        Router[Skill Router]
        Registry[Skill Registry]
        Context[Context Builders]
        Parser[Response Parsers]
    end

    subgraph UI["UI Components"]
        Palette[Command Palette]
        LyricsAI[Lyrics AI Panel]
        BeatsAI[Beats AI Panel]
    end

    UI --> Router
    Router --> Registry
    Router --> Context
    Router --> Parser
    Parser --> UI
```

**Components:**
- **Skill Registry:** 4 skills (lyrics, beats, chords, general) with triggers/prompts
- **Skill Router:** Keyword-based intent detection, routes to appropriate skill
- **Context Builders:** Injects app state (current lyrics, beat pattern, BPM) into prompts
- **Response Parsers:** JSON/lyrics/chord extraction with ReDoS protection
- **Beat Pattern Parser:** Converts JSON responses to instrument grid mapping

**Skills:**

| Skill | Triggers | Purpose |
|-------|----------|---------|
| `lyrics` | write, lyrics, verse, chorus, rhyme | Lyric generation/editing |
| `beats` | beat, drum, pattern, rhythm, groove | Beat pattern generation |
| `chords` | chord, harmony, progression, key | Chord suggestions |
| `general` | (fallback) | General music assistance |

### 4. Project Manager (Rust)
- **Storage:** SQLite for metadata
- **Files:** Audio, MIDI, project files on disk
- **Export:** WAV, MP3 (via ffmpeg), MIDI

---

## Frontend Components

### Lyrics Editor
- Rich text editor with verse/chorus structure
- AI suggestions sidebar
- Syllable counter, rhyme helper

### Beat Maker
- Grid-based pattern editor
- Sample library browser
- BPM/time signature controls

### Audio Player
- Waveform visualization (Web Audio AnalyserNode)
- Transport controls (play, pause, seek)
- Volume, pan controls

### AI Chat
- Conversation interface for suggestions
- Provider selector
- History persistence

### AI Command Palette
- Global shortcut (Cmd+K) activation
- Context-aware suggestions based on active feature
- Quick actions for lyrics (5 actions) and beats (6 genre presets)
- Skill-aware routing for specialized responses

### Lyrics AI Panel
- 5 quick actions: Continue, Rhyme, Rewrite, Expand, Summarize
- Custom prompt input
- Context injection from current lyrics

### Beats AI Panel
- 6 genre presets: Trap, Boom Bap, House, Lo-Fi, Drill, Funk
- Pattern generation with instrument mapping
- Direct grid integration

---

## Data Flow

### Audio Playback
```
User Click → React → IPC invoke('play_audio') → Rust → rodio → Speakers
```

### AI Request
```
User Input → React → IPC invoke('ai_generate') → Rust → Provider → Response → React
```

### Beat Creation
```
Grid Edit → React State → IPC invoke('update_pattern') → Rust → MIDI → Audio Preview
```

---

## File Structure

```
src/                    # React frontend
├── components/         # UI components
│   └── ai/             # AI command palette components
├── features/           # Feature modules (lyrics, beats, ai)
├── hooks/              # Custom React hooks
├── stores/             # Zustand stores
└── lib/
    ├── ai-skills/      # AI skills system
    └── ...             # Other utilities

src-tauri/              # Rust backend
├── src/
│   ├── audio/          # Audio engine
│   ├── midi/           # MIDI engine
│   ├── ai/             # AI provider abstraction
│   ├── project/        # Project management
│   └── commands/       # Tauri commands
└── Cargo.toml
```

---

## Security

- API keys stored encrypted (tauri-plugin-store)
- No sensitive data in IPC payloads
- Sandboxed file access via Tauri APIs
- Local-first: Offline mode by default
