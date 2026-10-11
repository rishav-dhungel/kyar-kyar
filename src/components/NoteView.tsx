import React, { useEffect, useRef, useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Folder, 
  Share2, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ArrowUpRight,
  Pin,
  Code2,
  List,
} from 'lucide-react';
import { TtIcon } from './TtIcon';
import { NoteItem, SiteConfig } from '../types';
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
  isOptimalWidth?: boolean;
  onToggleReadingWidth?: () => void;
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
  isOptimalWidth,
  onToggleReadingWidth,
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);
  const articleRef = useRef<HTMLElement | null>(null);
  const tocMenuRef = useRef<HTMLDivElement | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isTocOpen, setIsTocOpen] = useState(false);

  // Close TOC dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (tocMenuRef.current && !tocMenuRef.current.contains(e.target as Node)) {
        setIsTocOpen(false);
      }
    };
    if (isTocOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isTocOpen]);

  // Reset TOC menu state on note change
  useEffect(() => {
    setIsTocOpen(false);
  }, [note.id]);

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

    // Attach copy buttons to all code blocks
    const preBlocks = el.querySelectorAll('pre');
    preBlocks.forEach((pre) => {
      if (pre.querySelector('.code-copy-btn')) return;

      pre.style.position = 'relative';

      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.className = 'code-copy-btn absolute top-2 right-2 px-2 py-1 text-[11px] font-mono rounded border transition-all duration-150 flex items-center gap-1.5 opacity-70 hover:opacity-100 cursor-pointer select-none';
      copyBtn.style.backgroundColor = 'var(--card-main)';
      copyBtn.style.borderColor = 'var(--border-main)';
      copyBtn.style.color = 'var(--text-muted)';
      copyBtn.setAttribute('title', 'Copy code to clipboard');

      copyBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
        </svg>
        <span class="copy-label">Copy</span>
      `;

      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        e.preventDefault();
        const codeElement = pre.querySelector('code');
        const textToCopy = (codeElement ? codeElement.innerText : pre.innerText).replace(/Copy$/, '').trim();
        try {
          await navigator.clipboard.writeText(textToCopy);
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon text-emerald-500">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span class="copy-label text-emerald-500 font-medium">Copied!</span>
          `;
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="copy-icon">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              <span class="copy-label">Copy</span>
            `;
          }, 2000);
        } catch (err) {
          console.error('Failed to copy code block:', err);
        }
      });

      pre.appendChild(copyBtn);
    });

    el.addEventListener('click', handleInternalClick);
    return () => el.removeEventListener('click', handleInternalClick);
  }, [note, allNotes, onSelectNote, onSelectTag]);

  // Backlinks resolution
  const backlinkNotes = React.useMemo(() => {
    return note.backlinks
      .map((id) => allNotes.find((n) => n.id === id))
      .filter((n): n is NoteItem => Boolean(n));
  }, [note.backlinks, allNotes]);

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
      <article ref={articleRef} className={`mx-auto px-4 sm:px-8 py-8 sm:py-12 transition-all duration-200 ${isOptimalWidth ? 'max-w-[70ch]' : 'max-w-3xl'}`}>
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

        <div className="flex items-center gap-2 relative">
          {/* Reading Width Toggle (70ch) */}
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

          {/* Minimal Table of Contents Top Toggle Icon */}
          {config.navigation.showTableOfContents && note.headings.length > 0 && (
            <div className="relative" ref={tocMenuRef}>
              <button
                type="button"
                onClick={() => setIsTocOpen(!isTocOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors border hover:opacity-85 text-xs font-mono cursor-pointer"
                style={{
                  backgroundColor: isTocOpen 
                    ? 'color-mix(in srgb, var(--accent) 15%, var(--card-main))' 
                    : 'var(--card-main)',
                  borderColor: isTocOpen ? 'var(--accent)' : 'var(--border-main)',
                  color: isTocOpen ? 'var(--accent)' : 'var(--text-muted)',
                }}
                title="Table of contents outline"
                aria-label="Table of contents"
                aria-expanded={isTocOpen}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">TOC</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isTocOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Minimal Popover Outline */}
              {isTocOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 max-w-[90vw] max-h-80 overflow-y-auto rounded-lg border shadow-xl z-50 p-2.5 animate-fadeIn"
                  style={{
                    backgroundColor: 'var(--card-main)',
                    borderColor: 'var(--border-main)',
                  }}
                >
                  <div 
                    className="flex items-center justify-between pb-2 mb-2 border-b text-[10px] font-mono"
                    style={{ borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
                  >
                    <span className="font-semibold uppercase tracking-wider" style={{ color: 'var(--text-heading)' }}>
                      Outline
                    </span>
                    <span>{note.headings.length} sections</span>
                  </div>

                  <nav className="flex flex-col gap-0.5">
                    {note.headings.map((heading) => {
                      const minLevel = Math.min(...note.headings.map((h) => h.level));
                      const depth = Math.max(0, heading.level - minLevel);
                      return (
                        <a
                          key={heading.slug}
                          href={`#${heading.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            setIsTocOpen(false);
                            const el = document.getElementById(heading.slug);
                            if (el) {
                              const top = el.getBoundingClientRect().top + window.scrollY - 80;
                              window.scrollTo({ top, behavior: 'smooth' });
                            }
                          }}
                          className="py-1 px-2 rounded text-xs transition-colors hover:bg-opacity-80 block truncate font-mono text-[11px]"
                          style={{
                            paddingLeft: `${depth * 10 + 8}px`,
                            color: 'var(--text-main)',
                          }}
                          title={heading.text}
                        >
                          {heading.text}
                        </a>
                      );
                    })}
                  </nav>
                </div>
              )}
            </div>
          )}

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors border hover:opacity-80 cursor-pointer"
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
        className="mb-8 pb-6 border-b group/title cursor-default"
        style={{ borderColor: 'var(--border-main)' }}
      >
        <div className="flex items-start gap-2.5 mb-3">
          {note.pinned && (
            <span 
              title="Pinned Note"
              className="opacity-0 group-hover/title:opacity-100 transition-opacity duration-200 select-none"
            >
              <Pin className="w-4 h-4 shrink-0 mt-1 rotate-45" style={{ color: 'var(--text-muted)' }} />
            </span>
          )}
          <h1 
            className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight leading-tight ${fontClass}`}
            style={{ color: 'var(--text-heading)' }}
          >
            {note.title}
          </h1>
        </div>

        {/* Clean Unboxed Metadata — visible only when hovering over title */}
        <div 
          className="flex flex-wrap items-center gap-y-1.5 gap-x-2.5 text-xs font-mono opacity-0 group-hover/title:opacity-100 group-focus-within/title:opacity-100 transition-opacity duration-200"
          style={{ color: 'var(--text-muted)' }}
        >
          {note.isNotebook && (
            <span 
              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)',
                color: 'var(--accent)',
              }}
              title="Converted Jupyter Notebook"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Jupyter ({note.notebookKernel || note.notebookLanguage || 'Python'})</span>
            </span>
          )}

          {note.date && (
            <>
              {note.isNotebook && <span aria-hidden="true" style={{ color: 'var(--border-main)' }}>·</span>}
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>{note.date}</span>
              </span>
            </>
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
        </div>
      </header>

      {/* Main Markdown Body */}
      <div
        ref={contentRef}
        className={`markdown-body ${fontClass}`}
        dangerouslySetInnerHTML={{ __html: note.html || note.content }}
      />

      {/* Linked References — Academic Research Paper Footer Style */}
      {config.navigation.showBacklinks && backlinkNotes.length > 0 && (
        <section 
          className="mt-14 pt-8 border-t text-xs"
          style={{ borderColor: 'var(--border-main)' }}
        >
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-dashed" style={{ borderColor: 'var(--border-main)' }}>
            <h3 
              className="text-xs font-semibold tracking-wider font-mono uppercase flex items-center gap-2"
              style={{ color: 'var(--text-muted)' }}
            >
              <span>References</span>
            </h3>
            <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>
              [{backlinkNotes.length} cited {backlinkNotes.length === 1 ? 'document' : 'documents'}]
            </span>
          </div>

          <ol className="space-y-3.5 list-none p-0 m-0">
            {backlinkNotes.map((backNote, idx) => (
              <li 
                key={backNote.id}
                onClick={() => onSelectNote(backNote.id)}
                className="group flex items-start gap-2.5 p-2 -mx-2 rounded cursor-pointer hover:bg-[var(--card-main)] transition-colors"
              >
                {/* Academic citation index [1] */}
                <span 
                  className="font-mono text-xs font-semibold shrink-0 select-none pt-0.5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  [{idx + 1}]
                </span>

                {/* Academic bibliography entry format */}
                <div className="flex-1 min-w-0">
                  <div className="leading-relaxed">
                    <span 
                      className="font-medium hover:underline inline-flex items-center gap-1"
                      style={{ color: 'var(--text-heading)' }}
                    >
                      "{backNote.title}"
                      <ArrowUpRight className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity inline" />
                    </span>
                    {backNote.folder && (
                      <span className="font-mono text-[11px] ml-1.5 opacity-70" style={{ color: 'var(--text-muted)' }}>
                        in {backNote.folder}/
                      </span>
                    )}
                    {backNote.date && (
                      <span className="font-mono text-[11px] ml-1.5 opacity-60" style={{ color: 'var(--text-muted)' }}>
                        ({backNote.date})
                      </span>
                    )}
                  </div>

                  {backNote.description && (
                    <div 
                      className="text-[11px] mt-1.5 italic px-2.5 py-1.5 rounded border border-dotted leading-normal"
                      style={{ 
                        borderColor: 'var(--border-main)',
                        backgroundColor: 'var(--card-main)',
                        color: 'var(--text-muted)' 
                      }}
                    >
                      "{backNote.description}"
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ol>
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
