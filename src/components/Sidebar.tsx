import React, { useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  X,
  Search,
  Moon,
  Sun,
  Pin,
  Tag,
} from 'lucide-react';
import { FileTreeNode, FolderNode, NoteFileNode, NoteItem, SiteConfig, SidebarPlacement, SidebarMode } from '../types';

interface SidebarProps {
  config: SiteConfig;
  tree: FolderNode;
  notes: NoteItem[];
  activeNote?: NoteItem | null;
  activeNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  selectedFolder?: string | null;
  onSelectFolder?: (folderPath: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  sidebarMode: SidebarMode;
  onSetSidebarMode: (mode: SidebarMode) => void;
  isAutoPeekOpen?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  isOpen: boolean;
  onClose: () => void;
  placement: SidebarPlacement;
  onOpenSearch: () => void;
  isDark: boolean;
  onToggleColorMode: () => void;
  isTagsView?: boolean;
  onViewAllTags?: () => void;
  isPinnedView?: boolean;
  onViewPinned?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  config,
  tree,
  notes,
  activeNote,
  activeNoteId,
  onSelectNote,
  selectedTag,
  onSelectTag,
  selectedFolder,
  onSelectFolder,
  sidebarMode,
  onSetSidebarMode,
  isAutoPeekOpen = false,
  onMouseEnter,
  onMouseLeave,
  isOpen,
  onClose,
  placement,
  onOpenSearch,
  isDark,
  onToggleColorMode,
  isTagsView,
  onViewAllTags,
  isPinnedView,
  onViewPinned,
}) => {
  const isPopup = placement === 'popup';
  const isRight = placement === 'right';

  // Track expanded state of folders
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    const expandAll = (node: FolderNode) => {
      initial[node.path] = config.navigation.defaultExpandedFolders;
      for (const child of node.children) {
        if (child.isFolder) {
          expandAll(child);
        }
      }
    };
    expandAll(tree);
    return initial;
  });

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const pinnedNotes = notes.filter((n) => n.pinned);

  // Collect distinct tags for quick tag browsing
  const allTags = React.useMemo(() => {
    const set = new Set<string>();
    for (const n of notes) {
      for (const t of n.tags) {
        set.add(t);
      }
    }
    return Array.from(set).sort();
  }, [notes]);

  // Separate root-level notes from folders
  const rootNotes = tree.children.filter((child): child is NoteFileNode => !child.isFolder);
  const folderNodes = tree.children.filter((child): child is FolderNode => child.isFolder);

  const renderTreeNode = (node: FileTreeNode, depth = 0) => {
    if (node.isFolder) {
      const folder = node as FolderNode;
      const isExpanded = expandedFolders[folder.path] ?? false;
      const isFolderActive = selectedFolder === folder.path;

      return (
        <div key={folder.path} className="space-y-0.5 select-none">
          <div
            onClick={() => {
              if (onSelectFolder) {
                onSelectFolder(folder.path);
              } else {
                toggleFolder(folder.path);
              }
              if (isPopup || window.innerWidth < 768) {
                onClose();
              }
            }}
            className={`flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer text-xs font-medium transition-colors ${
              isFolderActive ? 'font-semibold' : 'hover:opacity-85'
            }`}
            style={{ 
              paddingLeft: `${depth * 12 + 8}px`,
              backgroundColor: isFolderActive ? 'var(--card-main)' : 'transparent',
              color: isFolderActive ? 'var(--text-heading)' : 'var(--text-main)',
              border: isFolderActive ? '1px solid var(--border-main)' : '1px solid transparent',
            }}
          >
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(folder.path);
                }}
                className="p-0.5 -ml-1 rounded hover:opacity-80"
                style={{ color: 'var(--text-muted)' }}
                title={isExpanded ? 'Collapse folder' : 'Expand folder'}
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
              <span style={{ color: 'var(--text-muted)' }}>
                {isExpanded ? <FolderOpen className="w-3.5 h-3.5" /> : <Folder className="w-3.5 h-3.5" />}
              </span>
              <span className="truncate font-mono tracking-tight" title={folder.name}>{folder.name}</span>
            </div>
          </div>

          {isExpanded && (
            <div className="space-y-0.5">
              {folder.children.map((child) => renderTreeNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    const fileNode = node as NoteFileNode;
    const isNoteActive = fileNode.noteId === activeNoteId && !selectedFolder && !selectedTag && !isTagsView && !isPinnedView;

    return (
      <div
        key={fileNode.path}
        onClick={() => {
          onSelectNote(fileNode.noteId);
          if (isPopup || window.innerWidth < 768) {
            onClose();
          }
        }}
        className={`group relative flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer text-xs transition-colors ${
          isNoteActive ? 'font-medium shadow-xs' : 'hover:opacity-85'
        }`}
        style={{ 
          paddingLeft: `${depth * 12 + 8}px`,
          backgroundColor: isNoteActive ? 'var(--card-main)' : 'transparent',
          color: isNoteActive ? 'var(--text-heading)' : 'var(--text-main)',
          border: isNoteActive ? '1px solid var(--border-main)' : '1px solid transparent',
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <FileText className="w-3 h-3 shrink-0" style={{ color: isNoteActive ? 'var(--accent)' : 'var(--text-muted)' }} />
          <div className="truncate flex-1 font-mono text-[11px]">
            {fileNode.note.title}
          </div>
        </div>
      </div>
    );
  };

  let positioningClasses = '';
  if (isPopup) {
    positioningClasses = `fixed top-0 bottom-0 z-50 w-72 sm:w-80 shadow-2xl transition-transform duration-200 ease-out will-change-transform ${
      isOpen ? 'left-0 translate-x-0' : 'left-0 -translate-x-full pointer-events-none'
    }`;
  } else if (isRight) {
    const mobileDrawer = `fixed top-0 bottom-0 right-0 z-50 w-72 sm:w-80 h-screen shadow-2xl transition-transform duration-200 ease-out will-change-transform ${
      isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
    }`;
    let desktopDock = '';
    if (sidebarMode === 'collapse') {
      desktopDock = 'md:sticky md:top-0 md:h-screen md:shrink-0 md:w-0 md:border-none md:overflow-hidden md:pointer-events-none md:opacity-0 md:translate-x-0 md:shadow-none';
    } else if (sidebarMode === 'autohide') {
      desktopDock = `md:fixed md:top-0 md:bottom-0 md:right-0 md:z-50 md:w-72 lg:md:w-80 md:h-screen md:shadow-2xl md:border-l transition-all duration-200 ease-out ${
        isAutoPeekOpen ? 'md:translate-x-0 md:opacity-100 md:pointer-events-auto' : 'md:translate-x-full md:opacity-0 md:pointer-events-none'
      }`;
    } else {
      desktopDock = 'md:sticky md:top-0 md:h-screen md:shrink-0 md:w-72 lg:md:w-80 md:border-l md:opacity-100 md:pointer-events-auto md:translate-x-0 md:shadow-none';
    }
    positioningClasses = `${mobileDrawer} ${desktopDock} transition-all duration-200`;
  } else {
    const mobileDrawer = `fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 h-screen shadow-2xl transition-transform duration-200 ease-out will-change-transform ${
      isOpen ? 'translate-x-0' : '-translate-x-full pointer-events-none'
    }`;
    let desktopDock = '';
    if (sidebarMode === 'collapse') {
      desktopDock = 'md:sticky md:top-0 md:h-screen md:shrink-0 md:w-0 md:border-none md:overflow-hidden md:pointer-events-none md:opacity-0 md:translate-x-0 md:shadow-none';
    } else if (sidebarMode === 'autohide') {
      desktopDock = `md:fixed md:top-0 md:bottom-0 md:left-0 md:z-50 md:w-72 lg:md:w-80 md:h-screen md:shadow-2xl md:border-r transition-all duration-200 ease-out ${
        isAutoPeekOpen ? 'md:translate-x-0 md:opacity-100 md:pointer-events-auto' : 'md:-translate-x-full md:opacity-0 md:pointer-events-none'
      }`;
    } else {
      desktopDock = 'md:sticky md:top-0 md:h-screen md:shrink-0 md:w-72 lg:md:w-80 md:border-r md:opacity-100 md:pointer-events-auto md:translate-x-0 md:shadow-none';
    }
    positioningClasses = `${mobileDrawer} ${desktopDock} transition-all duration-200`;
  }

  return (
    <>
      {/* Backdrop for mobile or popup mode */}
      {isOpen && (
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity ${
            isPopup ? 'z-45 block' : 'z-45 md:hidden'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        />
      )}

      {/* Auto-hide backdrop on desktop to quickly dismiss when clicking outside */}
      {sidebarMode === 'autohide' && isAutoPeekOpen && (
        <div 
          className="hidden md:block fixed inset-0 z-45 bg-black/20 backdrop-blur-[1px] transition-opacity"
          onClick={onMouseLeave}
        />
      )}

      <aside 
        className={`${positioningClasses} flex flex-col`}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          backgroundColor: 'var(--sidebar-main)',
          borderColor: 'var(--border-main)',
          color: 'var(--text-main)',
        }}
      >
        <div className="w-72 sm:w-72 lg:w-80 flex flex-col h-full min-h-0">
        {/* Top Header / Author Profile */}
        <div 
          className="p-5 border-b"
          style={{ borderColor: 'var(--border-main)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              {config.avatarUrl ? (
                <img 
                  src={config.avatarUrl} 
                  alt={config.author} 
                  className="w-13 h-13 rounded-full object-cover shadow-sm shrink-0 border" 
                  style={{ borderColor: 'var(--border-main)' }}
                />
              ) : (
                <div 
                  className="w-13 h-13 rounded-full flex items-center justify-center font-bold text-lg shrink-0 border"
                  style={{ 
                    backgroundColor: 'var(--card-main)', 
                    color: 'var(--accent)',
                    borderColor: 'var(--border-main)' 
                  }}
                >
                  {config.author.charAt(0)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h2 
                  className="text-base font-bold tracking-tight truncate"
                  style={{ color: 'var(--text-heading)' }}
                >
                  {config.author}
                </h2>
                <p 
                  className="text-xs font-medium line-clamp-1 mt-0.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {config.tagline}
                </p>

                {/* Social icons */}
                <div className="flex items-center gap-2.5 mt-2.5">
                  {config.social.github && (
                    <a 
                      href={config.social.github} 
                      target="_blank" 
                      rel="noreferrer"
                      className="hover:opacity-75 transition-opacity"
                      style={{ color: 'var(--text-muted)' }}
                      title="GitHub"
                    >
                      <Github className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {config.social.twitter && (
                    <a 
                      href={config.social.twitter} 
                      target="_blank" 
                      rel="noreferrer"
                      className="hover:opacity-75 transition-opacity"
                      style={{ color: 'var(--text-muted)' }}
                      title="Twitter / X"
                    >
                      <Twitter className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {config.social.linkedin && (
                    <a 
                      href={config.social.linkedin} 
                      target="_blank" 
                      rel="noreferrer"
                      className="hover:opacity-75 transition-opacity"
                      style={{ color: 'var(--text-muted)' }}
                      title="LinkedIn"
                    >
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {config.social.email && (
                    <a 
                      href={`mailto:${config.social.email}`} 
                      className="hover:opacity-75 transition-opacity"
                      style={{ color: 'var(--text-muted)' }}
                      title="Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile / Popup close button */}
            {(isPopup || (typeof window !== 'undefined' && window.innerWidth < 768)) && (
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-1.5 rounded-md hover:opacity-80 transition-opacity border cursor-pointer md:hidden shrink-0"
                style={{ 
                  borderColor: 'var(--border-main)',
                  backgroundColor: 'var(--card-main)',
                  color: 'var(--text-muted)' 
                }}
                title="Close sidebar"
                aria-label="Close sidebar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {config.bio && (
            <p 
              className="mt-3 text-xs leading-relaxed"
              style={{ color: 'var(--text-muted)' }}
            >
              {config.bio}
            </p>
          )}
        </div>

        {/* Search & Sidebar Mode Controls (Show, Auto-hide, Collapse) */}
        <div 
          className="p-3 border-b space-y-2.5"
          style={{ borderColor: 'var(--border-main)' }}
        >
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg border transition-all hover:border-[var(--accent)] group shadow-xs cursor-pointer focus:outline-none"
            style={{
              backgroundColor: 'var(--card-main)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-muted)',
            }}
            title="Search notes (Cmd+K)"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Search className="w-3.5 h-3.5 group-hover:text-[var(--accent)] transition-colors shrink-0" style={{ color: 'var(--accent)' }} />
              <span className="truncate">Search notes...</span>
            </div>
            <kbd 
              className="font-mono text-[10px] px-1.5 py-0.5 rounded border shrink-0"
              style={{ 
                borderColor: 'var(--border-main)',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-muted)'
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Theme & 3-Mode Sidebar Controls */}
          <div className="flex items-center justify-between gap-2">
            {/* Light / Dark Mode Toggle Button */}
            <button
              type="button"
              onClick={onToggleColorMode}
              className="p-1.5 px-2 rounded-lg border hover:opacity-85 transition-all cursor-pointer flex items-center gap-1.5 shadow-xs text-xs font-mono"
              style={{
                backgroundColor: 'var(--card-main)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-heading)',
              }}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Light / Dark mode"
            >
              {isDark ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span className="text-[11px]">{isDark ? 'Dark' : 'Light'}</span>
            </button>

            {/* 3-Mode Sidebar Selector: Show | Auto | Hide */}
            <div 
              className="flex items-center rounded-lg border p-0.5 text-[11px] font-mono select-none"
              style={{
                backgroundColor: 'var(--card-main)',
                borderColor: 'var(--border-main)',
              }}
              title="Sidebar visibility mode"
            >
              <button
                type="button"
                onClick={() => onSetSidebarMode('show')}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${
                  sidebarMode === 'show' ? 'font-bold shadow-xs' : 'opacity-65 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: sidebarMode === 'show' ? 'var(--bg-main)' : 'transparent',
                  color: sidebarMode === 'show' ? 'var(--text-heading)' : 'var(--text-muted)',
                  border: sidebarMode === 'show' ? '1px solid var(--border-main)' : '1px solid transparent',
                }}
                title="Show: Pinned permanently in normal flow"
              >
                Show
              </button>
              <button
                type="button"
                onClick={() => onSetSidebarMode('autohide')}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${
                  sidebarMode === 'autohide' ? 'font-bold shadow-xs' : 'opacity-65 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: sidebarMode === 'autohide' ? 'var(--bg-main)' : 'transparent',
                  color: sidebarMode === 'autohide' ? 'var(--text-heading)' : 'var(--text-muted)',
                  border: sidebarMode === 'autohide' ? '1px solid var(--border-main)' : '1px solid transparent',
                }}
                title="Auto-hide: Hidden while reading, reveals on hover"
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => onSetSidebarMode('collapse')}
                className={`px-2 py-1 rounded transition-all cursor-pointer ${
                  sidebarMode === 'collapse' ? 'font-bold shadow-xs' : 'opacity-65 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: sidebarMode === 'collapse' ? 'var(--bg-main)' : 'transparent',
                  color: sidebarMode === 'collapse' ? 'var(--text-heading)' : 'var(--text-muted)',
                  border: sidebarMode === 'collapse' ? '1px solid var(--border-main)' : '1px solid transparent',
                }}
                title="Collapse: Always keep collapsed"
              >
                Hide
              </button>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Pinned Page Navigation Item */}
          {pinnedNotes.length > 0 && (
            <div
              onClick={() => {
                onViewPinned?.();
                if (isPopup || window.innerWidth < 768) onClose();
              }}
              className={`flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer text-xs font-medium transition-colors select-none ${
                isPinnedView ? 'font-semibold shadow-xs' : 'hover:opacity-85'
              }`}
              style={{
                backgroundColor: isPinnedView ? 'var(--card-main)' : 'transparent',
                color: isPinnedView ? 'var(--text-heading)' : 'var(--text-main)',
                border: isPinnedView ? '1px solid var(--border-main)' : '1px solid transparent',
              }}
              title="Browse pinned pages"
            >
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Pin className="w-3.5 h-3.5 rotate-45" style={{ color: 'var(--text-muted)' }} />
                <span className="truncate font-mono">Pinned</span>
              </div>

              <span 
                className="text-[10px] font-mono px-1.5 py-0.5 rounded border" 
                style={{ 
                  backgroundColor: 'var(--bg-main)',
                  borderColor: 'var(--border-main)',
                  color: 'var(--text-muted)' 
                }}
                title={`${pinnedNotes.length} pinned pages`}
              >
                {pinnedNotes.length}
              </span>
            </div>
          )}

          {/* Folder Categories */}
          {folderNodes.length > 0 && (
            <div>
              <div 
                className="text-[11px] font-semibold uppercase tracking-wider font-mono mb-1.5 px-2 flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <Folder className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                <span>Folders</span>
              </div>
              <div className="space-y-0.5">
                {folderNodes.map((folderNode) => renderTreeNode(folderNode, 0))}
              </div>
            </div>
          )}

          {/* Standalone pages outside folders */}
          {rootNotes.length > 0 && (
            <div>
              <div 
                className="text-[11px] font-semibold uppercase tracking-wider font-mono mb-1.5 px-2 flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <FileText className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                <span>Pages</span>
              </div>
              <div className="space-y-0.5">
                {rootNotes.map((rootNode) => renderTreeNode(rootNode, 0))}
              </div>
            </div>
          )}

          {/* Tags Directory Page Navigation Entry */}
          {allTags.length > 0 && (
            <div
              onClick={() => {
                onViewAllTags?.();
                if (isPopup || window.innerWidth < 768) onClose();
              }}
              className={`flex items-center justify-between py-1.5 px-2 rounded-md cursor-pointer text-xs font-medium transition-colors select-none ${
                isTagsView && !selectedTag ? 'font-semibold shadow-xs' : 'hover:opacity-85'
              }`}
              style={{
                backgroundColor: isTagsView && !selectedTag ? 'var(--card-main)' : 'transparent',
                color: isTagsView && !selectedTag ? 'var(--text-heading)' : 'var(--text-main)',
                border: isTagsView && !selectedTag ? '1px solid var(--border-main)' : '1px solid transparent',
              }}
              title="Browse all tags"
            >
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Tag className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                <span className="truncate font-mono">Tags</span>
              </div>

              <span 
                className="text-[10px] font-mono px-1.5 py-0.5 rounded border" 
                style={{ 
                  backgroundColor: 'var(--bg-main)',
                  borderColor: 'var(--border-main)',
                  color: 'var(--text-muted)' 
                }}
                title={`${allTags.length} tags`}
              >
                {allTags.length}
              </span>
            </div>
          )}
        </div>
        </div>
      </aside>
    </>
  );
};
