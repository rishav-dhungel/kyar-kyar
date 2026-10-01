import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, X, Folder, Calendar } from 'lucide-react';
import { NoteItem } from '../types';

interface SearchModalProps {
  notes: NoteItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectNote: (noteId: string) => void;
  onSelectTag?: (tag: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  notes,
  isOpen,
  onClose,
  onSelectNote,
  onSelectTag,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter notes
  const filteredNotes = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [...notes]
        .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
        .slice(0, 8);
    }

    return notes
      .map((note) => {
        let score = 0;
        const titleLower = note.title.toLowerCase();
        const contentLower = note.rawMarkdown.toLowerCase();
        const folderLower = note.folder.toLowerCase();
        const tagsLower = note.tags.map((t) => t.toLowerCase());

        if (titleLower === q) score += 100;
        else if (titleLower.startsWith(q)) score += 60;
        else if (titleLower.includes(q)) score += 40;

        if (folderLower.includes(q)) score += 25;
        if (tagsLower.some((t) => t.includes(q))) score += 30;
        if (contentLower.includes(q)) score += 15;

        // Context snippet
        let snippet = '';
        if (contentLower.includes(q)) {
          const idx = contentLower.indexOf(q);
          const start = Math.max(0, idx - 40);
          const end = Math.min(note.rawMarkdown.length, idx + 80);
          snippet = (start > 0 ? '...' : '') + note.rawMarkdown.slice(start, end).replace(/[#*`_]/g, '') + '...';
        } else {
          snippet = note.description || note.content.slice(0, 80);
        }

        return { note, score, snippet };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [notes, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredNotes]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredNotes.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredNotes.length) % Math.max(1, filteredNotes.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filteredNotes[selectedIndex];
        if (selected) {
          const note = 'note' in selected ? selected.note : selected;
          onSelectNote(note.id);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredNotes, selectedIndex, onSelectNote, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] border"
        style={{
          backgroundColor: 'var(--card-main)',
          borderColor: 'var(--border-main)',
          color: 'var(--text-main)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input bar */}
        <div 
          className="flex items-center px-4 py-3.5 border-b gap-3"
          style={{ borderColor: 'var(--border-main)' }}
        >
          <Search className="w-5 h-5 shrink-0" style={{ color: 'var(--accent)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes by title, folder, content, or #tag..."
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-heading)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd 
            className="hidden sm:inline font-mono text-[10px] px-1.5 py-0.5 rounded border"
            style={{
              backgroundColor: 'var(--sidebar-main)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-muted)'
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredNotes.length === 0 ? (
            <div 
              className="py-12 text-center text-xs"
              style={{ color: 'var(--text-muted)' }}
            >
              No notes found matching "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {filteredNotes.map((item, idx) => {
                const note = 'note' in item ? item.note : item;
                const snippet = 'snippet' in item ? item.snippet : note.description;
                const isSelected = idx === selectedIndex;

                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      onSelectNote(note.id);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className="p-2.5 rounded-lg cursor-pointer transition-colors text-xs flex flex-col gap-1 border"
                    style={{
                      backgroundColor: isSelected ? 'var(--sidebar-main)' : 'transparent',
                      borderColor: isSelected ? 'var(--accent)' : 'transparent',
                      color: isSelected ? 'var(--text-heading)' : 'var(--text-main)',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 font-medium truncate">
                        <FileText 
                          className="w-3.5 h-3.5 shrink-0" 
                          style={{ color: isSelected ? 'var(--accent)' : 'var(--text-muted)' }} 
                        />
                        <span className="truncate">{note.title}</span>
                      </div>
                      <div 
                        className="flex items-center gap-2 text-[10px] font-mono shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {note.folder && (
                          <span className="flex items-center gap-0.5">
                            <Folder className="w-3 h-3" />
                            {note.folder}
                          </span>
                        )}
                        {note.date && (
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-3 h-3" />
                            {note.date}
                          </span>
                        )}
                      </div>
                    </div>

                    {snippet && (
                      <p 
                        className="text-[11px] line-clamp-1 pl-5"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {snippet}
                      </p>
                    )}

                    {note.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 pl-5 pt-0.5 flex-wrap">
                        {note.tags.slice(0, 4).map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectTag?.(tag);
                              onClose();
                            }}
                            className="text-[10px] font-mono px-1.5 py-0.5 rounded border hover:opacity-80 transition-opacity cursor-pointer"
                            style={{ 
                              color: 'var(--accent)',
                              borderColor: 'var(--border-main)',
                              backgroundColor: 'var(--bg-main)'
                            }}
                            title={`Filter notes by #${tag}`}
                          >
                            #{tag}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div 
          className="px-4 py-2 border-t text-[11px] flex items-center justify-between"
          style={{
            backgroundColor: 'var(--sidebar-main)',
            borderColor: 'var(--border-main)',
            color: 'var(--text-muted)',
          }}
        >
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--border-main)' }}>↑</kbd> <kbd className="font-mono px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--border-main)' }}>↓</kbd> navigate</span>
            <span><kbd className="font-mono px-1 py-0.5 rounded border text-[9px]" style={{ borderColor: 'var(--border-main)' }}>↵</kbd> open</span>
          </div>
          <span className="font-mono text-[10px]">{notes.length} total notes indexed</span>
        </div>
      </div>
    </div>
  );
};
