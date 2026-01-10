
import React, { useState } from 'react';
import { CodexEntry, CodexCategory, AIConfig, WritingLanguage } from '../types';
import { Icons } from '../constants';
import { generateCodexEntry, extractEntitiesFromText } from '../services/aiService';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';

interface CodexPanelProps {
  entries: CodexEntry[];
  onAddEntry: (entry: CodexEntry) => void;
  onAddOrUpdateEntry: (entry: CodexEntry) => void;
  onUpdateEntry: (entry: CodexEntry) => void;
  onDeleteEntry: (id: string) => void;
  aiConfig: AIConfig;
  writingLanguage: WritingLanguage;
  currentSceneContent?: string;
}

const CodexPanel: React.FC<CodexPanelProps> = ({ entries, onAddEntry, onAddOrUpdateEntry, onUpdateEntry, onDeleteEntry, aiConfig, writingLanguage, currentSceneContent }) => {
  const { t } = useI18n();
  const { colorClasses } = useTheme();
  const [selectedCategory, setSelectedCategory] = useState<CodexCategory | 'All'>('All');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newEntryName, setNewEntryName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  // Edit form state
  const [editForm, setEditForm] = useState<Partial<CodexEntry>>({});

  const filteredEntries = selectedCategory === 'All' 
    ? entries 
    : entries.filter(e => e.category === selectedCategory);

  const handleCreate = async () => {
    if (!newEntryName.trim()) return;

    const id = Date.now().toString();
    const category = selectedCategory === 'All' ? CodexCategory.Character : selectedCategory;
    
      // Quick add empty
     const newEntry: CodexEntry = {
       id,
       name: newEntryName,
       category,
       description: '',
       tags: []
     };
     onAddOrUpdateEntry(newEntry);
     setNewEntryName('');
    startEditing(newEntry);
  };

  const handleGenerate = async () => {
      if(!newEntryName.trim()) return;
      setIsGenerating(true);
      const id = Date.now().toString();
      const category = selectedCategory === 'All' ? CodexCategory.Character : selectedCategory;
      
      const desc = await generateCodexEntry(
        newEntryName, 
        category, 
        "Create a compelling entry fitting a sci-fi/fantasy novel.",
        writingLanguage,
        aiConfig
      );
      
      const newEntry: CodexEntry = {
          id,
          name: newEntryName,
          category,
          description: desc,
          tags: [t('codex.generated_tag')]
      };
      onAddEntry(newEntry);
      setIsGenerating(false);
      setNewEntryName('');
  }

  const handleScan = async () => {
      if(!currentSceneContent || currentSceneContent.length < 50) {
          alert("Scene content is too short to scan.");
          return;
      }
      setIsScanning(true);
      try {
          const existingNames = entries.map(e => e.name);
          const newEntries = await extractEntitiesFromText(
              currentSceneContent,
              existingNames,
              writingLanguage,
              aiConfig
          );
          
          if(newEntries.length === 0) {
               alert("No new entities found.");
          } else {
               newEntries.forEach(e => onAddOrUpdateEntry(e));
          }
      } catch (e: any) {
          const errorMsg = e?.message || String(e);
          console.error("Scan error:", e);
          alert(`Scan failed: ${errorMsg}`);
      } finally {
          setIsScanning(false);
      }
  }

  const startEditing = (entry: CodexEntry) => {
    setEditingId(entry.id);
    setEditForm({ ...entry });
  };

  const saveEdit = () => {
    if (editingId && editForm.id) {
      onUpdateEntry(editForm as CodexEntry);
      setEditingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-80 text-sm">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-slate-800 dark:text-slate-100 font-bold flex items-center gap-2">
            <Icons.Book /> {t('codex.title')}
            </h2>
            <button 
                onClick={handleScan}
                disabled={isScanning}
                className={`text-xs flex items-center gap-1 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors ${isScanning ? 'opacity-50 cursor-wait' : ''}`}
                title="Scan current scene for new entities"
            >
                {isScanning ? (
                    <span className="animate-spin">⟳</span>
                ) : (
                    <Icons.Scan />
                )}
                Scan
            </button>
        </div>
        
        {/* Category Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          {['All', ...Object.values(CodexCategory)].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as any)}
              className={`px-2 py-1 rounded text-xs transition-colors ${
                selectedCategory === cat 
                  ? `${colorClasses.primary} text-white`
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat === 'All' ? t('codex.all') : cat}
            </button>
          ))}
        </div>

        {/* Quick Add */}
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder={t('codex.new_placeholder')}
            className={`flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-slate-200 focus:outline-none ${colorClasses.ring}`}
            value={newEntryName}
            onChange={(e) => setNewEntryName(e.target.value)}
          />
           <button 
            onClick={handleCreate}
            disabled={isGenerating}
            className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white p-2 rounded"
            title="Create Empty"
          >
            <Icons.Plus />
          </button>
          <button 
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`${colorClasses.primary} ${colorClasses.hover} text-white p-2 rounded`}
            title="Generate with AI"
          >
            <Icons.Sparkles />
          </button>
        </div>
        {isGenerating && <p className={`text-xs ${colorClasses.text} mt-2 animate-pulse`}>{t('codex.consulting')}</p>}
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filteredEntries.map(entry => (
          <div key={entry.id} className="bg-slate-50 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 p-3 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
            {editingId === entry.id ? (
              <div className="space-y-2">
                <input 
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-slate-200 font-bold"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
                <select 
                   className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-slate-200 text-xs"
                   value={editForm.category}
                   onChange={(e) => setEditForm({...editForm, category: e.target.value as CodexCategory})}
                >
                  {Object.values(CodexCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <textarea 
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 text-slate-900 dark:text-slate-200 h-24 text-xs resize-none"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                />
                <div className="flex justify-end gap-2 mt-2">
                   <button onClick={() => onDeleteEntry(entry.id)} className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 p-1">
                      <Icons.Trash />
                   </button>
                   <button onClick={saveEdit} className="bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded text-xs">{t('codex.save')}</button>
                </div>
              </div>
            ) : (
              <div onClick={() => startEditing(entry)} className="cursor-pointer group">
                <div className="flex justify-between items-start">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{entry.name}</span>
                  <span className="text-[10px] uppercase tracking-wider bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-500 px-1 rounded">{entry.category}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-3 group-hover:text-slate-900 dark:group-hover:text-slate-300">
                  {entry.description || "No description."}
                </p>
              </div>
            )}
          </div>
        ))}
        {filteredEntries.length === 0 && (
          <div className="text-center text-slate-500 dark:text-slate-600 mt-10">
            <p>{t('codex.no_entries')}</p>
            <p className="text-xs">{t('codex.create_tip')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodexPanel;
