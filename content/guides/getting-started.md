---
title: "Getting Started with kyar-kyar"
date: "2026-09-30"
pinned: true
tags: [guides, getting-started, quickstart, overview]
description: An introduction to kyar-kyar, project architecture, file structure, and how markdown files become a published digital garden.
---

# Getting Started with kyar-kyar 🧭

**kyar-kyar** is a minimalist, fast, and responsive digital garden static site generator built with React and Vite. It is designed for individuals who want to maintain notes, documentation, or technical guides using plain text Markdown without database overhead or complex CMS tools.

---

## 🏗️ How It Works

1. **Content in `/content`**: All your notes live as plain `.md` files inside the `/content` folder.
2. **Automatic Structure**:
   - Files at the root of `/content` (such as `index.md`) become top-level notes.
   - Folders inside `/content` (such as `guides/`) automatically become collapsable categories in the sidebar.
3. **Rich Markdown Features**:
   - Bidirectional wikilinks with `[[note-name]]` syntax.
   - Tag system using frontmatter `tags: [tag1, tag2]` or inline `#tags`.
   - GitHub/Obsidian style callouts (`[!tip]`, `[!note]`, `[!warning]`).
   - Code syntax highlighting and clean typographic hierarchy.
4. **Vite Dynamic Discovery**:
   - The engine uses Vite's `import.meta.glob` to discover and parse files at build time without needing a backend server or database.

---

## 📂 Project Structure

```text
.
├── content/                     # Your markdown notes and guides
│   ├── index.md                 # Landing / root index note
│   └── guides/                  # Technical guides directory
│       ├── getting-started.md
│       ├── running-and-testing-locally.md
│       ├── markdown-and-wikilinks.md
│       ├── theming-and-customization.md
│       └── hosting-on-github-and-cloudflare.md
├── kyar-kyar.config.yaml        # Global theme, author, and branding configuration
├── src/                         # React UI, components, and Markdown parser
├── package.json                 # Scripts and dependencies
└── vite.config.ts               # Vite bundler configuration
```

---

## ⚡ Quick Navigation

- [[guides/running-and-testing-locally|Running and Testing Locally]] — Learn how to start the dev server, hot-reload notes, and test locally.
- [[guides/markdown-and-wikilinks|Markdown Syntax & Wikilinks]] — Learn how to write frontmatter, format code, and link notes together.
- [[guides/theming-and-customization|Theming & Customization]] — Change color schemes, typography, and sidebar placement in `kyar-kyar.config.yaml`.
- [[guides/hosting-on-github-and-cloudflare|Hosting on GitHub Pages & Cloudflare Pages]] — Deploy your notes to the edge for free.
