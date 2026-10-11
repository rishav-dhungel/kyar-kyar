import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, ArrowRight, CornerDownLeft } from 'lucide-react';
import { NoteItem } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  notes: NoteItem[];
  onSelectNote: (noteId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  notes,
  onSelectNote,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const results = React.useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      return notes.slice(0, 8);
    }

    return notes
      .filter((note) => {
        return (
          note.title.toLowerCase().includes(q) ||
          note.description?.toLowerCase().includes(q) ||
          note.tags.some((t) => t.toLowerCase().includes(q)) ||
          note.content.toLowerCase().includes(q)
        );
      })
      .slice(0, 10);
  }, [query, notes]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1 < results.length ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          onSelectNote(results[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onSelectNote, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div 
        className="relative w-full max-w-xl rounded-xl border shadow-2xl overflow-hidden z-10"
        style={{
          backgroundColor: 'var(--card-main)',
          borderColor: 'var(--border-main)',
        }}
      >
        <div 
          className="flex items-center px-4 py-3 border-b"
          style={{ borderColor: 'var(--border-main)' }}
        >
          <Search className="w-4 h-4 shrink-0 mr-3" style={{ color: 'var(--accent)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes by title, content, or #tag..."
            className="w-full bg-transparent text-sm focus:outline-none placeholder:text-muted"
            style={{ color: 'var(--text-heading)' }}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded hover:opacity-80 text-muted"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {results.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              No notes found matching "{query}"
            </div>
          ) : (
            results.map((note, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={note.id}
                  onClick={() => {
                    onSelectNote(note.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-start justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    isSelected ? 'font-medium' : ''
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--bg-main)' : 'transparent',
                    border: isSelected ? '1px solid var(--border-main)' : '1px solid transparent',
                  }}
                >
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    <FileText className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate" style={{ color: 'var(--text-heading)' }}>
                        {note.title}
                      </div>
                      {note.description && (
                        <div className="text-[11px] line-clamp-1 mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {note.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>
                        {note.folder && <span>folder: {note.folder}</span>}
                        {note.tags.slice(0, 3).map((t) => (
                          <span key={t}>#{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <CornerDownLeft className="w-3.5 h-3.5 shrink-0 opacity-60 ml-2 mt-1" style={{ color: 'var(--text-muted)' }} />
                  )}
                </div>
              );
            })
          )}
        </div>

        <div 
          className="px-4 py-2 border-t flex items-center justify-between text-[11px] font-mono"
          style={{ 
            borderColor: 'var(--border-main)',
            backgroundColor: 'var(--bg-main)',
            color: 'var(--text-muted)' 
          }}
        >
          <span>Use ↑↓ to navigate, Enter to open</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
