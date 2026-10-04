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
  const [isApproaching, setIsApproaching] = useState<boolean>(false);

  // Determine which side of the screen to dock on (opposite of sidebar)
  // If sidebar is on the left -> progress bar is on the right
  // If sidebar is on the right -> progress bar is on the left
  // If sidebar is popup -> default to the right
  const isDockedLeft = sidebarPlacement === 'right';

  // Build section items including top Overview/Title if headings exist
  const sections = React.useMemo(() => {
    if (!headings || headings.length === 0) return [];
    const normalizedTitle = title.trim().toLowerCase();
    const cleanHeadings = headings.filter((h) => h.text.trim().toLowerCase() !== normalizedTitle);
    return [
      { slug: 'article-top', text: title, level: 1 },
      ...cleanHeadings.map((h) => ({ slug: h.slug, text: h.text, level: h.level })),
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
      aria-label="Reading progress tracker"
      onMouseEnter={() => setIsApproaching(true)}
      onMouseLeave={() => {
        setIsApproaching(false);
        setHoveredSlug(null);
      }}
      className={`fixed ${isDockedLeft ? 'left-3 sm:left-5 lg:left-8' : 'right-3 sm:right-5 lg:right-8'} top-1/2 -translate-y-1/2 z-30 select-none pointer-events-auto hidden md:flex flex-col ${
        isDockedLeft ? 'items-start' : 'items-end'
      } gap-2.5 py-3 px-1.5`}
    >
      {/* Percentage in faint font-mono text */}
      <div 
        className="font-mono text-[10px] tracking-wider transition-opacity duration-200"
        style={{ color: 'var(--text-muted)', opacity: isApproaching ? 0.8 : 0.4 }}
        title={`Reading progress: ${progress}%`}
      >
        {progress}%
      </div>

      {/* Vertical Track / Section Line Stack */}
      <div 
        className={`flex flex-col ${isDockedLeft ? 'items-start' : 'items-end'} gap-1.5 relative py-1`}
      >
        {sections.length > 0 ? (
          sections.map((section, idx) => {
            const isActive = section.slug === activeSlug || (activeIndex === -1 && idx === 0);
            const isPassed = activeIndex !== -1 && idx < activeIndex;
            const isHovered = hoveredSlug === section.slug;

            // Only show title when user approaches / hovers:
            // 1. If a specific line is hovered, show its title.
            // 2. Or if approaching the tracker area and this is the active section, show it.
            const showTitle = isHovered || (isApproaching && isActive && !hoveredSlug);

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
                {/* The Section Line Indicator: Always visible with line and color */}
                <div
                  className="rounded-full transition-all duration-200 ease-out shrink-0"
                  style={{
                    height: isActive || isHovered ? '2.5px' : '2px',
                    width: isHovered ? '22px' : isActive ? '18px' : '9px',
                    backgroundColor: isActive || isHovered
                      ? 'var(--accent)' 
                      : isPassed 
                      ? 'var(--accent)' 
                      : 'var(--border-main)',
                    opacity: isActive || isHovered ? 1 : isPassed ? 0.55 : 0.35,
                  }}
                />

                {/* Title: ONLY shown when user approaches or hovers */}
                {showTitle && (
                  <span
                    className="text-[11px] font-mono tracking-tight max-w-[130px] lg:max-w-[180px] truncate px-2 py-0.5 rounded border shadow-xs backdrop-blur-md transition-all duration-150 animate-fadeIn pointer-events-none"
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--card-main) 94%, transparent)',
                      borderColor: 'var(--border-main)',
                      color: isActive || isHovered ? 'var(--text-heading)' : 'var(--text-muted)',
                    }}
                  >
                    {section.text}
                  </span>
                )}
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
