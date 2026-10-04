import React, { useEffect, useState } from 'react';
import { AlignLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { NoteHeading } from '../types';

interface TableOfContentsProps {
  headings: NoteHeading[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [activeSlug, setActiveSlug] = useState<string>('');
  // Collapsed by default as requested
  const [isCollapsed, setIsCollapsed] = useState<boolean>(true);

  // IntersectionObserver to highlight currently active section while scrolling
  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: '-80px 0px -60% 0px',
        threshold: 0,
      }
    );

    const elements: Element[] = [];
    for (const h of headings) {
      const el = document.getElementById(h.slug);
      if (el) {
        observer.observe(el);
        elements.push(el);
      }
    }

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, [headings]);

  if (!headings || headings.length === 0) {
    return null;
  }

  // Find min heading level (typically level 2) to normalize relative indentation
  const minLevel = Math.min(...headings.map((h) => h.level));
  const activeHeading = headings.find((h) => h.slug === activeSlug);

  const handleHeadingClick = (e: React.MouseEvent, slug: string) => {
    e.preventDefault();
    const el = document.getElementById(slug);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
      setActiveSlug(slug);
      window.history.replaceState(null, '', `#${slug}`);
    }
  };

  return (
    <nav 
      aria-label="Table of Contents"
      className="my-6 rounded-lg border text-xs select-none transition-all shadow-xs"
      style={{
        backgroundColor: 'var(--card-main)',
        borderColor: 'var(--border-main)',
        color: 'var(--text-main)',
      }}
    >
      {/* Header bar: Collapsed by default, click to expand/collapse */}
      <button 
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-3.5 sm:px-4 cursor-pointer text-left transition-colors hover:opacity-90 focus:outline-none"
        aria-expanded={!isCollapsed}
        aria-controls="toc-sections-list"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className="w-6 h-6 rounded flex items-center justify-center shrink-0 border"
            style={{ 
              backgroundColor: 'var(--bg-main)', 
              borderColor: 'var(--border-main)',
              color: 'var(--accent)'
            }}
          >
            <AlignLeft className="w-3.5 h-3.5" />
          </div>

          <div className="flex items-center gap-2 truncate">
            <span 
              className="font-semibold text-xs tracking-tight"
              style={{ color: 'var(--text-heading)' }}
            >
              Table of Contents
            </span>
            <span 
              className="px-1.5 py-0.5 rounded text-[10px] font-mono border shrink-0"
              style={{
                backgroundColor: 'var(--bg-main)',
                borderColor: 'var(--border-main)',
                color: 'var(--text-muted)',
              }}
            >
              {headings.length} {headings.length === 1 ? 'section' : 'sections'}
            </span>
          </div>

          {/* Contextual breadcrumb snippet when collapsed */}
          {isCollapsed && activeHeading && (
            <span 
              className="hidden md:inline-block text-[11px] truncate max-w-[220px]"
              style={{ color: 'var(--text-muted)' }}
              title={activeHeading.text}
            >
              · {activeHeading.text}
            </span>
          )}
        </div>

        <div 
          className="flex items-center gap-1.5 font-mono text-[11px] shrink-0 ml-2"
          style={{ color: 'var(--text-muted)' }}
        >
          <span>{isCollapsed ? 'Show' : 'Hide'}</span>
          {isCollapsed ? (
            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 transition-transform duration-200" />
          )}
        </div>
      </button>

      {/* Expanded Sections Tree */}
      {!isCollapsed && (
        <div 
          id="toc-sections-list"
          className="px-4 pb-3.5 pt-2 border-t"
          style={{ borderColor: 'var(--border-main)' }}
        >
          <ul className="space-y-1">
            {headings.map((h, idx) => {
              const isActive = activeSlug === h.slug;
              const relativeLevel = Math.max(0, h.level - minLevel);
              const indentPadding = relativeLevel * 16; // 16px per subheading depth

              return (
                <li
                  key={`${h.slug}-${idx}`}
                  style={{ paddingLeft: `${indentPadding}px` }}
                  className="relative group"
                >
                  {/* Subtle vertical indicator bar for subheadings */}
                  {relativeLevel > 0 && (
                    <span 
                      className="absolute left-1 top-2.5 bottom-2.5 w-px opacity-40"
                      style={{ backgroundColor: 'var(--border-main)' }}
                    />
                  )}

                  <a
                    href={`#${h.slug}`}
                    onClick={(e) => handleHeadingClick(e, h.slug)}
                    className={`flex items-center gap-2 py-1 px-2 rounded-md transition-all truncate ${
                      isActive ? 'font-semibold' : 'font-normal hover:opacity-100 opacity-80'
                    }`}
                    style={{
                      color: isActive ? 'var(--accent)' : 'var(--text-main)',
                      backgroundColor: isActive 
                        ? 'color-mix(in srgb, var(--accent) 10%, transparent)' 
                        : 'transparent',
                    }}
                  >
                    <span 
                      className={`w-1.5 h-1.5 rounded-full shrink-0 transition-transform ${
                        isActive ? 'scale-125' : 'opacity-40 group-hover:opacity-75'
                      }`}
                      style={{
                        backgroundColor: isActive ? 'var(--accent)' : 'var(--text-muted)',
                      }}
                    />
                    <span className="truncate">{h.text}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </nav>
  );
};
