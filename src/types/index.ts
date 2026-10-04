export interface NoteHeading {
  level: number;
  text: string;
  slug: string;
}

export interface NoteItem {
  id: string;
  slug: string;
  title: string;
  folder: string; // e.g. "journal", "thoughts", "reading-notes", or "" for root files outside folder
  filePath: string; // e.g. "about.md" or "journal/2026-09-29-morning.md"
  content: string;
  html?: string;
  rawMarkdown: string;
  frontmatter: Record<string, any>;
  date?: string;
  updatedDate?: string;
  tags: string[];
  pinned?: boolean;
  description?: string;
  readingTimeMinutes: number;
  wordCount: number;
  headings: NoteHeading[];
  forwardLinks: string[]; // slugs or titles linked in this note [[target]]
  backlinks: string[]; // note IDs linking to this note
  isNotebook?: boolean; // True if automatically converted from .ipynb or .ipyb
  notebookLanguage?: string; // e.g. "python", "julia", "r"
  notebookKernel?: string; // e.g. "Python 3"
}

export interface FolderNode {
  name: string;
  path: string;
  isFolder: true;
  children: (FolderNode | NoteFileNode)[];
  count: number;
}

export interface NoteFileNode {
  name: string;
  path: string;
  isFolder: false;
  noteId: string;
  note: NoteItem;
}

export type FileTreeNode = FolderNode | NoteFileNode;

export type PalettePreset = 
  | 'solarized-dark' 
  | 'solarized-light' 
  | 'classic-light'
  | 'classic-dark'
  | 'tokyo-night'
  | 'catppuccin'
  | 'rose-pine'
  | 'kanagawa'
  | 'everforest'
  | 'nord'
  | 'gruvbox-dark' 
  | 'gruvbox-light'
  | 'monokai-pro';

export type BackgroundPattern = 'dots' | 'grid' | 'lines' | 'crosshatch' | 'blueprint' | 'noise' | 'none';
export type SidebarPlacement = 'left' | 'right' | 'popup';

export interface CalibratedPalette {
  name: string;
  description: string;
  isDark: boolean;
  bgMain: string;
  sidebarBg: string;
  cardMain: string;
  borderMain: string;
  textMain: string;
  textHeading: string;
  textMuted: string;
  accent: string;
  codeBg: string;
  patternColor: string;
}

export interface CustomThemeColors {
  lightBg?: string;
  lightSidebar?: string;
  lightCard?: string;
  lightBorder?: string;
  lightText?: string;
  lightHeading?: string;
  lightMuted?: string;
  lightAccent?: string;
  darkBg?: string;
  darkSidebar?: string;
  darkCard?: string;
  darkBorder?: string;
  darkText?: string;
  darkHeading?: string;
  darkMuted?: string;
  darkAccent?: string;
}

export interface SiteConfig {
  title: string;
  author: string;
  tagline: string;
  bio: string;
  avatarUrl: string;
  baseUrl?: string;
  theme: {
    // Master palette or default dark mode palette
    palette: PalettePreset | string;
    // Explicit separate light mode palette (e.g. "classic-light", "solarized-light", "gruvbox-light")
    lightPalette?: PalettePreset | string;
    // Explicit separate dark mode palette (e.g. "solarized-dark", "gruvbox-dark", "nord", etc.)
    darkPalette?: PalettePreset | string;
    // Initial color mode: "dark", "light", or "system"
    colorMode: 'dark' | 'light' | 'system';
    // Sidebar position: "left", "right", or "popup"
    sidebarPlacement: SidebarPlacement;
    // Background texture pattern: "dots", "grid", "lines", "crosshatch", "blueprint", "noise", "none"
    backgroundPattern: BackgroundPattern;
    // Typography: "serif", "sans", or "mono"
    fontFamily: 'sans' | 'serif' | 'mono';
    // Global accent color override (optional)
    accentColor?: string;
    // Granular hex color overrides from YAML (optional)
    customColors?: CustomThemeColors;
  };
  navigation: {
    showFolderCounts: boolean;
    showTableOfContents: boolean;
    showBacklinks: boolean;
    showReadingTime: boolean;
    showWordCount: boolean;
    defaultExpandedFolders: boolean;
  };
  social: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    mastodon?: string;
    email?: string;
    rss?: boolean;
  };
  footer: {
    text: string;
  };
}
