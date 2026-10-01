import { FileTreeNode, FolderNode, NoteFileNode, NoteItem } from '../types';
import { resolveNote } from './noteResolver';

export function buildFileTree(notes: NoteItem[]): FolderNode {
  const root: FolderNode = {
    name: 'Root',
    path: '',
    isFolder: true,
    children: [],
    count: notes.length,
  };

  for (const note of notes) {
    const folderParts = note.folder ? note.folder.split('/').filter(Boolean) : [];
    let currentFolder = root;

    let accumulatedPath = '';
    for (const part of folderParts) {
      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
      let existing = currentFolder.children.find(
        (child) => child.isFolder && child.name.toLowerCase() === part.toLowerCase()
      ) as FolderNode | undefined;

      if (!existing) {
        existing = {
          name: part,
          path: accumulatedPath,
          isFolder: true,
          children: [],
          count: 0,
        };
        currentFolder.children.push(existing);
      }
      existing.count += 1;
      currentFolder = existing;
    }

    // Add note node
    const noteNode: NoteFileNode = {
      name: note.title,
      path: note.filePath,
      isFolder: false,
      noteId: note.id,
      note,
    };
    currentFolder.children.push(noteNode);
  }

  // Sort function: Folders first, then notes (pinned notes first, then alphabetically or by date)
  function sortTree(node: FolderNode) {
    node.children.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      if (a.isFolder && b.isFolder) {
        return a.name.localeCompare(b.name);
      }
      // Both are notes
      const noteA = (a as NoteFileNode).note;
      const noteB = (b as NoteFileNode).note;
      if (noteA.pinned && !noteB.pinned) return -1;
      if (!noteA.pinned && noteB.pinned) return 1;

      // Date comparison if present
      if (noteA.date && noteB.date) {
        return noteB.date.localeCompare(noteA.date);
      }
      return noteA.title.localeCompare(noteB.title);
    });

    for (const child of node.children) {
      if (child.isFolder) {
        sortTree(child);
      }
    }
  }

  sortTree(root);
  return root;
}

/**
 * Computes bidirectional backlinks between all notes
 */
export function computeBacklinks(notes: NoteItem[]): NoteItem[] {
  // Map to collect backlinks for each note ID
  const backlinksMap = new Map<string, Set<string>>();
  for (const note of notes) {
    backlinksMap.set(note.id, new Set<string>());
  }

  // Populate backlinks from forward links using resolveNote
  for (const sourceNote of notes) {
    for (const link of sourceNote.forwardLinks) {
      const targetNote = resolveNote(link, notes);
      if (targetNote && targetNote.id !== sourceNote.id) {
        backlinksMap.get(targetNote.id)?.add(sourceNote.id);
      }
    }
  }

  // Return updated notes with backlinks array
  return notes.map((note) => ({
    ...note,
    backlinks: Array.from(backlinksMap.get(note.id) || []),
  }));
}
