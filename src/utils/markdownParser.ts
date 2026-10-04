import { load } from 'js-yaml';
import { marked } from 'marked';
import { NoteHeading } from '../types';

export interface ParsedMarkdown {
  frontmatter: Record<string, any>;
  content: string;
  html: string;
  headings: NoteHeading[];
  forwardLinks: string[];
  tags: string[];
  wordCount: number;
  readingTimeMinutes: number;
  excerpt: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

/**
 * Parses frontmatter in YAML format at the beginning of a Markdown file:
 * ---
 * title: My Note
 * tags: [journal, thoughts]
 * ---
 */
export function extractFrontmatter(raw: string): { frontmatter: Record<string, any>; content: string } {
  const frontmatterRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
  const match = raw.match(frontmatterRegex);

  if (match) {
    try {
      const parsed = (load(match[1]) || {}) as Record<string, any>;
      return {
        frontmatter: parsed,
        content: match[2].trim(),
      };
    } catch (err) {
      console.warn('Error parsing frontmatter YAML:', err);
      return {
        frontmatter: {},
        content: raw,
      };
    }
  }

  return {
    frontmatter: {},
    content: raw,
  };
}

/**
 * Extracts and replaces wikilinks: [[target|title]] or [[target]]
 */
export function processWikilinks(text: string): { processedText: string; forwardLinks: string[] } {
  const forwardLinks: string[] = [];
  const wikilinkRegex = /\[\[([^[\]]+)\]\]/g;

  const processedText = text.replace(wikilinkRegex, (_, linkContent) => {
    let target = linkContent.trim();
    let display = target;

    if (linkContent.includes('|')) {
      const parts = linkContent.split('|');
      target = parts[0].trim();
      display = parts.slice(1).join('|').trim();
    }

    forwardLinks.push(target);
    // Render special data attributes for interactive SPA navigation
    const targetSlug = slugify(target.replace(/\.md$/, ''));
    return `<a href="#/note/${targetSlug}" class="wikilink" data-target="${target}" data-slug="${targetSlug}">${display}</a>`;
  });

  return { processedText, forwardLinks };
}

/**
 * Transforms Markdown callouts / admonitions:
 * > [!note] Title
 * > Content here
 */
export function processCallouts(text: string): string {
  const calloutBlockRegex = /^>\s*\[!([a-zA-Z]+)\]\s*(.*)?\n((?:^>.*(?:\n|$))*)/gm;

  return text.replace(calloutBlockRegex, (_, typeRaw, titleRaw, bodyRaw) => {
    const type = typeRaw.toLowerCase();
    const title = titleRaw.trim() || type.charAt(0).toUpperCase() + type.slice(1);
    const body = (bodyRaw || '')
      .split('\n')
      .map((line: string) => line.replace(/^>\s?/, ''))
      .join('\n')
      .trim();

    return `\n<div class="callout callout-${type}" data-callout="${type}">
      <div class="callout-header">
        <span class="callout-icon"></span>
        <span class="callout-title">${title}</span>
      </div>
      <div class="callout-body">
        ${body}
      </div>
    </div>\n`;
  });
}

/**
 * Extracts headings h2, h3, h4 for the Table of Contents.
 * Excludes h1 because h1 represents the document title (which is displayed in the note header).
 */
export function extractHeadings(markdown: string): NoteHeading[] {
  const headings: NoteHeading[] = [];
  const lines = markdown.split('\n');
  const slugCounts = new Map<string, number>();

  for (const line of lines) {
    // Only capture level 2, 3, and 4 headings for the Table of Contents
    const match = line.match(/^(#{2,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim().replace(/\[\[.*?\]\]/g, (m) => m.replace(/\[\[|\]\]/g, ''));
      const baseSlug = slugify(text) || 'section';
      const count = slugCounts.get(baseSlug) || 0;
      slugCounts.set(baseSlug, count + 1);
      const slug = count === 0 ? baseSlug : `${baseSlug}-${count}`;
      headings.push({ level, text, slug });
    }
  }

  return headings;
}

/**
 * Extracts inline #tags from markdown text (e.g. #journal, #reflection)
 */
export function extractInlineTags(text: string): string[] {
  const tagRegex = /(?:^|\s)#([a-zA-Z0-9_-]+)(?=\s|$|[.,;:!?])/g;
  const tags: string[] = [];
  let match;
  while ((match = tagRegex.exec(text)) !== null) {
    // Avoid hex color codes or headings
    if (!match[1].match(/^[0-9a-fA-F]{3,6}$/) && isNaN(Number(match[1]))) {
      tags.push(match[1]);
    }
  }
  return tags;
}

/**
 * Transforms inline #tags in markdown into interactive clickable links with data-tag attributes,
 * safely ignoring code blocks, inline code, and hex colors.
 */
export function processInlineTags(text: string): string {
  const codeSegmentRegex = /(```[\s\S]*?```|`[^`\n]+`)/g;
  const parts = text.split(codeSegmentRegex);

  for (let i = 0; i < parts.length; i += 2) {
    if (!parts[i]) continue;
    parts[i] = parts[i].replace(/(^|[^\w#])#([a-zA-Z][a-zA-Z0-9_-]*)(?=[^\w-]|$)/gm, (match, prefix, tag) => {
      if (/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(tag)) {
        return match;
      }
      return `${prefix}<a href="#/tag/${encodeURIComponent(tag)}" class="tag-link" data-tag="${tag}">#${tag}</a>`;
    });
  }

  return parts.join('');
}

/**
 * Full parsing pipeline from raw markdown to enriched note data.
 * Enforces single title: if title is in meta or starts in body, only one title is used.
 */
export function parseNoteMarkdown(raw: string, fallbackTitle: string): ParsedMarkdown {
  const { frontmatter, content } = extractFrontmatter(raw);

  // Single Title Enforcement:
  // If the markdown body begins with an H1 (# Title), extract it if frontmatter.title is missing,
  // and strip it from the body so there is never a duplicate title rendered in the body.
  let cleanedContent = content;
  const leadingH1Match = cleanedContent.match(/^\s*#\s+([^\n\r]+)(?:\r?\n|$)/);
  if (leadingH1Match) {
    const rawHeadingText = leadingH1Match[1].trim().replace(/\[\[.*?\]\]/g, (m) => m.replace(/\[\[|\]\]/g, ''));
    if (!frontmatter.title) {
      frontmatter.title = rawHeadingText;
    }
    // Remove the leading H1 from the body content
    cleanedContent = cleanedContent.replace(/^\s*#\s+[^\n\r]+(?:\r?\n|$)/, '').trim();
  } else if (frontmatter.title) {
    // If frontmatter already has a title, check if the first heading in content is an H1 with matching title
    const escaped = frontmatter.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const duplicateH1Regex = new RegExp(`^\\s*#\\s+${escaped}\\s*(?:\\r?\\n|$)`, 'im');
    cleanedContent = cleanedContent.replace(duplicateH1Regex, '').trim();
  }

  // Extract inline tags and combine with frontmatter tags
  const inlineTags = extractInlineTags(cleanedContent);
  const rawTags = frontmatter.tags || [];
  const fmTags = Array.isArray(rawTags)
    ? rawTags.map(String)
    : typeof rawTags === 'string'
    ? rawTags.split(',').map((t) => t.trim())
    : [];

  const combinedTags = Array.from(new Set([...fmTags, ...inlineTags]));

  // Headings (H2, H3, H4) for Table of Contents
  const headings = extractHeadings(cleanedContent);

  // Process Callouts
  const withCallouts = processCallouts(cleanedContent);

  // Process Inline Tags into clickable links
  const withTags = processInlineTags(withCallouts);

  // Process Wikilinks
  const { processedText, forwardLinks } = processWikilinks(withTags);

  // Render HTML via marked
  // Configure renderer to add IDs to headings for TOC linking
  const htmlSlugCounts = new Map<string, number>();
  const renderer = new marked.Renderer();
  renderer.heading = ({ text, depth }: { text: string; depth: number }) => {
    // Strip any HTML tags for clean slug
    const cleanText = text.replace(/<[^>]*>/g, '');
    const baseSlug = slugify(cleanText) || 'section';
    const count = htmlSlugCounts.get(baseSlug) || 0;
    htmlSlugCounts.set(baseSlug, count + 1);
    const id = count === 0 ? baseSlug : `${baseSlug}-${count}`;
    return `<h${depth} id="${id}" class="anchor-heading"><a href="#${id}" class="heading-anchor">#</a>${text}</h${depth}>`;
  };

  renderer.link = ({ href, title, text }: { href: string; title?: string | null; text: string }) => {
    const isExternal = href.startsWith('http://') || href.startsWith('https://');
    const titleAttr = title ? ` title="${title}"` : '';

    if (isExternal) {
      return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="external-link"${titleAttr}>${text}</a>`;
    }

    if (href.startsWith('#')) {
      return `<a href="${href}" class="anchor-link"${titleAttr}>${text}</a>`;
    }

    const cleanTarget = href.replace(/\.md$/, '');
    return `<a href="#/note/${cleanTarget}" class="internal-link" data-target="${cleanTarget}"${titleAttr}>${text}</a>`;
  };

  marked.setOptions({
    gfm: true,
    breaks: true,
    renderer,
  });

  const html = marked.parse(processedText) as string;

  // Words and reading time
  const cleanWordContent = cleanedContent.replace(/<[^>]*>/g, ' ').replace(/[#*_`~-]/g, ' ');
  const words = cleanWordContent.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Excerpt for search or previews
  const excerpt = cleanWordContent.slice(0, 180).trim() + (cleanWordContent.length > 180 ? '...' : '');

  return {
    frontmatter,
    content: cleanedContent,
    html,
    headings,
    forwardLinks,
    tags: combinedTags,
    wordCount,
    readingTimeMinutes,
    excerpt,
  };
}
