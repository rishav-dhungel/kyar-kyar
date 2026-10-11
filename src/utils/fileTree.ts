import { FolderNode, NoteFileNode, NoteItem } from '../types';
import { resolveNote } from './noteResolver';

export function computeBacklinks(notes: NoteItem[]): NoteItem[] {
  const noteMap = new Map<string, NoteItem>();
  for (const n of notes) {
    n.backlinks = [];
    noteMap.set(n.id, n);
  }

  for (const sourceNote of notes) {
    for (const targetLink of sourceNote.forwardLinks) {
      const resolved = resolveNote(targetLink, notes);
      if (resolved && resolved.id !== sourceNote.id) {
        if (!resolved.backlinks.includes(sourceNote.id)) {
          resolved.backlinks.push(sourceNote.id);
        }
      }
    }
  }

  return notes;
}

export function buildFileTree(notes: NoteItem[]): FolderNode {
  const root: FolderNode = {
    name: 'root',
    path: '',
    isFolder: true,
    children: [],
    count: notes.length,
  };

  for (const note of notes) {
    const parts = note.filePath.split('/').filter(Boolean);
    if (parts.length === 1) {
      root.children.push({
        name: note.title,
        path: note.filePath,
        isFolder: false,
        noteId: note.id,
        note,
      });
      continue;
    }

    let current = root;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const folderPath = parts.slice(0, i + 1).join('/');
      let existing = current.children.find(
        (child): child is FolderNode => child.isFolder && child.name === part
      );

      if (!existing) {
        existing = {
          name: part,
          path: folderPath,
          isFolder: true,
          children: [],
          count: 0,
        };
        current.children.push(existing);
      }
      existing.count += 1;
      current = existing;
    }

    current.children.push({
      name: note.title,
      path: note.filePath,
      isFolder: false,
      noteId: note.id,
      note,
    });
  }

  const sortChildren = (node: FolderNode) => {
    node.children.sort((a, b) => {
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;
      return a.name.localeCompare(b.name);
    });
    for (const child of node.children) {
      if (child.isFolder) {
        sortChildren(child);
      }
    }
  };

  sortChildren(root);
  return root;
}
