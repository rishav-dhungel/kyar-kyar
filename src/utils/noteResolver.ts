import { NoteItem } from '../types';
import { slugify } from './markdownParser';

/**
 * Robustly resolves any target string (from a wikilink [[...]], href="#/note/...",
 * relative link "path/to/note.md", or note title) to its corresponding NoteItem.
 */
export function resolveNote(rawTarget: string, notes: NoteItem[]): NoteItem | undefined {
  if (!rawTarget || !notes || notes.length === 0) return undefined;

  let target = decodeURIComponent(rawTarget).trim();
  
  // Strip leading protocols, hashes, paths, and markdown extensions
  target = target
    .replace(/^#\/note\//, '')
    .replace(/^\/note\//, '')
    .replace(/^#/, '')
    .replace(/^\.?\//, '')
    .replace(/^content\//, '')
    .replace(/\.md$/, '')
    .trim();

  if (!target) return undefined;

  const targetLower = target.toLowerCase();
  const targetCleanPath = targetLower.replace(/\\/g, '/');
  const targetFilename = targetCleanPath.split('/').pop() || '';
  const targetSlug = slugify(targetFilename || targetLower);

  // 1. Direct match: id, slug, or filePath without extension
  for (const n of notes) {
    if (n.id.toLowerCase() === targetLower) return n;
    if (n.slug.toLowerCase() === targetLower || n.slug.toLowerCase() === targetSlug) return n;
    
    const nPath = n.filePath.toLowerCase().replace(/\.md$/, '');
    if (nPath === targetCleanPath || nPath === targetLower) return n;
  }

  // 2. Filename match (e.g. "2026-09-29-morning-reflections" -> "journal/2026-09-29-morning-reflections.md")
  for (const n of notes) {
    const nFilename = n.filePath.split('/').pop()?.replace(/\.md$/, '').toLowerCase() || '';
    if (nFilename === targetFilename || nFilename === targetLower) return n;
  }

  // 3. Title match (case-insensitive)
  for (const n of notes) {
    if (n.title.toLowerCase() === targetLower) return n;
  }

  // 4. Slugified title, slugified path, or slugified filename match
  for (const n of notes) {
    const nTitleSlug = slugify(n.title);
    const nPath = n.filePath.toLowerCase().replace(/\.md$/, '');
    const nPathSlug = slugify(nPath);
    const nFilename = n.filePath.split('/').pop()?.replace(/\.md$/, '').toLowerCase() || '';
    const nFilenameSlug = slugify(nFilename);

    if (
      nTitleSlug === targetSlug ||
      nTitleSlug === targetLower ||
      nPathSlug === targetSlug ||
      nPath.replace(/\//g, '-') === targetLower ||
      nPath.replace(/\//g, '') === targetLower ||
      nFilenameSlug === targetSlug
    ) {
      return n;
    }
  }

  return undefined;
}
