---
title: "Running and Testing kyar-kyar Locally"
date: "2026-09-30"
pinned: true
tags: [guides, local-development, testing, quickstart, nodejs]
description: Step-by-step guide to installing dependencies, running the local dev server, testing wikilinks and tags, and previewing production builds locally.
---

This guide walks you through setting up, developing, testing, and verifying your **kyar-kyar** digital garden on your local computer.

---

## Prerequisites

Before running the project, make sure you have the following installed on your system:

- **Node.js**: Version **18.x** or **20.x+** recommended (check with `node -v`)
- **Package Manager**: `npm` (comes with Node.js), or `pnpm` / `yarn`
- **Text Editor**: VS Code, Cursor, Obsidian, or your favorite markdown editor

---

## 1. Quickstart

Clone or navigate to your project directory:

```bash
# 1. Clone your repository (if not already local)
git clone https://github.com/rishav-dhungel/kyar-kyar.git
cd kyar-kyar

# 2. Install dependencies
npm install

# 3. Start the local development server
npm run dev
```

Once started, open your browser and navigate to:
```text
http://localhost:3000
```

> [!tip] Hot Module Replacement
> The Vite development server automatically watches all `.md` files in `/content/` and `kyar-kyar.config.yaml`. Whenever you save edits, changes appear in your browser instantly without needing a full page reload.

---

## 2. Key npm Scripts

| Command | What it Does | When to Use |
| :--- | :--- | :--- |
| `npm run dev` | Starts Vite dev server at `http://localhost:3000` | Daily writing, editing, and previewing |
| `npm run build` | Compiles Markdown and assets into standalone `./dist/` | Before deploying or publishing |
| `npm run preview` | Serves the `./dist` production folder locally | To test the exact production output before pushing |
| `npm run lint` | Runs `tsc --noEmit` to verify TypeScript types | To ensure no syntax or type breakages exist |
| `npm run clean` | Removes `./dist` and temporary build cache | When troubleshooting stale caches |

---

## 3. How to Test Your Site Locally

When writing notes and adjusting configuration, test the following key areas before publishing:

### A. Testing Navigation & Wikilinks
- Click internal wikilinks (e.g. `[[guides/getting-started]]`, `[[guides/hosting-on-github-and-cloudflare]]`) to verify they navigate smoothly to the destination note.
- Check the **Linked References (Backlinks)** section at the bottom of notes to verify reciprocal connections appear automatically.

### B. Testing Tags & Topic Filtering
- Click on any tag badge (in note headers, in-body `#tags`, or in the sidebar).
- Verify that the URL updates to `#/tag/<tag-name>` and displays the filtered list of matching notes.
- Verify that clicking "Clear Tag Filter" or selecting a note returns you to the standard reading view.

### C. Testing Full-Text Search
- Press <kbd>Cmd</kbd> + <kbd>K</kbd> (Mac) or <kbd>Ctrl</kbd> + <kbd>K</kbd> (Windows/Linux) to open the instant search modal.
- Search for keywords across titles, descriptions, headings, and note contents.
- Use <kbd>↑</kbd> and <kbd>↓</kbd> arrows and <kbd>Enter</kbd> to jump directly to notes.

### D. Testing Themes, Palettes & Sidebar Placements
- Test the **Light / Dark Mode** toggle in the top-right navbar.
- Open `kyar-kyar.config.yaml` and test changing palettes (e.g. `tokyo-night`, `rose-pine`, `catppuccin`, `classic-light`, `solarized-dark`).
- Test switching `sidebarPlacement` between `"left"`, `"right"`, and `"popup"` mode.

### E. Testing on Mobile / Tablets
To test responsiveness on your phone or tablet on the same Wi-Fi network:
```bash
npm run dev -- --host
```
Vite will output a Network URL (e.g. `http://192.168.1.15:3000`). Open that URL in your mobile browser to test drawer menus, reading typography, and touch responsiveness.

---

## 4. Testing the Production Build Locally

Always test the compiled bundle locally before deploying to GitHub Pages or Cloudflare:

```bash
# Step 1: Run the type-checker
npm run lint

# Step 2: Build the production bundle
npm run build

# Step 3: Preview the production bundle locally
npm run preview
```

Alternatively, you can test with any standard static HTTP server:
```bash
npx serve dist -l 3000
```

Open `http://localhost:3000` to verify that all assets load cleanly, routes resolve without 404 errors, and images display properly.

---

## 5. Troubleshooting Common Local Issues

### Port 3000 is already in use
If another application is using port 3000:
```bash
npm run dev -- --port 3001
```

### Stale build cache
If changes aren't reflecting or an asset seems stuck:
```bash
npm run clean
npm run dev
```

### Missing dependencies error
If you see an error like `vite: command not found`:
```bash
rm -rf node_modules package-lock.json
npm install
```

Now you're ready to write, test, and publish your digital garden with total confidence. Check out [[guides/hosting-on-github-and-cloudflare|Hosting on GitHub Pages & Cloudflare Pages]] when you're ready to go live.
