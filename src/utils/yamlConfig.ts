import { load } from 'js-yaml';
import { CalibratedPalette, PalettePreset, SiteConfig } from '../types';

export const CALIBRATED_PALETTES: Record<string, CalibratedPalette> = {
  'solarized-dark': {
    name: 'Solarized Dark',
    description: 'Precision colors by Ethan Schoonover with deep blue-green base',
    isDark: true,
    bgMain: '#002b36',
    sidebarBg: '#002b36',
    cardMain: '#073642',
    borderMain: '#0d4a57',
    textMain: '#93a1a1',
    textHeading: '#fdf6e3',
    textMuted: '#586e75',
    accent: '#268bd2',
    codeBg: '#073642',
    patternColor: 'rgba(38, 139, 210, 0.08)',
  },
  'solarized-light': {
    name: 'Solarized Light',
    description: 'Classic warm cream background with readable contrast',
    isDark: false,
    bgMain: '#fdf6e3',
    sidebarBg: '#fdf6e3',
    cardMain: '#eee8d5',
    borderMain: '#dcd3be',
    textMain: '#586e75',
    textHeading: '#073642',
    textMuted: '#93a1a1',
    accent: '#268bd2',
    codeBg: '#f5efdc',
    patternColor: 'rgba(38, 139, 210, 0.08)',
  },
  'classic-light': {
    name: 'Classic Light',
    description: 'Clean paper-white minimal aesthetic',
    isDark: false,
    bgMain: '#ffffff',
    sidebarBg: '#ffffff',
    cardMain: '#f8fafc',
    borderMain: '#e2e8f0',
    textMain: '#334155',
    textHeading: '#0f172a',
    textMuted: '#64748b',
    accent: '#2563eb',
    codeBg: '#f1f5f9',
    patternColor: 'rgba(37, 99, 235, 0.06)',
  },
  'classic-dark': {
    name: 'Classic Dark',
    description: 'Sleek neutral dark mode with crisp slate tones',
    isDark: true,
    bgMain: '#090d16',
    sidebarBg: '#090d16',
    cardMain: '#131b2e',
    borderMain: '#1e293b',
    textMain: '#94a3b8',
    textHeading: '#f8fafc',
    textMuted: '#64748b',
    accent: '#38bdf8',
    codeBg: '#0f172a',
    patternColor: 'rgba(56, 189, 248, 0.08)',
  },
};

export const DEFAULT_CONFIG: SiteConfig = {
  title: 'kyar-kyar',
  author: 'kyar-kyar',
  tagline: 'Digital Garden & Engineering Notebook',
  bio: 'Personal digital garden, technical research notes, engineering notebooks, and living documentation.',
  avatarUrl: '',
  theme: {
    palette: 'solarized-dark',
    lightPalette: 'classic-light',
    darkPalette: 'solarized-dark',
    colorMode: 'dark',
    sidebarPlacement: 'left',
    backgroundPattern: 'dots',
    fontFamily: 'sans',
  },
  navigation: {
    showFolderCounts: false,
    showTableOfContents: true,
    showBacklinks: true,
    showReadingTime: true,
    showWordCount: true,
    defaultExpandedFolders: true,
  },
  social: {
    github: 'https://github.com',
    twitter: 'https://twitter.com',
  },
};

export function parseYamlConfig(yamlString: string): SiteConfig {
  try {
    const raw = (load(yamlString) || {}) as Record<string, any>;
    return {
      title: raw.title || DEFAULT_CONFIG.title,
      author: raw.author || DEFAULT_CONFIG.author,
      tagline: raw.tagline || DEFAULT_CONFIG.tagline,
      bio: raw.bio || DEFAULT_CONFIG.bio,
      avatarUrl: raw.avatarUrl || DEFAULT_CONFIG.avatarUrl,
      theme: {
        palette: raw.theme?.palette || DEFAULT_CONFIG.theme.palette,
        lightPalette: raw.theme?.lightPalette || DEFAULT_CONFIG.theme.lightPalette,
        darkPalette: raw.theme?.darkPalette || DEFAULT_CONFIG.theme.darkPalette,
        colorMode: raw.theme?.colorMode || DEFAULT_CONFIG.theme.colorMode,
        sidebarPlacement: raw.theme?.sidebarPlacement || DEFAULT_CONFIG.theme.sidebarPlacement,
        backgroundPattern: raw.theme?.backgroundPattern || DEFAULT_CONFIG.theme.backgroundPattern,
        fontFamily: raw.theme?.fontFamily || DEFAULT_CONFIG.theme.fontFamily,
        accentColor: raw.theme?.accentColor,
        customColors: raw.theme?.customColors,
      },
      navigation: {
        showFolderCounts: Boolean(raw.navigation?.showFolderCounts ?? DEFAULT_CONFIG.navigation.showFolderCounts),
        showTableOfContents: Boolean(raw.navigation?.showTableOfContents ?? DEFAULT_CONFIG.navigation.showTableOfContents),
        showBacklinks: Boolean(raw.navigation?.showBacklinks ?? DEFAULT_CONFIG.navigation.showBacklinks),
        showReadingTime: Boolean(raw.navigation?.showReadingTime ?? DEFAULT_CONFIG.navigation.showReadingTime),
        showWordCount: Boolean(raw.navigation?.showWordCount ?? DEFAULT_CONFIG.navigation.showWordCount),
        defaultExpandedFolders: Boolean(raw.navigation?.defaultExpandedFolders ?? DEFAULT_CONFIG.navigation.defaultExpandedFolders),
      },
      social: {
        github: raw.social?.github,
        twitter: raw.social?.twitter,
        linkedin: raw.social?.linkedin,
        email: raw.social?.email,
      },
    };
  } catch (err) {
    console.error('Failed to parse kyar-kyar.config.yaml:', err);
    return DEFAULT_CONFIG;
  }
}
