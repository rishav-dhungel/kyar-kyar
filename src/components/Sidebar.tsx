import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  ChevronDown, 
  ChevronRight, 
  Pin, 
  PinOff,
  Github, 
  Twitter, 
  Linkedin,
  Mail, 
  X,
  Compass,
  PanelLeft,
  PanelRight,
  PanelLeftClose,
  PanelRightClose,
  Sidebar as SidebarIcon,
  Search,
  Moon,
  Sun,
} from 'lucide-react';
import { FileTreeNode, FolderNode, NoteFileNode, NoteItem, SiteConfig, SidebarPlacement } from '../types';

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
  isAutoHideMode: boolean;
  isCollapsed?: boolean;
  onToggleAutoHide: () => void;
  isOpen: boolean;
  onClose: () => void;
  placement: SidebarPlacement;
  onChangePlacement: (placement: SidebarPlacement) => void;
  onOpenSearch: () => void;
  isDark: boolean;
  onToggleColorMode: () => void;
  onSidebarClick?: () => void;
  onMouseLeave?: () => void;
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
  isAutoHideMode,
  isCollapsed,
  onToggleAutoHide,
  isOpen,
  onClose,
  placement,
  onChangePlacement,
  onOpenSearch,
  isDark,
  onToggleColorMode,
  onSidebarClick,
  onMouseLeave,
}) => {
  const isPopup = placement === 'popup';
  const isRight = placement === 'right';

  // Store expanded state of folder paths
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    function populate(node: FolderNode) {
      initial[node.path] = config.navigation.defaultExpandedFolders;
      for (const child of node.children) {
        if (child.isFolder) {
          populate(child);
        }
      }
    }
    populate(tree);
    return initial;
  });

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  // Separate root-level notes (outside folders) from folders
  const rootNotes = React.useMemo(() => {
    return tree.children.filter((child) => !child.isFolder) as NoteFileNode[];
  }, [tree]);

  const folderNodes = React.useMemo(() => {
    return tree.children.filter((child) => child.isFolder) as FolderNode[];
  }, [tree]);

  const renderTreeNode = (node: FileTreeNode, depth = 0) => {
    if (node.isFolder) {
      const folder = node as FolderNode;
      const isExpanded = expandedFolders[folder.path] !== false;

      const isFolderActive = selectedFolder === folder.path;

      return (
        <div key={`folder-${folder.path}`} className="select-none my-0.5">
          <div 
            onClick={() => {
              if (!isExpanded) toggleFolder(folder.path);
              onSelectFolder?.(folder.path);
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
              borderLeft: isFolderActive ? '2px solid var(--accent)' : '2px solid transparent',
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
              <span style={{ color: 'var(--accent)' }}>
                {isExpanded ? <FolderOpen className="w-3.5 h-3.5" /> : <Folder className="w-3.5 h-3.5" />}
              </span>
              <span className="truncate font-mono tracking-tight" title={folder.name}>{folder.name}</span>
            </div>

            {config.navigation.showFolderCounts && (
              <span 
                className="text-[10px] font-mono px-1 py-0.2 rounded" 
                style={{ color: 'var(--text-muted)' }}
                title={`${folder.children.filter((c) => !c.isFolder).length} subpages`}
              >
                {folder.children.filter((c) => !c.isFolder).length}
              </span>
            )}
          </div>

          {isExpanded && (
            <div className="space-y-0.5">
              {folder.children.map((child) => renderTreeNode(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    // Note file
    const fileNode = node as NoteFileNode;
    const isActive = fileNode.noteId === activeNoteId;

    return (
      <div
        key={`file-${fileNode.noteId}`}
        onClick={() => {
          onSelectNote(fileNode.noteId);
          if (isPopup || window.innerWidth < 768) {
            onClose();
          }
        }}
        title={fileNode.note.title}
        className={`group relative flex items-center justify-between py-1.5 px-2 rounded-md text-xs cursor-pointer transition-colors ${
          isActive ? 'font-medium shadow-xs' : 'hover:opacity-85'
        }`}
        style={{ 
          paddingLeft: `${depth * 12 + 16}px`,
          backgroundColor: isActive ? 'var(--card-main)' : 'transparent',
          color: isActive ? 'var(--text-heading)' : 'var(--text-main)',
          borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        }}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          {fileNode.note.pinned ? (
            <Pin className="w-3 h-3 text-amber-500 shrink-0 rotate-45" />
          ) : (
            <FileText 
              className="w-3.5 h-3.5 shrink-0 opacity-70" 
              style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }} 
            />
          )}
          <span className="truncate flex-1" title={fileNode.note.title}>{fileNode.note.title}</span>
        </div>

        {fileNode.note.date && (
          <span className="text-[10px] font-mono hidden group-hover:inline shrink-0 ml-1" style={{ color: 'var(--text-muted)' }}>
            {fileNode.note.date.slice(5)}
          </span>
        )}

        {/* Hover Tooltip displaying full title of topic */}
        <div 
          role="tooltip"
          className={`absolute ${isRight ? 'right-full mr-2' : 'left-full ml-2'} top-1/2 -translate-y-1/2 hidden group-hover:flex items-center z-50 pointer-events-none transition-all duration-150 animate-fadeIn`}
        >
          <div 
            className="px-2.5 py-1 text-xs rounded-md shadow-xl border whitespace-normal max-w-xs break-words font-medium backdrop-blur-md"
            style={{
              backgroundColor: 'var(--card-main)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-heading)',
            }}
          >
            {fileNode.note.title}
          </div>
        </div>
      </div>
    );
  };

  // Determine slide-in / dock classes based on placement, isAutoHideMode, and isOpen state
  const isEffectiveAutoHide = isCollapsed !== undefined ? isCollapsed : isAutoHideMode;

  let positioningClasses = '';
  if (isPopup) {
    positioningClasses = `fixed top-0 bottom-0 z-50 w-72 lg:w-80 shadow-2xl transition-transform duration-200 ease-out will-change-transform ${
      isOpen ? 'left-0 translate-x-0' : 'left-0 -translate-x-full pointer-events-none'
    }`;
  } else if (isRight) {
    positioningClasses = isEffectiveAutoHide
      ? `fixed top-0 bottom-0 right-0 z-50 h-screen w-72 lg:w-80 border-l shadow-2xl transition-transform duration-200 ease-out will-change-transform ${
          isOpen ? 'translate-x-0 pointer-events-auto' : 'translate-x-full pointer-events-none'
        }`
      : `fixed md:sticky top-0 bottom-0 z-40 md:z-20 h-screen shrink-0 transition-opacity duration-150 ${
          isOpen 
            ? 'right-0 translate-x-0 w-72 lg:w-80 border-l opacity-100' 
            : 'right-0 translate-x-full md:translate-x-0 w-0 md:w-0 border-transparent opacity-0 pointer-events-none overflow-hidden'
        }`;
  } else {
    // Left placement
    positioningClasses = isEffectiveAutoHide
      ? `fixed top-0 bottom-0 left-0 z-50 h-screen w-72 lg:w-80 border-r shadow-2xl transition-transform duration-200 ease-out will-change-transform ${
          isOpen ? 'translate-x-0 pointer-events-auto' : '-translate-x-full pointer-events-none'
        }`
      : `fixed md:sticky top-0 bottom-0 z-40 md:z-20 h-screen shrink-0 transition-opacity duration-150 ${
          isOpen 
            ? 'left-0 translate-x-0 w-72 lg:w-80 border-r opacity-100' 
            : 'left-0 -translate-x-full md:translate-x-0 w-0 md:w-0 border-transparent opacity-0 pointer-events-none overflow-hidden'
        }`;
  }

  return (
    <>
      {/* Backdrop for mobile or popup mode */}
      {isOpen && (
        <div 
          className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity ${
            isPopup ? 'z-45 block' : 'z-35 md:hidden'
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        />
      )}

      <aside 
        onClick={(e) => {
          e.stopPropagation();
          onSidebarClick?.();
        }}
        onMouseLeave={onMouseLeave}
        className={`${positioningClasses} flex flex-col`}
        style={{
          backgroundColor: 'var(--sidebar-main)',
          borderColor: 'var(--border-main)',
          color: 'var(--text-main)',
        }}
      >
        <div className="w-72 lg:w-80 flex flex-col h-full min-h-0">
        {/* Top Header / Author Profile (Covering top of screen) */}
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

        {/* Search & Light/Dark Mode Controls side-by-side inside Sidebar */}
        <div 
          className="p-3 border-b flex items-center gap-2"
          style={{ borderColor: 'var(--border-main)' }}
        >
          {/* Quick Search Button */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex-1 flex items-center justify-between px-3 py-2 text-xs rounded-lg border transition-all hover:border-[var(--accent)] group shadow-xs cursor-pointer focus:outline-none"
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

          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={onToggleColorMode}
            className="p-2 rounded-lg border hover:opacity-85 transition-all cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
            style={{
              backgroundColor: 'var(--card-main)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-heading)',
            }}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Light / Dark mode"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* Pin / Collapse Toggle Button beside theme toggle */}
          <button
            type="button"
            onClick={onToggleAutoHide}
            className="p-2 rounded-lg border hover:opacity-85 transition-all cursor-pointer shrink-0 flex items-center justify-center shadow-xs"
            style={{
              backgroundColor: isAutoHideMode ? 'color-mix(in srgb, var(--accent) 18%, transparent)' : 'var(--card-main)',
              borderColor: isAutoHideMode ? 'var(--accent)' : 'var(--border-main)',
              color: isAutoHideMode ? 'var(--accent)' : 'var(--text-heading)',
            }}
            title={isAutoHideMode ? "Sidebar in hover peek mode (Click to pin open)" : "Pin open (Click to collapse & reveal on hover)"}
            aria-label="Toggle pin sidebar"
          >
            {isAutoHideMode ? (
              <PinOff className="w-4 h-4" />
            ) : (
              <Pin className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* Top-Level Standalone Pages (Outside Folders) */}
          {rootNotes.length > 0 && (
            <div>
              <div 
                className="text-[11px] font-semibold uppercase tracking-wider font-mono mb-1.5 px-2 flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <Compass className="w-3 h-3" />
                <span>Overview & Pages</span>
              </div>
              <div className="space-y-0.5">
                {rootNotes.map((rootNode) => renderTreeNode(rootNode, 0))}
              </div>
            </div>
          )}

          {/* Folder Categories */}
          {folderNodes.length > 0 && (
            <div>
              <div 
                className="text-[11px] font-semibold uppercase tracking-wider font-mono mb-1.5 px-2 flex items-center gap-1.5"
                style={{ color: 'var(--text-muted)' }}
              >
                <Folder className="w-3 h-3" />
                <span>Categories & Folders</span>
              </div>
              <div className="space-y-0.5">
                {folderNodes.map((folderNode) => renderTreeNode(folderNode, 0))}
              </div>
            </div>
          )}
        </div>

        {/* User-facing layout position toggle: Left, Right, Popup */}
        <div 
          className="p-3 border-t shrink-0 select-none"
          style={{ borderColor: 'var(--border-main)' }}
        >
          <div 
            className="flex items-center justify-between text-[11px] font-mono mb-2"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>Sidebar Layout</span>
            <span className="capitalize font-semibold" style={{ color: 'var(--accent)' }}>
              {placement}
            </span>
          </div>

          <div 
            className="grid grid-cols-3 gap-1 p-1 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--bg-main)',
              borderColor: 'var(--border-main)',
            }}
          >
            <button
              onClick={() => onChangePlacement('left')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-mono transition-all ${
                placement === 'left' ? 'font-semibold' : 'hover:opacity-100 opacity-70'
              }`}
              style={{
                backgroundColor: placement === 'left' ? 'var(--card-main)' : 'transparent',
                borderColor: placement === 'left' ? 'var(--border-main)' : 'transparent',
                borderWidth: '1px',
                color: placement === 'left' ? 'var(--text-heading)' : 'var(--text-muted)',
              }}
              title="Dock sidebar on left"
              aria-label="Dock sidebar on left"
            >
              <PanelLeft className="w-3.5 h-3.5" style={{ color: placement === 'left' ? 'var(--accent)' : 'inherit' }} />
              <span>Left</span>
            </button>

            <button
              onClick={() => onChangePlacement('right')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-mono transition-all ${
                placement === 'right' ? 'font-semibold' : 'hover:opacity-100 opacity-70'
              }`}
              style={{
                backgroundColor: placement === 'right' ? 'var(--card-main)' : 'transparent',
                borderColor: placement === 'right' ? 'var(--border-main)' : 'transparent',
                borderWidth: '1px',
                color: placement === 'right' ? 'var(--text-heading)' : 'var(--text-muted)',
              }}
              title="Dock sidebar on right"
              aria-label="Dock sidebar on right"
            >
              <PanelRight className="w-3.5 h-3.5" style={{ color: placement === 'right' ? 'var(--accent)' : 'inherit' }} />
              <span>Right</span>
            </button>

            <button
              onClick={() => onChangePlacement('popup')}
              className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded text-xs font-mono transition-all ${
                placement === 'popup' ? 'font-semibold' : 'hover:opacity-100 opacity-70'
              }`}
              style={{
                backgroundColor: placement === 'popup' ? 'var(--card-main)' : 'transparent',
                borderColor: placement === 'popup' ? 'var(--border-main)' : 'transparent',
                borderWidth: '1px',
                color: placement === 'popup' ? 'var(--text-heading)' : 'var(--text-muted)',
              }}
              title="Slide-over popup drawer"
              aria-label="Slide-over popup drawer"
            >
              <SidebarIcon className="w-3.5 h-3.5" style={{ color: placement === 'popup' ? 'var(--accent)' : 'inherit' }} />
              <span>Popup</span>
            </button>
          </div>
        </div>

        {/* Clean minimal footer */}
        <div 
          className="p-3 border-t flex items-center justify-between text-xs"
          style={{ 
            borderColor: 'var(--border-main)',
            color: 'var(--text-muted)'
          }}
        >
          <div className="font-mono text-[11px]">
            {notes.length} notes
          </div>
          <div className="text-[11px] font-mono">
            garden
          </div>
        </div>
        </div>
      </aside>
    </>
  );
};
