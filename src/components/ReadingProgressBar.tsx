import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, Hash, BookOpen } from 'lucide-react';
import { NoteHeading } from '../types';

interface ReadingProgressBarProps {
  targetRef: React.RefObject<HTMLElement | null>;
  readingTimeMinutes?: number;
  title?: string;
  headings?: NoteHeading[];
}

interface ActiveSection {
  text: string;
  slug: string;
  level: number;
}

export const ReadingProgressBar: React.FC<ReadingProgressBarProps> = ({
  targetRef,
  readingTimeMinutes = 1,
  title,
  headings = [],
}) => {
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>({
    text: title || 'Overview',
    slug: '',
    level: 0,
  });

  const barContainerRef = useRef<HTMLDivElement | null>(null);
  const menuContainerRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Update active section based on current scroll position
  const updateActiveSection = useCallback(() => {
    if (!headings || headings.length === 0) {
      setActiveSection({
        text: title || 'Overview',
        slug: '',
        level: 0,
      });
      return;
    }

    // Offset trigger: section bar (42px) + buffer (18px) = 60px
    const scrollPosition = (window.scrollY || document.documentElement.scrollTop) + 60;

    let current: ActiveSection = {
      text: title || 'Overview',
      slug: '',
      level: 0,
    };

    for (let i = 0; i < headings.length; i++) {
      const h = headings[i];
      const el = document.getElementById(h.slug);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY;
        if (scrollPosition >= top) {
          current = {
            text: h.text,
            slug: h.slug,
            level: h.level,
          };
        } else {
          break;
        }
      }
    }

    setActiveSection(current);
  }, [headings, title]);

  // Calculate percentage of note read
  const calculateProgress = useCallback(() => {
    if (!targetRef.current) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight > 0) {
        const pct = Math.min(100, Math.max(0, (window.scrollY / docHeight) * 100));
        setProgress(Math.round(pct));
      }
      return;
    }

    const element = targetRef.current;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const navbarHeight = 0;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const elementTop = rect.top + scrollTop;
    const elementHeight = element.offsetHeight;

    // Total distance needed to scroll through the article content
    const totalDistance = elementHeight - (windowHeight * 0.7);

    // If near the bottom of the whole page, consider 100% complete
    const isPageBottom = windowHeight + scrollTop >= document.documentElement.scrollHeight - 32;
    if (isPageBottom) {
      setProgress(100);
      return;
    }

    if (totalDistance <= 0) {
      setProgress(100);
      return;
    }

    const scrolled = scrollTop - (elementTop - navbarHeight);
    if (scrolled <= 0) {
      setProgress(0);
      return;
    }

    const pct = Math.min(100, Math.max(0, (scrolled / totalDistance) * 100));
    setProgress(Math.round(pct));
  }, [targetRef]);

  // Reset and recalculate on scroll / resize / note change
  useEffect(() => {
    calculateProgress();
    updateActiveSection();
    setIsScrolled((window.scrollY || document.documentElement.scrollTop) > 75);

    const onScroll = () => {
      calculateProgress();
      updateActiveSection();
      setIsScrolled((window.scrollY || document.documentElement.scrollTop) > 75);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [calculateProgress, updateActiveSection, title]);

  // Click on progress bar track to scrub / jump to that percentage of the article
  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!barContainerRef.current || !targetRef.current) return;
    const barRect = barContainerRef.current.getBoundingClientRect();
    const clickRatio = Math.max(0, Math.min(1, (e.clientX - barRect.left) / barRect.width));

    const element = targetRef.current;
    const rect = element.getBoundingClientRect();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const elementTop = rect.top + scrollTop;
    const elementHeight = element.offsetHeight;
    const navbarHeight = 0;
    const totalDistance = elementHeight - (window.innerHeight * 0.7);

    const targetY = (elementTop - navbarHeight) + (totalDistance * clickRatio);
    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: 'smooth',
    });
  };

  // Scroll smoothly to a specific section heading
  const scrollToSection = (slug: string) => {
    if (!slug) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(slug);
    if (el) {
      // 42px section bar + 8px buffer = 50px
      const top = el.getBoundingClientRect().top + window.scrollY - 50;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const remainingMinutes = Math.max(1, Math.ceil(readingTimeMinutes * (1 - progress / 100)));

  return (
    <div
      className={`sticky top-0 z-20 w-full select-none transition-all ${
        isScrolled ? 'shadow-xs border-b' : 'border-b-0'
      }`}
      style={{
        backgroundColor: 'var(--bg-main)',
        borderColor: isScrolled ? 'var(--border-main)' : 'transparent',
      }}
      role="region"
      aria-label="Reading progress and current section"
    >
      {/* 1. Scroll-based Reading Progress Line */}
      <div
        ref={barContainerRef}
        onClick={handleBarClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-full relative cursor-pointer overflow-hidden transition-all group"
        style={{
          height: isHovered ? '4.5px' : '3px',
          backgroundColor: isScrolled ? 'var(--border-main)' : 'transparent',
        }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress indicator"
        title={`Reading progress: ${progress}% (Click along bar to scrub)`}
      >
        <div
          className="h-full transition-all duration-100 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: 'var(--accent)',
            boxShadow: isHovered ? '0 0 10px var(--accent)' : '0 0 5px var(--accent)',
          }}
        />
      </div>

      {/* 2. Top Content Strip: Current Section Text Box + Reading Metrics (Only activated when scrolled) */}
      <div 
        className={`transition-all duration-300 ease-out overflow-hidden ${
          isScrolled 
            ? 'max-h-14 opacity-100' 
            : 'max-h-0 opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: 'var(--card-main)',
        }}
      >
        <div 
          className="flex items-center justify-between px-3 sm:px-6 py-1.5 gap-2 backdrop-blur-md"
        >
        {/* Left: Small Section Indicator Text Box */}
        <div className="relative min-w-0 flex items-center" ref={menuContainerRef}>
          <div 
            className="flex items-center rounded-md border text-xs font-mono shadow-xs overflow-hidden transition-all"
            style={{
              backgroundColor: 'var(--bg-main)',
              borderColor: isMenuOpen ? 'var(--accent)' : 'var(--border-main)',
            }}
          >
            {/* Clickable section title to scroll to section start */}
            <button
              type="button"
              onClick={() => scrollToSection(activeSection.slug)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-left truncate max-w-[190px] sm:max-w-xs md:max-w-md hover:opacity-80 transition-opacity cursor-pointer focus:outline-none"
              title={`Currently in: ${activeSection.text} (Click to scroll to top of this section)`}
            >
              {activeSection.level > 0 ? (
                <span 
                  className="px-1 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 flex items-center gap-0.5"
                  style={{ 
                    backgroundColor: 'var(--card-main)', 
                    color: 'var(--accent)',
                    border: '1px solid var(--border-main)'
                  }}
                >
                  <Hash className="w-2.5 h-2.5" />
                  <span>H{activeSection.level}</span>
                </span>
              ) : (
                <span 
                  className="px-1 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0 flex items-center gap-0.5"
                  style={{ 
                    backgroundColor: 'var(--card-main)', 
                    color: 'var(--accent)',
                    border: '1px solid var(--border-main)'
                  }}
                >
                  <BookOpen className="w-2.5 h-2.5" />
                  <span>NOTE</span>
                </span>
              )}

              <span 
                className="truncate font-medium text-xs"
                style={{ color: 'var(--text-heading)' }}
              >
                {activeSection.text}
              </span>
            </button>

            {/* Quick dropdown toggle button if note has headings */}
            {headings.length > 1 && (
              <button
                type="button"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="px-1.5 py-1 border-l hover:opacity-80 transition-opacity focus:outline-none cursor-pointer"
                style={{
                  borderColor: 'var(--border-main)',
                  color: isMenuOpen ? 'var(--accent)' : 'var(--text-muted)',
                }}
                title="Browse all sections"
                aria-label="Toggle section picker"
                aria-expanded={isMenuOpen}
              >
                <ChevronDown 
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} 
                />
              </button>
            )}
          </div>

          {/* Section Picker Dropdown */}
          {isMenuOpen && headings.length > 0 && (
            <div
              className="absolute left-0 top-full mt-1.5 w-64 sm:w-80 max-h-72 overflow-y-auto rounded-lg border shadow-xl z-50 p-1.5 backdrop-blur-md"
              style={{
                backgroundColor: 'var(--sidebar-main)',
                borderColor: 'var(--border-main)',
              }}
            >
              <div 
                className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider font-semibold border-b mb-1 flex items-center justify-between"
                style={{ borderColor: 'var(--border-main)', color: 'var(--text-muted)' }}
              >
                <span>Jump to Section</span>
                <span>{headings.length} sections</span>
              </div>

              {headings.map((h, idx) => {
                const isActive = activeSection.slug === h.slug;
                return (
                  <button
                    key={`${h.slug}-${idx}`}
                    type="button"
                    onClick={() => {
                      scrollToSection(h.slug);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition-colors flex items-center gap-2 cursor-pointer ${
                      isActive ? 'font-semibold' : 'hover:opacity-80'
                    }`}
                    style={{
                      paddingLeft: `${Math.max(8, (h.level - 1) * 10 + 8)}px`,
                      backgroundColor: isActive ? 'var(--card-main)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-main)',
                    }}
                  >
                    <span 
                      className="text-[10px] font-mono shrink-0 px-1 py-0.5 rounded"
                      style={{
                        backgroundColor: isActive ? 'var(--bg-main)' : 'transparent',
                        color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                        border: isActive ? '1px solid var(--border-main)' : 'none'
                      }}
                    >
                      H{h.level}
                    </span>
                    <span className="truncate">{h.text}</span>
                    {isActive && (
                      <span 
                        className="ml-auto w-1.5 h-1.5 rounded-full shrink-0" 
                        style={{ backgroundColor: 'var(--accent)' }} 
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Reading Progress Metric Box */}
        <div 
          className="flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-mono shrink-0 shadow-xs"
          style={{
            backgroundColor: 'var(--bg-main)',
            borderColor: 'var(--border-main)',
            color: 'var(--text-muted)',
          }}
        >
          <span 
            className="w-1.5 h-1.5 rounded-full animate-pulse" 
            style={{ backgroundColor: 'var(--accent)' }} 
          />
          <span className="font-semibold" style={{ color: 'var(--accent)' }}>
            {progress}%
          </span>
          <span className="hidden sm:inline text-[11px]" style={{ color: 'var(--text-muted)' }}>
            · ~{remainingMinutes}m left
          </span>
        </div>
      </div>
      </div>
    </div>
  );
};
