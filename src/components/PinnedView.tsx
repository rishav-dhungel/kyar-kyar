import React from 'react';
import { Pin, ArrowUpRight, FileText, Calendar, Clock } from 'lucide-react';
import { TtIcon } from './TtIcon';
import { NoteItem, SiteConfig } from '../types';

interface PinnedViewProps {
  notes: NoteItem[];
  config: SiteConfig;
  onSelectNote: (noteId: string) => void;
  isOptimalWidth?: boolean;
  onToggleReadingWidth?: () => void;
}

export const PinnedView: React.FC<PinnedViewProps> = ({
  notes,
  config,
  onSelectNote,
  isOptimalWidth,
  onToggleReadingWidth,
}) => {
  const pinnedNotes = notes.filter((n) => n.pinned);

  return (
    <div className={`mx-auto px-4 sm:px-8 py-10 transition-all duration-200 ${isOptimalWidth ? 'max-w-[70ch]' : 'max-w-3xl'}`}>
      {/* Header */}
      <header 
        className="pb-5 mb-8 border-b"
        style={{ borderColor: 'var(--border-main)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div 
            className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            <Pin className="w-3.5 h-3.5 rotate-45" style={{ color: 'var(--text-muted)' }} />
            <span>Pinned Posts</span>
          </div>

          {onToggleReadingWidth && (
            <button
              type="button"
              onClick={onToggleReadingWidth}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors border hover:opacity-85 text-xs font-mono cursor-pointer"
              style={{
                backgroundColor: isOptimalWidth 
                  ? 'color-mix(in srgb, var(--accent) 15%, var(--card-main))' 
                  : 'var(--card-main)',
                borderColor: isOptimalWidth ? 'var(--accent)' : 'var(--border-main)',
                color: isOptimalWidth ? 'var(--accent)' : 'var(--text-muted)',
              }}
              title={isOptimalWidth ? "Disable 70ch reading width" : "Enable 70ch reading width"}
              aria-label="Toggle 70ch reading width"
            >
              <TtIcon className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px]">70ch</span>
            </button>
          )}
        </div>
        <h1 
          className="text-2xl sm:text-3xl font-bold tracking-tight"
          style={{ color: 'var(--text-heading)' }}
        >
          Pinned Pages
        </h1>
        <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          Essential guides and global documentation pinned for quick access.
        </p>
      </header>

      {/* Pinned Notes List */}
      <div className="space-y-3">
        {pinnedNotes.length === 0 ? (
          <div 
            className="p-8 text-center rounded-lg border border-dashed text-xs font-mono"
            style={{ 
              backgroundColor: 'var(--card-main)', 
              borderColor: 'var(--border-main)',
              color: 'var(--text-muted)' 
            }}
          >
            No notes are currently pinned.
          </div>
        ) : (
          pinnedNotes.map((note) => (
            <article
              key={note.id}
              onClick={() => onSelectNote(note.id)}
              className="group p-4 rounded-lg border cursor-pointer transition-all hover:opacity-90"
              style={{
                backgroundColor: 'var(--card-main)',
                borderColor: 'var(--border-main)',
              }}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <Pin className="w-3.5 h-3.5 rotate-45 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <h2 
                    className="text-sm font-semibold truncate group-hover:underline"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    {note.title}
                  </h2>
                </div>
                <ArrowUpRight 
                  className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" 
                  style={{ color: 'var(--text-muted)' }}
                />
              </div>

              {note.description && (
                <p 
                  className="text-xs line-clamp-2 mb-2.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {note.description}
                </p>
              )}

              <div 
                className="flex items-center gap-2 text-[10px] font-mono flex-wrap"
                style={{ color: 'var(--text-muted)' }}
              >
                {note.folder && <span>folder: {note.folder}</span>}
                {note.folder && <span>·</span>}
                {note.date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{note.date}</span>
                  </span>
                )}
                {note.date && <span>·</span>}
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{note.readingTimeMinutes} min read</span>
                </span>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Minimal Footer */}
      <footer 
        className="mt-14 pt-8 text-center text-xs border-t"
        style={{ borderColor: 'var(--border-main)' }}
      >
        <div 
          className="font-mono text-[11px] tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {config.footer?.text || `© ${config.author} ${new Date().getFullYear()}`}
        </div>
      </footer>
    </div>
  );
};
