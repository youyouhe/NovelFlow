
import React, { useState } from 'react';
import { Icons } from '../constants';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';
import { Project, Snapshot } from '../types';

interface HistoryModalProps {
  project: Project;
  onClose: () => void;
  onCreateSnapshot: (note: string) => void;
  onRestoreSnapshot: (snapshot: Snapshot) => void;
  onDeleteSnapshot: (id: string) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ project, onClose, onCreateSnapshot, onRestoreSnapshot, onDeleteSnapshot }) => {
  const { t } = useI18n();
  const { colorClasses } = useTheme();

  // Helper to generate default snapshot name
  const generateDefaultName = () => {
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, '0');
      const dd = String(now.getDate()).padStart(2, '0');
      
      let uuid = '';
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
          uuid = crypto.randomUUID().split('-')[0]; // Use first segment for brevity
      } else {
          uuid = Math.random().toString(36).substring(2, 10);
      }
      
      return `${yyyy}-${mm}-${dd}-${uuid}`;
  };

  const [note, setNote] = useState(generateDefaultName());

  const handleCreate = () => {
    if (!note.trim()) return;
    onCreateSnapshot(note);
    setNote(generateDefaultName()); // Reset with new default
  };

  const handleRestore = (snap: Snapshot) => {
    if (confirm(t('history.restore_confirm'))) {
        onRestoreSnapshot(snap);
        onClose();
    }
  };

  const handleDelete = (id: string) => {
      if (confirm(t('history.delete_confirm'))) {
          onDeleteSnapshot(id);
      }
  };

  const sortedSnapshots = [...(project.snapshots || [])].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[80vh]">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Icons.History /> {t('history.title')}
          </h2>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
           <div className="flex gap-2">
              <input 
                className={`flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded px-3 py-2 text-sm ${colorClasses.ring} outline-none dark:text-white`}
                placeholder={t('history.placeholder')}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <button 
                onClick={handleCreate}
                disabled={!note.trim()}
                className={`px-4 py-2 ${colorClasses.primary} ${colorClasses.hover} text-white rounded font-medium text-sm disabled:opacity-50`}
              >
                {t('history.create')}
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
           {sortedSnapshots.length === 0 ? (
               <div className="text-center text-slate-500 py-8">{t('history.no_snapshots')}</div>
           ) : (
               sortedSnapshots.map(snap => (
                   <div key={snap.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 group">
                       <div>
                           <div className="font-bold text-slate-700 dark:text-slate-200">{snap.note}</div>
                           <div className="text-xs text-slate-500 mt-1">
                               {t('history.created')}: {new Date(snap.timestamp).toLocaleString()}
                           </div>
                           <div className="text-[10px] text-slate-400 mt-1">
                               ID: {snap.id.slice(0, 8)} • Scenes: {snap.data.chapters.reduce((acc, c) => acc + c.scenes.length, 0)}
                           </div>
                       </div>
                       <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => handleDelete(snap.id)}
                                className="px-3 py-1.5 border border-red-200 dark:border-red-900/50 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded text-xs transition-colors"
                                title={t('history.delete')}
                            >
                                <Icons.Trash />
                            </button>
                            <button 
                                onClick={() => handleRestore(snap)}
                                className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-300"
                            >
                                {t('history.restore')}
                            </button>
                       </div>
                   </div>
               ))
           )}
        </div>
      </div>
    </div>
  );
};

export default HistoryModal;
