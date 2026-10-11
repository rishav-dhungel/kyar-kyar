---
title: "Theming & Customization"
date: "2026-09-30"
pinned: false
tags: [guides, configuration, themes, styling, typography]
description: Guide to customizing color palettes, typography styles, background patterns, and author profile details in kyar-kyar.config.yaml.
---

All site-wide metadata, author information, visual themes, and layout placements are configured in a single YAML file located at the root of the project: `kyar-kyar.config.yaml`.

---

## Configuration Reference

Here is an annotated breakdown of available settings:

```yaml
# Author Profile & Branding
author: "Rishav Dhungel"
tagline: "Software Engineer & Builder"
bio: "Technical documentation, operational guides, and architecture for kyar-kyar."
avatarUrl: "https://github.com/rishav-dhungel.png"
title: "kyar-kyar Guides & Documentation"
baseUrl: "https://rishav-dhungel.github.io/kyar-kyar"

# Theme & Appearance
theme:
  # Dark Palettes: "nord", "tokyo-night", "rose-pine", "gruvbox-dark", "catppuccin", "solarized-dark"
  palette: "nord"

  # Light Palettes: "classic-light", "gruvbox-light", "solarized-light"
  lightPalette: "classic-light"

  # Color Mode: "dark", "light", or "system"
  colorMode: "dark"

  # Sidebar Placement: "left", "right", or "popup"
  sidebarPlacement: "left"

  # Background Pattern: "dots", "grid", "lines", "crosshatch", "blueprint", "noise", "none"
  backgroundPattern: "dots"

  # Typography: "serif", "sans", "mono"
  fontFamily: "mono"

  # Accent Color: Hex color code (e.g. #64b5f6)
  accentColor: "#64b5f6"

# Social Links (Displayed in author profile and footer)
social:
  github: "https://github.com/rishav-dhungel"
  email: "rishavdhungel3@gmail.com"
```

---

## Supported Color Palettes

### Dark Palettes
- `nord`: Arctic, bluish-gray tones with cool pastel highlights.
- `tokyo-night`: Deep navy background with vibrant neon accents.
- `rose-pine`: Soft warm dark pine aesthetic with muted rose tones.
- `gruvbox-dark`: Warm retro groove tones with amber accents.
- `catppuccin`: Soothing pastel palette on deep Mocha slate.
- `solarized-dark`: Precision low-contrast palette calibrated for eye comfort.

### Light Palettes
- `classic-light`: Clean minimalist editorial paper background.
- `gruvbox-light`: Warm parchment tones with retro contrast.
- `solarized-light`: Warm ivory background engineered for readability.

---

## Sidebar Placement

You can choose where the sidebar docks:
- `"left"`: Classic document tree layout on the left edge.
- `"right"`: Right-hand sidebar dock.
- `"popup"`: Drawer overlay mode that only appears when invoked.

When reading notes, the sidebar automatically collapses to provide a distraction-free view, and can be hovered or toggled at any time using `Cmd + \` or the toggle button.
