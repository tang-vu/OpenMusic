# OpenMusic Design Guidelines

## Design Philosophy
- **Simplicity First**: Minimal clicks to create music
- **Dark Theme**: Reduce eye strain during long sessions
- **Visual Feedback**: Every action shows immediate response

## Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--bg-primary` | `#0D0D0F` | Main background |
| `--bg-secondary` | `#16161A` | Panels, cards |
| `--bg-tertiary` | `#1E1E24` | Inputs, hover states |

### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--accent-primary` | `#7C3AED` | Primary actions, focus |
| `--accent-secondary` | `#06B6D4` | Secondary highlights |
| `--accent-success` | `#22C55E` | Play, success states |
| `--accent-warning` | `#F59E0B` | Warnings |
| `--accent-error` | `#EF4444` | Errors, stop/delete |

### Text Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--text-primary` | `#F4F4F5` | Headlines, primary text |
| `--text-secondary` | `#A1A1AA` | Labels, hints |
| `--text-muted` | `#52525B` | Disabled, placeholders |

## Typography

**Font Stack**: `Inter, -apple-system, sans-serif`

| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 24px | 700 | 1.2 |
| H2 | 18px | 600 | 1.3 |
| Body | 14px | 400 | 1.5 |
| Caption | 12px | 400 | 1.4 |
| Mono (code/lyrics) | 14px | 400 | 1.6 |

**Mono Font**: `JetBrains Mono, monospace` - for lyrics editor

## Spacing System
Base unit: 4px

| Token | Value | Usage |
|-------|-------|-------|
| `xs` | 4px | Icon gaps |
| `sm` | 8px | Compact spacing |
| `md` | 16px | Default padding |
| `lg` | 24px | Section gaps |
| `xl` | 32px | Panel margins |

## Component Styles

### Buttons
- **Primary**: Purple bg, white text, 8px radius
- **Secondary**: Transparent, border, 8px radius
- **Icon**: 40x40px, rounded, subtle hover
- **States**: Hover (+10% brightness), Active (scale 0.98)

### Inputs
- Background: `--bg-tertiary`
- Border: 1px `--text-muted`, focus: `--accent-primary`
- Radius: 8px
- Padding: 12px 16px

### Panels
- Background: `--bg-secondary`
- Border-radius: 12px
- Padding: 16px
- Shadow: `0 4px 24px rgba(0,0,0,0.4)`

### Beat Grid
- Cell size: 40x40px
- Active: `--accent-primary`
- Inactive: `--bg-tertiary`
- Gap: 2px

## Layout Structure
```
+------------------------------------------+
|  Logo    [Tabs: Lyrics|Beats|Mix]   [AI] |  <- Header (56px)
+------------------------------------------+
|                                          |
|            Main Content Area             |  <- Flexible
|                                          |
+------------------------------------------+
|  [<<] [Play] [>>]  ====waveform====  0:00|  <- Player (72px)
+------------------------------------------+
```

## Interaction Patterns
1. **Tabs**: Click to switch views, no page reload
2. **Drag**: Beat cells toggle on click, drag to paint
3. **Hover**: Show tooltips after 500ms delay
4. **Keyboard**: Space=Play, Cmd+S=Save, Esc=Close modal

## Accessibility
- Min contrast ratio: 4.5:1
- Focus visible rings on all interactive elements
- Keyboard navigable
- Reduced motion support

## Responsive Breakpoints
- Min width: 900px (desktop app)
- Sidebar collapse: < 1200px
- Compact mode: < 1000px
