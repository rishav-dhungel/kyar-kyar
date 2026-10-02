import { load } from 'js-yaml';
import { 
  BackgroundPattern, 
  CalibratedPalette, 
  PalettePreset, 
  SidebarPlacement, 
  SiteConfig 
} from '../types';

export const CALIBRATED_PALETTES: Record<string, CalibratedPalette> = {
  // Previous warm, clean paper light mode
  'classic-light': {
    name: 'Classic Stone Paper',
    description: 'Clean crisp warm-stone paper with high-contrast charcoal typography',
    isDark: false,
    bgMain: '#fbfbfa',
    sidebarBg: '#f7f7f6',
    cardMain: '#ffffff',
    borderMain: '#e5e5e4',
    textMain: '#1c1917',
    textHeading: '#0c0a09',
    textMuted: '#57534e',
    accent: '#2563eb',
    codeBg: '#f4f4f5',
    patternColor: 'rgba(0, 0, 0, 0.04)',
  },

  // Calibrated Solarized Dark (Ethan Schoonover official specifications)
  'solarized-dark': {
    name: 'Solarized Dark',
    description: 'Ethan Schoonover official Solarized precision palette (base03/base02)',
    isDark: true,
    bgMain: '#002b36',
    sidebarBg: '#073642',
    cardMain: '#00212b',
    borderMain: '#0e4e5e',
    textMain: '#93a1a1',
    textHeading: '#eee8d5',
    textMuted: '#586e75',
    accent: '#268bd2',
    codeBg: '#073642',
    patternColor: 'rgba(38, 139, 210, 0.08)',
  },

  // Solarized Light counterpart
  'solarized-light': {
    name: 'Solarized Light',
    description: 'Ethan Schoonover official Solarized Light palette (base3/base2)',
    isDark: false,
    bgMain: '#fdf6e3',
    sidebarBg: '#eee8d5',
    cardMain: '#ffffff',
    borderMain: '#dcd3bd',
    textMain: '#586e75',
    textHeading: '#073642',
    textMuted: '#839496',
    accent: '#268bd2',
    codeBg: '#eee8d5',
    patternColor: 'rgba(88, 110, 117, 0.08)',
  },

  // Classic Dark counterpart
  'classic-dark': {
    name: 'Classic Dark',
    description: 'Subtle charcoal stone with crisp white highlights',
    isDark: true,
    bgMain: '#18181b',
    sidebarBg: '#121214',
    cardMain: '#27272a',
    borderMain: '#2e2e33',
    textMain: '#f4f4f5',
    textHeading: '#ffffff',
    textMuted: '#a1a1aa',
    accent: '#3b82f6',
    codeBg: '#27272a',
    patternColor: 'rgba(255, 255, 255, 0.05)',
  },

  // Gruvbox Dark
  'gruvbox-dark': {
    name: 'Gruvbox Dark',
    description: 'Morhetz iconic retro groove dark palette',
    isDark: true,
    bgMain: '#282828',
    sidebarBg: '#1d2021',
    cardMain: '#32302f',
    borderMain: '#504945',
    textMain: '#ebdbb2',
    textHeading: '#fbf1c7',
    textMuted: '#a89984',
    accent: '#fe8019',
    codeBg: '#1d2021',
    patternColor: 'rgba(250, 189, 47, 0.07)',
  },

  // Gruvbox Light
  'gruvbox-light': {
    name: 'Gruvbox Light',
    description: 'Morhetz warm parchment retro groove light palette',
    isDark: false,
    bgMain: '#fbf1c7',
    sidebarBg: '#f2e5bc',
    cardMain: '#ffffff',
    borderMain: '#d5c4a1',
    textMain: '#3c3836',
    textHeading: '#282828',
    textMuted: '#7c6f64',
    accent: '#af3a03',
    codeBg: '#f2e5bc',
    patternColor: 'rgba(124, 111, 100, 0.08)',
  },

  // Nord Dark (Enhanced High-Contrast & Ergonomic Calibration)
  'nord': {
    name: 'Nord Dark',
    description: 'Arctic Ice Studio polar night palette refined for crisp readability and zero eye strain',
    isDark: true,
    bgMain: '#1e222a',
    sidebarBg: '#181b21',
    cardMain: '#252b36',
    borderMain: '#363e4d',
    textMain: '#e8edf4',
    textHeading: '#ffffff',
    textMuted: '#9bb0c9',
    accent: '#64b5f6',
    codeBg: '#15181f',
    patternColor: 'rgba(100, 181, 246, 0.05)',
  },

  // Tokyo Night
  'tokyo-night': {
    name: 'Tokyo Night',
    description: 'Enki Tokyo Night dark neon atmospheric palette',
    isDark: true,
    bgMain: '#1a1b26',
    sidebarBg: '#16161e',
    cardMain: '#24283b',
    borderMain: '#2f3549',
    textMain: '#c0caf5',
    textHeading: '#ffffff',
    textMuted: '#7982a9',
    accent: '#7aa2f7',
    codeBg: '#16161e',
    patternColor: 'rgba(122, 162, 247, 0.08)',
  },

  // Catppuccin Mocha
  'catppuccin': {
    name: 'Catppuccin Mocha',
    description: 'Official Catppuccin Mocha pastel dark palette',
    isDark: true,
    bgMain: '#1e1e2e',
    sidebarBg: '#181825',
    cardMain: '#25253a',
    borderMain: '#313244',
    textMain: '#cdd6f4',
    textHeading: '#f5e0dc',
    textMuted: '#a6adc8',
    accent: '#89b4fa',
    codeBg: '#181825',
    patternColor: 'rgba(203, 166, 247, 0.08)',
  },

  // Monokai Pro
  'monokai-pro': {
    name: 'Monokai Pro',
    description: 'Wimer Hazenberg professional developer contrast palette',
    isDark: true,
    bgMain: '#2d2a2e',
    sidebarBg: '#221f22',
    cardMain: '#363337',
    borderMain: '#4a474b',
    textMain: '#fcfcfa',
    textHeading: '#ffffff',
    textMuted: '#939293',
    accent: '#ffd866',
    codeBg: '#221f22',
    patternColor: 'rgba(255, 216, 102, 0.08)',
  },

  // Rose Pine (Omakub official curated theme)
  'rose-pine': {
    name: 'Rosé Pine',
    description: 'All natural pine, faux fur, and delicate bougainvillea aesthetic',
    isDark: true,
    bgMain: '#191724',
    sidebarBg: '#1f1d2e',
    cardMain: '#26233a',
    borderMain: '#403d52',
    textMain: '#e0def4',
    textHeading: '#eb6f92',
    textMuted: '#908caa',
    accent: '#ebbcba',
    codeBg: '#1f1d2e',
    patternColor: 'rgba(235, 188, 186, 0.08)',
  },

  // Kanagawa (Omakub official curated theme)
  'kanagawa': {
    name: 'Kanagawa Wave',
    description: 'Inspired by Katsushika Hokusai The Great Wave off Kanagawa',
    isDark: true,
    bgMain: '#1f1f28',
    sidebarBg: '#16161d',
    cardMain: '#2a2a37',
    borderMain: '#363646',
    textMain: '#dcd7ba',
    textHeading: '#c8c093',
    textMuted: '#727169',
    accent: '#7e9cd8',
    codeBg: '#16161d',
    patternColor: 'rgba(126, 156, 216, 0.08)',
  },

  // Everforest (Omakub official curated theme)
  'everforest': {
    name: 'Everforest Dark',
    description: 'Warm, comfortable, natural green forest environment',
    isDark: true,
    bgMain: '#2d353b',
    sidebarBg: '#232a2e',
    cardMain: '#343f44',
    borderMain: '#475258',
    textMain: '#d3c6aa',
    textHeading: '#e69875',
    textMuted: '#859289',
    accent: '#a7c080',
    codeBg: '#232a2e',
    patternColor: 'rgba(167, 192, 128, 0.08)',
  },

  // Kanagawa Lotus Light (Inspired by unbleached washi paper & traditional Japanese sumi ink)
  'kanagawa-lotus': {
    name: 'Kanagawa Lotus',
    description: 'Katsushika Hokusai inspired unbleached washi paper, deep sumi ink & lacquer red',
    isDark: false,
    bgMain: '#f2ecde',
    sidebarBg: '#eae3d2',
    cardMain: '#faf6ee',
    borderMain: '#dcd4be',
    textMain: '#545464',
    textHeading: '#43436c',
    textMuted: '#8a8980',
    accent: '#c84053',
    codeBg: '#eae3d2',
    patternColor: 'rgba(84, 84, 100, 0.08)',
  },

  // Rosé Pine Dawn (Soho aesthetic with warm soft cream, dusky rose & deep pine indigo)
  'rose-pine-dawn': {
    name: 'Rosé Pine Dawn',
    description: 'Soho aesthetic with warm soft cream, dusky rose & deep pine indigo',
    isDark: false,
    bgMain: '#faf4ed',
    sidebarBg: '#f2e9de',
    cardMain: '#fffaf3',
    borderMain: '#e4dad1',
    textMain: '#575279',
    textHeading: '#286983',
    textMuted: '#9893a5',
    accent: '#b4637a',
    codeBg: '#f2e9de',
    patternColor: 'rgba(180, 99, 122, 0.07)',
  },

  // Catppuccin Latte (Soothing warm pastel latte with crisp sapphire & lavender highlights)
  'catppuccin-latte': {
    name: 'Catppuccin Latte',
    description: 'Soothing warm pastel latte with crisp sapphire & lavender highlights',
    isDark: false,
    bgMain: '#eff1f5',
    sidebarBg: '#e6e9ef',
    cardMain: '#ffffff',
    borderMain: '#ccd0da',
    textMain: '#4c4f69',
    textHeading: '#1e1e2e',
    textMuted: '#6c6f85',
    accent: '#1e66f5',
    codeBg: '#e6e9ef',
    patternColor: 'rgba(30, 102, 245, 0.06)',
  },

  // Everforest Light (Sainnhe calming forest botanical greens on warm tea-tinted parchment)
  'everforest-light': {
    name: 'Everforest Light',
    description: 'Sainnhe calming forest botanical greens on warm tea-tinted parchment',
    isDark: false,
    bgMain: '#f8f5e4',
    sidebarBg: '#efeac9',
    cardMain: '#ffffff',
    borderMain: '#ded7af',
    textMain: '#5c6a72',
    textHeading: '#2d353b',
    textMuted: '#829181',
    accent: '#8da101',
    codeBg: '#efeac9',
    patternColor: 'rgba(141, 161, 1, 0.07)',
  },

  // Nord Snow Storm (Arctic Ice Studio crystalline snow-white & glacier frost blue)
  'nord-snow': {
    name: 'Nord Snow Storm',
    description: 'Arctic Ice Studio crystalline snow-white & glacier frost blue palette',
    isDark: false,
    bgMain: '#eceff4',
    sidebarBg: '#e5e9f0',
    cardMain: '#ffffff',
    borderMain: '#d8dee9',
    textMain: '#2e3440',
    textHeading: '#1c212a',
    textMuted: '#4c566a',
    accent: '#5e81ac',
    codeBg: '#e5e9f0',
    patternColor: 'rgba(94, 129, 172, 0.07)',
  },

  // Tokyo Night Day (Contemporary Shibuya daytime sky blue with vibrant ultramarine)
  'tokyo-night-day': {
    name: 'Tokyo Night Day',
    description: 'Contemporary Shibuya daytime sky blue with vibrant ultramarine',
    isDark: false,
    bgMain: '#e1e2e7',
    sidebarBg: '#d5d6db',
    cardMain: '#ffffff',
    borderMain: '#c4c8d4',
    textMain: '#343b58',
    textHeading: '#1d202f',
    textMuted: '#6172b0',
    accent: '#2e7de9',
    codeBg: '#d5d6db',
    patternColor: 'rgba(46, 125, 233, 0.07)',
  },
};

// Aliases for user convenience in YAML
CALIBRATED_PALETTES['classic'] = CALIBRATED_PALETTES['classic-light'];
CALIBRATED_PALETTES['solarized'] = CALIBRATED_PALETTES['solarized-dark'];
CALIBRATED_PALETTES['rosepine'] = CALIBRATED_PALETTES['rose-pine'];
CALIBRATED_PALETTES['lotus'] = CALIBRATED_PALETTES['kanagawa-lotus'];
CALIBRATED_PALETTES['dawn'] = CALIBRATED_PALETTES['rose-pine-dawn'];
CALIBRATED_PALETTES['latte'] = CALIBRATED_PALETTES['catppuccin-latte'];
CALIBRATED_PALETTES['nord-light'] = CALIBRATED_PALETTES['nord-snow'];
CALIBRATED_PALETTES['snow'] = CALIBRATED_PALETTES['nord-snow'];

export const DEFAULT_CONFIG_YAML = `# ==============================================================================
# kyar-kyar — Personal Blog & Digital Garden Configuration
# Fully vibe coded website generator configured entirely via this YAML file
# ==============================================================================

# Personal Identity & Branding (Your Name, Face Photo & Tagline)
author: "Kyar-Kyar"
tagline: "Software Engineer, Writer & Thinker"
bio: "Writing about distributed systems, book notes, reflections, and slow living."
avatarUrl: ""
title: "Kyar-Kyar's Notes"
baseUrl: "https://kyar-kyar.github.io"

# Aesthetics & Theme Calibration
theme:
  # Master palette or default dark mode palette:
  # Available dark presets: nord, tokyo-night, rose-pine, kanagawa, everforest, catppuccin, solarized-dark, gruvbox-dark, monokai-pro, classic-dark
  palette: "nord"

  # Light Mode Color Scheme:
  # Available light presets:
  #   - "kanagawa-lotus"  : Traditional Japanese unbleached washi paper, sumi ink & lacquer red (Default & Recommended)
  #   - "rose-pine-dawn"  : Warm soft cream, dusky rose & deep pine indigo
  #   - "gruvbox-light"   : Morhetz warm retro groove parchment & rust
  #   - "catppuccin-latte": Soothing warm pastel latte & sapphire blue
  #   - "everforest-light": Calming forest botanical greens & tea parchment
  #   - "nord-snow"       : Arctic Ice Studio crystalline snow-white & glacier blue
  #   - "solarized-light" : Ethan Schoonover official Solarized precision palette
  #   - "tokyo-night-day" : Contemporary Shibuya daytime blue & ultramarine
  #   - "classic-light"   : Warm clean minimal stone paper
  lightPalette: "kanagawa-lotus"

  # Dark Mode Color Scheme:
  # Calibrated Nord Dark (Arctic Ice Studio polar night palette)
  darkPalette: "nord"

  # Default initial color mode on visit: "light", "dark", or "system"
  colorMode: "light"

  # Sidebar Placement:
  # Options:
  #   - "left"  : Docked to the left side of the screen
  #   - "right" : Docked to the right side of the screen
  #   - "popup" : Clean distraction-free view with toggleable slide-over drawer
  sidebarPlacement: "left"

  # Background Texture Pattern:
  # Options: "noise", "dots", "grid", "lines", "crosshatch", "blueprint", "none"
  backgroundPattern: "noise"

  # Typography: "mono" (technical), "serif" (literary book), "sans" (modern clean)
  fontFamily: "mono"

  # Accent Highlight Color (Optional hex color, comment out to use palette default accent)
  # accentColor: "#c84053"

  # Granular Hex Overrides (Optional — override any individual color directly in YAML):
  # customColors:
  #   lightBg: "#fbfbfa"
  #   lightSidebar: "#f7f7f6"
  #   lightCard: "#ffffff"
  #   lightBorder: "#e5e5e4"
  #   lightText: "#1c1917"
  #   darkBg: "#1e222a"
  #   darkSidebar: "#181b21"
  #   darkCard: "#252b36"
  #   darkBorder: "#363e4d"
  #   darkText: "#e8edf4"

# Navigation & Reading Features
navigation:
  showFolderCounts: true
  showTableOfContents: true
  showBacklinks: true
  showReadingTime: true
  showWordCount: true
  defaultExpandedFolders: true

# Social Links
social:
  github: "https://github.com/kyar-kyar"
  twitter: "https://x.com/kyar_kyar"
  linkedin: "https://linkedin.com/in/kyarkyar"
  email: "kyarkyar@example.com"
  rss: true

# Site Footer
footer:
  text: "powered by kyar-kyar fully vibe coded website generator"
`;

export function parseYamlConfig(yamlString: string): SiteConfig {
  try {
    const raw = (load(yamlString) || {}) as Record<string, any>;
    const author = raw.author || 'Kyar-Kyar';
    
    // Theme parsing
    const rawTheme = raw.theme || {};
    const palette = rawTheme.palette || 'nord';
    const lightPalette = rawTheme.lightPalette || 'classic-light';
    const darkPalette = rawTheme.darkPalette || (palette in CALIBRATED_PALETTES && CALIBRATED_PALETTES[palette].isDark ? palette : 'nord');

    const validPatterns: BackgroundPattern[] = ['dots', 'grid', 'lines', 'crosshatch', 'blueprint', 'noise', 'none'];
    const backgroundPattern: BackgroundPattern = validPatterns.includes(rawTheme.backgroundPattern) 
      ? rawTheme.backgroundPattern 
      : 'dots';

    const validPlacements: SidebarPlacement[] = ['left', 'right', 'popup'];
    const sidebarPlacement: SidebarPlacement = validPlacements.includes(rawTheme.sidebarPlacement)
      ? rawTheme.sidebarPlacement
      : 'left';

    const validModes = ['dark', 'light', 'system'] as const;
    const colorMode = validModes.includes(rawTheme.colorMode) ? rawTheme.colorMode : 'dark';

    return {
      author,
      tagline: raw.tagline || 'Software Engineer, Writer & Thinker',
      bio: raw.bio || 'Writing about distributed systems, book notes, reflections, and slow living.',
      avatarUrl: raw.avatarUrl || '',
      title: raw.title || `${author}'s Notes`,
      baseUrl: raw.baseUrl || '',
      theme: {
        palette,
        lightPalette,
        darkPalette,
        colorMode,
        sidebarPlacement,
        backgroundPattern,
        fontFamily: rawTheme.fontFamily || 'serif',
        accentColor: rawTheme.accentColor,
        customColors: rawTheme.customColors || {},
      },
      navigation: {
        showFolderCounts: raw.navigation?.showFolderCounts !== false,
        showTableOfContents: raw.navigation?.showTableOfContents !== false,
        showBacklinks: raw.navigation?.showBacklinks !== false,
        showReadingTime: raw.navigation?.showReadingTime !== false,
        showWordCount: raw.navigation?.showWordCount !== false,
        defaultExpandedFolders: raw.navigation?.defaultExpandedFolders !== false,
      },
      social: {
        github: raw.social?.github,
        twitter: raw.social?.twitter,
        linkedin: raw.social?.linkedin,
        mastodon: raw.social?.mastodon,
        email: raw.social?.email,
        rss: raw.social?.rss !== false,
      },
      footer: {
        text: raw.footer?.text || 'powered by kyar-kyar fully vibe coded website generator',
      },
    };
  } catch (err) {
    console.warn('Failed to parse YAML config, using default:', err);
    return parseYamlConfig(DEFAULT_CONFIG_YAML);
  }
}
