import React, { useEffect, useState } from 'react';
import { List, ChevronDown, ChevronUp } from 'lucide-react';
import { NoteHeading } from '../types';

interface TableOfContentsProps {
  headings: NoteHeading[];
}

export const TableOfContents: React.FC<TableOfContentsProps> = ({ headings }) => {
  const [activeSlug, setActiveSlug] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  if (headings.length < 2) {
    return null;
  }

  return (
    <nav 
      className="my-6 p-4 rounded-lg border select-none text-xs transition-colors"
      style={{
        backgroundColor: 'var(--card-main)',
        borderColor: 'var(--border-main)',
        color: 'var(--text-main)',
      }}
    >
      <div 
        className="flex items-center justify-between cursor-pointer font-semibold mb-2"
        onClick={() => setIsCollapsed(!isCollapsed)}
        style={{ color: 'var(--text-heading)' }}
      >
        <div 
          className="flex items-center gap-1.5 uppercase font-mono tracking-wider text-[11px]"
          style={{ color: 'var(--text-muted)' }}
        >
          <List className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />
          <span>Table of Contents</span>
        </div>
        <button 
          className="hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-muted)' }}
          aria-label={isCollapsed ? "Expand table of contents" : "Collapse table of contents"}
        >
          {isCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
        </button>
      </div>

      {!isCollapsed && (
        <ul 
          className="space-y-1.5 pt-2 border-t"
          style={{ borderColor: 'var(--border-main)' }}
        >
          {headings.map((h, idx) => {
            const isActive = activeSlug === h.slug;
            return (
              <li
                key={`${h.slug}-${idx}`}
                style={{ paddingLeft: `${(h.level - 1) * 12}px` }}
              >
                <a
                  href={`#${h.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(h.slug);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setActiveSlug(h.slug);
                    }
                  }}
                  className="block py-0.5 truncate transition-all duration-150 hover:underline"
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--text-main)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </nav>
  );
};
