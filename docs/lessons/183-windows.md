---
type: Lesson
theme: checks
---
# Windows and watchers · 29 Sep 2026

- **Numbers:**
  - Estimate $14; the session record read $12.60 when the PR was marked ready, and used about a third of its context. Started 20:53 UTC; PR #183 opened as a draft at 21:55.
  - Six pushes before ready. One merge from `main` by hand (Release 36). One red Parts run, on the head before that merge.
  - `npm run check`: 447/447 with 8 pending (the decor and floor plans parts'). Four pending checks switched on. No hours waiting on the owner.
- **[D]:**
  - (a) Two game-code bugs caught by the pre-written checks before opening:
    - a safety margin before the gate call that let nobody watch at level 9;
    - a cap on watchers that counted from the per-state index, which doesn't list new states.
  - (b) None yet.
  - (c) Two fixes to `windows.mjs`: its `waiting()` didn't count the watchers' own state, and after Release 36 its walls included the roof terrace's deck.
- **Balance:** the Balance workflow's tables on the PR; watchers only move waiting passengers.
- **Went well:**
  - Printing what the check's filter saw first (#181's lesson) found the level 9 timing in one probe: everyone waiting is 1–2 minutes from their call.
  - A fresh review before opening found a small rating leak (standing lounge passengers dropped out of the crowding count) and a layout-switch gap. No check measured either.
- **Lessons:**
  - `byState()` (07-passengers.js) lists only `gate`, `shop`, `toShop`, `mkt` and `toMkt`: a new state gets no list, and `stateIn` does nothing for it. A system with its own state keeps its own short list, as the terrace and the windows do.
  - A pre-written check that plays the `newest` save can change under a part when a release adds a save. Release 36's `v36-L9.json` has the terrace bought, and the windows check then wanted glass on its deck. After merging a release, rerun the part's own group before anything else.
  - Whole `scene` runs put Classic desktop at +0.045× over six runs each. An A/B in one page (the same frames with the part's layer entries taken out and put back) showed the glass and its lights cost nothing measurable there. Time the part's own code directly before trimming it to fit a noisy row. The same A/B on the simulation found a real cost worth cutting: 1.9% of Midfield's `update()` from checking every waiting passenger's gate call, down to 0.85% by testing distance first.
