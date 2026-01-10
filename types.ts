
export enum CodexCategory {
  Character = 'Character',
  Location = 'Location',
  Item = 'Item',
  Lore = 'Lore',
  Faction = 'Faction', // Organizations, Guilds, Families
  System = 'System',   // Magic systems, Tech rules, Laws
  Species = 'Species', // Races, Creatures, Flora
  Event = 'Event'      // History, Wars, Timeline
}

export interface CodexEntry {
  id: string;
  name: string;
  category: CodexCategory;
  description: string;
  tags: string[];
}

export interface Scene {
  id: string;
  title: string;
  content: string;
  summary?: string;
}

export interface Chapter {
  id: string;
  title: string;
  scenes: Scene[];
}

export interface Snapshot {
  id: string;
  timestamp: number;
  note: string;
  data: Project;
}

export type WritingLanguage = 'en' | 'zh' | 'ja' | 'ko' | 'es' | 'fr' | 'de' | 'it' | 'ru' | 'pt';

export interface Project {
  id: string;
  title: string;
  author: string;
  genre?: string;
  subgenre?: string;
  writingLanguage: WritingLanguage;
  chapters: Chapter[];
  codex: CodexEntry[];
  snapshots?: Snapshot[];
  lastModified?: number; // Added for sorting in dashboard
  contentHash?: string; // New: SHA-256 hash of the content
}

export interface ProjectMetadata {
  id: string;
  title: string;
  author: string;
  genre?: string;
  subgenre?: string;
  writingLanguage: WritingLanguage;
  lastModified: number;
  wordCount: number;
  chapterCount: number;
  contentHash?: string; // New: Exposed in list for quick checks
}

// --- Gallery Types ---

export interface SupabaseConfig {
    url: string;
    anonKey: string;
}

export type NovelVisibility = 'public' | 'private';

export interface GalleryNovelMetadata {
    id: string;
    title: string;
    author: string;
    genre: string;
    subgenre?: string;
    description: string; // Brief summary for the card
    wordCount: number;
    visibility: NovelVisibility;
    likes: number;
    downloads: number;
    publishedAt: number | string;
    tags: string[];
    contentHash?: string; 
    ownerId?: string; // New: To identify if it belongs to current user
}

export interface GalleryFilter {
    search: string;
    genre: string; // 'All' or specific genre
    sort: 'newest' | 'popular';
    scope: 'community' | 'mine'; // New: Filter by ownership
}

// ---------------------

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum ViewMode {
  Write = 'Write',
  Plan = 'Plan',
  Codex = 'Codex'
}

export type Language = 'en' | 'zh';

export type ThemeMode = 'light' | 'dark';
export type AccentColor = 'blue' | 'purple' | 'emerald' | 'rose' | 'amber';

export type SettingsTab = 'appearance' | 'writing' | 'ai' | 'image' | 'account';

export type AIProvider = 'gemini' | 'deepseek';
export type ImageProvider = 'gemini' | 'openai_compatible';

export type AIContinuationMode = 'general' | 'action' | 'dialogue' | 'description' | 'twist';
export type AIContinuationLength = 'short' | 'medium' | 'long' | 'very_long';
export type AIContextSize = 'small' | 'medium' | 'large' | 'huge';

export type ExplicitAction = 'continue' | 'new_scene' | 'new_chapter';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  continuationMode?: AIContinuationMode;
  continuationLength?: AIContinuationLength;
  contextSize?: AIContextSize;
  autoScanAfterContinue?: boolean;
  clearCodexBeforeScan?: boolean;
  generateOpeningWithAI?: boolean;
  deepseekApiKey?: string;
  
  // Structure/Pacing Config
  targetSceneWordCount?: number; // Target words per scene (default: 2000)
  targetSceneCountPerChapter?: number; // Target scenes per chapter (default: 5)
  
  // Image Generation Config
  imageProvider?: ImageProvider;
  imageModel?: string; // e.g. 'gemini-2.5-flash-image' or 'dall-e-3'
  imageBaseUrl?: string; // For openai_compatible
  imageApiKey?: string; // For openai_compatible
  imageSize?: string; // e.g. '1024x1024' or '2:3'
  
  // Mode-specific length constraints override: true = ignore length constraint for this mode
  modeLengthOverrides?: Record<AIContinuationMode, boolean>;
  
  // Explicit action override: if set, use this action instead of letting AI decide
  explicitAction?: ExplicitAction;
}

export interface KeyboardConfig {
  aiContinue: string; // e.g., "Alt+c"
}

// Response structure for Smart Continuation
export interface SmartContinuationResponse {
    action: 'continue' | 'new_scene' | 'new_chapter';
    title?: string; // Required if action is new_scene or new_chapter
    content: string;
    summary?: string; // Optional summary for the new scene
}

export interface StoryStructureContext {
    projectTitle: string;
    genre: string;
    subgenre?: string;
    chapterTitle: string;
    sceneTitle: string;
    sceneIndex: number; // 0-based index
    totalScenesInChapter: number;
    previousSceneSummary?: string;
    currentSceneWordCount?: number; // Added for pacing control
    currentScenePageCount?: number; // Added for pacing control
    currentPageIndex?: number; // Current page being edited (0-based)
}
