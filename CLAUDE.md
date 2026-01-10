# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server (http://localhost:3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Testing**: No test framework is currently configured. When adding tests, use Vitest (matches Vite setup):
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Linting**: No linter is configured. When adding, use ESLint + TypeScript plugin:
```bash
npm install -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-react
```

## Project Overview

**NovelFlow** is a professional fiction writing environment (React 19 SPA) featuring a dedicated Codex (Wiki) system that integrates deeply with Google Gemini AI to maintain story consistency, character voice, and world-building rules during AI-assisted writing.

**Tech Stack**: TypeScript, Vite, React 19, Tailwind CSS, React Context API, Google Gemini AI, Supabase (optional cloud backend)

## Architecture

```
novelflow/
├── App.tsx              # Main application (project state, panels, shortcuts, auto-save)
├── index.tsx            # Entry point with React.StrictMode
├── types.ts             # All TypeScript types (enums, interfaces)
├── constants.tsx        # Icons, arrays, constants
├── i18n.tsx             # I18n provider (English/Chinese)
├── theme.tsx            # Theme provider (light/dark + accent colors)
├── components/          # React components
└── services/            # Business logic & API integrations
```

### Entry Point & Providers

[App.tsx](App.tsx) is wrapped in providers:
```tsx
<ThemeProvider>
  <I18nProvider>
    <App />
  </I18nProvider>
</ThemeProvider>
```

### State Management Patterns

1. **React Context** for global state:
   - `I18nProvider` - `useI18n()` returns `{ t, language, setLanguage }`
   - `ThemeProvider` - `useTheme()` returns `{ colorClasses, mode, setMode, accent, setAccent }`

2. **localStorage** for persistence:
   - Use function initializers with try/catch for reading localStorage
   - Projects stored as metadata list (`novelflow_project_list`) with full project data
   - Config keys: `novelflow_ai_config`, `novelflow_supabase_config`, `novelflow_shortcuts`, `novelflow_theme_mode`, `novelflow_theme_accent`

3. **Service Layer**: All API calls and business logic in `services/` directory with named exports (no default exports)

### Core Components

| Component | Purpose |
|-----------|---------|
| [Dashboard.tsx](components/Dashboard.tsx) | Project list with local/gallery tabs |
| [Editor.tsx](components/Editor.tsx) | Scene editing with AI continuation |
| [CodexPanel.tsx](components/CodexPanel.tsx) | Entity management (characters, locations, lore) |
| [ChatPanel.tsx](components/ChatPanel.tsx) | Codex assistant chat |
| [Storyboard.tsx](components/Storyboard.tsx) | Drag-and-drop scene planning |
| [GalleryView.tsx](components/GalleryView.tsx) | Cloud novel browsing |
| [SettingsModal.tsx](components/SettingsModal.tsx) | Configuration (AI, Supabase, shortcuts, theme) |

### Services

| Service | Purpose |
|---------|---------|
| [aiService.ts](services/aiService.ts) | AI generation (continuation, codex scanning, images) |
| [galleryService.ts](services/galleryService.ts) | Supabase API integration |
| [supabaseClient.ts](services/supabaseClient.ts) | Supabase client singleton |
| [identityService.ts](services/identityService.ts) | User identity management |
| [geminiService.ts](services/geminiService.ts) | Legacy Gemini wrapper |

## Code Style Guidelines

### Imports & File Organization
```tsx
// Single blank line at start
import React from 'react';
import { useState } from 'react';  // Third-party
import { Scene } from '../types';  // Local imports
import { useI18n } from '../i18n'; // Context hooks
```
- Use path alias `@/*` for root directory imports (configured in vite.config.ts)
- Component files: `components/` directory with PascalCase names
- Service files: `services/` directory with camelCase names

### Components
- Use functional components with `React.FC` type annotation
- Define props interfaces immediately before component
```tsx
interface EditorProps {
  activeScene: Scene;
  onSceneUpdate: (scene: Scene) => void;
}

const Editor: React.FC<EditorProps> = ({ activeScene, onSceneUpdate }) => {
  const { t } = useI18n();
  const { colorClasses } = useTheme();
  // ...
};
```

### Naming Conventions
- Components: PascalCase (`Editor`, `CodexPanel`)
- Functions/Variables: camelCase (`handleSave`, `activeSceneId`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_SHORTCUTS`, `AI_CONFIG_KEY`)
- Events: `handle` prefix (`handleSend`, `handleGenerate`)

### localStorage Pattern
```tsx
const [config, setConfig] = useState(() => {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? JSON.parse(saved) : defaultConfig;
  } catch {
    return defaultConfig;
  }
});
```

### Styling
- Use Tailwind utility classes directly
- Theme colors via `colorClasses` from `useTheme()`: `bg-${colorClasses.bg} text-${colorClasses.text}`
- Dark mode: check `mode` from theme context, apply `dark:` prefix

## Data Models

**Project Structure:**
- `Project` - Main novel project (chapters, codex, metadata)
- `Chapter` - Contains array of scenes
- `Scene` - Individual writing unit with content/summary
- `CodexEntry` - Wiki entries (Character, Location, Lore, etc.)
- `Snapshot` - Version history checkpoints

**Configuration:**
- `AIConfig` - AI provider settings (Gemini/DeepSeek, model, modes)
- `SupabaseConfig` - Cloud backend configuration
- `KeyboardConfig` - Keyboard shortcut customization

## AI Integration

**Providers:** Google Gemini AI (`@google/genai`) or DeepSeek (configurable)

**AI Features:**
1. Smart Continuation - Analyzes story structure to decide whether to continue current scene, create new scene, or create new chapter
2. Codex Scanning - Extracts characters, locations, lore from writing
3. Image Generation - Creates scene illustrations
4. Multi-language Support - English, Chinese, Japanese, Korean, Spanish, French, German, Italian, Russian, Portuguese

**AI Modes:**
- Continuation: general, action, dialogue, description, twist
- Length: short, medium, long, very_long
- Context: small, medium, large, huge

## Adding New Features

1. Add types to [types.ts](types.ts) if needed
2. Create service functions in `services/` for business logic/API calls
3. Build components in `components/` following existing patterns
4. Add translation keys to [i18n.tsx](i18n.tsx) (both `en` and `zh` objects)
5. Use `useI18n()` and `useTheme()` hooks in components
6. Persist config in localStorage with unique key
7. Test manually: `npm run dev`

## File Extensions

- Components: `.tsx` (contains JSX)
- Services/Types: `.ts` (no JSX needed)
- Configuration: `.ts` (vite.config.ts, tsconfig.json)

## Environment Setup

Required environment variable in [.env.local](.env.local):
- `GEMINI_API_KEY` - Google Gemini API key for AI features
