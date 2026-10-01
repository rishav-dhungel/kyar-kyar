import { NoteItem } from '../types';
import { parseNoteMarkdown, slugify } from './markdownParser';
import { computeBacklinks } from './fileTree';

/**
 * Dynamically discovers and loads all markdown files from the /content parent folder.
 * Vite's import.meta.glob bundles all .md files under /content/ as raw text.
 * When files are added, renamed, or moved into folders inside /content,
 * they are automatically discovered, parsed, and rendered without hardcoded content!
 */
export function loadContentFromMarkdown(): NoteItem[] {
  // Vite glob import of all markdown files in root /content folder
  const contentModules = import.meta.glob('/content/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  // Fallback: also check if any markdown files exist in src/content
  const srcContentModules = import.meta.glob('/src/content/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  const allModules: Record<string, string> = {
    ...srcContentModules,
    ...contentModules,
  };

  const rawEntries = Object.entries(allModules);

  if (rawEntries.length === 0) {
    console.warn('No markdown files found in /content parent folder.');
    return [];
  }

  const notes: NoteItem[] = rawEntries.map(([absolutePath, rawMarkdown], index) => {
    // Normalize relative file path from /content/ or /src/content/
    let relativeFilePath = absolutePath;
    if (relativeFilePath.startsWith('/content/')) {
      relativeFilePath = relativeFilePath.replace('/content/', '');
    } else if (relativeFilePath.startsWith('/src/content/')) {
      relativeFilePath = relativeFilePath.replace('/src/content/', '');
    } else {
      relativeFilePath = relativeFilePath.replace(/^\//, '');
    }

    // Extract folder name (if inside a subfolder)
    const lastSlashIndex = relativeFilePath.lastIndexOf('/');
    const folder = lastSlashIndex !== -1 ? relativeFilePath.slice(0, lastSlashIndex) : '';
    
    // Fallback title from filename
    const filename = relativeFilePath.split('/').pop()?.replace(/\.md$/, '') || `Note ${index + 1}`;
    const cleanFilenameTitle = filename
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    // Parse YAML frontmatter, markdown, headings, and wikilinks
    const parsed = parseNoteMarkdown(rawMarkdown, cleanFilenameTitle);
    const title = parsed.frontmatter.title || cleanFilenameTitle;
    const slug = slugify(parsed.frontmatter.slug || filename);

    return {
      id: `note-${index + 1}`,
      slug,
      title,
      folder,
      filePath: relativeFilePath,
      content: parsed.content,
      html: parsed.html,
      rawMarkdown,
      frontmatter: parsed.frontmatter,
      date: parsed.frontmatter.date,
      tags: parsed.tags || [],
      pinned: Boolean(parsed.frontmatter.pinned),
      description: parsed.frontmatter.description || parsed.excerpt,
      readingTimeMinutes: parsed.readingTimeMinutes,
      wordCount: parsed.wordCount,
      headings: parsed.headings,
      forwardLinks: parsed.forwardLinks,
      backlinks: [],
    };
  });

  // Ensure index.md is always first if present
  notes.sort((a, b) => {
    if (a.filePath === 'index.md') return -1;
    if (b.filePath === 'index.md') return 1;
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return 0;
  });

  // Automatically compute bidirectional backlinks across all parsed markdown notes
  return computeBacklinks(notes);
}
