import React from 'react';
import { 
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sidebar as SidebarIcon,
} from 'lucide-react';
import { NoteItem, SiteConfig, SidebarPlacement } from '../types';

interface NavbarProps {
  config: SiteConfig;
  activeNote: NoteItem | null;
  isSidebarOpen: boolean;
  placement: SidebarPlacement;
  onToggleSidebar: () => void;
  onHoverNavbarSide?: () => void;
  onGoHome: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  activeNote,
  isSidebarOpen,
  placement,
  onToggleSidebar,
  onHoverNavbarSide,
  onGoHome,
}) => {
  const isRight = placement === 'right';
  const isPopup = placement === 'popup';

  return (
    <header 
      className="sticky top-0 z-30 flex items-center justify-between h-14 px-3 sm:px-6 backdrop-blur-md transition-colors duration-150 border-b relative select-none"
      style={{
        backgroundColor: 'var(--sidebar-main)',
        borderColor: 'var(--border-main)',
        color: 'var(--text-main)',
      }}
    >
      {/* Invisible hover trigger zone along the side of the navbar to bring sidebar back */}
      {!isSidebarOpen && onHoverNavbarSide && (
        <div
          onMouseEnter={onHoverNavbarSide}
          className={`absolute top-0 bottom-0 w-32 sm:w-48 z-10 cursor-pointer ${
            isRight ? 'right-0' : 'left-0'
          }`}
          title="Hover to reveal sidebar"
        />
      )}

      {/* Side: Sidebar Toggle + Breadcrumb or Author link */}
      <div 
        onMouseEnter={onHoverNavbarSide}
        className="flex items-center gap-2.5 min-w-0 z-20"
      >
        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          onMouseEnter={onHoverNavbarSide}
          className="p-1.5 sm:p-2 rounded-md transition-all hover:opacity-80 border focus:outline-none shrink-0 cursor-pointer shadow-xs"
          style={{ 
            backgroundColor: 'var(--card-main)',
            borderColor: 'var(--border-main)',
            color: 'var(--text-heading)' 
          }}
          title={isSidebarOpen ? 'Collapse sidebar (⌘\\)' : 'Hover or click to expand sidebar'}
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {isPopup ? (
            <SidebarIcon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          ) : isRight ? (
            isSidebarOpen ? (
              <PanelRightClose className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            ) : (
              <PanelRightOpen className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            )
          ) : (
            isSidebarOpen ? (
              <PanelLeftClose className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            ) : (
              <PanelLeftOpen className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            )
          )}
        </button>

        {/* Small Author click to go home */}
        <button
          onClick={onGoHome}
          className="text-xs font-semibold tracking-tight hover:opacity-80 transition-opacity truncate hidden sm:inline ml-1 cursor-pointer"
          style={{ color: 'var(--text-heading)' }}
        >
          {config.author}
        </button>

        {/* Breadcrumb path for the active note */}
        {activeNote && (
          <div 
            className="flex items-center gap-1.5 text-xs min-w-0 pl-2 ml-1 border-l"
            style={{ borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
          >
            {activeNote.folder ? (
              <>
                <span className="truncate max-w-[120px] font-mono">
                  {activeNote.folder}
                </span>
                <ChevronRight className="w-3 h-3 opacity-40 shrink-0" />
              </>
            ) : null}
            <span 
              className="truncate max-w-[220px] sm:max-w-xs md:max-w-md font-medium"
              style={{ color: 'var(--text-heading)' }}
            >
              {activeNote.title}
            </span>
          </div>
        )}
      </div>

      {/* Right side: Clean & uncluttered */}
      <div className="flex items-center gap-2">
        {/* Top bar is now ultra-clean; search and theme switcher are housed in the sidebar */}
      </div>
    </header>
  );
};
