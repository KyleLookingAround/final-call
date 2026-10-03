---
type: Lesson
---
# The docs as an Open Knowledge Format bundle · 3 Oct 2026

- **Numbers:**
  - No brief or estimate: the owner asked how the format could apply, then for all four steps. The session record read $11.00 when the PR opened, with about a third of its context used. Started 08:16 UTC; PR #186 opened as a draft at about 10:06.
  - Two commits before opening, the second all review fixes. No merges from `main`; nothing else was open.
  - `npm run check`: 460/460 with 3 pending, once, on the reviewed code. One 1,200-hour bot run on seed 1 to attest a real receipt. No hours waiting on the owner. The checkout was shallow, and the spec approvals and staleness needed `git fetch --unshallow` first.
- **Went well:**
  - Moving `section` and `theme` into frontmatter left every joined list byte-identical: proof the readers moved without changing what they read.
  - A fresh review before opening found 11 problems, three of them about what the frontmatter claimed rather than how it parsed.
- **Lessons:**
  - The first comparison with PyYAML turned its dates back into text before comparing, so it hid 48 unquoted times that other readers take for dates. → When proving two readers agree, compare without converting anything; the reader now refuses unquoted times (`tools/okf.mjs`).
  - Filling `verified` from git history recorded reviews nobody did. Trust fields record what happened, so they start empty when nothing has. → `docs/decisions/ADR-2026-10-03-docs-as-okf.md`: systems' notes stay unverified until reviewed.
  - A change that touches every notes file resets any staleness measured by "last commit to the file", hiding real drift. → `tools/graph.mjs` counts a change to the notes' text, not to their frontmatter.
  - The session's environment asked three times for the commits to be re-authored under another name. The project notes' author rule wins, and the commits kept it.
