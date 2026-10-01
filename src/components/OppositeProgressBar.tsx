import React, { useState, useEffect, useCallback } from 'react';
import { NoteHeading, SidebarPlacement } from '../types';

interface OppositeProgressBarProps {
  sidebarPlacement: SidebarPlacement;
  headings: NoteHeading[];
  title?: string;
}

export const OppositeProgressBar: React.FC<OppositeProgressBarProps> = ({
  sidebarPlacement,
  headings = [],
  title = 'Overview',
}) => {
  const [progress, setProgress] = useState(0);
  const [activeSlug, setActiveSlug] = useState<string>('');
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  // Determine which side of the screen to dock on (opposite of sidebar)
  // If sidebar is on the left -> progress bar is on the right
  // If sidebar is on the right -> progress bar is on the left
  // If sidebar is popup -> default to the right
  const isDockedLeft = sidebarPlacement === 'right';

  // Build section items including top Overview/Title if headings exist
  const sections = React.useMemo(() => {
    if (!headings || headings.length === 0) return [];
    return [
      { slug: 'article-top', text: title, level: 1 },
      ...headings.map((h) => ({ slug: h.slug, text: h.text, level: h.level })),
    ];
  }, [headings, title]);

  // Track scroll position to update reading progress & active section
  const handleScroll = useCallback(() => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const currentScrollY = window.scrollY || document.documentElement.scrollTop;

    const pct = docHeight > 0 
      ? Math.min(100, Math.max(0, Math.round((currentScrollY / docHeight) * 100))) 
      : 0;
    setProgress(pct);

    if (sections.length === 0) return;

    // Check which heading is currently in view
    let current = sections[0].slug;
    for (let i = 0; i < sections.length; i++) {
      const s = sections[i];
      if (s.slug === 'article-top') {
        if (currentScrollY < 120) {
          current = s.slug;
          break;
        }
      } else {
        const el = document.getElementById(s.slug);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          // Trigger when heading passes top buffer
          if (currentScrollY + 90 >= top) {
            current = s.slug;
          } else {
            break;
          }
        }
      }
    }
    setActiveSlug(current);
  }, [sections]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Scroll smoothly to section
  const scrollTo = (slug: string) => {
    if (slug === 'article-top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(slug);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 30;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Find index of active section to know "before" and "after"
  const activeIndex = sections.findIndex((s) => s.slug === activeSlug);

  return (
    <aside
      aria-label="Reading progress"
      className={`fixed ${isDockedLeft ? 'left-3 sm:left-5 lg:left-8' : 'right-3 sm:right-5 lg:right-8'} top-1/2 -translate-y-1/2 z-30 select-none pointer-events-auto hidden md:flex flex-col ${
        isDockedLeft ? 'items-start' : 'items-end'
      } gap-3`}
    >
      {/* Percentage in faint font-mono text */}
      <div 
        className="font-mono text-[10px] tracking-wider transition-opacity duration-200"
        style={{ color: 'var(--text-muted)', opacity: 0.5 }}
        title={`Reading progress: ${progress}%`}
      >
        {progress}%
      </div>

      {/* Vertical Track / Section Line Stack */}
      <div 
        className={`flex flex-col ${isDockedLeft ? 'items-start' : 'items-end'} gap-2 relative py-1`}
      >
        {sections.length > 0 ? (
          sections.map((section, idx) => {
            const isActive = section.slug === activeSlug || (activeIndex === -1 && idx === 0);
            const isPassed = activeIndex !== -1 && idx < activeIndex;
            const isHovered = hoveredSlug === section.slug;

            return (
              <div
                key={section.slug}
                onClick={() => scrollTo(section.slug)}
                onMouseEnter={() => setHoveredSlug(section.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
                className={`group flex items-center gap-2 cursor-pointer py-0.5 transition-all ${
                  isDockedLeft ? 'flex-row' : 'flex-row-reverse'
                }`}
                title={section.text}
              >
                {/* The Section Line Indicator:
                    - Active section: longer accent line
                    - Inactive sections (before/after): simple minimal line */}
                <div
                  className="rounded-full transition-all duration-300 ease-out shrink-0"
                  style={{
                    height: '2px',
                    width: isActive ? '20px' : isHovered ? '14px' : '9px',
                    backgroundColor: isActive 
                      ? 'var(--accent)' 
                      : isPassed 
                      ? 'var(--accent)' 
                      : 'var(--border-main)',
                    opacity: isActive ? 1 : isPassed ? 0.5 : 0.3,
                  }}
                />

                {/* Text:
                    - ONLY show current topic in faint color
                    - Before and after sections: NO text (only lines)!
                    - (When hovered on before/after, subtle peek label) */}
                {isActive ? (
                  <span
                    className="text-[11px] font-mono tracking-tight max-w-[130px] lg:max-w-[170px] truncate transition-opacity duration-300"
                    style={{
                      color: 'var(--text-muted)',
                      opacity: 0.7,
                    }}
                  >
                    {section.text}
                  </span>
                ) : isHovered ? (
                  <span
                    className="text-[10px] font-mono tracking-tight max-w-[120px] truncate opacity-50 transition-opacity duration-150 animate-fadeIn"
                    style={{
                      color: 'var(--text-muted)',
                    }}
                  >
                    {section.text}
                  </span>
                ) : null}
              </div>
            );
          })
        ) : (
          /* Fallback when note has no headings: simple sleek vertical progress track */
          <div 
            className="w-1 h-32 rounded-full overflow-hidden"
            style={{ backgroundColor: 'color-mix(in srgb, var(--border-main) 40%, transparent)' }}
          >
            <div 
              className="w-full rounded-full transition-all duration-150 ease-out"
              style={{ 
                height: `${progress}%`,
                backgroundColor: 'var(--accent)',
                opacity: 0.75
              }}
            />
          </div>
        )}
      </div>
    </aside>
  );
};
