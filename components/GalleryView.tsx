
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { GalleryNovelMetadata, GalleryFilter, Project, SupabaseConfig } from '../types';
import { fetchGalleryNovels, importNovelFromGallery, likeNovel } from '../services/galleryService';
import { GENRE_TEMPLATES, Icons } from '../constants';
import { useI18n } from '../i18n';
import { useTheme } from '../theme';
import { createClient } from '@supabase/supabase-js';
import { getUserId } from '../services/identityService';
import ReaderModal from './ReaderModal';

interface GalleryViewProps {
  onImport: (project: Project) => void;
  config: SupabaseConfig;
  onUpdateConfig: (config: SupabaseConfig) => void;
  existingHashes?: Set<string>; 
}

const PAGE_SIZE = 12;

const GalleryView: React.FC<GalleryViewProps> = ({ onImport, config, onUpdateConfig, existingHashes }) => {
  const { t, language } = useI18n();
  const { colorClasses } = useTheme();
  
  const [novels, setNovels] = useState<GalleryNovelMetadata[]>([]);
  const [loading, setLoading] = useState(true); // Initial load
  const [isFetchingMore, setIsFetchingMore] = useState(false); // Pagination load
  const [error, setError] = useState<string | null>(null);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [readingProject, setReadingProject] = useState<Project | null>(null);
  const [isLoadingReader, setIsLoadingReader] = useState(false);

  // Pagination State
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // Config State
  const [showConfig, setShowConfig] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const [filter, setFilter] = useState<GalleryFilter>({
      search: '',
      genre: 'All',
      sort: 'popular',
      scope: 'community' 
  });
  
  const currentUserId = getUserId();

  // Reset List when Filters Change
  useEffect(() => {
    setNovels([]);
    setPage(0);
    setHasMore(true);
    // Fetch first page
    loadGallery(0);
  }, [filter, config]); 

  // Load More when Page Increases
  useEffect(() => {
    if (page > 0) {
        loadGallery(page);
    }
  }, [page]);

  const loadGallery = async (pageIndex: number) => {
      if (!config.url || !config.anonKey) {
          setLoading(false);
          setShowConfig(true); 
          return;
      }

      if (pageIndex === 0) setLoading(true);
      else setIsFetchingMore(true);
      
      setError(null);

      try {
          const data = await fetchGalleryNovels(filter, config, pageIndex, PAGE_SIZE);
          
          if (data.length < PAGE_SIZE) {
              setHasMore(false);
          }

          setNovels(prev => {
              if (pageIndex === 0) return data;
              // Deduplicate based on ID just in case
              const existingIds = new Set(prev.map(n => n.id));
              const uniqueNew = data.filter(n => !existingIds.has(n.id));
              return [...prev, ...uniqueNew];
          });

      } catch (e) {
          console.error(e);
          setError("Unable to connect to Gallery. Please check settings.");
      } finally {
          setLoading(false);
          setIsFetchingMore(false);
      }
  };

  // Intersection Observer for Infinite Scroll
  const observer = useRef<IntersectionObserver | null>(null);
  const bottomRef = useCallback((node: HTMLDivElement) => {
    if (loading || isFetchingMore) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
            setPage(prev => prev + 1);
        }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, isFetchingMore, hasMore]);


  const handleImport = async (id: string, silent = false) => {
      setImportingId(id);
      try {
          const project = await importNovelFromGallery(id, config);
          if (project) {
              if (!silent) {
                  onImport(project);
                  alert(t('gallery.downloaded'));
              }
              setNovels(prev => prev.map(n => n.id === id ? { ...n, downloads: n.downloads + 1 } : n));
              return project;
          }
      } catch (e) {
          if (!silent) alert("Import failed. " + e);
      } finally {
          setImportingId(null);
      }
      return null;
  };

  const handleRead = async (novel: GalleryNovelMetadata) => {
      setIsLoadingReader(true);
      try {
          // We fetch the full project data just like importing, but don't save to local storage yet
          const project = await importNovelFromGallery(novel.id, config);
          if (project) {
              setReadingProject(project);
          }
      } catch (e) {
          console.error(e);
          alert("Could not load book for reading.");
      } finally {
          setIsLoadingReader(false);
      }
  };

  const handleLike = async (novel: GalleryNovelMetadata) => {
      if (likedIds.has(novel.id)) return; 

      setNovels(prev => prev.map(n => n.id === novel.id ? { ...n, likes: n.likes + 1 } : n));
      setLikedIds(prev => new Set(prev).add(novel.id));

      try {
          await likeNovel(novel.id, novel.likes, config);
      } catch (e) {
          console.error("Like failed", e);
          setNovels(prev => prev.map(n => n.id === novel.id ? { ...n, likes: n.likes - 1 } : n));
          setLikedIds(prev => {
              const next = new Set(prev);
              next.delete(novel.id);
              return next;
          });
      }
  };

  const handleConfigChange = (key: keyof SupabaseConfig, value: string) => {
      const cleanValue = value.trim();
      onUpdateConfig({ ...config, [key]: cleanValue });
      setTestStatus('idle');
  }

  const handleTestConnection = async () => {
      if (!config.url || !config.anonKey) {
          setTestStatus('error');
          setTestMessage("URL and Key are required.");
          return;
      }
      setTestStatus('testing');
      setTestMessage('');
      try {
          const client = createClient(config.url, config.anonKey);
          const { error } = await client.from('novels').select('id').limit(1);
          if (error) throw error;
          setTestStatus('success');
          loadGallery(0);
      } catch (e: any) {
          console.error(e);
          setTestStatus('error');
          setTestMessage(e.message || "Connection failed.");
      }
  }

  // Derived State for Layout
  const featuredNovel = useMemo(() => {
      if (filter.scope === 'mine' || novels.length === 0) return null;
      // Featured is simply the most liked one currently loaded
      return [...novels].sort((a, b) => b.likes - a.likes)[0];
  }, [novels, filter.scope]);

  const topList = useMemo(() => {
      if (filter.scope === 'mine' || novels.length < 2) return [];
      // Next 3 most liked currently loaded
      return [...novels].sort((a, b) => b.likes - a.likes).slice(1, 4);
  }, [novels, filter.scope]);

  const standardGrid = useMemo(() => {
      if (filter.scope === 'mine') return novels;
      if (novels.length === 0) return [];
      // Remove featured from grid if displayed
      const featuredId = featuredNovel?.id;
      return novels.filter(n => n.id !== featuredId);
  }, [novels, featuredNovel, filter.scope]);

  // Generate a consistent gradient based on string hash for covers
  const getGradient = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
          hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      const gradients = [
          'from-pink-500 to-rose-500',
          'from-purple-500 to-indigo-500',
          'from-blue-500 to-cyan-500',
          'from-emerald-500 to-teal-500',
          'from-orange-500 to-amber-500',
          'from-slate-600 to-slate-800'
      ];
      return gradients[Math.abs(hash) % gradients.length];
  }

  if (readingProject) {
      return (
          <ReaderModal 
            project={readingProject} 
            onClose={() => setReadingProject(null)} 
            onClone={() => {
                onImport(readingProject);
                alert("Cloned to your workspace!");
            }}
          />
      );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 animate-in fade-in duration-300">
        
        {/* Configuration Check */}
        <div className="mb-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-lg ring-1 ring-slate-900/5">
            <div 
                className="px-6 py-4 flex justify-between items-center cursor-pointer bg-slate-50 dark:bg-slate-950 border-b border-slate-100 dark:border-slate-800"
                onClick={() => setShowConfig(!showConfig)}
            >
                <div className="flex items-center gap-2">
                    <Icons.Server />
                    <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-100">Gallery Connection</div>
                        <div className="text-xs text-slate-500">Connect to a Supabase backend to share and read novels.</div>
                    </div>
                </div>
                <div className={`transition-transform duration-200 text-slate-400 ${(showConfig || !config.url) ? 'rotate-180' : ''}`}>▼</div>
            </div>
            
            {(showConfig || !config.url) && (
                <div className="p-6 grid md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">Supabase Project URL</label>
                        <input 
                            className={`w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none ${colorClasses.ring}`}
                            value={config.url}
                            onChange={(e) => handleConfigChange('url', e.target.value)}
                            placeholder="https://your-project.supabase.co"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">Anon / Public Key</label>
                        <div className="flex gap-2">
                            <input 
                                className={`flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none ${colorClasses.ring}`}
                                value={config.anonKey}
                                onChange={(e) => handleConfigChange('anonKey', e.target.value)}
                                placeholder="sb_publishable_..."
                                type="password"
                            />
                            <button 
                                onClick={handleTestConnection}
                                disabled={testStatus === 'testing'}
                                className={`px-4 py-2 text-xs font-bold rounded-lg border transition-colors whitespace-nowrap ${
                                    testStatus === 'success' ? 'bg-green-100 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-800 dark:text-green-400' : 
                                    testStatus === 'error' ? 'bg-red-100 border-red-300 text-red-700 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400' :
                                    'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'
                                }`}
                            >
                                {testStatus === 'testing' ? 'Connecting...' : t('settings.test_conn')}
                            </button>
                        </div>
                        {testStatus === 'error' && <div className="text-xs text-red-500 mt-2">{testMessage}</div>}
                    </div>
                </div>
            )}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
             <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                <button
                    onClick={() => setFilter({...filter, scope: 'community'})}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter.scope === 'community' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Explore
                </button>
                <button
                    onClick={() => setFilter({...filter, scope: 'mine'})}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${filter.scope === 'mine' ? 'bg-white dark:bg-slate-700 shadow text-slate-800 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    My Studio
                </button>
            </div>

            <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <input 
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-shadow"
                        placeholder={t('gallery.search_placeholder')}
                        value={filter.search}
                        onChange={(e) => setFilter({...filter, search: e.target.value})}
                    />
                    <span className="absolute left-3 top-2.5 text-slate-400"><Icons.Scan /></span>
                </div>
                <select
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-4 py-2 text-sm focus:outline-none"
                    value={filter.genre}
                    onChange={(e) => setFilter({...filter, genre: e.target.value})}
                >
                    <option value="All">{t('gallery.filter_all')}</option>
                    {GENRE_TEMPLATES.map(g => (
                        <option key={g.id} value={g.name.en}>{g.name[language]}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* FEATURED & TOP SECTION (Only in Community Scope) */}
        {filter.scope === 'community' && featuredNovel && !loading && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                {/* Hero Card */}
                <div className="lg:col-span-2 relative h-80 rounded-2xl overflow-hidden group cursor-pointer shadow-xl" onClick={() => handleRead(featuredNovel)}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(featuredNovel.title)} opacity-90 group-hover:scale-105 transition-transform duration-700`}></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-8 text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">Featured #1</span>
                            <span className="bg-white/20 backdrop-blur-md text-[10px] font-bold px-2 py-0.5 rounded">{featuredNovel.genre}</span>
                        </div>
                        <h2 className="text-3xl font-bold mb-2 leading-tight">{featuredNovel.title}</h2>
                        <p className="text-sm text-slate-200 line-clamp-2 max-w-xl mb-4">{featuredNovel.description}</p>
                        <div className="flex gap-4 items-center">
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleRead(featuredNovel); }}
                                className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-slate-100 transition-colors flex items-center gap-2"
                            >
                                <Icons.Book /> Read Now
                            </button>
                            <div className="flex gap-4 text-xs font-medium">
                                <span className="flex items-center gap-1"><Icons.Sparkles /> {featuredNovel.likes}</span>
                                <span className="flex items-center gap-1">⬇ {featuredNovel.downloads}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top List */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Icons.Sparkles /> Trending Now
                    </h3>
                    <div className="space-y-4 flex-1">
                        {topList.map((novel, idx) => (
                            <div key={novel.id} className="flex gap-3 group cursor-pointer" onClick={() => handleRead(novel)}>
                                <div className={`w-12 h-16 rounded bg-gradient-to-br ${getGradient(novel.title)} shrink-0 shadow-sm group-hover:shadow-md transition-shadow`}></div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm truncate group-hover:text-blue-500 transition-colors">{novel.title}</h4>
                                    <p className="text-xs text-slate-500 mb-1">by {novel.author}</p>
                                    <div className="flex gap-3 text-[10px] text-slate-400">
                                        <span className="flex items-center gap-1"><Icons.Sparkles /> {novel.likes}</span>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-slate-200 dark:text-slate-800 italic">#{idx + 2}</div>
                            </div>
                        ))}
                        {topList.length === 0 && <div className="text-sm text-slate-400 text-center py-10">Not enough data for ranking.</div>}
                    </div>
                </div>
            </div>
        )}

        {/* Loading State - Initial */}
        {loading && (
            <div className="flex justify-center py-20">
                <div className={`animate-spin h-10 w-10 border-4 border-slate-200 border-t-blue-600 rounded-full`}></div>
            </div>
        )}

        {/* Standard Grid */}
        {!loading && (
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">
                        {filter.scope === 'mine' ? 'My Library' : 'All Novels'}
                    </h3>
                    <span className="text-xs text-slate-500">{novels.length} loaded</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {standardGrid.length === 0 ? (
                        <div className="col-span-full text-center text-slate-400 py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                            {error ? 'Connection failed.' : (filter.scope === 'mine' ? 'You haven\'t published anything yet.' : t('gallery.empty'))}
                        </div>
                    ) : (
                        standardGrid.map(novel => {
                            const isInstalled = existingHashes?.has(novel.contentHash || '');
                            const isMine = novel.ownerId === currentUserId;
                            
                            return (
                                <div key={novel.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group h-[340px]">
                                    
                                    {/* Cover Mockup */}
                                    <div className={`h-32 bg-gradient-to-br ${getGradient(novel.title)} relative p-4 flex flex-col justify-end`}>
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                                        {isInstalled && <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">✓ Installed</div>}
                                        {isMine && !isInstalled && <div className="absolute top-2 right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">Mine</div>}
                                        {novel.visibility === 'private' && <div className="absolute top-2 left-2 bg-slate-900/50 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-full"><Icons.Key /></div>}
                                    </div>
                                    
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 mb-1">{novel.genre}</div>
                                        <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1 line-clamp-1" title={novel.title}>{novel.title}</h3>
                                        <p className="text-xs text-slate-500 mb-3">by {novel.author}</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-4 leading-relaxed flex-1">
                                            {novel.description}
                                        </p>
                                        
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
                                            <div className="flex gap-3 text-xs text-slate-400">
                                                <button onClick={() => handleLike(novel)} className={`flex items-center gap-1 hover:text-pink-500 transition-colors ${likedIds.has(novel.id) ? 'text-pink-500' : ''}`}>
                                                    <Icons.Sparkles /> {novel.likes}
                                                </button>
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => handleRead(novel)}
                                                    className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                    title="Read Online"
                                                >
                                                    <Icons.Book />
                                                </button>
                                                <button 
                                                    onClick={() => handleImport(novel.id)}
                                                    disabled={importingId === novel.id || isInstalled}
                                                    className={`p-1.5 rounded transition-colors ${isInstalled ? 'text-green-500' : 'text-slate-500 hover:text-green-600'}`}
                                                    title="Clone"
                                                >
                                                    {importingId === novel.id ? <span className="animate-spin">⟳</span> : <Icons.Plus />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        )}

        {/* Load More Indicator / Observer Target */}
        {!loading && hasMore && (
            <div ref={bottomRef} className="h-20 w-full flex justify-center items-center mt-6">
                {isFetchingMore ? (
                     <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin h-6 w-6 border-2 border-slate-300 border-t-blue-500 rounded-full"></div>
                        <span className="text-xs text-slate-400">Loading more novels...</span>
                     </div>
                ) : (
                    <div className="h-10"></div> 
                )}
            </div>
        )}

        {!loading && !hasMore && novels.length > 0 && (
             <div className="text-center py-10 text-slate-400 text-xs">
                 You've reached the end of the library.
             </div>
        )}
        
        {/* Reader Loader Overlay */}
        {isLoadingReader && (
            <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-2xl flex items-center gap-3">
                    <div className="animate-spin h-5 w-5 border-2 border-slate-200 border-t-blue-600 rounded-full"></div>
                    <span className="text-sm font-bold">Opening Book...</span>
                </div>
            </div>
        )}
    </div>
  );
};

export default GalleryView;
