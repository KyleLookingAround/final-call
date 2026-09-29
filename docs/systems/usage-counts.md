# Usage counts

**Usage counts** (`65-usage-counts.js`). A cookie-free page counter, GoatCounter, so the owner can see whether anyone
came from the launch posts. `USAGE_SITE` (the GoatCounter site code) sits in one place and is `final-call`. Were it empty, nothing would load and
nothing would be sent, ever, which is how this shipped before the owner had a GoatCounter site. With a code set, the
counter's script tag loads only on the published site (`feedbackRepo()`, the same test the Help feedback link and the
update check use), never in `R.sim`, never in `build/test.html` or from a local file, and only if the player hasn't
turned it off in Office › Settings › Screen and sound ("Send anonymous usage counts", on by default, `G.set.usage`).
Loading is deferred with `setTimeout` past this file's own top-level code, so the decision reads the save's actual
setting rather than a fresh game's default.

Six named events mark the funnel, each sent at most once per save (`G.usageSent`, a flag per event): `first-flight`
(the first departure, `08-stands.js`), `level-1` and `level-3` (`checkLevel()`, `09-construction-levels-days.js`),
`day-2` (the second game day begins, `09-construction-levels-days.js`), `photo` (a photo saved or shared,
`62-photo-mode.js`) and `share` (a save code copied, `15-panel.js`). `usageEvent(name)` is a no-op — no DOM work, no
network call, no change to `G` — whenever the script hasn't loaded (counting off, not the published site, or
`R.sim`), so every call site is safe to reach from `update()`. Nothing sent ever names or describes the player: just
a path and an event flag.

This is a narrow, owner-approved exception to the one-page-no-dependencies decision
(`docs/decisions/ADR-2026-09-26-one-page-no-dependencies.md`): the script is optional, off by default, and the page
still works with it never loaded.
