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
  // Vite glob import of all markdown files in root /content folder
  const mdModules = import.meta.glob('/content/**/*.md', {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  // Vite glob import of Jupyter notebooks (.ipynb and .ipyb)
  const notebookModules = import.meta.glob(['/content/**/*.ipynb', '/content/**/*.ipyb'], {
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

  const srcNotebookModules = import.meta.glob(['/src/content/**/*.ipynb', '/src/content/**/*.ipyb'], {
    query: '?raw',
    import: 'default',
    eager: true,
  }) as Record<string, string>;

  const allModules: Record<string, string> = {
    ...srcMdModules,
    ...srcNotebookModules,
    ...notebookModules,
    ...mdModules,
  };

  const rawEntries = Object.entries(allModules);

  if (rawEntries.length === 0) {
    console.warn('No markdown or notebook files found in /content parent folder.');
    return [];
  }

  const notes: NoteItem[] = rawEntries.map(([absolutePath, rawContent], index) => {
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
