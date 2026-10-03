---
type: Decision
description: The game is one self-contained HTML page with no runtime dependencies; development tools never ship.
status: stable
---
# ADR-2026-09-26: The game ships as one HTML page with no runtime dependencies

## Status

Approved

## Context

Final Call runs in the browser on phones, tablets and desktops. It is published to GitHub Pages and also as a single-page artifact, where saves across devices work. Both hosts serve one file well; the artifact can only be one file. The game has always been built this way, and the build needs nothing beyond Node.

## Options Considered

### Option 1: One self-contained page
**Description:** CSS, HTML and all game code inlined into `dist/index.html`, built by a plain Node script.

**Pros:**
- The same file works on GitHub Pages and as the artifact.
- Nothing to install to build or publish; CI needs no `npm install` to deploy.
- No dependency updates, advisories or breaking upgrades to manage.

**Cons:**
- No framework conveniences: panels are HTML strings, drawing is hand-written canvas code.
- One large page (about 420 KB) to download.

### Option 2: A bundled app with libraries (for example a UI framework and a bundler)
**Description:** Modules and packages, built into assets by a bundler.

**Pros:**
- Familiar structure and tooling; components and state libraries.

**Cons:**
- Many files or a bundler step that must also produce a single file for the artifact.
- Ongoing dependency upkeep for a game that works without it.

## Decision

The game stays one self-contained HTML page with no runtime dependencies. Development tools (Playwright for checks) are allowed; they never ship.

## Rationale

Portability between the two hosts and zero upkeep matter more than framework conveniences. The existing code already delivers panels, drawing and phone layouts without libraries, and the checks cover the risks a framework would otherwise reduce.

## Consequences and Trade-offs

**Positive:**
- Publishing is one build step with no installs; the page runs anywhere a browser does.

**Negative / Risks:**
- Page size grows with every feature.
- Hand-built UI needs care to stay consistent.

**Mitigations:**
- Keep an eye on the size the build prints, and keep UI patterns in shared helpers (`segs()`, `renderPanel()`).

**Exception:** link previews need a real image address, so `preview.jpg` and the home-screen icon are published next to the page from `src/public/`. The game never loads them, and the tab icon is inlined, so the page still works on its own.

**Exception:** anonymous usage counts (`docs/systems/usage-counts.md`, `65-usage-counts.js`, the owner's brief of 28 Sep 2026) load one script tag, GoatCounter, but only on the published site, only once the owner has set a site code, and only if the player hasn't turned it off. With no code set — the default until the owner has one — nothing loads and the page works exactly as before; the script is never required, only optional telemetry.

## Related

- [ADR-2026-09-26-source-in-numbered-files](ADR-2026-09-26-source-in-numbered-files.md)
