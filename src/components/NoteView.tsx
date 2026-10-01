import React, { useEffect, useRef, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Folder, 
  Share2, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  ArrowUpRight,
  Pin
} from 'lucide-react';
import { NoteItem, SiteConfig } from '../types';
import { TableOfContents } from './TableOfContents';
import { resolveNote } from '../utils/noteResolver';

interface NoteViewProps {
  note: NoteItem;
  allNotes: NoteItem[];
  config: SiteConfig;
  onSelectNote: (noteId: string) => void;
  onSelectFolder?: (folderPath: string) => void;
  onSelectTag?: (tag: string) => void;
  prevNote: NoteItem | null;
  nextNote: NoteItem | null;
}

export const NoteView: React.FC<NoteViewProps> = ({
  note,
  allNotes,
  config,
  onSelectNote,
  onSelectFolder,
  onSelectTag,
  prevNote,
  nextNote,
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Intercept wikilink clicks inside the rendered markdown HTML
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const handleInternalClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      const dataTarget = anchor.getAttribute('data-target') || anchor.getAttribute('data-slug');

      // 1. Tag link: e.g. <a href="#/tag/..." class="tag-link" data-tag="...">
      const dataTag = anchor.getAttribute('data-tag');
      if (dataTag) {
        e.preventDefault();
        onSelectTag?.(dataTag);
        return;
      }

      if (href && href.startsWith('#/tag/')) {
        e.preventDefault();
        const tag = decodeURIComponent(href.replace('#/tag/', ''));
        onSelectTag?.(tag);
        return;
      }

      // 2. Folder link: e.g. <a href="#/folder/..." or wikilink to a folder
      if (href && href.startsWith('#/folder/')) {
        e.preventDefault();
        const folder = decodeURIComponent(href.replace('#/folder/', ''));
        onSelectFolder?.(folder);
        return;
      }

      // 3. Explicit wikilink or internal note target
      if (dataTarget) {
        const found = resolveNote(dataTarget, allNotes);
        if (found) {
          e.preventDefault();
          onSelectNote(found.id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        // Check if dataTarget refers to a folder
        const cleanTarget = dataTarget.toLowerCase().replace(/^\/+|\/+$/g, '');
        const isFolder = allNotes.some((n) => (n.folder || '').toLowerCase().startsWith(cleanTarget));
        if (isFolder) {
          e.preventDefault();
          onSelectFolder?.(cleanTarget);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      // 3. Hash link to note: #/note/...
      if (href && href.startsWith('#/note/')) {
        const rawTarget = href.replace('#/note/', '');
        const found = resolveNote(rawTarget, allNotes);
        if (found) {
          e.preventDefault();
          onSelectNote(found.id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      // 4. Relative markdown link: e.g. href="about.md", href="journal/note.md", href="/about"
      if (
        href && 
        !href.startsWith('http://') && 
        !href.startsWith('https://') && 
        !href.startsWith('mailto:') && 
        !href.startsWith('tel:') && 
        !href.startsWith('#')
      ) {
        const found = resolveNote(href, allNotes);
        if (found) {
          e.preventDefault();
          onSelectNote(found.id);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }
      }

      // 5. In-page anchor link (e.g. href="#heading-id" or heading anchors)
      if (href && href.startsWith('#') && !href.startsWith('#/')) {
        e.preventDefault();
        const targetId = href.slice(1);
        const targetEl = document.getElementById(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.pushState(null, '', href);
        }
        return;
      }

      // 6. External links: guarantee safe opening in new tab
      if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
        anchor.setAttribute('target', '_blank');
        anchor.setAttribute('rel', 'noopener noreferrer');
      }
    };

    el.addEventListener('click', handleInternalClick);
    return () => el.removeEventListener('click', handleInternalClick);
  }, [note, allNotes, onSelectNote, onSelectTag]);

  // Backlinks resolution
  const backlinkNotes = React.useMemo(() => {
    return note.backlinks
      .map((id) => allNotes.find((n) => n.id === id))
      .filter((n): n is NoteItem => Boolean(n));
  }, [note.backlinks, allNotes]);

  // Subpages in same folder
  const siblingNotes = React.useMemo(() => {
    if (!note.folder) return [];
    return allNotes.filter((n) => n.folder === note.folder && n.id !== note.id);
  }, [allNotes, note.folder, note.id]);

  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#/note/${note.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const fontClass = 
    config.theme.fontFamily === 'serif'
      ? 'font-serif'
      : config.theme.fontFamily === 'mono'
      ? 'font-mono'
      : 'font-sans';

  return (
    <div className="w-full relative">
      <article ref={articleRef} className="max-w-3xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
      {/* Top Breadcrumb & Share Action */}
      <div 
        className="flex items-center justify-between text-xs mb-6"
        style={{ color: 'var(--text-muted)' }}
      >
        <div className="flex items-center gap-1.5 font-mono">
          <button
            onClick={() => {
              const root = allNotes.find((n) => n.filePath === 'index.md');
              if (root) onSelectNote(root.id);
            }}
            className="hover:underline"
            style={{ color: 'var(--text-muted)' }}
          >
            home
          </button>
          {note.folder ? (
            <>
              <span style={{ color: 'var(--border-main)' }}>/</span>
              <button
                type="button"
                onClick={() => onSelectFolder?.(note.folder)}
                className="hover:underline cursor-pointer"
                style={{ color: 'var(--text-main)' }}
                title={`View all pages in ${note.folder}`}
              >
                {note.folder}
              </button>
            </>
          ) : (
            <>
              <span style={{ color: 'var(--border-main)' }}>/</span>
              <span style={{ color: 'var(--text-muted)' }}>pages</span>
            </>
          )}
          <span style={{ color: 'var(--border-main)' }}>/</span>
          <span 
            className="truncate max-w-[160px] font-medium"
            style={{ color: 'var(--text-heading)' }}
          >
            {note.filePath.split('/').pop()}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors border hover:opacity-80"
            style={{
              backgroundColor: 'var(--card-main)',
              borderColor: 'var(--border-main)',
              color: 'var(--text-muted)',
            }}
            title="Copy Note Link"
          >
            {copiedLink ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline text-xs">
              {copiedLink ? 'Copied' : 'Share'}
            </span>
          </button>
        </div>
      </div>

      {/* Note Title & Header */}
      <header 
        className="mb-8 pb-6 border-b"
        style={{ borderColor: 'var(--border-main)' }}
      >
        <div className="flex items-start gap-2.5 mb-3">
          {note.pinned && (
            <span title="Pinned Note">
              <Pin className="w-5 h-5 text-amber-500 shrink-0 mt-1 rotate-45" />
            </span>
          )}
          <h1 
            className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-tight ${fontClass}`}
            style={{ color: 'var(--text-heading)' }}
          >
            {note.title}
          </h1>
        </div>

        {/* Clean Unboxed Metadata */}
        <div 
          className="flex flex-wrap items-center gap-y-1.5 gap-x-2.5 text-xs font-mono"
          style={{ color: 'var(--text-muted)' }}
        >
          {note.date && (
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>{note.date}</span>
            </span>
          )}

          {config.navigation.showReadingTime && (
            <>
              <span aria-hidden="true" style={{ color: 'var(--border-main)' }}>·</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{note.readingTimeMinutes} min read</span>
              </span>
            </>
          )}

          {config.navigation.showWordCount && (
            <>
              <span aria-hidden="true" style={{ color: 'var(--border-main)' }}>·</span>
              <span>{note.wordCount} words</span>
            </>
          )}

          {note.folder && (
            <>
              <span aria-hidden="true" style={{ color: 'var(--border-main)' }}>·</span>
              <span className="flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5" />
                <span>{note.folder}</span>
              </span>
            </>
          )}

          {note.tags.length > 0 && (
            <>
              <span aria-hidden="true" style={{ color: 'var(--border-main)' }}>·</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {note.tags.map((tag) => (
                  <button 
                    key={tag}
                    type="button"
                    onClick={() => onSelectTag?.(tag)}
                    className="px-2 py-0.5 rounded text-[11px] font-mono border hover:opacity-80 active:scale-95 transition-all cursor-pointer inline-flex items-center"
                    style={{ 
                      backgroundColor: 'var(--card-main)',
                      borderColor: 'var(--border-main)',
                      color: 'var(--accent)' 
                    }}
                    title={`View all notes tagged #${tag}`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Table of Contents */}
      {config.navigation.showTableOfContents && note.headings.length > 1 && (
        <TableOfContents headings={note.headings} />
      )}

      {/* Main Markdown Body */}
      <div
        ref={contentRef}
        className={`markdown-body ${fontClass}`}
        dangerouslySetInnerHTML={{ __html: note.html || note.content }}
      />

      {/* Folder Subpages / Siblings Section */}
      {note.folder && (
        <section 
          className="mt-12 p-4 sm:p-5 rounded-lg border"
          style={{
            backgroundColor: 'var(--card-main)',
            borderColor: 'var(--border-main)',
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Folder className="w-4 h-4" style={{ color: 'var(--accent)' }} />
              <h3 
                className="text-xs font-semibold uppercase tracking-wider font-mono"
                style={{ color: 'var(--text-heading)' }}
              >
                In folder: {note.folder}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onSelectFolder?.(note.folder)}
              className="text-xs font-mono hover:underline flex items-center gap-1 cursor-pointer"
              style={{ color: 'var(--accent)' }}
            >
              <span>View folder index</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {siblingNotes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {siblingNotes.map((sib) => (
                <div
                  key={sib.id}
                  onClick={() => onSelectNote(sib.id)}
                  className="p-2.5 rounded-md border text-xs cursor-pointer hover:opacity-85 transition-opacity flex items-center justify-between"
                  style={{
                    backgroundColor: 'var(--sidebar-main)',
                    borderColor: 'var(--border-main)',
                  }}
                >
                  <span className="truncate font-medium" style={{ color: 'var(--text-main)' }}>
                    {sib.title}
                  </span>
                  {sib.readingTimeMinutes && (
                    <span className="text-[10px] font-mono shrink-0 ml-2" style={{ color: 'var(--text-muted)' }}>
                      {sib.readingTimeMinutes} min
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
              This is the only document in {note.folder}/.
            </p>
          )}
        </section>
      )}

      {/* Linked References / Backlinks Section */}
      {config.navigation.showBacklinks && (
        <section 
          className="mt-14 pt-8 border-t"
          style={{ borderColor: 'var(--border-main)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 
              className="text-xs font-semibold uppercase tracking-wider font-mono"
              style={{ color: 'var(--text-muted)' }}
            >
              Linked References ({backlinkNotes.length})
            </h3>
            {backlinkNotes.length > 0 && (
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Notes that mention this document
              </span>
            )}
          </div>

          {backlinkNotes.length === 0 ? (
            <div 
              className="p-4 rounded-lg border border-dashed text-xs text-center"
              style={{ 
                backgroundColor: 'var(--card-main)', 
                borderColor: 'var(--border-main)',
                color: 'var(--text-muted)' 
              }}
            >
              No other notes link to this note yet. Use <code className="font-mono">[[{note.title}]]</code> in any note to connect them.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {backlinkNotes.map((backNote) => (
                <div
                  key={backNote.id}
                  onClick={() => onSelectNote(backNote.id)}
                  className="group p-3.5 rounded-lg border cursor-pointer transition-all hover:opacity-90"
                  style={{
                    backgroundColor: 'var(--card-main)',
                    borderColor: 'var(--border-main)',
                  }}
                >
                  <div 
                    className="flex items-center justify-between text-xs font-semibold mb-1"
                    style={{ color: 'var(--text-heading)' }}
                  >
                    <span className="truncate group-hover:underline">{backNote.title}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                  <p 
                    className="text-[11px] line-clamp-2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {backNote.description}
                  </p>
                  <div 
                    className="flex items-center gap-1.5 mt-2 text-[10px] font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {backNote.folder && <span>{backNote.folder}</span>}
                    {backNote.date && (
                      <>
                        <span>·</span>
                        <span>{backNote.date}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Prev / Next Pagination Footer */}
      <nav 
        className="mt-12 pt-6 border-t grid grid-cols-2 gap-4"
        style={{ borderColor: 'var(--border-main)' }}
      >
        {prevNote ? (
          <button
            onClick={() => onSelectNote(prevNote.id)}
            className="flex flex-col items-start p-3 rounded-lg border text-left transition-colors group hover:opacity-90"
            style={{
              backgroundColor: 'var(--card-main)',
              borderColor: 'var(--border-main)',
            }}
          >
            <span 
              className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" />
              <span>Previous Note</span>
            </span>
            <span 
              className="text-xs font-semibold truncate w-full group-hover:underline"
              style={{ color: 'var(--text-heading)' }}
            >
              {prevNote.title}
            </span>
          </button>
        ) : (
          <div />
        )}

        {nextNote ? (
          <button
            onClick={() => onSelectNote(nextNote.id)}
            className="flex flex-col items-end p-3 rounded-lg border text-right transition-colors group hover:opacity-90"
            style={{
              backgroundColor: 'var(--card-main)',
              borderColor: 'var(--border-main)',
            }}
          >
            <span 
              className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider mb-1"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>Next Note</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </span>
            <span 
              className="text-xs font-semibold truncate w-full group-hover:underline"
              style={{ color: 'var(--text-heading)' }}
            >
              {nextNote.title}
            </span>
          </button>
        ) : (
          <div />
        )}
      </nav>

      {/* Footer requested by user */}
      <footer 
        className="mt-14 pt-8 text-center text-xs border-t"
        style={{ borderColor: 'var(--border-main)' }}
      >
        <div 
          className="font-mono text-[11px] tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          {config.footer.text}
        </div>
      </footer>
    </article>
  </div>
  );
};
