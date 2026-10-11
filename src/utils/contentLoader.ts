import { NoteItem } from '../types';
import { parseNoteMarkdown, slugify } from './markdownParser';
import { computeBacklinks } from './fileTree';
import { convertNotebookToMarkdown } from './notebookConverter';

/**
 * Dynamically discovers and loads all Markdown (.md) and Jupyter Notebook (.ipynb, .ipyb)
 * files from the /content parent folder.
 * 
 * When someone places an .ipynb or .ipyb notebook in /content or any subfolder,
 * it is automatically converted into a blog post with code blocks, cell outputs,
 * images, tables, and table of contents!
 */
export function loadContentFromMarkdown(): NoteItem[] {
  // Relative globs from src/utils/ to root content folder (works universally across Windows, macOS, Linux)
  const relMdModules = import.meta.glob('../../content/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  const relNbIpynb = import.meta.glob('../../content/**/*.ipynb', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  const relNbIpyb = import.meta.glob('../../content/**/*.ipyb', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  // Root-relative globs
  const rootMdModules = import.meta.glob('/content/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  const rootNbIpynb = import.meta.glob('/content/**/*.ipynb', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  const rootNbIpyb = import.meta.glob('/content/**/*.ipyb', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  // Fallback: also check if any markdown or notebook files exist in src/content
  const srcMdModules = import.meta.glob('/src/content/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  const srcNbIpynb = import.meta.glob('/src/content/**/*.ipynb', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  const srcNbIpyb = import.meta.glob('/src/content/**/*.ipyb', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  // Helper to extract clean path relative to content folder
  const normalizePath = (rawPath: string): string => {
    const p = rawPath.replace(/\\/g, '/');
    const contentMatch = p.match(/(?:^|\/)content\/(.+)$/);
    if (contentMatch) return contentMatch[1];
    const srcContentMatch = p.match(/(?:^|\/)src\/content\/(.+)$/);
    if (srcContentMatch) return srcContentMatch[1];
    return p.replace(/^(\.\.\/)+/, '').replace(/^\.\//, '').replace(/^\/?content\//, '').replace(/^\/?src\/content\//, '').replace(/^\/+/, '');
  };

  // Merge and de-duplicate by normalized relative path
  const normalizedMap = new Map<string, string>();
  const allSources = [
    rootMdModules,
    rootNbIpynb,
    rootNbIpyb,
    relMdModules,
    relNbIpynb,
    relNbIpyb,
    srcMdModules,
    srcNbIpynb,
    srcNbIpyb,
  ];

  for (const src of allSources) {
    for (const [absPath, content] of Object.entries(src)) {
      if (content && typeof content === 'string') {
        const relPath = normalizePath(absPath);
        if (!normalizedMap.has(relPath)) {
          normalizedMap.set(relPath, content);
        }
      }
    }
  }

  const rawEntries = Array.from(normalizedMap.entries());

  if (rawEntries.length === 0) {
    console.warn('No markdown or notebook files found in content folder.');
    return [];
  }

  const notes: NoteItem[] = rawEntries.map(([relativeFilePath, rawContent], index) => {
    // Extract folder name (if inside a subfolder)
    const lastSlashIndex = relativeFilePath.lastIndexOf('/');
    const folder = lastSlashIndex !== -1 ? relativeFilePath.slice(0, lastSlashIndex) : '';
    
    const isNotebook = relativeFilePath.endsWith('.ipynb') || relativeFilePath.endsWith('.ipyb');
    const rawFilename = relativeFilePath.split('/').pop() || `Note ${index + 1}`;
    const cleanFilename = rawFilename.replace(/\.(md|ipynb|ipyb)$/i, '');
    const cleanFilenameTitle = cleanFilename
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    let markdownToParse = rawContent;
    let notebookMetadata: Record<string, any> = {};
    let nbLanguage = 'python';
    let nbKernel = 'Python 3';

    // If it's a Jupyter Notebook, convert it to clean Markdown
    if (isNotebook) {
      const converted = convertNotebookToMarkdown(rawContent, rawFilename);
      markdownToParse = converted.markdown;
      notebookMetadata = converted.frontmatter;
      nbLanguage = converted.language;
      nbKernel = converted.kernelName;
    }

    // Parse YAML frontmatter, markdown, headings, and wikilinks
    const parsed = parseNoteMarkdown(markdownToParse, cleanFilenameTitle);
    
    // Combine frontmatter (notebook metadata merged with any parsed frontmatter)
    const combinedFrontmatter = {
      ...notebookMetadata,
      ...parsed.frontmatter,
    };

    const title = combinedFrontmatter.title || cleanFilenameTitle;
    const slug = slugify(combinedFrontmatter.slug || cleanFilename);

    const tags = Array.from(
      new Set([
        ...(parsed.tags || []),
        ...(combinedFrontmatter.tags || []),
        ...(isNotebook ? ['jupyter', 'notebook'] : []),
      ])
    );

    return {
      id: `note-${index + 1}`,
      slug,
      title,
      folder,
      filePath: relativeFilePath,
      content: parsed.content,
      html: parsed.html,
      rawMarkdown: rawContent,
      frontmatter: combinedFrontmatter,
      date: combinedFrontmatter.date,
      tags,
      pinned: Boolean(combinedFrontmatter.pinned),
      description: combinedFrontmatter.description || parsed.excerpt,
      readingTimeMinutes: parsed.readingTimeMinutes,
      wordCount: parsed.wordCount,
      headings: parsed.headings,
      forwardLinks: parsed.forwardLinks,
      backlinks: [],
      isNotebook,
      notebookLanguage: isNotebook ? nbLanguage : undefined,
      notebookKernel: isNotebook ? nbKernel : undefined,
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
