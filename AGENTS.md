# AGENTS.md

This file contains instructions for agentic coding assistants working on this repository.

## Build & Development Commands

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

## Code Style Guidelines

### Imports & File Organization
- Single blank line at file start before imports
- Import order: React imports, third-party libraries, local imports (../types, ../constants, ../services, context hooks)
- Use path alias `@/*` for root directory imports (configured in vite.config.ts)
- Component files: `components/` directory with PascalCase names
- Service files: `services/` directory with camelCase names

### Components
- Use functional components with `React.FC` type annotation
- Define interfaces for component props immediately before component
- Example:
  ```tsx
  interface EditorProps {
    activeScene: Scene;
    onSceneUpdate: (scene: Scene) => void;
  }
  
  const Editor: React.FC<EditorProps> = ({ activeScene, onSceneUpdate }) => {
    const { t } = useI18n();
    const { colorClasses } = useTheme();
    // ...
  }
  ```

### TypeScript & Types
- All types defined in `types.ts` (enums, interfaces)
- Use `enum` for fixed sets of values (CodexCategory, ViewMode, etc.)
- Use `interface` for objects with named properties
- Use `type` for unions and aliases (WritingLanguage, ThemeMode, etc.)
- Import types: `import { Scene, Chapter } from '../types';`

### State Management
- Use React hooks: `useState`, `useEffect`, `useCallback`, `useMemo`, `useRef`
- Initialize state with functions for complex initialization (e.g., reading localStorage)
- Example:
  ```tsx
  const [aiConfig, setAiConfig] = useState<AIConfig>(() => {
      const saved = localStorage.getItem(AI_CONFIG_KEY);
      return saved ? JSON.parse(saved) : { provider: 'gemini', model: '' };
  });
  ```

### Custom Hooks (Context)
- Use `useI18n()` for translations (returns `{ t, language, setLanguage }`)
- Use `useTheme()` for theming (returns `{ colorClasses, mode, setMode, accent, setAccent }`)
- Both provide context values and setter functions

### Naming Conventions
- Components: PascalCase (`Editor`, `CodexPanel`, `Dashboard`)
- Functions/Variables: camelCase (`handleSave`, `activeSceneId`, `formatCodexForAI`)
- Constants: UPPER_SNAKE_CASE at module level (`DEFAULT_SHORTCUTS`, `AI_CONFIG_KEY`)
- Props: descriptive names matching their purpose (`onSceneUpdate`, `onCreateChapter`)
- Events: `handle` prefix for event handlers (`handleSend`, `handleGenerate`)

### Error Handling
- Use try/catch in async functions within services
- Throw errors to be handled by calling components
- Example in services:
  ```tsx
  export const fetchGalleryNovels = async (...) => {
      if (!supabase) throw new Error("Supabase not configured");
      try {
          // API call
      } catch (e) {
          console.error("Failed to fetch:", e);
          throw e;
      }
  }
  ```

### Constants & Configuration
- Store all constants in `constants.tsx` (includes Icons object, arrays for dropdowns)
- Use `Icons.Book`, `Icons.Sparkles` for inline SVG icons
- Storage keys defined where used (e.g., `AI_CONFIG_KEY`, `LIST_STORAGE_KEY`)
- Configuration objects stored in localStorage with typed defaults

### Services
- Place all API/business logic in `services/` directory
- Export named functions, not default exports
- Services import types from `../types` and use config/params
- Supabase client uses singleton pattern: `getSupabaseClient(config)`
- Gemini/DeepSeek services handle AI generation, parsing JSON responses

### Styling (Tailwind CSS)
- Use Tailwind utility classes directly in JSX
- Theme colors via `colorClasses` from `useTheme()`: `bg-${colorClasses.bg} text-${colorClasses.text}`
- Dark mode: check `mode` from theme context, apply `dark:` prefix
- Common patterns: `className="p-4 rounded-lg border hover:..."`

### Event Handlers
- Prevent default for form/button clicks when needed: `e.preventDefault()`, `e.stopPropagation()`
- Async handlers should set loading state: `setLoading(true); try { ... } finally { setLoading(false); }`
- Update state immutably: `setMessages(prev => [...prev, newMessage])`
- Use `useCallback` for handlers passed to child components

### localStorage Usage
- Use try/catch when reading/parsing localStorage (may throw if data corrupted)
- Parse with JSON.parse/stringify for objects
- Example:
  ```tsx
  try {
      const saved = localStorage.getItem(AI_CONFIG_KEY);
      return saved ? JSON.parse(saved) : defaultConfig;
  } catch {
      return defaultConfig;
  }
  ```

### Helper Functions
- Define helper functions at module level before components
- Use descriptive names: `formatCodexForAI`, `countWords`, `generateUUID`
- Pure functions preferred (no side effects)
- Date/UUID helpers use `crypto.randomUUID()` or fallback

## Architecture Notes

- **Main App**: `App.tsx` manages project state (activeProject, projectList), UI panels, keyboard shortcuts
- **Dashboard**: Project list view with local/gallery tabs, publishing workflow
- **Editor**: Scene editing with AI continuation, image generation, word counting
- **Codex Panel**: Entity management (characters, locations, lore) with AI generation
- **Chat Panel**: Codex assistant chat
- **Storyboard**: Drag-and-drop scene planning
- **i18n**: English and Chinese translations, use `t('key')` function
- **Theme**: Light/dark mode + accent colors, persisted to localStorage
- **Gallery**: Cloud novel sharing via Supabase (optional, requires config)

## Adding New Features

1. Add types to `types.ts` if needed
2. Create service functions in `services/` for business logic/API calls
3. Build components in `components/` following existing patterns
4. Add translation keys to `i18n.tsx` (both `en` and `zh` objects)
5. Use `useI18n()` and `useTheme()` hooks in components
6. Persist config in localStorage with unique key
7. Test manually: `npm run dev`

## File Extensions

- Components: `.tsx` (contains JSX)
- Services/Types: `.ts` (no JSX needed)
- Configuration: `.ts` (vite.config.ts, tsconfig.json)
