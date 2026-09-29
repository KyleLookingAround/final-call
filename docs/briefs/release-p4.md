# Brief: Release batch P4, numbers, labels and the save panel (#153)

Batch P4 of the release audit (`docs/ideas/release-audit.md`, #155). Branch `feature/release-p4-labels`, one PR.

## Goal
- Fix rows 10, 35, 36, 37 and 38 of issue #153 and the panel notes' text, biggest first. Where a row's fix is wrong once in the code, do what serves the player better and say why in the PR.
- Numbers read the same way everywhere, labels are plain UK English, the save panel says what it does. Look at screenshots at 390×844 and 1440×900. `PLAY` stays identical on seeds 1–3.
- May touch: `03-state.js`, `15-panel.js`, `12-drawing.js`, the checks that prove its rows, those systems' notes, a What's new fragment, a lesson and this brief. No other game file.

## Rules
- No `perf` or `scene` ratio may rise beyond noise (±0.02× simulation, ±0.05× drawing).
- Auto-merge (squash) once Checks, Description and, if play moved, Balance are green. Book one `send_later` to confirm the merge and the Pages publish, close #153, and stop.
- Ask only for something irreversible or outside the brief; otherwise open a `needs-owner` issue with a default, and take it after 12 hours.
- Estimate: about $10. Past twice that, say why in the PR and its lesson.
