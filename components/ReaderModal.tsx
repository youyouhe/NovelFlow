
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Project, Chapter, Scene, CodexCategory } from '../types';
import { Icons, CODEX_HIGHLIGHT_COLORS } from '../constants';
import { useTheme } from '../theme';

interface ReaderModalProps {
  project: Project;
  onClose: () => void;
  onClone: () => void;
}

// --- Splitter Logic (Adapted for Reader) ---
const PAGE_HEIGHT_PX = 1123; // A4 height at 96 DPI
const FILL_RATIO = 0.90; // Slightly less than editor for reading comfort
const MAX_PAGE_CONTENT_HEIGHT = PAGE_HEIGHT_PX * FILL_RATIO;

const splitContentForReader = (text: string): string[] => {
    if (typeof document === 'undefined') return [text];
    if (!text) return [];

    const container = document.createElement('div');
    // Match the Reader rendering styles exactly: width 210mm, padding 12 (3rem/48px)
    // We append this to body to measure scrollHeight
    container.className = 'fixed top-0 left-0 -z-50 w-[210mm] p-12 bg-white opacity-0 pointer-events-none';
    container.style.boxSizing = 'border-box'; 
    
    document.body.appendChild(container);

    // Split by double newline to preserve paragraph structure used in renderContent
    const paragraphs = text.split(/\n\s*\n/);
    const pages: string[] = [];
    let currentPageParagraphs: string[] = [];

    for (let i = 0; i < paragraphs.length; i++) {
        const p = paragraphs[i];
        if (!p.trim()) continue;

        // Create a temporary element to measure this paragraph's height contribution
        let el: HTMLElement;
        
        // Detect type to match renderContent styles
        const isImage = /^!\[(.*?)\]\((.*?)\)$/.test(p.trim());
        const isHeading = /^(INT\.|EXT\.|EST\.|I\/E\.|内\.|外\.|场景\.)/i.test(p.trim());

        if (isImage) {
            el = document.createElement('div');
            // Matching renderContent: my-8 (32px top/bottom)
            // Estimated height: 400px (since we can't load image to know true height)
            el.className = 'my-8 h-[400px] block'; 
        } else if (isHeading) {
            el = document.createElement('h3');
            // Matching renderContent: text-xl font-bold uppercase tracking-wide my-6
            el.className = 'text-xl font-bold uppercase tracking-wide my-6 block';
            el.textContent = p;
        } else {
            el = document.createElement('p');
            // Matching renderContent: mb-6 leading-loose text-lg font-serif
            el.className = 'mb-6 leading-loose text-lg font-serif block';
            el.textContent = p;
        }
        
        container.appendChild(el);
        
        if (container.scrollHeight > MAX_PAGE_CONTENT_HEIGHT) {
             if (currentPageParagraphs.length > 0) {
                 // Page is full, push previous content
                 pages.push(currentPageParagraphs.join('\n\n'));
                 
                 // Start new page with current paragraph
                 currentPageParagraphs = [p];
                 container.innerHTML = '';
                 container.appendChild(el);
             } else {
                 // Single paragraph is huge (unlikely but possible), push it alone
                 pages.push(p);
                 currentPageParagraphs = [];
                 container.innerHTML = '';
             }
        } else {
            currentPageParagraphs.push(p);
        }
    }

    if (currentPageParagraphs.length > 0) {
        pages.push(currentPageParagraphs.join('\n\n'));
    }
    
    document.body.removeChild(container);
    return pages.length > 0 ? pages : [''];
};

const ReaderModal: React.FC<ReaderModalProps> = ({ project, onClose, onClone }) => {
  const { colorClasses, mode } = useTheme();
  
  // Navigation State
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [activeSceneIndex, setActiveSceneIndex] = useState(0);
  
  // View Mode State
  const [viewMode, setViewMode] = useState<'scroll' | 'paged_flip' | 'paged_scroll'>('scroll');
  const [pages, setPages] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const targetPageRef = useRef<number>(0); // 0 for start, -1 for end (when navigating back)

  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Zoom State
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  const activeChapter = project.chapters[activeChapterIndex] || { title: 'End', scenes: [] };
  const activeScene = activeChapter.scenes[activeSceneIndex];

  // --- Calculate Pages when Scene Changes ---
  useEffect(() => {
      if (viewMode === 'paged_flip' || viewMode === 'paged_scroll') {
          const newPages = splitContentForReader(activeScene?.content || '');
          setPages(newPages);
          
          if (viewMode === 'paged_flip') {
              if (targetPageRef.current === -1) {
                  setCurrentPageIndex(Math.max(0, newPages.length - 1));
                  targetPageRef.current = 0;
              } else {
                  setCurrentPageIndex(0);
              }
          }
      }
  }, [activeScene, viewMode]);

  // --- Zoom Logic (Alt + Scroll) ---
  useEffect(() => {
      const container = contentContainerRef.current;
      if (!container) return;

      const handleWheelNative = (e: WheelEvent) => {
          if (e.altKey) {
              e.preventDefault();
              e.stopPropagation();

              const delta = e.deltaY * -0.001;
              setZoomLevel(prev => {
                  const newZoom = prev + delta;
                  return Math.min(Math.max(newZoom, 0.5), 2.5); // Clamp zoom
              });
          }
      };

      container.addEventListener('wheel', handleWheelNative, { passive: false });
      return () => {
          container.removeEventListener('wheel', handleWheelNative);
      };
  }, []);

  // --- Highlighting Logic ---
  const nameToCategoryMap = useMemo<Map<string, CodexCategory>>(() => {
      const map = new Map<string, CodexCategory>();
      if (project.codex) {
          project.codex.forEach(c => {
              if (c.name.trim()) {
                  map.set(c.name.trim(), c.category);
              }
          });
      }
      return map;
  }, [project.codex]);

  const highlightingRegex = useMemo(() => {
      const names: string[] = Array.from(nameToCategoryMap.keys());
      if (names.length === 0) return null;
      const sortedNames = names.sort((a, b) => b.length - a.length);
      const escapedNames = sortedNames.map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
      return new RegExp(`(${escapedNames.join('|')})`, 'g');
  }, [nameToCategoryMap]);

  const renderContent = (content: string) => {
      if (!content) return null;
      const paragraphs = content.split(/\n\s*\n/);

      return paragraphs.map((paragraph, pIdx) => {
          const imageMatch = paragraph.match(/^!\[(.*?)\]\((.*?)\)$/);
          if (imageMatch) {
              return (
                  <div key={pIdx} className="my-8 flex flex-col items-center">
                      <img 
                        src={imageMatch[2]} 
                        alt={imageMatch[1]} 
                        className="rounded-lg shadow-lg max-h-[500px] object-contain" 
                      />
                      {imageMatch[1] && <span className="text-sm text-slate-500 mt-2 italic">{imageMatch[1]}</span>}
                  </div>
              );
          }
          
          const isSceneHeading = /^(INT\.|EXT\.|EST\.|I\/E\.|内\.|外\.|场景\.)/i.test(paragraph.trim());
          if (isSceneHeading) {
              return (
                  <h3 key={pIdx} className="text-blue-700 dark:text-blue-400 font-bold uppercase tracking-wide my-6 text-xl">
                      {paragraph}
                  </h3>
              );
          }

          if (!highlightingRegex) {
              return <p key={pIdx} className="mb-6 leading-loose text-lg text-slate-800 dark:text-slate-300 font-serif">{paragraph}</p>;
          }

          const parts = paragraph.split(highlightingRegex);
          return (
              <p key={pIdx} className="mb-6 leading-loose text-lg text-slate-800 dark:text-slate-300 font-serif">
                  {parts.map((part, partIndex) => {
                      const category = nameToCategoryMap.get(part);
                      if (category) {
                          const colors = CODEX_HIGHLIGHT_COLORS[category];
                          return (
                              <span 
                                  key={partIndex} 
                                  className={`${mode === 'dark' ? colors.dark : colors.light} font-semibold cursor-help border-b border-transparent hover:border-current transition-colors`}
                                  title={`${category} (From Codex)`}
                              >
                                  {part}
                              </span>
                          );
                      }
                      return <span key={partIndex}>{part}</span>;
                  })}
              </p>
          );
      });
  };

  // --- Navigation Helper ---
  const navigation = useMemo(() => {
      const nav: {cIdx: number, sIdx: number, title: string}[] = [];
      project.chapters.forEach((c, cIdx) => {
          c.scenes.forEach((s, sIdx) => {
              nav.push({ cIdx, sIdx, title: s.title });
          });
      });
      return nav;
  }, [project]);

  const currentNavIndex = navigation.findIndex(n => n.cIdx === activeChapterIndex && n.sIdx === activeSceneIndex);
  
  const handleNavNext = () => {
      if (viewMode === 'paged_flip') {
          // In Flip mode, try to go to next page first
          if (currentPageIndex < pages.length - 1) {
              setCurrentPageIndex(p => p + 1);
              return;
          }
      }
      
      // Otherwise, go to next scene
      if (currentNavIndex < navigation.length - 1) {
          const next = navigation[currentNavIndex + 1];
          setActiveChapterIndex(next.cIdx);
          setActiveSceneIndex(next.sIdx);
          targetPageRef.current = 0; // Start at beginning of next scene
          contentContainerRef.current?.scrollTo(0, 0);
      }
  };

  const handleNavPrev = () => {
      if (viewMode === 'paged_flip') {
          // In Flip mode, try to go to prev page first
          if (currentPageIndex > 0) {
              setCurrentPageIndex(p => p - 1);
              return;
          }
      }

      // Otherwise, go to prev scene
      if (currentNavIndex > 0) {
          const prev = navigation[currentNavIndex - 1];
          setActiveChapterIndex(prev.cIdx);
          setActiveSceneIndex(prev.sIdx);
          targetPageRef.current = -1; // Flag to start at END of prev scene
          contentContainerRef.current?.scrollTo(0, 0);
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-950 flex flex-col animate-in fade-in duration-200">
      {/* Header */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-950 shadow-sm z-20 shrink-0">
          <div className="flex items-center gap-4">
              <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <Icons.ArrowLeft />
              </button>
              <div>
                  <h1 className="font-bold text-slate-800 dark:text-slate-200 text-sm md:text-base line-clamp-1">{project.title}</h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">by {project.author}</p>
              </div>
          </div>
          <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <button 
                      onClick={() => setViewMode('scroll')}
                      className={`p-1.5 rounded transition-colors ${viewMode === 'scroll' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      title="Continuous Scroll"
                  >
                      <Icons.List />
                  </button>
                  <button 
                      onClick={() => setViewMode('paged_flip')}
                      className={`p-1.5 rounded transition-colors ${viewMode === 'paged_flip' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      title="Paged Flip"
                  >
                      <Icons.Book />
                  </button>
                  <button 
                      onClick={() => setViewMode('paged_scroll')}
                      className={`p-1.5 rounded transition-colors ${viewMode === 'paged_scroll' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                      title="Paged Scroll"
                  >
                      <Icons.Grid />
                  </button>
              </div>

              <div 
                  className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs text-slate-500 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  onClick={() => setZoomLevel(1.0)}
                  title="Reset Zoom (Alt + Scroll to change)"
              >
                  <Icons.Scan /> <span>{Math.round(zoomLevel * 100)}%</span>
              </div>
              <button 
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 md:hidden"
              >
                  <Icons.List />
              </button>
              <button 
                  onClick={onClone}
                  className={`hidden md:flex px-4 py-1.5 ${colorClasses.primary} ${colorClasses.hover} text-white text-xs font-bold rounded-full items-center gap-2 transition-colors`}
              >
                  <Icons.Plus /> Clone
              </button>
          </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
          {/* Sidebar (TOC) */}
          <div className={`
              absolute md:relative z-10 h-full w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out shrink-0
              ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0 md:opacity-0'}
          `}>
              <div className="p-4 overflow-y-auto h-full">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Table of Contents</h3>
                  <div className="space-y-4">
                      {project.chapters.map((chap, cIdx) => (
                          <div key={chap.id}>
                              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 px-2 truncate" title={chap.title}>{chap.title}</div>
                              {chap.scenes.map((scene, sIdx) => (
                                  <button
                                      key={scene.id}
                                      onClick={() => {
                                          setActiveChapterIndex(cIdx);
                                          setActiveSceneIndex(sIdx);
                                          setViewMode('scroll'); // Reset to default scroll when jumping via TOC
                                          if (window.innerWidth < 768) setSidebarOpen(false);
                                      }}
                                      className={`w-full text-left px-4 py-2 text-xs rounded transition-colors truncate ${
                                          cIdx === activeChapterIndex && sIdx === activeSceneIndex
                                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                                          : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800'
                                      }`}
                                      title={scene.title}
                                  >
                                      {scene.title}
                                  </button>
                              ))}
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Reader Content Area */}
          <div 
            ref={contentContainerRef}
            id="reader-content" 
            className="flex-1 overflow-y-auto bg-slate-200 dark:bg-slate-950 scroll-smooth relative"
          >
              <div 
                  className="flex flex-col items-center min-h-full py-12 md:py-16 transition-transform duration-100 ease-out origin-top"
                  style={{ transform: `scale(${zoomLevel})` }}
              >
                  {activeScene ? (
                      <>
                          {viewMode === 'scroll' && (
                              /* --- CONTINUOUS SCROLL MODE --- */
                              <div className="w-full max-w-3xl bg-white dark:bg-slate-900 px-12 py-16 shadow-lg rounded-sm min-h-[80vh]">
                                  <div className="mb-8 text-center">
                                      <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 dark:text-slate-200 mb-2">
                                          {activeScene.title}
                                      </h2>
                                      <div className="h-1 w-20 bg-slate-200 dark:bg-slate-800 mx-auto rounded-full"></div>
                                  </div>
                                  <div className="max-w-none">
                                      {renderContent(activeScene.content)}
                                  </div>
                              </div>
                          )}

                          {viewMode === 'paged_flip' && (
                              /* --- PAGED FLIP MODE --- */
                              <div className="relative w-[210mm] min-h-[297mm] bg-white dark:bg-slate-900 shadow-xl transition-colors duration-200 group flex-shrink-0">
                                   {/* Page Header Info */}
                                   <div className="absolute top-4 left-0 right-0 px-8 flex justify-between text-[10px] text-slate-300 dark:text-slate-700 font-sans select-none pointer-events-none">
                                       <span>{activeChapter.title}</span>
                                       <span>{activeScene.title}</span>
                                   </div>

                                   {/* Content */}
                                   <div className="absolute inset-0 p-12 overflow-hidden z-0 text-slate-800 dark:text-slate-300">
                                      {renderContent(pages[currentPageIndex] || '')}
                                   </div>

                                   {/* Page Footer Info */}
                                   <div className="absolute bottom-4 left-0 right-0 flex justify-center text-[10px] text-slate-300 dark:text-slate-700 font-mono select-none pointer-events-none">
                                       {currentPageIndex + 1} / {pages.length}
                                   </div>
                              </div>
                          )}

                          {viewMode === 'paged_scroll' && (
                               /* --- PAGED SCROLL MODE --- */
                               <div className="flex flex-col gap-8">
                                   {pages.map((pageContent, idx) => (
                                       <div key={idx} className="relative w-[210mm] min-h-[297mm] bg-white dark:bg-slate-900 shadow-xl transition-colors duration-200 group flex-shrink-0">
                                           {/* Page Header Info */}
                                           <div className="absolute top-4 left-0 right-0 px-8 flex justify-between text-[10px] text-slate-300 dark:text-slate-700 font-sans select-none pointer-events-none">
                                               <span>{activeChapter.title}</span>
                                               <span>{activeScene.title}</span>
                                           </div>

                                           {/* Content */}
                                           <div className="absolute inset-0 p-12 overflow-hidden z-0 text-slate-800 dark:text-slate-300">
                                              {renderContent(pageContent)}
                                           </div>

                                           {/* Page Footer Info */}
                                           <div className="absolute bottom-4 left-0 right-0 flex justify-center text-[10px] text-slate-300 dark:text-slate-700 font-mono select-none pointer-events-none">
                                               {idx + 1} / {pages.length}
                                           </div>
                                       </div>
                                   ))}
                               </div>
                          )}

                          {/* Navigation Controls */}
                          <div className="w-full max-w-3xl mt-12 flex justify-between items-center px-4">
                              <button 
                                  onClick={handleNavPrev}
                                  disabled={currentNavIndex === 0 && (viewMode !== 'paged_flip' || currentPageIndex === 0)}
                                  className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white/50 dark:bg-slate-900/50 px-4 py-2 rounded-full"
                              >
                                  <Icons.ChevronLeft /> Previous
                              </button>
                              
                              <span className="text-xs text-slate-400 font-medium">
                                  {viewMode === 'paged_flip' ? (
                                      `Page ${currentPageIndex + 1} of ${pages.length}`
                                  ) : (
                                      `Scene ${currentNavIndex + 1} of ${navigation.length}`
                                  )}
                              </span>

                              <button 
                                  onClick={handleNavNext}
                                  disabled={currentNavIndex === navigation.length - 1 && (viewMode !== 'paged_flip' || currentPageIndex === pages.length - 1)}
                                  className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white/50 dark:bg-slate-900/50 px-4 py-2 rounded-full"
                              >
                                  Next <Icons.ChevronRight />
                              </button>
                          </div>
                      </>
                  ) : (
                      <div className="flex items-center justify-center h-full text-slate-400 italic">
                          Select a chapter to begin reading.
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};

export default ReaderModal;
