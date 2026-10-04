---
title: "Hosting & Authoring Guide: kyar-kyar"
date: "2026-09-30"
pinned: true
tags: [guides, hosting, deployment, github-pages, cloudflare, kyar-kyar]
description: Complete step-by-step guide for authoring notes in /content/ and deploying your kyar-kyar blog to GitHub Pages and Cloudflare Pages.
---

Welcome to **kyar-kyar**, the minimal, high-performance personal blog and digital garden static site generator.

This updated guide covers everything you need to know about the latest version:
1. **Dynamic Content Engine**: Storing and organizing Markdown notes in the `/content/` directory.
2. **Configuration**: Customizing your identity and themes via `kyar-kyar.config.yaml`.
3. **Seamless Design**: Blended background sidebar and edge-to-edge layout with zero margin gaps.
4. **Zero-Cost Edge Hosting**: Publishing to GitHub Pages and Cloudflare Pages.

---

## 1. How Content Works in kyar-kyar

Unlike systems that require database setup or hardcoded array files, **kyar-kyar compiles directly from real Markdown (`.md`) files inside the `/content/` folder**.

### Directory Structure Example:
```text
content/
├── index.md                 # Top-level home note (appears at root)
└── guides/                  # Becomes an expandable "guides" sidebar folder
    ├── getting-started.md
    ├── running-and-testing-locally.md
    ├── markdown-and-wikilinks.md
    ├── theming-and-customization.md
    └── hosting-on-github-and-cloudflare.md
```

### Frontmatter Format:
Every Markdown file can include optional YAML frontmatter at the top:
```markdown
---
title: "My Article Title"
date: "2026-09-30"
pinned: true
tags: [architecture, design, ideas]
description: "A quick summary shown in search results and preview cards."
---

# Your Note Content

Write in standard Markdown! You can also use [[internal-links]] or [[folder/note-name|Custom Link Text]].
```

- **Top-level files** (e.g. `content/index.md`) appear as root pages.
- **Subfolders** (e.g. `content/guides/`) automatically generate collapsable folder categories in the sidebar.
- **Wikilinks** (`[[other-note]]`) automatically generate forward links and bidirectional backlinks.

---

## 2. Site Configuration (`kyar-kyar.config.yaml`)

All site-wide metadata, identity details, and themes are controlled in a single file: `kyar-kyar.config.yaml`.

```yaml
# Author Identity & Branding
author: "Rishav Dhungel"
tagline: "Software Engineer & Builder"
bio: "Technical documentation, operational guides, and architecture for kyar-kyar."
avatarUrl: "https://github.com/rishav-dhungel.png"
title: "kyar-kyar Guides & Documentation"
baseUrl: "https://rishav-dhungel.github.io/kyar-kyar"

# Aesthetics & Theme Calibration
theme:
  palette: "nord"             # Default dark palette: nord, tokyo-night, rose-pine, gruvbox-dark
  lightPalette: "classic-light" # Default light palette: classic-light, gruvbox-light, solarized-light
  colorMode: "dark"           # "dark", "light", or "system"
  sidebarPlacement: "left"    # "left", "right", or "popup"
  backgroundPattern: "dots"   # "dots", "grid", "lines", "none"
  fontFamily: "mono"          # "serif", "sans", "mono"

# Social Links
social:
  github: "https://github.com/rishav-dhungel"
  email: "rishavdhungel3@gmail.com"
```

The sidebar background color automatically **blends with your theme background**, providing an immersive, uninterrupted visual canvas with zero margin gaps against the viewport.

---

## 3. Deploying to GitHub Pages (Automated via GitHub Actions)

GitHub Pages hosts your blog directly from your Git repository for free forever.

### GitHub Pages Setup Instructions:
1. Create a repository on GitHub named **`kyar-kyar`** under `rishav-dhungel`.
2. Initialize and push your project:
   ```bash
   git init
   git add .
   git commit -m "Launch kyar-kyar digital garden"
   git remote add origin https://github.com/rishav-dhungel/kyar-kyar.git
   git branch -M main
   git push -u origin main
   ```
3. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment > Source**, select **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` will automatically build and publish your site at:
   ```text
   https://rishav-dhungel.github.io/kyar-kyar/
   ```
   Whenever you push new Markdown notes to `/content/`, GitHub Actions will rebuild and deploy them in seconds.

---

## 4. Deploying to Cloudflare Pages (Instant Edge CDN)

Cloudflare Pages deploys static sites to a worldwide edge network with ultra-low latency.

### Cloudflare Pages Setup Instructions:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages**.
2. Select **Connect to Git** and choose your repository.
3. Configure build settings:
   - **Framework preset:** `Vite`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click **Save and Deploy**. Your site will be live at `https://<your-project>.pages.dev`.

---

## 5. Manual Static Build & Direct Upload

If you prefer not to use Git or CI/CD pipelines, you can build the site on your computer and deploy the static files manually:

1. **Build locally**:
   ```bash
   npm run build
   ```
2. The complete production website is generated in the `./dist` directory.
3. **Upload manually**:
   - **Cloudflare Pages**: Drag and drop the `./dist` folder into [Cloudflare Pages Direct Upload](https://dash.cloudflare.com/).
   - **Netlify Drop**: Drag and drop `./dist` into [app.netlify.com/drop](https://app.netlify.com/drop).
   - **Self-hosted VPS**: Copy `./dist` to your Nginx/Caddy server (`/var/www/kyar-kyar`).
