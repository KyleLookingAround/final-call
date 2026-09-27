## What and why

<!-- One or two sentences. Link the issue: "Closes #12". -->

## What players see

<!-- What changes on the map, board and gates, or "Nothing" for code-only changes. -->

## Checks

- [ ] `npm run check` passes
- [ ] Looked at the screenshots (the "screenshots" artifact, or `build/shots/`) for phone, tablet and desktop
- [ ] Economy or progression change: bot run on seeds 1–3, results below (the Balance workflow also runs)
- [ ] New saved fields have a default in `DEFAULT()` and are handled in `resetAll`; older saves still load
- [ ] Rules changed on purpose have their `rules` check updated; new rules have a check
- [ ] Project notes, `docs/ROADMAP.md` and (for a release) `docs/HISTORY.md` are up to date
- [ ] A fresh review before opening: what it found and what changed
