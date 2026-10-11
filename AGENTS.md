# AGENTS.md — AI Agent & Developer Architecture Guide

> **Project**: `kyar-kyar` 🌱  
> **Type**: Zero-CMS, Zero-Database, Pure Static Site Generator for Personal Blogs, Digital Gardens & Technical Notes  
> **Tech Stack**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Marked, js-yaml, Lucide Icons, Motion  
> **Status**: Fully vibe-coded, production-ready, exportable to GitHub Pages & Cloudflare Pages  

This document serves as the single source of truth for AI agents (and human developers vibe-coding with agents) to understand the codebase, extend functionality, and maintain architectural integrity.

---

## 1. Core Philosophy & Architectural Principles

1. **Pure Static Architecture**:
   - The entire blog compiles down to static HTML, CSS, JavaScript, and assets.
   - No backend databases, no server maintenance, no authentication layers.
   - Can be served from any static host, CDN, GitHub Pages, Cloudflare Pages, S3, Caddy, Nginx, or Netlify.

2. **File-System as Navigation**:
   - The folder hierarchy inside `/content/` directly mirrors the navigation sidebar and category structure.
   - Moving or nesting files in `/content/` automatically updates the breadcrumbs, subfolder indexes, and file tree.

3. **Content Ingestion via Vite Glob Imports**:
   - All `.md` Markdown files and `.ipynb` / `.ipyb` Jupyter Notebooks are bundled client-side using `import.meta.glob`.
   - Edits in `/content/` or `kyar-kyar.config.yaml` update instantly via Vite hot-reloading.

4. **Optimal Typographic Discipline (70ch Measure)**:
   - Line length defaults to **`70ch`** (`max-w-[70ch]`), adhering to the typographic golden standard of 65–75 characters per line to eliminate horizontal reading fatigue.
   - Users can toggle between `70ch` and full-width using the **`Tt`** icon button in the header toolbar.

5. **Single-Title Rule**:
   - An article title comes from frontmatter (`title: ...`) or the first leading `# Heading` in markdown.
   - If extracted from the body, the leading `# Heading` is stripped to prevent duplicate titles.

6. **Hash-Based Client Routing**:
   - Uses SPA hash routing (`#/note/:slug`, `#/folder/:path`, `#/tag/:tag`, `#/pinned`).
   - Ensures deep links and refreshes work flawlessly on GitHub Pages and static hosts without requiring `_redirects` or URL rewrites.

---

## 2. Directory & File Structure

```text
├── content/                     # Markdown & Jupyter notebook source files
│   ├── index.md                 # Root homepage note
│   └── guides/                  # Subfolder (automatically creates a folder node)
│       ├── getting-started.md
│       ├── theming-and-customization.md
│       ├── markdown-and-wikilinks.md
│       ├── running-and-testing-locally.md
│       ├── hosting-on-github-and-cloudflare.md
│       └── data-science-and-visualization.ipyb
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Sticky top header, breadcrumbs, sidebar toggler
│   │   ├── Sidebar.tsx          # Collapsible tree navigation, author profile, search & theme controls
│   │   ├── NoteView.tsx         # Active note renderer, TOC popover, backlinks citations, 70ch width toggle
│   │   ├── FolderView.tsx       # Subfolder browser, note card directory with search & sorting
│   │   ├── TagsView.tsx         # Tag directory, filterable note list by tag
│   │   ├── PinnedView.tsx       # Dedicated view for all pinned notes
│   │   ├── SearchModal.tsx      # Modal search index with instant fuzzy search (Cmd+K)
│   │   ├── TableOfContents.tsx  # Dynamic heading outline parser
│   │   ├── TtIcon.tsx           # Custom 2px-stroke typography "Tt" icon component
│   │   ├── ReadingProgressBar.tsx # Top reading progress indicator
│   │   └── OppositeProgressBar.tsx
│   ├── utils/
│   │   ├── contentLoader.ts     # Ingests & normalizes all content via Vite glob imports
│   │   ├── markdownParser.ts    # Frontmatter extraction, wikilinks, callouts, anchor headings
│   │   ├── notebookConverter.ts # Converts .ipynb JSON cells to Markdown + code + images + tables
│   │   ├── noteResolver.ts      # Resolves [[wikilinks]], slugs, filenames, and paths
│   │   ├── fileTree.ts          # Builds hierarchical tree and calculates bidirectional backlinks
│   │   └── yamlConfig.ts        # Parses kyar-kyar.config.yaml & provides calibrated color palettes
│   ├── types.ts                 # Core TypeScript interfaces (NoteItem, SiteConfig, FolderNode, etc.)
│   ├── App.tsx                  # Root application coordinator, state, theme, keyboard shortcuts
│   ├── main.tsx                 # React 19 DOM entrypoint
│   └── index.css                # Global Tailwind CSS imports & theme CSS variables
├── kyar-kyar.config.yaml        # Single site configuration file (author, theme, palette, social, footer)
├── vite.config.ts               # Vite configuration (conditional base, port 3000, 0.0.0.0 host)
├── tsconfig.json                # TypeScript compiler configuration
└── package.json                 # Project scripts and dependencies
```

---

## 3. Data Flow & Content Pipeline

### 3.1 Content Loading (`contentLoader.ts`)
- Ingests all Markdown (`.md`) and Jupyter Notebooks (`.ipynb`, `.ipyb`) via multiple glob patterns (relative `../../content/**` and root `/content/**`) to guarantee cross-platform compatibility across Windows, macOS, and Linux.
- Normalizes file paths (e.g. `guides/getting-started.md`), separates folder paths, and parses frontmatter.
- Sorts notes: `index.md` always comes first, followed by pinned notes, then by date/title.

### 3.2 Markdown & Admonitions (`markdownParser.ts`)
- **YAML Frontmatter**: Parsed using `js-yaml`. Supports `title`, `description`, `date`, `tags`, `pinned`, and custom metadata.
- **Wikilinks**: Transforms `[[note-title]]` and `[[target|Display Label]]` into interactive SPA links `<a href="#/note/slug" class="wikilink">`.
- **Callouts / Admonitions**: Transforms Obsidian/GitHub-style callouts (`> [!note]`, `> [!tip]`, `> [!warning]`, `> [!info]`, `> [!danger]`) into styled admonition boxes.
- **Anchor Headings**: Automatically injects slugified IDs into `h2`, `h3`, and `h4` tags for TOC navigation.
- **Inline Tags**: Transforms `#topic` into clickable filter links `#/tag/topic`.

### 3.3 Jupyter Notebook Converter (`notebookConverter.ts`)
- Accepts standard Jupyter Notebook JSON format (v3 and v4+).
- Formats `markdown` cells as Markdown text.
- Formats `code` cells into syntax-highlighted code blocks with execution counts (`[1]`).
- Renders `outputs`:
  - `stream` stdout/stderr with ANSI escape code stripping.
  - `execute_result` / `display_data`: Base64 PNG/JPEG images, SVG vectors, HTML (Pandas tables), plain text.
  - `error`: Formatted execution tracebacks.

### 3.4 Bidirectional Backlinks (`fileTree.ts`)
- Iterates over all notes, collects all forward wikilinks, and resolves target notes using `resolveNote`.
- Creates a bidirectional graph of references displayed in the academic citation footer of each note.

---

## 4. Theming & Design System

`kyar-kyar` uses CSS variables injected on `:root` based on `kyar-kyar.config.yaml` and calibrated palettes in `src/utils/yamlConfig.ts`.

### 4.1 CSS Custom Properties
```css
:root {
  --bg-main: #fbfbfa;          /* Main content area background */
  --sidebar-main: #f7f7f6;     /* Sidebar & navbar background */
  --card-main: #ffffff;        /* Cards, popovers, dropdowns */
  --border-main: #e5e5e4;      /* Subtle hairline borders */
  --text-main: #1c1917;        /* Body typography */
  --text-heading: #0c0a09;     /* Primary headings */
  --text-muted: #57534e;       /* Secondary labels, breadcrumbs */
  --accent: #2563eb;           /* Brand highlight, active links */
  --code-bg: #f4f4f5;          /* Pre blocks and inline code */
  --pattern-color: rgba(...);  /* Background texture overlay */
}
```

### 4.2 Available Built-in Palettes
- **Light Palettes**: `classic-light`, `solarized-light`, `gruvbox-light`, `catppuccin-latte`, `everforest-light`, `nord-snow`, `kanagawa-lotus`, `rose-pine-dawn`, `tokyo-night-day`.
- **Dark Palettes**: `nord` (default), `classic-dark`, `solarized-dark`, `gruvbox-dark`, `catppuccin`, `everforest`, `tokyo-night`, `kanagawa`, `rose-pine`, `monokai-pro`.

### 4.3 Typography Reading Measure
- Default: **`70ch`** (`max-w-[70ch]`).
- Toggled via `TtIcon` (`src/components/TtIcon.tsx`) between `70ch` and full-width (`max-w-3xl`).
- Persisted in browser `localStorage` under `kyar_kyar_reading_width`.

---

## 5. Development & Build Commands

| Command | Action | Notes |
| :--- | :--- | :--- |
| `npm run dev` | Starts local dev server at `http://localhost:3000` | Supports HMR on all `.md` and `.yaml` edits |
| `npm start` | Alias for `npm run dev` | Runs on port 3000, binds to `0.0.0.0` |
| `npm run build` | Compiles project into standalone `./dist/` | Generates portable relative assets (`./assets/`) |
| `npm run preview` | Previews `./dist/` build locally at port 3000 | Verifies production bundle before pushing |
| `npm run lint` | Runs `tsc --noEmit` | Strict TypeScript verification |
| `npm run clean` | Removes `./dist` | Cross-platform Node.js command |
| `bun dev` / `bun start` | Works interchangeably with Bun | Uses `bun.lock` |

---

## 6. Vibe-Coding Rules for AI Agents

When modifying or extending this repository, agents **MUST** follow these rules:

1. **Do Not Hardcode Content in Components**:
   - All articles, documentation, notes, and blog posts belong in `/content/`.
   - All branding, author metadata, social links, and theme defaults belong in `kyar-kyar.config.yaml`.

2. **Preserve Path Normalization in `contentLoader.ts`**:
   - Always retain both relative (`../../content/**`) and root-relative (`/content/**`) globs.
   - Use `normalizePath` to strip leading slashes or Windows backslashes so keys remain clean relative paths (e.g. `index.md`, `guides/my-post.md`).

3. **Maintain SPA Hash Routing**:
   - All internal links MUST use hash routing (e.g. `#/note/slug`, `#/folder/path`, `#/tag/name`).
   - Never use HTML5 history `pushState` with path-based URLs like `/note/slug` unless a server fallback is present, as this will break on static hosts like GitHub Pages on page refresh.

4. **Preserve Single-Title Discipline**:
   - The document title must appear only once in the note header.
   - Do not re-inject `# Title` in the rendered markdown body.

5. **Theme Variables Over Arbitrary Hex Values**:
   - Always use `var(--bg-main)`, `var(--card-main)`, `var(--text-heading)`, `var(--accent)`, etc., rather than hardcoding arbitrary colors, so the entire theme system adapts dynamically.

6. **Keep the Reading Width Toggle Clean**:
   - The reading width toggle uses `TtIcon` and displays `70ch` without extraneous wording (do not add back the word "Standard").

7. **Verify Builds Before Turn Completion**:
   - Always run `lint_applet` (`tsc --noEmit`) and `compile_applet` (`npm run build`) before completing your task.
