import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { NoteView } from './components/NoteView';
import { SearchModal } from './components/SearchModal';
import { NoteItem, SidebarPlacement } from './types';
import { loadContentFromMarkdown } from './utils/contentLoader';
import { buildFileTree, computeBacklinks } from './utils/fileTree';
import { resolveNote } from './utils/noteResolver';
import { 
  CALIBRATED_PALETTES, 
  parseYamlConfig 
} from './utils/yamlConfig';
import rawYamlConfig from '../kyar-kyar.config.yaml?raw';
import { Tag, PanelLeft, PanelRight } from 'lucide-react';

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
    const darkKey = config.theme.darkPalette || config.theme.palette || 'nord';
    return CALIBRATED_PALETTES[darkKey] || CALIBRATED_PALETTES['nord'];
  }, [config.theme.lightPalette, config.theme.darkPalette, config.theme.palette, isDark]);

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
  }, [activePalette, isDark, config.theme.accentColor, config.theme.customColors, config.theme.lightPalette]);

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

  // Sync URL hash with active note or active tag
  useEffect(() => {
    if (selectedTag) {
      window.history.replaceState(null, '', `#/tag/${encodeURIComponent(selectedTag)}`);
      document.title = `#${selectedTag} — ${config.author}`;
    } else {
      const active = notes.find((n) => n.id === activeNoteId);
      if (active) {
        window.history.replaceState(null, '', `#/note/${active.slug}`);
        document.title = `${active.title} — ${config.author}`;
      }
    }
  }, [selectedTag, activeNoteId, notes, config.author]);

  // Listen for browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/tag/')) {
        const rawTag = decodeURIComponent(hash.replace('#/tag/', ''));
        setSelectedTag(rawTag);
      } else if (hash.startsWith('#/note/')) {
        setSelectedTag(null);
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

  // Modals / Drawers State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(() => {
    if (config.theme.sidebarPlacement === 'popup') return false;
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 768;
    }
    return true;
  });
  const [isSidebarPinned, setIsSidebarPinned] = useState(true);
  const isHoverPeekRef = React.useRef(false);

  // Global keyboard shortcuts (Cmd+K / Ctrl+K for search, Cmd+\ or Ctrl+\ or Cmd+B for sidebar toggle)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === '\\' || e.key.toLowerCase() === 'b')) {
        e.preventDefault();
        setIsSidebarOpen((prev) => {
          const next = !prev;
          setIsSidebarPinned(next);
          isHoverPeekRef.current = false;
          return next;
        });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-hide sidebar when user starts reading (scrolling down into note)
  useEffect(() => {
    let lastScrollY = window.scrollY || document.documentElement.scrollTop;

    const handleScroll = () => {
      const currentScrollY = window.scrollY || document.documentElement.scrollTop;

      // When the user starts reading and scrolls down into content:
      // Immediately disappear the sidebar for distraction-free reading
      if (currentScrollY > 30 && currentScrollY > lastScrollY + 5) {
        setIsSidebarOpen(false);
        setIsSidebarPinned(false);
        isHoverPeekRef.current = false;
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hover effect: when sidebar is closed, hovering near the screen edge peeks it open
  const handleEdgeHover = () => {
    if (!isSidebarOpen) {
      setIsSidebarOpen(true);
      isHoverPeekRef.current = true;
    }
  };

  // If user peeked via hover without clicking, moving the mouse away hides it
  const handleSidebarMouseLeave = () => {
    if (isHoverPeekRef.current && !isSidebarPinned) {
      setIsSidebarOpen(false);
      isHoverPeekRef.current = false;
    }
  };

  // When clicked on sidebar, it remains open (pinned) so it doesn't disappear on mouse move
  const handleSidebarClick = () => {
    setIsSidebarPinned(true);
    isHoverPeekRef.current = false;
  };

  // Explicit close (X button or backdrop)
  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
    setIsSidebarPinned(false);
    isHoverPeekRef.current = false;
  };

  const handleToggleSidebar = () => {
    if (isSidebarOpen) {
      handleCloseSidebar();
    } else {
      setIsSidebarOpen(true);
      setIsSidebarPinned(true);
      isHoverPeekRef.current = false;
    }
  };

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

  const patternClass = `pattern-${config.theme.backgroundPattern || 'dots'}`;

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
      }}
    >
      {/* Floating Sidebar Toggle Button when sidebar is closed */}
      {!isSidebarOpen && (
        <div 
          className={`fixed top-3 ${placement === 'right' ? 'right-3' : 'left-3'} z-40`}
          onMouseEnter={handleEdgeHover}
        >
          <button
            type="button"
            onClick={handleToggleSidebar}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border shadow-md backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer focus:outline-none"
            style={{
              backgroundColor: 'var(--card-main)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-heading)',
            }}
            title="Open sidebar (⌘\ or hover here)"
            aria-label="Open sidebar"
          >
            {placement === 'right' ? <PanelRight className="w-4 h-4" /> : <PanelLeft className="w-4 h-4" />}
            <span className="text-xs font-mono font-medium hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
              Sidebar
            </span>
          </button>
        </div>
      )}

      {/* Subtle edge hover zone to bring the sidebar back on hover only when reading */}
      {!isSidebarOpen && (
        <div 
          className={`fixed top-0 bottom-0 ${placement === 'right' ? 'right-0' : 'left-0'} w-4 sm:w-6 z-30 cursor-pointer pointer-events-auto`}
          onMouseEnter={handleEdgeHover}
          title="Hover to reveal sidebar"
        />
      )}

      {/* Main Layout Area — Edge-to-edge with no outer margin gaps */}
      <div className={`flex-1 flex w-full ${layoutDirectionClass}`}>
        {/* Full-Height Sidebar with Author Profile, Search & Theme Controls */}
        <Sidebar
          config={config}
          tree={fileTree}
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={(id) => {
            setActiveNoteId(id);
            setSelectedTag(null);
            setIsSidebarPinned(true);
          }}
          selectedTag={selectedTag}
          onSelectTag={(tag) => {
            setSelectedTag(tag);
            setIsSidebarPinned(true);
          }}
          isOpen={isSidebarOpen}
          onClose={handleCloseSidebar}
          placement={placement}
          onChangePlacement={handlePlacementChange}
          onOpenSearch={() => {
            setIsSearchOpen(true);
            setIsSidebarPinned(true);
          }}
          isDark={isDark}
          onToggleColorMode={handleToggleColorMode}
          onSidebarClick={handleSidebarClick}
          onMouseLeave={handleSidebarMouseLeave}
        />

        {/* Content Container */}
        <main className={`flex-1 min-w-0 pb-16 transition-all duration-200 ${placement === 'popup' || !isSidebarOpen ? 'max-w-4xl mx-auto w-full' : ''}`}>
          {selectedTag ? (
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
                  className="text-xs hover:underline"
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
                    }}
                    className="p-4 rounded-lg border cursor-pointer transition-all hover:opacity-90"
                    style={{
                      backgroundColor: 'var(--card-main)',
                      borderColor: 'var(--border-main)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 
                        className="font-semibold text-sm truncate"
                        style={{ color: 'var(--text-heading)' }}
                      >
                        {note.title}
                      </h3>
                      {note.date && (
                        <span className="text-[11px] font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
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
                      {note.folder ? <span>📂 {note.folder}</span> : <span>📄 Standalone page</span>}
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
                                }}
                                className="px-1.5 py-0.5 rounded text-[10px] font-mono border hover:opacity-80 transition-opacity"
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
              onSelectNote={setActiveNoteId}
              onSelectTag={setSelectedTag}
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

      {/* Instant Search Modal (Cmd+K) */}
      <SearchModal
        notes={notes}
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectNote={(id) => {
          setActiveNoteId(id);
          setSelectedTag(null);
        }}
        onSelectTag={setSelectedTag}
      />
    </div>
  );
}
