
import React from 'react';
import { AccentColor, WritingLanguage, AIContinuationMode, AIContinuationLength, AIContextSize, CodexCategory } from './types';

// Using simple SVG icons to avoid external dependencies failure in some environments
// In a real project, lucide-react is recommended.

export const Icons = {
  Book: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
  ),
  Pen: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
  ),
  ChevronRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
  ),
  ChevronLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
  ),
  Send: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
  ),
  Save: () => (
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
  ),
  Help: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
  ),
  New: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
  ),
  Moon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
  ),
  Sun: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
  ),
  Grid: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
  ),
  List: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
  ),
  History: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>
  ),
  Server: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
  ),
  Key: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg>
  ),
  Globe: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>
  ),
  ArrowLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
  ),
  Scan: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3"/><path d="M4 12h16"/></svg>
  ),
  PanelLeft: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
  ),
  PanelRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line></svg>
  ),
  Image: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
  ),
  Palette: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="13.5" cy="6.5" r="0.5" fill="currentColor"/><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor"/><circle cx="8.5" cy="7.5" r="0.5" fill="currentColor"/><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>
  )
};

export const THEME_COLORS: Record<AccentColor, {
  primary: string;
  hover: string;
  text: string;
  border: string;
  ring: string;
  bgSoft: string;
  gradient: string;
}> = {
  blue: {
    primary: 'bg-blue-600',
    hover: 'hover:bg-blue-700',
    text: 'text-blue-600 dark:text-blue-400',
    border: 'border-blue-600 dark:border-blue-500',
    ring: 'focus:ring-blue-500',
    bgSoft: 'bg-blue-50 dark:bg-blue-900/20',
    gradient: 'from-blue-600 to-indigo-600'
  },
  purple: {
    primary: 'bg-purple-600',
    hover: 'hover:bg-purple-700',
    text: 'text-purple-600 dark:text-purple-400',
    border: 'border-purple-600 dark:border-purple-500',
    ring: 'focus:ring-purple-500',
    bgSoft: 'bg-purple-50 dark:bg-purple-900/20',
    gradient: 'from-purple-600 to-pink-600'
  },
  emerald: {
    primary: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700',
    text: 'text-emerald-600 dark:text-emerald-400',
    border: 'border-emerald-600 dark:border-emerald-500',
    ring: 'focus:ring-emerald-500',
    bgSoft: 'bg-emerald-50 dark:bg-emerald-900/20',
    gradient: 'from-emerald-600 to-teal-600'
  },
  rose: {
    primary: 'bg-rose-600',
    hover: 'hover:bg-rose-700',
    text: 'text-rose-600 dark:text-rose-400',
    border: 'border-rose-600 dark:border-rose-500',
    ring: 'focus:ring-rose-500',
    bgSoft: 'bg-rose-50 dark:bg-rose-900/20',
    gradient: 'from-rose-600 to-red-600'
  },
  amber: {
    primary: 'bg-amber-600',
    hover: 'hover:bg-amber-700',
    text: 'text-amber-600 dark:text-amber-400',
    border: 'border-amber-600 dark:border-amber-500',
    ring: 'focus:ring-amber-500',
    bgSoft: 'bg-amber-50 dark:bg-amber-900/20',
    gradient: 'from-amber-600 to-orange-600'
  }
};

export const CODEX_HIGHLIGHT_COLORS: Record<CodexCategory, { light: string; dark: string; bg: string }> = {
  [CodexCategory.Character]: { 
    light: 'text-blue-600', 
    dark: 'text-blue-400',
    bg: 'bg-blue-500' 
  },
  [CodexCategory.Location]: { 
    light: 'text-emerald-600', 
    dark: 'text-emerald-400',
    bg: 'bg-emerald-500' 
  },
  [CodexCategory.Item]: { 
    light: 'text-amber-600', 
    dark: 'text-amber-400',
    bg: 'bg-amber-500' 
  },
  [CodexCategory.Lore]: { 
    light: 'text-purple-600', 
    dark: 'text-purple-400',
    bg: 'bg-purple-500' 
  },
  [CodexCategory.Faction]: { 
    light: 'text-rose-600', 
    dark: 'text-rose-400',
    bg: 'bg-rose-500' 
  },
  [CodexCategory.System]: { 
    light: 'text-cyan-600', 
    dark: 'text-cyan-400',
    bg: 'bg-cyan-500' 
  },
  [CodexCategory.Species]: { 
    light: 'text-fuchsia-600', 
    dark: 'text-fuchsia-400',
    bg: 'bg-fuchsia-500' 
  },
  [CodexCategory.Event]: { 
    light: 'text-orange-600', 
    dark: 'text-orange-400',
    bg: 'bg-orange-500' 
  }
};

export const AI_CONTINUATION_MODES: { id: AIContinuationMode; label: { en: string; zh: string }; prompt: { en: string; zh: string }; ignoreLength?: boolean }[] = [
  {
    id: 'general',
    label: { en: 'General', zh: '通用续写' },
    prompt: { en: 'Continue the story naturally based on the previous context.', zh: '根据前文自然地续写故事。' }
  },
  {
    id: 'action',
    label: { en: 'Action', zh: '动作战斗' },
    prompt: { en: 'Focus on high-paced action, combat, and physical movements.', zh: '重点描写快节奏的动作、战斗和肢体细节。' }
  },
  {
    id: 'dialogue',
    label: { en: 'Dialogue', zh: '角色对话' },
    prompt: { en: 'Focus on character interaction and meaningful dialogue.', zh: '重点描写角色之间的互动和富有深意的对话。' }
  },
  {
    id: 'description',
    label: { en: 'Description', zh: '环境描写' },
    prompt: { en: 'Focus on describing the setting, atmosphere, and sensory details.', zh: '重点描写场景、氛围和感官细节。' }
  },
  {
    id: 'twist',
    label: { en: 'Plot Twist', zh: '情节反转' },
    prompt: { en: 'Introduce a surprising plot twist or unexpected event.', zh: '引入一个令人惊讶的情节反转或意外事件。' }
  }
];

export const AI_LENGTHS: { id: AIContinuationLength; label: { en: string; zh: string }; tokens: number; instruction: { en: string; zh: string } }[] = [
  { 
    id: 'short', 
    label: { en: 'Short (~200 words)', zh: '短 (~200字)' }, 
    tokens: 1000, 
    instruction: { en: 'Write a short continuation, approximately 200 words.', zh: '请写一段约200字的简短续写。' } 
  },
  { 
    id: 'medium', 
    label: { en: 'Medium (~500 words)', zh: '中 (~500字)' }, 
    tokens: 2000, 
    instruction: { en: 'Write a medium length continuation, approximately 500 words.', zh: '请写一段约500字的中等篇幅续写。' } 
  },
  { 
    id: 'long', 
    label: { en: 'Long (~1000 words)', zh: '长 (~1000字)' }, 
    tokens: 4000, 
    instruction: { en: 'Write a long continuation, approximately 1000 words.', zh: '请写一段约1000字的长篇续写。' } 
  },
  { 
    id: 'very_long', 
    label: { en: 'Very Long (~2000 words)', zh: '超长 (~2000字)' }, 
    tokens: 8000, 
    instruction: { en: 'Write a very extensive continuation, approximately 2000 words.', zh: '请写一段约2000字的超长篇幅续写。' } 
  }
];

export const AI_CONTEXT_SIZES: { id: AIContextSize; label: { en: string; zh: string }; chars: number }[] = [
  {
    id: 'small',
    label: { en: 'Small (~1000 chars)', zh: '小 (~1000字)' },
    chars: 1000
  },
  {
    id: 'medium',
    label: { en: 'Medium (~3000 chars)', zh: '中 (~3000字)' },
    chars: 3000
  },
  {
    id: 'large',
    label: { en: 'Large (~6000 chars)', zh: '大 (~6000字)' },
    chars: 6000
  },
  {
    id: 'huge',
    label: { en: 'Huge (~12000 chars)', zh: '超大 (~12000字)' },
    chars: 12000
  }
];

export const INITIAL_PROJECT_DATA: any = {
  id: 'proj_1',
  title: 'The Starless Crown',
  author: 'Writer Extraordinaire',
  genre: 'Fantasy',
  subgenre: 'High Fantasy',
  writingLanguage: 'en',
  chapters: [
    {
      id: 'chap_1',
      title: 'Chapter 1: The Awakening',
      scenes: [
        {
          id: 'scene_1',
          title: 'Waking up',
          content: 'The alarm clock buzzed, a harsh mechanical wasp trapped in the amber of the morning silence. Elara groaned, rolling over to slam her hand onto the snooze button. It missed, sending a glass of water cascading onto the hardwood floor.\n\n"Perfect," she muttered, her voice raspy with sleep. "Just perfect."\n\nOutside, the city of Neo-Veridia was already awake. Neon signs flickered in the dawn drizzle, casting long, synthetic shadows across her apartment walls. She sat up, rubbing her temples. Today was the day. The day she would finally meet the Contact.',
          summary: 'Elara wakes up and prepares for the meeting.'
        }
      ]
    }
  ],
  codex: [
    {
      id: 'codex_1',
      name: 'Elara Vance',
      category: 'Character',
      description: 'A 28-year-old hacker with a cynical outlook but a hidden heart of gold. She has a cybernetic left eye that glows blue when she is processing data streams. Wears a battered leather jacket.',
      tags: ['Protagonist', 'Hacker', 'Human']
    },
    {
      id: 'codex_2',
      name: 'Neo-Veridia',
      category: 'Location',
      description: 'A sprawling metropolis built on the ruins of the Old World. Governed by the Syndicate. Known for perpetual rain and neon aesthetics.',
      tags: ['City', 'Setting', 'Cyberpunk']
    },
    {
      id: 'codex_3',
      name: 'The Syndicate',
      category: 'Lore',
      description: 'The ruling corporate body of Neo-Veridia. Ruthless, efficient, and omnipresent.',
      tags: ['Antagonist', 'Organization']
    }
  ],
  snapshots: []
};

// Genre Templates Structure
export interface GenreTemplate {
  id: string;
  name: { zh: string, en: string };
  subcategories: { zh: string, en: string }[];
  openingOptions: { zh: string, en: string }[];
  defaultContent?: { zh: string, en: string };
}

export const GENRE_TEMPLATES: GenreTemplate[] = [
  {
    id: 'fantasy',
    name: { zh: '玄幻奇幻', en: 'Fantasy' },
    subcategories: [
      { zh: '异世争霸', en: 'Otherworld Hegemony' },
      { zh: '魔法校园', en: 'Magic School' },
      { zh: '领主贵族', en: 'Lord/Noble' },
      { zh: '西方奇幻', en: 'Western Fantasy' },
      { zh: '东方玄幻', en: 'Eastern Fantasy' },
      { zh: '异界大陆', en: 'Otherworld Continent' },
      { zh: '异术超能', en: 'Supernatural Abilities' }
    ],
    openingOptions: [
      {
        zh: "天空被撕裂出一道深紫色的裂痕，古老的魔力如同潮水般涌入这个世界。林恩站在破碎的城墙上，望着远方逼近的黑影，握紧了手中仅存的断剑。预言中的末日，终于降临了。",
        en: "The sky tore open, revealing a deep purple rift as ancient magic flooded into the world. Lynn stood atop the shattered battlements, watching the encroaching shadows on the horizon, tightening his grip on the broken sword. The prophecy was finally coming to pass."
      },
      {
        zh: "信封上盖着赤红的火漆印，那是皇家魔法学院的标志。艾瑞克颤抖着手撕开封口，一张羊皮纸滑落出来。他屏住呼吸，因为这一刻将决定他究竟是成为一名受人敬仰的法师，还是继续在贫民窟里做一个默默无闻的抄写员。",
        en: "The envelope was stamped with a crimson wax seal—the emblem of the Royal Magic Academy. Eric's hands trembled as he tore it open, letting a piece of parchment slide out. He held his breath; this moment would determine whether he would become a revered mage or remain a nameless scribe in the slums."
      },
      {
        zh: "酒馆里的空气浑浊不堪，充满了劣质麦酒和烤肉的味道。角落里，一个戴着兜帽的陌生人将一枚金币弹向空中，金币在烛光下划出一道闪亮的弧线，稳稳落在了桌面上。“我听说，你们这里有人在找那座失落的神庙？”",
        en: "The air in the tavern was thick with the smell of cheap ale and roasted meat. In the corner, a hooded stranger flipped a gold coin into the air. It caught the candlelight in a glittering arc before landing steadily on the table. \"I heard someone here is looking for the Lost Temple?\""
      }
    ]
  },
  {
    id: 'xianxia',
    name: { zh: '仙侠武侠', en: 'Xianxia/Wuxia' },
    subcategories: [
      { zh: '洪荒封神', en: 'Prehistoric/Mythology' },
      { zh: '现代异侠', en: 'Modern Wuxia' },
      { zh: '历史武侠', en: 'Historical Wuxia' },
      { zh: '奇幻修真', en: 'Fantasy Cultivation' },
      { zh: '国术古武', en: 'Traditional Martial Arts' },
      { zh: '传统武侠', en: 'Classic Wuxia' },
      { zh: '现代修真', en: 'Modern Cultivation' },
      { zh: '古典仙侠', en: 'Classic Xianxia' }
    ],
    openingOptions: [
      {
        zh: "青云峰顶，云雾缭绕。叶凡盘膝坐在一块巨石之上，呼吸吐纳间，周围的灵气仿佛受到了牵引，缓缓汇聚而来。但他眉宇间却紧锁着一丝化不开的忧愁，因为这已经是他困在炼气期的第三年了。",
        en: "Mist swirled around the summit of Qingyun Peak. Ye Fan sat cross-legged on a massive boulder, his rhythmic breathing drawing the surrounding spiritual energy towards him. Yet, a frown remained locked between his brows—he had been stuck in the Qi Refining stage for three long years."
      },
      {
        zh: "痛。无尽的痛楚像潮水般淹没了意识。当他再次睁开眼时，看到的不再是天劫降临时的雷霆万钧，而是熟悉的木制横梁和破旧的棉被。他猛地坐起身，看着自己稚嫩的双手。他竟然回到了五百年前，家破人亡的那一天。",
        en: "Pain. Infinite pain drowned his consciousness like a tide. When he opened his eyes again, he saw not the thunderous wrath of the Heavenly Tribulation, but familiar wooden beams and a tattered quilt. He bolted upright, staring at his own youthful hands. He had returned to five hundred years ago—the very day his family was destroyed."
      },
      {
        zh: "老村长叹了口气，将那块布满裂纹的玉佩塞进少年手中。“孩子，你是我们在山沟里捡到的。这块玉佩是你唯一的信物。去吧，去外面的世界看看，也许能找到你的身世。”",
        en: "The old village chief sighed and pressed the cracked jade pendant into the young boy's hand. \"Child, we found you in the ravine. This pendant is the only token of your past. Go, see the outside world. Perhaps you will find your true origins.\""
      }
    ]
  },
  {
    id: 'urban',
    name: { zh: '都市小说', en: 'Urban' },
    subcategories: [
      { zh: '都市生活', en: 'Urban Life' },
      { zh: '都市异能', en: 'Urban Superpowers' },
      { zh: '都市重生', en: 'Urban Rebirth' },
      { zh: '职场励志', en: 'Workplace/Career' },
      { zh: '现实题材', en: 'Realistic Fiction' },
      { zh: '娱乐明星', en: 'Entertainment/Star' },
      { zh: '都市激战', en: 'Urban Action' },
      { zh: '商业大亨', en: 'Business Tycoon' },
      { zh: '校园风云', en: 'School Life' },
      { zh: '乡村乡土', en: 'Rural Life' }
    ],
    openingOptions: [
      {
        zh: "凌晨三点的江海市依旧灯火通明。苏铭站在落地窗前，俯瞰着脚下川流不息的车流，手中的红酒杯轻轻摇晃。那个改变他命运的电话，就是在这个时候打来的。",
        en: "At 3 AM, the city of Jianghai was still ablaze with lights. Su Ming stood before the floor-to-ceiling window, looking down at the endless stream of traffic, gently swirling the wine glass in his hand. The phone call that changed his destiny had come at exactly this time."
      },
      {
        zh: "夏日的风吹过操场，带来一阵燥热。高三（二）班的教室里，风扇在头顶吱呀作响。林远看着黑板上倒计时的数字，手中的笔停在了半空。那个转校生推门而入的瞬间，阳光正好洒在她的侧脸上。",
        en: "The summer wind blew across the playground, bringing a wave of heat. In the classroom of Class 2, Grade 12, the fan creaked overhead. Lin Yuan stared at the countdown numbers on the blackboard, his pen freezing in mid-air. The moment the transfer student pushed open the door, the sunlight fell perfectly on her profile."
      },
      {
        zh: "“叮！检测到宿主遭遇重大挫折，神级选择系统正在激活……” 刚被公司无理辞退的张浩愣在原地，耳边响起的冰冷机械音，彻底颠覆了他对这个世界的认知。",
        en: "\"Ding! Host major setback detected. God-level Selection System activating...\" Zhang Hao, who had just been unfairly fired from his company, froze in place. The cold mechanical voice ringing in his ears completely shattered his understanding of the world."
      }
    ]
  },
  {
    id: 'history',
    name: { zh: '历史军事', en: 'History/Military' },
    subcategories: [
      { zh: '历史穿越', en: 'Historical Transmigration' },
      { zh: '架空历史', en: 'Alternative History' },
      { zh: '战争幻想', en: 'War Fantasy' },
      { zh: '军旅生涯', en: 'Military Life' },
      { zh: '历史传奇', en: 'Historical Legend' },
      { zh: '战史风云', en: 'War History' },
      { zh: '谍战特工', en: 'Espionage' }
    ],
    openingOptions: [
      {
        zh: "凛冽的北风卷着雪花，拍打在破旧的辕门上。李将军望着帐外那群衣衫褴褛却目光坚毅的士兵，心中涌起一股难以言喻的悲凉。粮草已断三天，援军迟迟未至，而敌军的战鼓声已在十里外响起。",
        en: "The biting north wind whipped snowflakes against the tattered camp gates. General Li looked at the soldiers outside his tent—ragged clothes, yet eyes filled with steely determination—and felt an indescribable sorrow. Rations had been gone for three days, reinforcements were nowhere to be seen, and the enemy's war drums were already beating ten miles away."
      },
      {
        zh: "深宫大内，烛火摇曳。老皇帝的咳嗽声在空旷的寝殿里显得格外刺耳。太子跪在床榻前，低垂着头，看似恭顺，眼底却藏着一丝不易察觉的寒光。今夜，注定是权力的交接之夜。",
        en: "Deep within the palace, candlelight flickered. The old Emperor's coughs echoed sharply in the vast chamber. The Crown Prince knelt before the bed, head bowed in apparent submission, but a hidden glint of cold calculation lay in his eyes. Tonight was destined to be the night power changed hands."
      },
      {
        zh: "醒来时，头痛欲裂。赵子龙发现自己不再身处现代化的图书馆，而是躺在一张硬邦邦的木板床上，身上盖着粗布麻衣。窗外传来叫卖声，那是他不曾听过的古老方言：“热乎的炊饼咯——”",
        en: "He woke up with a splitting headache. Zhao Zilong found he was no longer in the modern library, but lying on a hard wooden bed, covered in rough linen. From the window came the sound of hawking in an ancient dialect he had never heard: \"Hot steamed cakes for sale—\""
      }
    ]
  },
  {
    id: 'game',
    name: { zh: '游戏竞技', en: 'Game/Sports' },
    subcategories: [
      { zh: '虚拟网游', en: 'Virtual Reality MMO' },
      { zh: '电子竞技', en: 'Esports' },
      { zh: '游戏生涯', en: 'Gaming Career' },
      { zh: '篮球风云', en: 'Basketball' },
      { zh: '天下足球', en: 'Football/Soccer' },
      { zh: '棋牌桌游', en: 'Board Games' },
      { zh: '游戏异界', en: 'Game World Transmigration' },
      { zh: '体育竞技', en: 'Sports Competition' }
    ],
    openingOptions: [
      {
        zh: "“系统连接中……身份验证通过。欢迎回到《神域》。” 随着冰冷的电子音落下，原本漆黑的视野瞬间被绚烂的光芒填满。林萧再次睁开眼，已经站在了新手村的广场上，而他手中的剑，正是传说中的神器。",
        en: "\"System connecting... Authentication successful. Welcome back to 'Divine Realm'.\" As the cold electronic voice faded, the darkness was instantly replaced by blinding light. Lin Xiao opened his eyes to find himself standing once again in the Novice Village square, the legendary artifact sword already in his hand."
      },
      {
        zh: "观众席爆发出的欢呼声几乎要掀翻体育馆的顶棚。这是全球总决赛的决胜局。屏幕上的水晶枢纽只剩下一丝血皮。键盘的敲击声如同密集的雨点，他屏住呼吸，按下了最后的大招。",
        en: "The cheers from the audience nearly lifted the roof off the stadium. This was the deciding match of the World Finals. The Nexus on the screen had only a sliver of health left. The sound of keyboard tapping was like intense rain. He held his breath and pressed the key for his ultimate ability."
      },
      {
        zh: "全世界的天空在那一刻同时变成了深蓝色。一行巨大的金色文字悬浮在云端：“地球Online版本更新完成。游戏化正式开始。祝各位玩家好运。”",
        en: "At that moment, the sky across the entire world turned a deep blue. A line of massive golden text floated amongst the clouds: \"Earth Online update complete. Gamification officially initiated. Good luck, players.\""
      }
    ]
  },
  {
    id: 'scifi',
    name: { zh: '科幻末世', en: 'Sci-Fi/Apocalypse' },
    subcategories: [
      { zh: '末世危机', en: 'Apocalypse Crisis' },
      { zh: '进化变异', en: 'Evolution/Mutation' },
      { zh: '时空穿梭', en: 'Time Travel' },
      { zh: '未来幻想', en: 'Future Fantasy' },
      { zh: '古武机甲', en: 'Mecha/Martial Arts' },
      { zh: '星际战争', en: 'Interstellar War' }
    ],
    openingOptions: [
      {
        zh: "警报声在狭窄的舱室里回荡，红色的应急灯光忽明忽暗。09号醒来时，发现休眠舱的玻璃盖已经布满了裂纹。外面的星空正在旋转——或者说，是飞船正在失控翻滚，坠向那颗红色的未知星球。",
        en: "Alarms echoed through the narrow cabin, the red emergency lights flickering wildly. When Number 09 woke, he found the glass of his cryo-pod covered in cracks. The stars outside were spinning—or rather, the ship was tumbling out of control, plummeting towards the unknown red planet."
      },
      {
        zh: "霓虹雨不停地落在第07区的街道上，混合着机油和血液的味道。赛博义肢的机械臂在手里发出轻微的嗡鸣。赏金猎人K压低了帽檐，看着全息悬赏令上的那个背影，嘴角露出了一丝冷笑。",
        en: "Neon rain fell ceaselessly on the streets of Sector 07, mixing the smells of motor oil and blood. The mechanical arm of his cybernetic prosthesis hummed softly. Bounty Hunter K pulled his hat low, looked at the silhouette on the holographic warrant, and smirked."
      },
      {
        zh: "盖革计数器在疯狂地鸣叫。废墟之上，尘埃遮蔽了太阳。幸存者小队小心翼翼地穿过这座死寂的城市，寻找着传说中的避难所。突然，前面的废墟堆里传来了一声异样的低吼。",
        en: "The Geiger counter was clicking madly. Above the ruins, dust obscured the sun. The survivor squad moved carefully through the silent city, searching for the legendary shelter. Suddenly, a strange growl echoed from the rubble ahead."
      }
    ]
  },
  {
    id: 'suspense',
    name: { zh: '悬疑推理', en: 'Suspense/Mystery' },
    subcategories: [
      { zh: '民间奇谈', en: 'Folklore/Urban Legends' },
      { zh: '恐怖悬疑', en: 'Horror/Thriller' },
      { zh: '侦探推理', en: 'Detective/Mystery' },
      { zh: '探险揭秘', en: 'Adventure/Exploration' }
    ],
    openingOptions: [
      {
        zh: "雨下得很大，冲刷着巷子里那具早已冰冷的尸体。陈警官压低了帽檐，跨过黄色的警戒线。他闻到了一股熟悉的味道——那是苦杏仁的香气，和五年前那个连环杀手留下的线索一模一样。",
        en: "The rain poured down, washing over the cold body in the alleyway. Officer Chen pulled his hat low and stepped over the yellow police tape. He caught a familiar scent—the smell of bitter almonds, exactly like the clue left by the serial killer five years ago."
      },
      {
        zh: "那座老宅在村子的尽头已经荒废了三十年。自从李家七口人一夜之间离奇失踪后，就再也没人敢靠近。今晚，为了那笔高额的直播打赏，我推开了那扇吱呀作响的大门。",
        en: "The old house at the end of the village had been abandoned for thirty years. Ever since the Li family of seven mysteriously vanished overnight, no one dared approach it. Tonight, for the sake of a huge livestream donation, I pushed open the creaking main door."
      },
      {
        zh: "他在一个纯白色的房间里醒来，四周没有门窗，甚至没有接缝。记忆像被打碎的玻璃，怎么也拼凑不起来。唯一的线索，是他手心里紧紧攥着的一张纸条：“不要相信他们。”",
        en: "He woke up in a pure white room with no doors or windows, not even a seam. His memory was like shattered glass, impossible to piece together. The only clue was a note tightly gripped in his palm: \"Don't trust them.\""
      }
    ]
  },
  {
    id: 'lightnovel',
    name: { zh: '轻小说', en: 'Light Novel' },
    subcategories: [
      { zh: '爆笑幽默', en: 'Comedy' },
      { zh: '男生同人', en: 'Fanfiction (Male MC)' },
      { zh: '宅系小说', en: 'Otaku Culture' },
      { zh: '萌系小说', en: 'Moe' },
      { zh: '灵魂转换', en: 'Body Swap' }
    ],
    openingOptions: [
      {
        zh: "“从今天开始，你就是魔王大人了！” 还没等我反应过来，那个穿着女仆装的少女就跪在了我的面前。等等，我只是出门买个酱油啊！",
        en: "\"Starting today, you are the Demon Lord!\" Before I could react, the girl in the maid outfit knelt before me. Wait, I just went out to buy some soy sauce!"
      },
      {
        zh: "作为被召唤的勇者，我的固有技能居然是……【超速土下座】？这种技能到底要怎么拯救世界啊！",
        en: "As the summoned hero, my inherent skill is actually... [Supersonic Dogeza]? How am I supposed to save the world with this kind of skill!"
      },
      {
        zh: "转生恶役大小姐之后，我发现原本应该处刑我的王子殿下，看我的眼神好像不太对劲？",
        en: "After reincarnating as the villainess, I found that the Prince, who was supposed to execute me, is looking at me with a strange look in his eyes?"
      }
    ]
  }
];
