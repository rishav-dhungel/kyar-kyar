import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { NoteView } from './components/NoteView';
import { FolderView } from './components/FolderView';
import { SearchModal } from './components/SearchModal';
import { OppositeProgressBar } from './components/OppositeProgressBar';
import { NoteItem, SidebarPlacement } from './types';
import { loadContentFromMarkdown } from './utils/contentLoader';
import { buildFileTree, computeBacklinks } from './utils/fileTree';
import { resolveNote } from './utils/noteResolver';
import { 
  CALIBRATED_PALETTES, 
  parseYamlConfig 
} from './utils/yamlConfig';
import rawYamlConfig from '../kyar-kyar.config.yaml?raw';
import { Tag, PanelLeft, PanelRight, Search, Sun, Moon } from 'lucide-react';

export default function App() {
  // 1. Config parsed directly from kyar-kyar.config.yaml (no localstorage override)
  const config = useMemo(() => {
    return parseYamlConfig(rawYamlConfig);
  }, []);

  // 2. Color Mode Calibration (defaults to YAML or prefers-color-scheme)
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (config.theme.colorMode === 'dark') return true;
    if (config.theme.colorMode === 'light') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Calculate active calibrated palette based on YAML config presets & isDark toggle
  const activePalette = useMemo(() => {
    if (!isDark) {
      const lightKey = config.theme.lightPalette || 'classic-light';
      return CALIBRATED_PALETTES[lightKey] || CALIBRATED_PALETTES['classic-light'];
    }
    const darkKey = config.theme.darkPalette || config.theme.palette || 'classic-dark';
    return CALIBRATED_PALETTES[darkKey] || CALIBRATED_PALETTES['classic-dark'];
  }, [config.theme.lightPalette, config.theme.darkPalette, config.theme.palette, isDark]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kyar_kyar_light_palette');
      localStorage.removeItem('kyar_kyar_dark_palette');
      localStorage.removeItem('kyar_kyar_autohide_sidebar');
    }
  }, []);

  const handleToggleColorMode = () => {
    setIsDark((prev) => !prev);
  };

  // Apply calibrated CSS variables to document
  useEffect(() => {
    const root = document.documentElement;

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const custom = config.theme.customColors || {};

    const bgMain = isDark 
      ? (custom.darkBg || activePalette.bgMain) 
      : (custom.lightBg || activePalette.bgMain);

    // Sidebar color blends seamlessly with background (unless explicitly customized)
    const sidebarBg = isDark 
      ? (custom.darkSidebar || bgMain) 
      : (custom.lightSidebar || bgMain);

    const cardMain = isDark 
      ? (custom.darkCard || activePalette.cardMain) 
      : (custom.lightCard || activePalette.cardMain);

    const borderMain = isDark 
      ? (custom.darkBorder || activePalette.borderMain) 
      : (custom.lightBorder || activePalette.borderMain);

    const textMain = isDark 
      ? (custom.darkText || activePalette.textMain) 
      : (custom.lightText || activePalette.textMain);

    const textHeading = isDark 
      ? (custom.darkHeading || activePalette.textHeading) 
      : (custom.lightHeading || activePalette.textHeading);

    const textMuted = isDark 
      ? (custom.darkMuted || activePalette.textMuted) 
      : (custom.lightMuted || activePalette.textMuted);

    // Accent: if user specified accentColor in theme, use it for dark or custom; for classic-light allow #2563eb or accentColor
    const accent = isDark
      ? (custom.darkAccent || config.theme.accentColor || activePalette.accent)
      : (custom.lightAccent || (config.theme.lightPalette === 'classic-light' && !config.theme.accentColor ? '#2563eb' : config.theme.accentColor) || activePalette.accent);

    root.style.setProperty('--bg-main', bgMain);
    root.style.setProperty('--sidebar-main', sidebarBg);
    root.style.setProperty('--card-main', cardMain);
    root.style.setProperty('--border-main', borderMain);
    root.style.setProperty('--text-main', textMain);
    root.style.setProperty('--text-heading', textHeading);
    root.style.setProperty('--text-muted', textMuted);
    root.style.setProperty('--accent', accent);
    root.style.setProperty('--code-bg', activePalette.codeBg);
    root.style.setProperty('--pattern-color', activePalette.patternColor);

    // Apply global uniform font family matching YAML config
    const fontChoice = config.theme.fontFamily || 'sans';
    root.setAttribute('data-font', fontChoice);
    const activeFont = 
      fontChoice === 'mono' 
        ? "var(--font-mono)" 
        : fontChoice === 'serif' 
        ? "var(--font-serif)" 
        : "var(--font-sans)";
    root.style.setProperty('--font-active', activeFont);
    document.body.style.fontFamily = activeFont;
  }, [activePalette, isDark, config.theme.accentColor, config.theme.customColors, config.theme.lightPalette, config.theme.fontFamily]);

  // 3. Notes State (Parsed dynamically from Markdown files in /content folder)
  const [notes] = useState<NoteItem[]>(() => {
    return loadContentFromMarkdown();
  });

  // 4. Active Note and Navigation
  const [activeNoteId, setActiveNoteId] = useState<string>(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#/note/')) {
      const target = hash.replace('#/note/', '');
      const match = resolveNote(target, notes);
      if (match) return match.id;
    }
    const home = notes.find((n) => n.filePath === 'index.md');
    return home ? home.id : notes[0]?.id || '';
  });

  // Filter tag state with deep-link hash support
  const [selectedTag, setSelectedTag] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#/tag/')) {
      return decodeURIComponent(window.location.hash.replace('#/tag/', ''));
    }
    return null;
  });

  // Selected folder state with deep-link hash support
  const [selectedFolder, setSelectedFolder] = useState<string | null>(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#/folder/')) {
      return decodeURIComponent(window.location.hash.replace('#/folder/', ''));
    }
    return null;
  });

  // Sync URL hash with active note, folder, or active tag
  useEffect(() => {
    if (selectedFolder) {
      window.history.replaceState(null, '', `#/folder/${encodeURIComponent(selectedFolder)}`);
      document.title = `${selectedFolder}/ — ${config.author}`;
    } else if (selectedTag) {
      window.history.replaceState(null, '', `#/tag/${encodeURIComponent(selectedTag)}`);
      document.title = `#${selectedTag} — ${config.author}`;
    } else {
      const active = notes.find((n) => n.id === activeNoteId);
      if (active) {
        window.history.replaceState(null, '', `#/note/${active.slug}`);
        document.title = `${active.title} — ${config.author}`;
      }
    }
  }, [selectedFolder, selectedTag, activeNoteId, notes, config.author]);

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/folder/')) {
        const rawFolder = decodeURIComponent(hash.replace('#/folder/', ''));
        setSelectedFolder(rawFolder);
        setSelectedTag(null);
      } else if (hash.startsWith('#/tag/')) {
        const rawTag = decodeURIComponent(hash.replace('#/tag/', ''));
        setSelectedTag(rawTag);
        setSelectedFolder(null);
      } else if (hash.startsWith('#/note/')) {
        setSelectedTag(null);
        setSelectedFolder(null);
        const target = hash.replace('#/note/', '');
        const match = resolveNote(target, notes);
        if (match) {
          setActiveNoteId(match.id);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [notes]);

  // User-facing interactive placement state (defaults to YAML, toggleable via frontend buttons at bottom of sidebar)
  const [placement, setPlacement] = useState<SidebarPlacement>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kyar_kyar_sidebar_placement') as SidebarPlacement;
      if (saved && ['left', 'right', 'popup'].includes(saved)) {
        return saved;
      }
    }
    return config.theme.sidebarPlacement || 'left';
  });

  const handlePlacementChange = (newPlacement: SidebarPlacement) => {
    setPlacement(newPlacement);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kyar_kyar_sidebar_placement', newPlacement);
    }
  };

  // Modals / Drawers State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Desktop sidebar collapse state (defaults to false: always docked & visible in normal flow)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kyar_kyar_sidebar_collapsed') === 'true';
    }
    return false;
  });

  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        localStorage.setItem('kyar_kyar_sidebar_collapsed', String(next));
      }
      return next;
    });
  };

  const handleCloseSidebar = () => {
    setIsMobileDrawerOpen(false);
  };

  // Global keyboard shortcuts (Cmd+K / Ctrl+K for search, Cmd+\ or Ctrl+\ for sidebar toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === '\\' || e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        if (placement === 'popup' || (typeof window !== 'undefined' && window.innerWidth < 768)) {
          setIsMobileDrawerOpen((prev) => !prev);
        } else {
          toggleSidebarCollapse();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [placement]);

  // Compute File Tree (Roots outside folders & Folders)
  const fileTree = useMemo(() => {
    return buildFileTree(notes);
  }, [notes]);

  // Active Note
  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === activeNoteId) || notes[0] || null;
  }, [notes, activeNoteId]);

  // Prev / Next Notes in order
  const { prevNote, nextNote } = useMemo(() => {
    const idx = notes.findIndex((n) => n.id === activeNoteId);
    return {
      prevNote: idx > 0 ? notes[idx - 1] : null,
      nextNote: idx >= 0 && idx < notes.length - 1 ? notes[idx + 1] : null,
    };
  }, [notes, activeNoteId]);

  const handleGoHome = () => {
    const home = notes.find((n) => n.filePath === 'index.md');
    if (home) {
      setActiveNoteId(home.id);
    } else if (notes[0]) {
      setActiveNoteId(notes[0].id);
    }
    setSelectedTag(null);
  };

  // Tag filter notes view if a tag is active (case-insensitive matching)
  const tagFilteredNotes = useMemo(() => {
    if (!selectedTag) return [];
    const normalizedTag = selectedTag.toLowerCase().trim();
    return notes.filter((n) =>
      n.tags.some((t) => t.toLowerCase().trim() === normalizedTag)
    );
  }, [notes, selectedTag]);

  const patternClass = `pattern-${config.theme.backgroundPattern || 'none'}`;

  // Determine container flex direction based on placement
  let layoutDirectionClass = '';
  if (placement === 'right') {
    layoutDirectionClass = 'flex-row-reverse';
  } else if (placement === 'popup') {
    layoutDirectionClass = 'flex-col';
  } else {
    layoutDirectionClass = 'flex-row';
  }

  return (
    <div 
      className={`min-h-screen flex flex-col transition-colors duration-150 ${patternClass}`}
      style={{
        backgroundColor: 'var(--bg-main)',
        color: 'var(--text-main)',
        fontFamily: 'var(--font-active)',
      }}
    >
      {/* Mobile Topbar Navigation (< 768px) */}
      <header 
        className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b backdrop-blur-md"
        style={{
          backgroundColor: 'color-mix(in srgb, var(--card-main) 92%, transparent)',
          borderColor: 'var(--border-main)',
        }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity cursor-pointer shrink-0"
            style={{
              backgroundColor: 'var(--bg-main)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-heading)',
            }}
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleGoHome}
            className="font-bold text-sm tracking-tight truncate hover:opacity-80 text-left"
            style={{ color: 'var(--text-heading)' }}
          >
            {config.title || config.author}
          </button>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-main)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-muted)',
            }}
            title="Search notes (Cmd+K)"
            aria-label="Search notes"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleToggleColorMode}
            className="p-1.5 rounded-lg border hover:opacity-80 transition-opacity cursor-pointer"
            style={{
              backgroundColor: 'var(--bg-main)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-heading)',
            }}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </header>

      {/* Desktop Floating Expand Button (when desktop sidebar is collapsed or in popup mode) */}
      {(isSidebarCollapsed || placement === 'popup') && (
        <div className={`hidden md:block fixed top-3 ${placement === 'right' ? 'right-3' : 'left-3'} z-30`}>
          <button
            type="button"
            onClick={() => {
              if (placement === 'popup') {
                setIsMobileDrawerOpen((prev) => !prev);
              } else {
                toggleSidebarCollapse();
              }
            }}
            className="p-2 rounded-lg border shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none flex items-center justify-center gap-1.5 font-mono text-xs"
            style={{
              backgroundColor: 'var(--card-main)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-heading)',
            }}
            title={placement === 'popup' ? "Open navigation drawer (Cmd+\\)" : "Expand sidebar (Cmd+\\)"}
            aria-label="Toggle sidebar"
          >
            {placement === 'right' ? <PanelRight className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            <span className="hidden lg:inline text-[11px] font-sans">Sidebar</span>
          </button>
        </div>
      )}

      {/* Main Layout Area — Normal Flow */}
      <div className={`flex-1 flex w-full ${layoutDirectionClass}`}>
        {/* Full-Height Sidebar in Normal Flow */}
        <Sidebar
          config={config}
          tree={fileTree}
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={(id) => {
            setActiveNoteId(id);
            setSelectedFolder(null);
            setSelectedTag(null);
            setIsMobileDrawerOpen(false);
          }}
          selectedTag={selectedTag}
          onSelectTag={(tag) => {
            setSelectedTag(tag);
            setSelectedFolder(null);
            setIsMobileDrawerOpen(false);
          }}
          selectedFolder={selectedFolder}
          onSelectFolder={(folder) => {
            setSelectedFolder(folder);
            setSelectedTag(null);
            setIsMobileDrawerOpen(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          activeNote={selectedFolder || selectedTag ? null : activeNote}
          isOpen={isMobileDrawerOpen}
          onClose={handleCloseSidebar}
          placement={placement}
          onChangePlacement={handlePlacementChange}
          onOpenSearch={() => {
            setIsSearchOpen(true);
          }}
          isDark={isDark}
          onToggleColorMode={handleToggleColorMode}
        />

        {/* Content Container */}
        <main className={`flex-1 min-w-0 pb-16 transition-all duration-200 ${placement === 'popup' || isSidebarCollapsed ? 'max-w-4xl mx-auto w-full' : ''}`}>
          {selectedFolder ? (
            /* Automatically generated Folder Subpages Index View */
            <FolderView
              folderPath={selectedFolder}
              notes={notes}
              config={config}
              onSelectNote={(id) => {
                setActiveNoteId(id);
                setSelectedFolder(null);
                setSelectedTag(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectFolder={(folder) => {
                setSelectedFolder(folder);
                setSelectedTag(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectTag={(tag) => {
                setSelectedTag(tag);
                setSelectedFolder(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onBackToHome={() => {
                setSelectedFolder(null);
                const home = notes.find((n) => n.filePath === 'index.md');
                if (home) setActiveNoteId(home.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          ) : selectedTag ? (
            /* Tag / Topic Results View */
            <div className="max-w-3xl mx-auto px-4 sm:px-8 py-10">
              <div 
                className="flex items-center justify-between pb-4 mb-6 border-b"
                style={{ borderColor: 'var(--border-main)' }}
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <h1 
                    className="text-xl font-bold font-mono"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    #{selectedTag}
                  </h1>
                  <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                    ({tagFilteredNotes.length} notes)
                  </span>
                </div>
                <button
                  onClick={() => setSelectedTag(null)}
                  className="text-xs hover:underline cursor-pointer"
                  style={{ color: 'var(--accent)' }}
                >
                  Clear Tag Filter
                </button>
              </div>

              <div className="space-y-3">
                {tagFilteredNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => {
                      setActiveNoteId(note.id);
                      setSelectedTag(null);
                      setSelectedFolder(null);
                    }}
                    title={note.title}
                    className="group relative p-4 rounded-lg border cursor-pointer transition-all hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--card-main)',
                      borderColor: 'var(--border-main)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="relative group/topic flex-1 min-w-0">
                        <h3 
                          title={note.title}
                          className="font-semibold text-sm truncate group-hover/topic:underline"
                          style={{ color: 'var(--text-heading)' }}
                        >
                          {note.title}
                        </h3>

                        {/* Floating Full Title Badge on Hover */}
                        <div 
                          role="tooltip"
                          className="absolute left-0 bottom-full mb-1 hidden group-hover:flex items-center z-30 pointer-events-none transition-all duration-150 animate-fadeIn"
                        >
                          <div 
                            className="px-2.5 py-1 text-xs font-medium rounded-md shadow-xl border backdrop-blur-md max-w-sm sm:max-w-md break-words"
                            style={{
                              backgroundColor: 'var(--card-main)',
                              borderColor: 'var(--border-main)',
                              color: 'var(--text-heading)',
                            }}
                          >
                            {note.title}
                          </div>
                        </div>
                      </div>
                      {note.date && (
                        <span className="text-[11px] font-mono shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
                          {note.date}
                        </span>
                      )}
                    </div>
                    <p 
                      className="text-xs line-clamp-2"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {note.description}
                    </p>
                    <div 
                      className="flex items-center gap-2 mt-2 text-[10px] font-mono flex-wrap"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {note.folder ? <span>folder: {note.folder}</span> : <span>root page</span>}
                      <span>·</span>
                      <span>{note.readingTimeMinutes} min read</span>
                      {note.tags.length > 0 && (
                        <>
                          <span>·</span>
                          <div className="flex items-center gap-1">
                            {note.tags.map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(t);
                                  setSelectedFolder(null);
                                }}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono border hover:opacity-80 transition-opacity cursor-pointer"
                                style={{
                                  backgroundColor: 'var(--bg-main)',
                                  borderColor: 'var(--border-main)',
                                  color: 'var(--accent)',
                                }}
                              >
                                #{t}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeNote ? (
            <NoteView
              note={activeNote}
              allNotes={notes}
              config={config}
              onSelectNote={(id) => {
                setActiveNoteId(id);
                setSelectedFolder(null);
                setSelectedTag(null);
              }}
              onSelectFolder={(folder) => {
                setSelectedFolder(folder);
                setSelectedTag(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onSelectTag={(tag) => {
                setSelectedTag(tag);
                setSelectedFolder(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              prevNote={prevNote}
              nextNote={nextNote}
            />
          ) : (
            <div 
              className="text-center py-20 text-sm font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              No notes found in this directory.
            </div>
          )}
        </main>
      </div>

      {/* Reading Progress Indicator opposite of the sidebar */}
      {!selectedFolder && !selectedTag && activeNote && (
        <OppositeProgressBar
          sidebarPlacement={placement}
          headings={activeNote.headings}
          title={activeNote.title}
        />
      )}

      {/* Instant Search Modal (Cmd+K) */}
      <SearchModal
        notes={notes}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNote={(id) => {
          setActiveNoteId(id);
          setSelectedTag(null);
          setSelectedFolder(null);
        }}
        onSelectTag={(tag) => {
          setSelectedTag(tag);
          setSelectedFolder(null);
        }}
      />
    </div>
  );
}
