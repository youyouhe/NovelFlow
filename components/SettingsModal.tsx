import React, { useState, useEffect } from 'react';
import { Icons, THEME_COLORS, AI_CONTINUATION_MODES, AI_LENGTHS, AI_CONTEXT_SIZES, CODEX_HIGHLIGHT_COLORS } from '../constants';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';
import { AccentColor, ThemeMode, AIConfig, AIProvider, WritingLanguage, Project, KeyboardConfig, AIContinuationMode, AIContinuationLength, AIContextSize, CodexCategory, SupabaseConfig, ImageProvider, SettingsTab } from '../types';
import { getUserId, setUserId } from '../services/identityService';

interface SettingsModalProps {
  onClose: () => void;
  aiConfig: AIConfig;
  onUpdateAIConfig: (config: AIConfig) => void;
  supabaseConfig: SupabaseConfig;
  onUpdateSupabaseConfig: (config: SupabaseConfig) => void;
  onDeleteProject: () => void;
  project: Project;
  onUpdateProject: (project: Project) => void;
  shortcuts: KeyboardConfig;
  onUpdateShortcuts: (shortcuts: KeyboardConfig) => void;
}

const TABS: { id: SettingsTab; icon: React.FC; labelKey: string }[] = [
  { id: 'appearance', icon: Icons.Palette, labelKey: 'settings.tab_appearance' },
  { id: 'writing', icon: Icons.Pen, labelKey: 'settings.tab_writing' },
  { id: 'ai', icon: Icons.Sparkles, labelKey: 'settings.tab_ai' },
  { id: 'image', icon: Icons.Image, labelKey: 'settings.tab_image' },
  { id: 'account', icon: Icons.Users, labelKey: 'settings.tab_account' },
];

const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, aiConfig, onUpdateAIConfig, supabaseConfig, onUpdateSupabaseConfig, onDeleteProject, project, onUpdateProject, shortcuts, onUpdateShortcuts }) => {
  const { t, language } = useI18n();
  const { mode, setMode, accent, setAccent, colorClasses } = useTheme();
  
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [provider, setProvider] = useState<AIProvider>(aiConfig.provider);
  const [userId, setUserIdState] = useState(getUserId());
  const [isEditingId, setIsEditingId] = useState(false);
  const [recordingKey, setRecordingKey] = useState<keyof KeyboardConfig | null>(null);

  useEffect(() => {
    setProvider(aiConfig.provider);
  }, [aiConfig]);

  const updateConfig = (newProvider: AIProvider, newMode?: AIContinuationMode, newLength?: AIContinuationLength, newContextSize?: AIContextSize, autoScan?: boolean, clearCodexBeforeScan?: boolean, genOpening?: boolean, targetSceneWordCount?: number, targetSceneCountPerChapter?: number, modeLengthOverrides?: Record<AIContinuationMode, boolean>) => {
      onUpdateAIConfig({
          ...aiConfig,
          provider: newProvider,
          continuationMode: newMode || aiConfig.continuationMode,
          continuationLength: newLength || aiConfig.continuationLength,
          contextSize: newContextSize || aiConfig.contextSize,
          autoScanAfterContinue: autoScan !== undefined ? autoScan : aiConfig.autoScanAfterContinue,
          clearCodexBeforeScan: clearCodexBeforeScan !== undefined ? clearCodexBeforeScan : aiConfig.clearCodexBeforeScan,
          generateOpeningWithAI: genOpening !== undefined ? genOpening : aiConfig.generateOpeningWithAI,
          targetSceneWordCount: targetSceneWordCount !== undefined ? targetSceneWordCount : aiConfig.targetSceneWordCount,
          targetSceneCountPerChapter: targetSceneCountPerChapter !== undefined ? targetSceneCountPerChapter : aiConfig.targetSceneCountPerChapter,
          modeLengthOverrides: modeLengthOverrides !== undefined ? modeLengthOverrides : aiConfig.modeLengthOverrides
      });
  };

  const handleModeLengthOverride = (mode: AIContinuationMode, ignoreLength: boolean) => {
      const currentOverrides = aiConfig.modeLengthOverrides || {};
      onUpdateAIConfig({
          ...aiConfig,
          modeLengthOverrides: {
              ...currentOverrides,
              [mode]: ignoreLength
          }
      });
  };

  const handleProviderChange = (newProvider: AIProvider) => {
      setProvider(newProvider);
      updateConfig(newProvider);
  };
  
  const handleDeepSeekKeyChange = (val: string) => {
      onUpdateAIConfig({
          ...aiConfig,
          deepseekApiKey: val
      });
  }
  
  const handleImageConfigChange = (key: keyof AIConfig, value: string) => {
      onUpdateAIConfig({
          ...aiConfig,
          [key]: value
      });
  }

  const handleLanguageChange = (lang: WritingLanguage) => {
      onUpdateProject({
          ...project,
          writingLanguage: lang
      });
  }

  const handleDelete = () => {
      if(confirm(t('settings.delete_confirm'))) {
          onDeleteProject();
      }
  }

  const handleShortcutKeyDown = (e: React.KeyboardEvent, keyName: keyof KeyboardConfig) => {
      e.preventDefault();
      e.stopPropagation();

      const modifiers = [];
      if (e.ctrlKey) modifiers.push('Ctrl');
      if (e.altKey) modifiers.push('Alt');
      if (e.shiftKey) modifiers.push('Shift');
      if (e.metaKey) modifiers.push('Meta');

      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) return;

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const shortcutString = [...modifiers, key].join('+');
      
      onUpdateShortcuts({
          ...shortcuts,
          [keyName]: shortcutString
      });
      setRecordingKey(null);
  };
  
  const handleSaveUserId = () => {
      if (userId.trim()) {
          setUserId(userId.trim());
          setIsEditingId(false);
          alert("Identity updated. Refresh the page to apply changes fully if needed.");
      }
  }

  const supportedLanguages: WritingLanguage[] = ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de', 'it', 'ru', 'pt'];

  const renderAppearanceTab = () => (
      <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t('settings.theme')}</label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <button
                onClick={() => setMode('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'light' 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icons.Sun /> {t('settings.light')}
              </button>
              <button
                onClick={() => setMode('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === 'dark' 
                    ? 'bg-slate-700 text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                <Icons.Moon /> {t('settings.dark')}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t('settings.accent')}</label>
            <div className="grid grid-cols-5 gap-3">
              {(Object.keys(THEME_COLORS) as AccentColor[]).map((color) => (
                <button
                  key={color}
                  onClick={() => setAccent(color)}
                  className={`w-full aspect-square rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                    THEME_COLORS[color].primary
                  } ${accent === color ? 'ring-2 ring-offset-2 ring-slate-400 dark:ring-slate-500' : ''}`}
                  title={color}
                >
                  {accent === color && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Codex Highlighting</label>
              <div className="grid grid-cols-2 gap-2">
                  {Object.entries(CODEX_HIGHLIGHT_COLORS).map(([category, colors]) => (
                      <div key={category} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{category}</span>
                          <span className={`text-xs font-bold ${mode === 'dark' ? colors.dark : colors.light}`}>Abc</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderWritingTab = () => (
      <div className="space-y-6">
          <div>
             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                 <Icons.Globe /> {t('settings.writing_lang')}
             </label>
             <select
                 className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none text-sm ${colorClasses.ring}`}
                 value={project.writingLanguage}
                 onChange={e => handleLanguageChange(e.target.value as WritingLanguage)}
               >
                  {supportedLanguages.map(lang => (
                     <option key={lang} value={lang}>{t(`lang.${lang}`)}</option>
                  ))}
               </select>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">{t('settings.shortcuts')}</label>
             <div className="space-y-3">
                 <div>
                     <span className="text-xs text-slate-500 block mb-1">{t('settings.shortcut_continue')}</span>
                     <input 
                         readOnly
                         className={`w-full bg-slate-50 dark:bg-slate-950 border ${recordingKey === 'aiContinue' ? colorClasses.border : 'border-slate-300 dark:border-slate-700'} rounded px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none text-sm cursor-pointer`}
                         value={recordingKey === 'aiContinue' ? t('settings.shortcut_placeholder') : shortcuts.aiContinue}
                         onClick={() => setRecordingKey('aiContinue')}
                         onBlur={() => setRecordingKey(null)}
                         onKeyDown={(e) => handleShortcutKeyDown(e, 'aiContinue')}
                     />
                 </div>
             </div>
          </div>
      </div>
  );

  const renderAITab = () => (
      <div className="space-y-4">
          <div>
              <span className="text-xs text-slate-500 block mb-1">{t('settings.provider')}</span>
              <div className="flex gap-2">
                  <button 
                    onClick={() => handleProviderChange('gemini')}
                    className={`flex-1 py-2 text-xs border rounded transition-all ${provider === 'gemini' ? `${colorClasses.border} ${colorClasses.text} bg-slate-50 dark:bg-slate-800 font-bold ring-1 ring-offset-0 ${colorClasses.ring}` : 'border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                      Google Gemini
                  </button>
                  <button 
                    onClick={() => handleProviderChange('deepseek')}
                    className={`flex-1 py-2 text-xs border rounded transition-all ${provider === 'deepseek' ? `${colorClasses.border} ${colorClasses.text} bg-slate-50 dark:bg-slate-800 font-bold ring-1 ring-offset-0 ${colorClasses.ring}` : 'border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                      DeepSeek
                  </button>
              </div>
          </div>

          {provider === 'deepseek' && (
              <div>
                  <label className="block text-xs text-slate-500 mb-1">DeepSeek API Key</label>
                  <input 
                      type="password"
                      className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none text-sm ${colorClasses.ring}`}
                      placeholder="sk-..."
                      value={aiConfig.deepseekApiKey || ''}
                      onChange={(e) => handleDeepSeekKeyChange(e.target.value)}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Leave empty to use server default.</p>
              </div>
          )}
          
          <div>
              <span className="text-xs text-slate-500 block mb-1">Default Continuation Mode</span>
              <select
                  className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none text-sm ${colorClasses.ring}`}
                  value={aiConfig.continuationMode || 'general'}
                  onChange={(e) => updateConfig(provider, e.target.value as AIContinuationMode, undefined, undefined)}
              >
                  {AI_CONTINUATION_MODES.map(mode => (
                      <option key={mode.id} value={mode.id}>
                          {language === 'zh' ? mode.label.zh : mode.label.en}
                      </option>
                  ))}
              </select>
          </div>

          <div>
              <span className="text-xs text-slate-500 block mb-1">Target Output Length</span>
              <select
                  className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none text-sm ${colorClasses.ring}`}
                  value={aiConfig.continuationLength || 'medium'}
                  onChange={(e) => updateConfig(provider, undefined, e.target.value as AIContinuationLength, undefined)}
              >
                  {AI_LENGTHS.map(len => (
                      <option key={len.id} value={len.id}>
                          {language === 'zh' ? len.label.zh : len.label.en}
                      </option>
                  ))}
              </select>
          </div>

          <div>
              <span className="text-xs text-slate-500 block mb-2">Mode-specific Length Constraints</span>
              <p className="text-[10px] text-slate-400 mb-2">When enabled, the AI will ignore the target output length setting for that mode.</p>
              <div className="space-y-2">
                  {AI_CONTINUATION_MODES.map(mode => (
                      <div key={mode.id} className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                              {language === 'zh' ? mode.label.zh : mode.label.en}
                          </span>
                          <button
                              onClick={() => handleModeLengthOverride(mode.id, !(aiConfig.modeLengthOverrides?.[mode.id] || false))}
                              className={`w-9 h-5 rounded-full transition-colors relative ${aiConfig.modeLengthOverrides?.[mode.id] ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                          >
                              <span className={`absolute top-0.5 left-0.5 bg-white w-4 h-4 rounded-full transition-transform ${aiConfig.modeLengthOverrides?.[mode.id] ? 'translate-x-4' : ''}`} />
                          </button>
                      </div>
                  ))}
              </div>
          </div>

          <div>
              <span className="text-xs text-slate-500 block mb-1">Context Window Size (Input)</span>
              <select
                  className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none text-sm ${colorClasses.ring}`}
                  value={aiConfig.contextSize || 'medium'}
                  onChange={(e) => updateConfig(provider, undefined, undefined, e.target.value as AIContextSize)}
              >
                  {AI_CONTEXT_SIZES.map(size => (
                      <option key={size.id} value={size.id}>
                          {language === 'zh' ? size.label.zh : size.label.en}
                      </option>
                  ))}
              </select>
          </div>

          <div>
              <span className="text-xs text-slate-500 block mb-1">Target Scene Length (words)</span>
              <input
                  type="number"
                  min="500"
                  max="10000"
                  step="100"
                  className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none text-sm ${colorClasses.ring}`}
                  value={aiConfig.targetSceneWordCount || 2000}
                  onChange={(e) => updateConfig(provider, undefined, undefined, undefined, undefined, undefined, undefined, parseInt(e.target.value) || undefined)}
              />
              <span className="text-[10px] text-slate-400">AI will suggest new scene when approaching this length</span>
          </div>

          <div>
              <span className="text-xs text-slate-500 block mb-1">Target Scenes per Chapter</span>
              <input
                  type="number"
                  min="1"
                  max="20"
                  step="1"
                  className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none text-sm ${colorClasses.ring}`}
                  value={aiConfig.targetSceneCountPerChapter || 5}
                  onChange={(e) => updateConfig(provider, undefined, undefined, undefined, undefined, undefined, undefined, undefined, parseInt(e.target.value) || undefined)}
              />
              <span className="text-[10px] text-slate-400">AI will suggest new chapter when reaching this scene count</span>
          </div>

          <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.clear_codex_before_scan')}</span>
              <button
                onClick={() => onUpdateAIConfig({ ...aiConfig, clearCodexBeforeScan: !aiConfig.clearCodexBeforeScan })}
                className={`w-11 h-6 rounded-full transition-colors relative ${aiConfig.clearCodexBeforeScan ? colorClasses.primary : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${aiConfig.clearCodexBeforeScan ? 'translate-x-5' : ''}`} />
              </button>
          </div>

          <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{t('settings.generate_opening')}</span>
              <button
                  onClick={() => updateConfig(provider, undefined, undefined, undefined, undefined, undefined, !aiConfig.generateOpeningWithAI)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${aiConfig.generateOpeningWithAI ? colorClasses.primary : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                  <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${aiConfig.generateOpeningWithAI ? 'translate-x-5' : ''}`} />
              </button>
          </div>
      </div>
  );

  const renderImageTab = () => (
      <div className="space-y-4">
          <div className="flex gap-2">
              <button
                  onClick={() => handleImageConfigChange('imageProvider', 'gemini')}
                  className={`flex-1 py-2 text-xs border rounded transition-all ${aiConfig.imageProvider !== 'openai_compatible' ? `${colorClasses.border} ${colorClasses.text} bg-slate-50 dark:bg-slate-800 font-bold ring-1 ring-offset-0 ${colorClasses.ring}` : 'border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                  Google Gemini (Native)
              </button>
              <button
                  onClick={() => handleImageConfigChange('imageProvider', 'openai_compatible')}
                  className={`flex-1 py-2 text-xs border rounded transition-all ${aiConfig.imageProvider === 'openai_compatible' ? `${colorClasses.border} ${colorClasses.text} bg-slate-50 dark:bg-slate-800 font-bold ring-1 ring-offset-0 ${colorClasses.ring}` : 'border-slate-300 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                  Custom / OpenAI
              </button>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
              <div>
                  <label className="block text-xs text-slate-500 mb-1">{t('settings.image_model')}</label>
                  <input 
                      className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none text-sm ${colorClasses.ring}`}
                      placeholder={aiConfig.imageProvider === 'openai_compatible' ? 'dall-e-3' : 'gemini-2.5-flash-image'}
                      value={aiConfig.imageModel || ''}
                      onChange={(e) => handleImageConfigChange('imageModel', e.target.value)}
                  />
              </div>
              
              {aiConfig.imageProvider === 'openai_compatible' && (
                  <>
                      <div>
                          <label className="block text-xs text-slate-500 mb-1">{t('settings.image_base_url')}</label>
                          <input 
                              className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none text-sm ${colorClasses.ring}`}
                              placeholder="https://api.openai.com/v1"
                              value={aiConfig.imageBaseUrl || ''}
                              onChange={(e) => handleImageConfigChange('imageBaseUrl', e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-slate-500 mb-1">{t('settings.image_api_key')}</label>
                          <input 
                              type="password"
                              className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none text-sm ${colorClasses.ring}`}
                              placeholder="sk-..."
                              value={aiConfig.imageApiKey || ''}
                              onChange={(e) => handleImageConfigChange('imageApiKey', e.target.value)}
                          />
                      </div>
                      <div>
                          <label className="block text-xs text-slate-500 mb-1">Image Size</label>
                          <input 
                              className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-slate-900 dark:text-slate-200 focus:outline-none text-sm ${colorClasses.ring}`}
                              placeholder="1024x1024"
                              value={aiConfig.imageSize || ''}
                              onChange={(e) => handleImageConfigChange('imageSize', e.target.value)}
                          />
                          <span className="text-[10px] text-slate-400">e.g. "1024x1024" or "2:3" (for specific models)</span>
                      </div>
                  </>
              )}
          </div>
      </div>
  );

  const renderAccountTab = () => (
      <div className="space-y-6">
          <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">My Identity (Client ID)</label>
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      This ID links you to your published novels (Public & Private). 
                      Keep this safe if you want to access your private uploads on another device.
                  </p>
                  <div className="flex gap-2">
                       <input 
                          className={`flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-xs font-mono text-slate-600 dark:text-slate-300`}
                          value={userId}
                          onChange={(e) => setUserIdState(e.target.value)}
                          readOnly={!isEditingId}
                       />
                       {isEditingId ? (
                           <button onClick={handleSaveUserId} className="text-xs bg-green-500 text-white px-2 rounded">Save</button>
                       ) : (
                           <button onClick={() => setIsEditingId(true)} className="text-xs bg-slate-200 dark:bg-slate-700 px-2 rounded">Edit</button>
                       )}
                  </div>
              </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
             <label className="block text-sm font-bold text-red-600 mb-3">{t('settings.delete_project')}</label>
             <button 
                onClick={handleDelete}
                className="w-full py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-bold"
             >
                 {t('settings.delete_btn')}
             </button>
          </div>
      </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-md w-full flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Icons.Settings /> {t('settings.title')}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4">
            {TABS.map(tab => {
                const Icon = tab.icon;
                return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                            activeTab === tab.id
                                ? `${colorClasses.text} ${colorClasses.border}`
                                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 border-transparent'
                        }`}
                    >
                        <Icon /> {t(tab.labelKey)}
                    </button>
                );
            })}
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
            {activeTab === 'appearance' && renderAppearanceTab()}
            {activeTab === 'writing' && renderWritingTab()}
            {activeTab === 'ai' && renderAITab()}
            {activeTab === 'image' && renderImageTab()}
            {activeTab === 'account' && renderAccountTab()}
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-b-xl flex justify-end">
          <button 
            onClick={onClose}
            className={`px-4 py-2 text-white rounded font-medium text-sm transition-colors ${colorClasses.primary} ${colorClasses.hover}`}
          >
            {t('settings.close')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;