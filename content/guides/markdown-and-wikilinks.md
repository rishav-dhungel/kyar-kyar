---
title: "Markdown Syntax & Wikilinks"
date: "2026-09-30"
pinned: false
tags: [guides, markdown, wikilinks, callouts, syntax]
description: Guide on using Obsidian-compatible wikilinks, frontmatter, callout admonitions, code blocks, and tags in kyar-kyar.
---

**kyar-kyar** supports standard CommonMark, GitHub-Flavored Markdown (GFM), and Obsidian-style extensions like `[[wikilinks]]` and `[!callouts]`.

---

## Frontmatter

At the very top of each `.md` file, you can optionally include YAML frontmatter surrounded by triple dashes:

```yaml
---
title: "Document Title"
date: "2026-09-30"
pinned: true
tags: [guide, workflow, markdown]
description: "A short synopsis used in previews and search cards."
---
```

### Frontmatter Fields

| Field | Type | Description |
| :--- | :--- | :--- |
| `title` | `string` | Display title for the note. Defaults to the filename if omitted. |
| `date` | `string` | ISO format date (`YYYY-MM-DD`). |
| `pinned` | `boolean` | When `true`, places a pin icon on the note and sorts it to the top. |
| `tags` | `string[]` | List of tag labels associated with this note. |
| `description` | `string` | Short summary for cards and search results. |

---

## Wikilinks & Backlinks

You can connect documents using double square brackets:

```markdown
# Simple link using the target note's slug or path
[[guides/getting-started]]

# Custom link text using a pipe
[[guides/getting-started|Getting Started Guide]]
```

When you link to another note, **kyar-kyar** automatically computes reciprocal backlinks and displays them under the **Linked References** section at the bottom of the target document.

> [!tip] Automatic Clean Footers
> The **Linked References** section only appears at the bottom of a page when other notes link to it. Documents without incoming links maintain a clean, distraction-free reading footer.

---

## Callouts and Admonitions

You can add stylized callout blocks using GitHub / Obsidian syntax:

```markdown
> [!note]
> Useful contextual information for the reader.

> [!tip]
> A helpful suggestion or shortcut.

> [!warning]
> A critical warning or caveat to keep in mind.

> [!info]
> Background notes or reference material.
```

### Rendered Example

> [!tip] Instant Preview
> Whenever you edit and save any `.md` file in `/content/`, the local development server updates the UI immediately.

---

## Tags

Tags can be defined either in the YAML frontmatter:
```yaml
tags: [guides, markdown]
```
Or directly within the body text using hashtag notation: `#guides`.

Clicking on any tag opens the filtered tag view showing all documents sharing that tag.
