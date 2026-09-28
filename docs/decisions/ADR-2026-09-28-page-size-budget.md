# ADR-2026-09-28: A byte budget on the built page

## Status

Accepted.

## Context

`dist/index.html` is the whole game: markup, CSS and the joined game script, plus a small inline icon. It grows with every feature and has no ceiling, so a slow creep (a large table, an unminified asset, a copy-pasted block) would only be noticed by chance. `docs/ROADMAP.md`'s ideas already named this: "Page size budget. A check on the size of `dist/index.html`, which grows with every feature."

## Options Considered

### Option 1: No check, watch it by eye
**Pros:** nothing to build or maintain. **Cons:** relies on someone noticing; the page has already reached 749 KB.

### Option 2: A check group with a fixed byte budget
**Description:** `tools/checks/page-size.mjs` reads the `dist/index.html` the build already made and fails if it's over a budget, printing the size, the budget and a breakdown by CSS, script and inline images/data.
**Pros:** costs nothing extra in CI (no browser, one file read); catches a size regression on the PR that causes it, with enough detail to see which part grew.
**Cons:** a budget can go stale and needs raising on purpose sometimes.

## Decision

Option 2. The budget is set at the page's size on `main` at 15:45 on 28 Sep 2026 (749 KB) plus about 15% headroom, rounded: 861,000 bytes, as the `BUDGET` constant in `tools/checks/page-size.mjs`. Raising it on purpose is a one-line change to that constant, with the reason given in the PR that raises it.

## Consequences

- A PR that grows the page past budget fails Checks and has to say why, in the same way a balance change outside its baselines does.
- The budget doesn't track page growth on its own; a feature that's meant to grow the page (a new system, a bundled asset) raises the constant in its own PR rather than working around the check.
- Shrinking the page (the roadmap's other idea) would let the budget come back down; that's not part of this change.
