import React, { useMemo, useState } from 'react';
import { 
  Folder, 
  FolderOpen, 
  FileText, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Search, 
  Pin, 
  ArrowUpDown,
  Tag as TagIcon
} from 'lucide-react';
import { NoteItem, SiteConfig } from '../types';

interface FolderViewProps {
  folderPath: string;
  notes: NoteItem[];
  config: SiteConfig;
  onSelectNote: (noteId: string) => void;
  onSelectFolder?: (folderPath: string) => void;
  onSelectTag?: (tag: string) => void;
  onBackToHome: () => void;
}

type SortOption = 'default' | 'title' | 'date' | 'readingTime';

export const FolderView: React.FC<FolderViewProps> = ({
  folderPath,
  notes,
  config,
  onSelectNote,
  onSelectFolder,
  onSelectTag,
  onBackToHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('default');

  // Filter notes that belong directly to this folder or nested inside this folder
  const folderNotes = useMemo(() => {
    const normalizedTarget = folderPath.toLowerCase().replace(/^\/+|\/+$/g, '');
    return notes.filter((n) => {
      const noteFolder = (n.folder || '').toLowerCase().replace(/^\/+|\/+$/g, '');
      return noteFolder === normalizedTarget || noteFolder.startsWith(`${normalizedTarget}/`);
    });
  }, [notes, folderPath]);

  // Find direct nested subfolders inside this folder
  const subfolders = useMemo(() => {
    const normalizedTarget = folderPath.toLowerCase().replace(/^\/+|\/+$/g, '');
    const set = new Set<string>();

    for (const n of folderNotes) {
      const noteFolder = (n.folder || '').replace(/^\/+|\/+$/g, '');
      const noteFolderLower = noteFolder.toLowerCase();
      if (noteFolderLower.startsWith(`${normalizedTarget}/`)) {
        // Extract immediate next subfolder segment
        const remainder = noteFolder.slice(normalizedTarget.length + 1);
        const nextSegment = remainder.split('/')[0];
        if (nextSegment) {
          set.add(`${folderPath}/${nextSegment}`);
        }
      }
    }
    return Array.from(set).sort();
  }, [folderNotes, folderPath]);

  // Apply search query
  const filteredNotes = useMemo(() => {
    let result = folderNotes;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((n) => {
        return (
          n.title.toLowerCase().includes(q) ||
          n.filePath.toLowerCase().includes(q) ||
          (n.description && n.description.toLowerCase().includes(q)) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }

    // Apply sorting
    const sorted = [...result];
    switch (sortBy) {
      case 'title':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'date':
        sorted.sort((a, b) => {
          if (!a.date) return 1;
          if (!b.date) return -1;
          return b.date.localeCompare(a.date);
        });
        break;
      case 'readingTime':
        sorted.sort((a, b) => (b.readingTimeMinutes || 0) - (a.readingTimeMinutes || 0));
        break;
      default:
        // Default: pinned first, then natural order
        sorted.sort((a, b) => {
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          return a.title.localeCompare(b.title);
        });
    }

    return sorted;
  }, [folderNotes, searchQuery, sortBy]);

  const cleanFolderName = folderPath.split('/').pop() || folderPath;
  const fontClass = config.theme.fontFamily === 'serif' 
    ? 'font-serif' 
    : config.theme.fontFamily === 'mono' 
      ? 'font-mono' 
      : 'font-sans';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Breadcrumb Navigation */}
      <nav 
        className="flex items-center gap-1.5 text-xs font-mono mb-6"
        style={{ color: 'var(--text-muted)' }}
        aria-label="Breadcrumb"
      >
        <button
          onClick={onBackToHome}
          className="hover:underline cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
        >
          home
        </button>
        <span style={{ color: 'var(--border-main)' }}>/</span>
        <span 
          className="font-medium"
          style={{ color: 'var(--text-heading)' }}
        >
          {folderPath}
        </span>
      </nav>

      {/* Folder Header */}
      <header 
        className="mb-8 pb-6 border-b"
        style={{ borderColor: 'var(--border-main)' }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div 
            className="p-2.5 rounded-lg border"
            style={{ 
              backgroundColor: 'var(--card-main)', 
              borderColor: 'var(--border-main)',
              color: 'var(--accent)'
            }}
          >
            <FolderOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 
                className={`text-xl sm:text-2xl font-bold tracking-tight ${fontClass}`}
                style={{ color: 'var(--text-heading)' }}
              >
                {cleanFolderName}
              </h1>
              <span 
                className="text-xs font-mono px-2 py-0.5 rounded-full border"
                style={{ 
                  backgroundColor: 'var(--card-main)', 
                  borderColor: 'var(--border-main)',
                  color: 'var(--text-muted)'
                }}
              >
                {folderNotes.length} {folderNotes.length === 1 ? 'page' : 'pages'}
              </span>
            </div>
            <p 
              className="text-xs font-mono mt-1"
              style={{ color: 'var(--text-muted)' }}
            >
              All subpages in /{folderPath}
            </p>
          </div>
        </div>

        {/* Search & Sort Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" 
              style={{ color: 'var(--text-muted)' }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Filter pages in ${cleanFolderName}...`}
              className="w-full pl-9 pr-3 py-1.5 rounded-md border text-xs focus:outline-none transition-colors"
              style={{
                backgroundColor: 'var(--card-main)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-heading)',
              }}
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono hidden sm:inline" style={{ color: 'var(--text-muted)' }}>
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-2.5 py-1.5 rounded-md border text-xs font-mono cursor-pointer focus:outline-none"
              style={{
                backgroundColor: 'var(--card-main)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-heading)',
              }}
            >
              <option value="default">Default (Pinned first)</option>
              <option value="title">Title (A-Z)</option>
              <option value="date">Date (Newest)</option>
              <option value="readingTime">Reading Time</option>
            </select>
          </div>
        </div>
      </header>

      {/* Subfolders (if any) */}
      {subfolders.length > 0 && (
        <section className="mb-8">
          <h2 
            className="text-xs font-semibold uppercase tracking-wider font-mono mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Subfolders
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {subfolders.map((sub) => {
              const subName = sub.split('/').pop() || sub;
              const count = notes.filter((n) => (n.folder || '').startsWith(sub)).length;
              return (
                <div
                  key={sub}
                  onClick={() => onSelectFolder?.(sub)}
                  title={`Folder: ${sub}`}
                  className="group relative flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:opacity-85 transition-all"
                  style={{
                    backgroundColor: 'var(--card-main)',
                    borderColor: 'var(--border-main)',
                  }}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Folder className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                    <span 
                      title={subName}
                      className="text-xs font-mono font-medium truncate" 
                      style={{ color: 'var(--text-heading)' }}
                    >
                      {subName}/
                    </span>
                  </div>
                  <span className="text-[11px] font-mono shrink-0" style={{ color: 'var(--text-muted)' }}>
                    {count} {count === 1 ? 'page' : 'pages'}
                  </span>

                  {/* Hover tooltip showing full folder path */}
                  <div 
                    role="tooltip"
                    className="absolute left-3 bottom-full mb-1 hidden group-hover:flex items-center z-30 pointer-events-none transition-all duration-150"
                  >
                    <div 
                      className="px-2 py-0.5 text-xs font-mono rounded-md shadow-lg border backdrop-blur-md whitespace-nowrap"
                      style={{
                        backgroundColor: 'var(--card-main)',
                        borderColor: 'var(--border-main)',
                        color: 'var(--text-heading)',
                      }}
                    >
                      /{sub}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Subpages List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 
            className="text-xs font-semibold uppercase tracking-wider font-mono"
            style={{ color: 'var(--text-muted)' }}
          >
            Pages in this folder ({filteredNotes.length})
          </h2>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs hover:underline cursor-pointer"
              style={{ color: 'var(--accent)' }}
            >
              Clear filter
            </button>
          )}
        </div>

        {filteredNotes.length === 0 ? (
          <div 
            className="p-8 rounded-lg border border-dashed text-center"
            style={{ 
              backgroundColor: 'var(--card-main)', 
              borderColor: 'var(--border-main)',
              color: 'var(--text-muted)' 
            }}
          >
            <p className="text-xs">No pages found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotes.map((note) => (
              <article
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                title={note.title}
                className="group relative p-4 rounded-lg border cursor-pointer transition-all hover:scale-[1.005] hover:shadow-xs active:scale-[0.998]"
                style={{
                  backgroundColor: 'var(--card-main)',
                  borderColor: 'var(--border-main)',
                }}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="relative group/topic flex items-center gap-2 min-w-0 flex-1">
                    {note.pinned ? (
                      <span title="Pinned note">
                        <Pin className="w-3.5 h-3.5 shrink-0 rotate-45" style={{ color: 'var(--text-muted)' }} />
                      </span>
                    ) : (
                      <FileText className="w-3.5 h-3.5 shrink-0 opacity-60" style={{ color: 'var(--accent)' }} />
                    )}
                    <h3 
                      title={note.title}
                      className={`text-sm sm:text-base font-semibold truncate group-hover/topic:underline ${fontClass}`}
                      style={{ color: 'var(--text-heading)' }}
                    >
                      {note.title}
                    </h3>

                    {/* Floating Full Title Badge on Hover */}
                    <div 
                      role="tooltip"
                      className="absolute left-6 bottom-full mb-1 hidden group-hover:flex items-center z-30 pointer-events-none transition-all duration-150 animate-fadeIn"
                    >
                      <div 
                        className="px-2.5 py-1 text-xs font-medium rounded-md shadow-xl border backdrop-blur-md max-w-sm sm:max-w-md md:max-w-lg break-words"
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

                  <ArrowRight 
                    className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1 opacity-50 group-hover:opacity-100" 
                    style={{ color: 'var(--accent)' }} 
                  />
                </div>

                {note.description && (
                  <p 
                    className="text-xs leading-relaxed mb-3 line-clamp-2"
                    style={{ color: 'var(--text-main)' }}
                  >
                    {note.description}
                  </p>
                )}

                {/* Metadata & Tags */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-[11px] font-mono" style={{ borderColor: 'var(--border-main)' }}>
                  <div className="flex items-center gap-3" style={{ color: 'var(--text-muted)' }}>
                    {note.date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{note.date}</span>
                      </span>
                    )}
                    {note.readingTimeMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{note.readingTimeMinutes} min read</span>
                      </span>
                    )}
                    <span className="opacity-70">
                      {note.filePath.split('/').pop()}
                    </span>
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      {note.tags.map((tag) => (
                        <button
                          key={tag}
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectTag?.(tag);
                          }}
                          className="px-1.5 py-0.5 rounded text-[10px] border hover:opacity-80 transition-opacity cursor-pointer"
                          style={{
                            backgroundColor: 'var(--sidebar-main)',
                            borderColor: 'var(--border-main)',
                            color: 'var(--accent)',
                          }}
                          title={`Filter by #${tag}`}
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
