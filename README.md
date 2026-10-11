# kyar-kyar 🌱

> An open-source, blazing-fast personal blog and digital garden static site generator. No CMS, no databases, no server maintenance. Fully vibe coded website generator.

**kyar-kyar** lets you write plain Markdown files on your computer — placed either directly in the root or inside folder categories — and compiles them into a fast, searchable personal website.

All settings (palettes, dark/light calibration, background patterns, and sidebar positions) are configured directly in `kyar-kyar.config.yaml` with **zero frontend customizer clutter**.

---

## 💻 Running & Testing Locally

You can spin up **kyar-kyar** in seconds to preview notes, test themes, and write markdown locally on your computer.

### 📋 Prerequisites
- **Node.js**: v18.0.0 or v20.0.0+ (`node -v`)
- **npm** (bundled with Node) or `pnpm` / `yarn`

### ⚡ 1. Quickstart (Development Server)
```bash
# 1. Clone or navigate into your project directory
git clone https://github.com/rishav-dhungel/kyar-kyar.git
cd kyar-kyar

# 2. Install dependencies
npm install

# 3. Start local development server with hot-reloading
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

> **Instant Live Reload**: Any change you make to `.md` files in the `/content/` directory or settings in `kyar-kyar.config.yaml` updates automatically in your browser without restarting the server!

### 📱 2. Testing on Mobile & Tablets (Network Mode)
To test responsive layouts and touch interaction on a phone or tablet on the same Wi-Fi:
```bash
npm run dev -- --host
```
Vite will output your local network address (e.g. `http://192.168.1.15:3000`). Open that URL on your mobile browser.

### 🧪 3. Local Testing & Verification Checklist
Before deploying your site to production, run through this quick checklist:
1. **Wikilinks & Internal Navigation**: Click `[[note-slug]]` links to verify they route to the target note, and verify backlinks appear at the bottom.
2. **Interactive Tags**: Click `#tags` in headers, markdown bodies, or sidebar to verify the tag filter view activates at `#/tag/<tag-name>`.
3. **Instant Search**: Press <kbd>Cmd</kbd> + <kbd>K</kbd> / <kbd>Ctrl</kbd> + <kbd>K</kbd> to search notes by title, folder, content, or tag.
4. **Theme & Palettes**: Toggle between Dark and Light mode in the top navbar. Test custom palettes in `kyar-kyar.config.yaml`.
5. **Type & Syntax Check**: Run `npm run lint` (`tsc --noEmit`) to verify that all code compiles without any errors.

### 📦 4. Previewing the Production Build Locally
To test the exact production bundle as it will run on GitHub Pages or Cloudflare:
```bash
# Compile production static bundle into ./dist/
npm run build

# Preview the compiled bundle locally
npm run preview
```
Or test with a standalone HTTP server:
```bash
npx serve dist -l 3000
```

---

## 🎨 Configuring Your Site via `kyar-kyar.config.yaml`

Everything about your site is defined in `kyar-kyar.config.yaml`:

```yaml
# ==============================================================================
# Personal Identity & Branding (Author Name, Face & Tagline)
# ==============================================================================
author: "Rishav Dhungel"
tagline: "Software Engineer, Writer & Thinker"
bio: "Writing about systems, daily reflections, book notes, and slow living."
avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&h=240&q=80"
title: "Rishav Dhungel's Garden"
baseUrl: "https://rishav-dhungel.github.io/kyar-kyar"

# ==============================================================================
# Theme & Calibration
# ==============================================================================
theme:
  # Calibrated Palettes & Color Schemes:
  # - lightPalette: "classic-light" (Previous clean warm stone paper scheme, default for light mode)
  #                 or "solarized-light", "gruvbox-light"
  # - darkPalette:  "nord" (Arctic Ice Studio polar night palette, default for dark mode)
  #                 or "tokyo-night", "rose-pine", "kanagawa", "everforest", "catppuccin", "solarized-dark", "gruvbox-dark"
  palette: "nord"
  lightPalette: "classic-light"
  darkPalette: "nord"
  accentColor: "#64b5f6"

  # Initial Color Mode: "dark" | "light" | "system"
  colorMode: "dark"

  # Sidebar Placement:
  # - "left": Docked on the left side
  # - "right": Docked on the right side
  # - "popup": Hidden slide-over drawer for centered, distraction-free reading
  sidebarPlacement: "left"

  # Background Texture & Patterns:
  # - "dots": subtle engineering dot matrix
  # - "grid": drafting graph paper grid
  # - "lines": notebook ruled lines
  # - "crosshatch": fine diagonal linework
  # - "blueprint": technical square grid
  # - "noise": tactile paper texture
  # - "none": flat solid background
  backgroundPattern: "dots"

  # Typography: serif (literary), sans (modern), mono (technical)
  fontFamily: "serif"

# ==============================================================================
# Reading & Navigation Features
# ==============================================================================
navigation:
  showFolderCounts: true
  showTableOfContents: true
  showBacklinks: true
  showReadingTime: true
  showWordCount: true
  defaultExpandedFolders: true

# ==============================================================================
# Social Links
# ==============================================================================
social:
  github: "https://github.com/rishav-dhungel"
  twitter: "https://x.com"
  linkedin: "https://linkedin.com"
  email: "rishavdhungel3@gmail.com"
  rss: true

# ==============================================================================
# Footer
# ==============================================================================
footer:
  text: "powered by kyar-kyar fully vibe coded website generator"
```

---

## 🎨 Omakub-Inspired Color Palettes (With Hardcoded Hex Colors)

`kyar-kyar` comes pre-calibrated with themes inspired by the curated **Omakub** developer environment (by DHH / Basecamp). You can activate any palette by setting `theme.darkPalette:` or `theme.lightPalette:` in `kyar-kyar.config.yaml`, or use the exact hardcoded hex colors in `theme.customColors:`.

### Quick Preset Selector

```yaml
theme:
  # Light Mode (Clean Stone Paper by default):
  lightPalette: "classic-light"   # Options: "classic-light", "solarized-light", "gruvbox-light"

  # Dark Mode (Choose any Omakub curated palette):
  darkPalette: "tokyo-night"      # Options: "tokyo-night", "rose-pine", "kanagawa", "everforest", 
                                  #          "catppuccin", "nord", "gruvbox-dark", "solarized-dark"
```

---

### 1. Tokyo Night (Omakub Default Theme)
*Atmospheric Tokyo dusk with neon blue and violet accents.*
- **Preset name:** `tokyo-night`
- **Hardcoded Hex Values:**
  - Background (`bgMain`): `#1a1b26`
  - Sidebar (`sidebarBg`): `#16161e`
  - Card / Surface (`cardMain`): `#24283b`
  - Border (`borderMain`): `#2f3549`
  - Primary Text (`textMain`): `#c0caf5`
  - Headings (`textHeading`): `#ffffff`
  - Muted Text (`textMuted`): `#7982a9`
  - Accent Color (`accent`): `#7aa2f7`

```yaml
# Copy-paste directly into kyar-kyar.config.yaml:
theme:
  darkPalette: "tokyo-night"
  accentColor: "#7aa2f7"
```

---

### 2. Rosé Pine (Omakub Curated Theme)
*All-natural pine, warm faux fur, and delicate bougainvillea florals.*
- **Preset name:** `rose-pine`
- **Hardcoded Hex Values:**
  - Background (`bgMain`): `#191724`
  - Sidebar (`sidebarBg`): `#1f1d2e`
  - Card / Surface (`cardMain`): `#26233a`
  - Border (`borderMain`): `#403d52`
  - Primary Text (`textMain`): `#e0def4`
  - Headings (`textHeading`): `#eb6f92`
  - Muted Text (`textMuted`): `#908caa`
  - Accent Color (`accent`): `#ebbcba`

```yaml
# Copy-paste directly into kyar-kyar.config.yaml:
theme:
  darkPalette: "rose-pine"
  accentColor: "#ebbcba"
```

---

### 3. Kanagawa Wave (Omakub Curated Theme)
*Inspired by Katsushika Hokusai's iconic woodblock print "The Great Wave off Kanagawa".*
- **Preset name:** `kanagawa`
- **Hardcoded Hex Values:**
  - Background (`bgMain`): `#1f1f28`
  - Sidebar (`sidebarBg`): `#16161d`
  - Card / Surface (`cardMain`): `#2a2a37`
  - Border (`borderMain`): `#363646`
  - Primary Text (`textMain`): `#dcd7ba`
  - Headings (`textHeading`): `#c8c093`
  - Muted Text (`textMuted`): `#727169`
  - Accent Color (`accent`): `#7e9cd8`

```yaml
# Copy-paste directly into kyar-kyar.config.yaml:
theme:
  darkPalette: "kanagawa"
  accentColor: "#7e9cd8"
```

---

### 4. Everforest (Omakub Curated Theme)
*A comfortable, warm green environment designed to ease eye strain during long writing sessions.*
- **Preset name:** `everforest`
- **Hardcoded Hex Values:**
  - Background (`bgMain`): `#2d353b`
  - Sidebar (`sidebarBg`): `#232a2e`
  - Card / Surface (`cardMain`): `#343f44`
  - Border (`borderMain`): `#475258`
  - Primary Text (`textMain`): `#d3c6aa`
  - Headings (`textHeading`): `#e69875`
  - Muted Text (`textMuted`): `#859289`
  - Accent Color (`accent`): `#a7c080`

```yaml
# Copy-paste directly into kyar-kyar.config.yaml:
theme:
  darkPalette: "everforest"
  accentColor: "#a7c080"
```

---

### 5. Catppuccin Mocha (Omakub Curated Theme)
*Soothing pastel dark palette with soft lavender, mauve, and sapphire.*
- **Preset name:** `catppuccin`
- **Hardcoded Hex Values:**
  - Background (`bgMain`): `#1e1e2e`
  - Sidebar (`sidebarBg`): `#181825`
  - Card / Surface (`cardMain`): `#25253a`
  - Border (`borderMain`): `#313244`
  - Primary Text (`textMain`): `#cdd6f4`
  - Headings (`textHeading`): `#f5e0dc`
  - Muted Text (`textMuted`): `#a6adc8`
  - Accent Color (`accent`): `#89b4fa`

```yaml
# Copy-paste directly into kyar-kyar.config.yaml:
theme:
  darkPalette: "catppuccin"
  accentColor: "#89b4fa"
```

---

### 6. Nord (Omakub Curated Theme — Calibrated High Contrast)
*Arctic polar night blue-gray aesthetic refined for crisp readability and zero eye strain.*
- **Preset name:** `nord`
- **Hardcoded Hex Values:**
  - Background (`bgMain`): `#1e222a`
  - Sidebar (`sidebarBg`): `#181b21`
  - Card / Surface (`cardMain`): `#252b36`
  - Border (`borderMain`): `#363e4d`
  - Primary Text (`textMain`): `#e8edf4`
  - Headings (`textHeading`): `#ffffff`
  - Muted Text (`textMuted`): `#9bb0c9`
  - Accent Color (`accent`): `#64b5f6`

```yaml
# Copy-paste directly into kyar-kyar.config.yaml:
theme:
  darkPalette: "nord"
  accentColor: "#64b5f6"
```

---

### 7. Solarized Dark (Ethan Schoonover Precision Palette)
*Precision-engineered optical contrast with Solarized cyan-blue.*
- **Preset name:** `solarized-dark`
- **Hardcoded Hex Values:**
  - Background (`bgMain`): `#002b36` (base03)
  - Sidebar (`sidebarBg`): `#073642` (base02)
  - Card / Surface (`cardMain`): `#00212b`
  - Border (`borderMain`): `#0e4e5e`
  - Primary Text (`textMain`): `#93a1a1` (base1)
  - Headings (`textHeading`): `#eee8d5` (base2)
  - Muted Text (`textMuted`): `#586e75` (base01)
  - Accent Color (`accent`): `#268bd2` (Solarized Blue)

```yaml
# Copy-paste directly into kyar-kyar.config.yaml:
theme:
  darkPalette: "solarized-dark"
  accentColor: "#268bd2"
```

---

### 8. Gruvbox Dark (Omakub Curated Retro Groove)
*Warm retro terminal groove with bright pumpkin orange accents.*
- **Preset name:** `gruvbox-dark`
- **Hardcoded Hex Values:**
  - Background (`bgMain`): `#282828`
  - Sidebar (`sidebarBg`): `#1d2021`
  - Card / Surface (`cardMain`): `#32302f`
  - Border (`borderMain`): `#504945`
  - Primary Text (`textMain`): `#ebdbb2`
  - Headings (`textHeading`): `#fbf1c7`
  - Muted Text (`textMuted`): `#a89984`
  - Accent Color (`accent`): `#fe8019`

```yaml
# Copy-paste directly into kyar-kyar.config.yaml:
theme:
  darkPalette: "gruvbox-dark"
  accentColor: "#fe8019"
```

---

### 9. Classic Stone Paper (Default Light Mode)
*Previous clean warm-stone paper with high-contrast typography and cobalt accents.*
- **Preset name:** `classic-light`
- **Hardcoded Hex Values:**
  - Background (`bgMain`): `#fbfbfa`
  - Sidebar (`sidebarBg`): `#f7f7f6`
  - Card / Surface (`cardMain`): `#ffffff`
  - Border (`borderMain`): `#e5e5e4`
  - Primary Text (`textMain`): `#1c1917`
  - Headings (`textHeading`): `#0c0a09`
  - Muted Text (`textMuted`): `#57534e`
  - Accent Color (`accent`): `#2563eb`

```yaml
# Copy-paste directly into kyar-kyar.config.yaml:
theme:
  lightPalette: "classic-light"
```

---

### Custom Hex Overrides in YAML

If you want to fine-tune individual colors beyond presets, specify them in `theme.customColors:`:

```yaml
theme:
  customColors:
    # Light mode overrides
    lightBg: "#fbfbfa"
    lightSidebar: "#f7f7f6"
    lightCard: "#ffffff"
    lightBorder: "#e5e5e4"
    lightText: "#1c1917"
    lightAccent: "#2563eb"

    # Dark mode overrides
    darkBg: "#002b36"
    darkSidebar: "#073642"
    darkCard: "#00212b"
    darkBorder: "#0e4e5e"
    darkText: "#93a1a1"
    darkAccent: "#268bd2"
```

## 📁 Organizing Your Notes & Blog Posts

Drop Markdown files into your content folder or project root:

```text
content/
├── index.md                              # Home page (outside folder)
├── about.md                              # Standalone page: About Me (outside folder)
├── journal/                              # Folder category: Daily logs & reflections
│   ├── 2026-09-29-morning-reflections.md
│   └── 2026-09-28-gratitude-and-focus.md
├── thoughts/                             # Folder category: Essays & ideas
│   ├── digital-gardening-vs-chronological-blogs.md
│   └── building-second-brain.md
├── reading-notes/                        # Folder category: Book summaries & quotes
│   ├── atomic-habits-takeaways.md
│   └── show-your-work.md
└── guides/                               # Folder category: Documentation & tutorials
    ├── running-and-testing-locally.md
    └── hosting-on-github-and-cloudflare.md
```

- **Files outside folders** (e.g. `index.md`, `about.md`) appear under "Overview & Pages" in the sidebar.
- **Files inside folders** (e.g. `journal/`, `thoughts/`) appear under "Categories & Folders" as expandable directories.

---

---

## 🚀 Manual Hosting Guide

**kyar-kyar** compiles down to a pure static Single-Page Application (HTML, CSS, JavaScript, and assets) with no dynamic database or backend server requirements. You can manually host it on any web host, CDN, cloud platform, or your own server.

### 📦 1. Generating the Static Build

Run the standard build command:

```bash
# 1. Install dependencies
npm install

# 2. Build production static bundle
npm run build
```

This compiles your site into a self-contained `./dist` folder containing `index.html` and bundled assets.

---

### Option A: Drag-and-Drop / Direct Upload (No Git Required)

You can manually host the `./dist` folder without setting up Git or CI/CD:

- **Cloudflare Pages Direct Upload**:
  1. Log into [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages** > **Upload assets**.
  2. Drag and drop the `./dist` directory. Your site is instantly live globally!
- **Netlify Drop**:
  1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
  2. Drag and drop the `./dist` directory.
- **Vercel CLI**:
  ```bash
  npx vercel deploy --prebuilt
  ```
- **AWS S3 / Google Cloud Storage**:
  Upload all files inside `./dist` to a public storage bucket configured for static website hosting.

---

### Option B: Self-Hosted on Your Own VPS (Nginx / Caddy / Apache)

To host on your own Linux server or VPS (DigitalOcean, Hetzner, Linode, AWS EC2, Raspberry Pi):

#### 1. Transfer the `dist` folder:
```bash
rsync -avz ./dist/ user@your-server-ip:/var/www/kyar-kyar/
```

#### 2. Nginx Configuration (`/etc/nginx/sites-available/kyar-kyar`):
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/kyar-kyar;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets for high performance
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }
}
```

#### 3. Caddy Server (`/etc/caddy/Caddyfile`):
```caddy
yourdomain.com {
    root * /var/www/kyar-kyar
    file_server
    try_files {path} /index.html
}
```

#### 4. Instant Local / Internal Preview Server:
```bash
npx serve dist -l 3000
```

---

### Option C: GitHub Pages (Free Automatic Deployment via Git)

GitHub Pages can host your blog directly from your Git repository:

1. **Create a GitHub repository** named `kyar-kyar` at [github.com/new](https://github.com/new) under `rishav-dhungel`.
2. **Push your project**:
   ```bash
   git init
   git add .
   git commit -m "Launch kyar-kyar digital garden"
   git branch -M main
   git remote add origin https://github.com/rishav-dhungel/kyar-kyar.git
   git push -u origin main
   ```
3. **Enable GitHub Pages**:
   - In your repository, go to **Settings** > **Pages**.
   - Under **Build and deployment > Source**, select **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` will automatically build and publish your site at `https://rishav-dhungel.github.io/kyar-kyar/`.

---

### Option D: Cloudflare Pages (Git Integration)

1. Log into [dash.cloudflare.com](https://dash.cloudflare.com/) and navigate to **Workers & Pages**.
2. Click **Create Application** > **Pages** > **Connect to Git**.
3. Select your repository and specify build settings:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**. Your site will be published at `https://<project-name>.pages.dev` with automatic edge caching.

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build production static bundle
npm run build
```

---

## 📄 License
[MIT](LICENSE) © 2026 Rishav Dhungel
