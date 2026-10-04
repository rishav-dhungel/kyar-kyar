import React, { useState, useMemo } from 'react';
import { Tag, Search, ArrowUpRight, FileText, Calendar, Clock, X } from 'lucide-react';
import { NoteItem, SiteConfig } from '../types';

interface TagsViewProps {
  notes: NoteItem[];
  config: SiteConfig;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  onSelectNote: (noteId: string) => void;
}

export const TagsView: React.FC<TagsViewProps> = ({
  notes,
  config,
  selectedTag,
  onSelectTag,
  onSelectNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Collect all unique tags and their note counts
  const tagData = useMemo(() => {
    const map: Record<string, NoteItem[]> = {};
    for (const note of notes) {
      for (const tag of note.tags) {
        if (!map[tag]) map[tag] = [];
        map[tag].push(note);
      }
    }
    return Object.entries(map)
      .map(([tag, taggedNotes]) => ({
        tag,
        count: taggedNotes.length,
        notes: taggedNotes,
      }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [notes]);

  // Filter tags by search query
  const filteredTags = useMemo(() => {
    if (!searchQuery.trim()) return tagData;
    const q = searchQuery.toLowerCase().trim();
    return tagData.filter((item) => item.tag.toLowerCase().includes(q));
  }, [tagData, searchQuery]);

  // Notes to display for currently active tag
  const activeTaggedNotes = useMemo(() => {
    if (!selectedTag) return [];
    return notes.filter((n) => n.tags.includes(selectedTag));
  }, [notes, selectedTag]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
      {/* Top Header */}
      <header 
        className="pb-5 mb-6 border-b"
        style={{ borderColor: 'var(--border-main)' }}
      >
        <div 
          className="flex items-center gap-1.5 mb-2 font-mono text-xs uppercase tracking-wider" 
          style={{ color: 'var(--text-muted)' }}
        >
          <Tag className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          <span>Tags</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: 'var(--text-heading)' }}
            >
              Tags Directory
            </h1>
            <p className="text-xs sm:text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              Browse through {tagData.length} topics across all notes.
            </p>
          </div>

          {/* Quick Search inside tags */}
          <div className="relative w-full sm:w-60">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter tags..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border text-xs font-mono focus:outline-none focus:ring-1"
              style={{
                backgroundColor: 'var(--card-main)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-main)',
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs opacity-60 hover:opacity-100 cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Compact Tags List (Minimal space, format: tagname, count) */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3 text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
          <span>Topics ({filteredTags.length})</span>
          {selectedTag && (
            <button
              type="button"
              onClick={() => onSelectTag(null)}
              className="hover:underline cursor-pointer flex items-center gap-1 text-[11px]"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>Clear active tag</span>
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {filteredTags.length === 0 ? (
          <div 
            className="p-4 text-center rounded-lg border border-dashed text-xs font-mono"
            style={{ 
              backgroundColor: 'var(--card-main)', 
              borderColor: 'var(--border-main)',
              color: 'var(--text-muted)' 
            }}
          >
            No tags found matching "{searchQuery}".
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {filteredTags.map(({ tag, count }) => {
              const isSelected = selectedTag === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onSelectTag(isSelected ? null : tag)}
                  className={`px-2.5 py-1 rounded-md text-xs font-mono border cursor-pointer transition-all flex items-center gap-1 select-none ${
                    isSelected ? 'font-semibold shadow-xs' : 'hover:opacity-85'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--card-main)' : 'var(--sidebar-main)',
                    borderColor: isSelected ? 'var(--text-heading)' : 'var(--border-main)',
                    color: isSelected ? 'var(--text-heading)' : 'var(--text-main)',
                  }}
                  title={`Filter by #${tag} (${count} ${count === 1 ? 'note' : 'notes'})`}
                >
                  <span style={{ color: isSelected ? 'var(--text-heading)' : 'var(--text-main)' }}>
                    #{tag},
                  </span>
                  <span className="font-mono opacity-65 text-[11px]">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* Filtered Notes Section (if a tag is selected) */}
      {selectedTag ? (
        <section 
          className="pt-6 border-t"
          style={{ borderColor: 'var(--border-main)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 
                className="text-sm font-semibold font-mono flex items-center gap-1.5"
                style={{ color: 'var(--text-heading)' }}
              >
                <span>Notes for</span>
                <span 
                  className="px-2 py-0.5 rounded text-xs border font-mono" 
                  style={{ 
                    backgroundColor: 'var(--card-main)', 
                    borderColor: 'var(--border-main)', 
                    color: 'var(--text-heading)' 
                  }}
                >
                  #{selectedTag}, {activeTaggedNotes.length}
                </span>
              </h2>
            </div>

            <button
              type="button"
              onClick={() => onSelectTag(null)}
              className="text-xs font-mono hover:underline cursor-pointer"
              style={{ color: 'var(--text-muted)' }}
            >
              Show all tags
            </button>
          </div>

          <div className="space-y-3">
            {activeTaggedNotes.map((note) => (
              <div
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
                    <FileText className="w-3.5 h-3.5 shrink-0 opacity-60" style={{ color: 'var(--accent)' }} />
                    <h3 
                      className="text-sm font-semibold truncate group-hover:underline"
                      style={{ color: 'var(--text-heading)' }}
                    >
                      {note.title}
                    </h3>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                </div>

                {note.description && (
                  <p 
                    className="text-xs line-clamp-2 mb-2"
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
              </div>
            ))}
          </div>
        </section>
      ) : (
        /* If no tag is explicitly selected, show most recent notes across the garden */
        <section 
          className="pt-6 border-t"
          style={{ borderColor: 'var(--border-main)' }}
        >
          <div className="text-xs font-mono mb-4 font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Recent Notes
          </div>
          <div className="space-y-3">
            {notes.slice(0, 5).map((note) => (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className="group p-3.5 rounded-lg border cursor-pointer transition-all hover:opacity-90 flex items-center justify-between gap-3"
                style={{
                  backgroundColor: 'var(--card-main)',
                  borderColor: 'var(--border-main)',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-3.5 h-3.5 shrink-0 opacity-60" style={{ color: 'var(--accent)' }} />
                    <span className="text-xs font-semibold truncate group-hover:underline" style={{ color: 'var(--text-heading)' }}>
                      {note.title}
                    </span>
                  </div>
                  {note.description && (
                    <p className="text-[11px] line-clamp-1" style={{ color: 'var(--text-muted)' }}>
                      {note.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 transition-opacity ml-1" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
