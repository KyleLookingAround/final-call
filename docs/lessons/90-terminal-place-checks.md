# The terminal as a place: checks first · 27 Sep 2026

- **Numbers:** estimate $10. Started 17:00, PR #90 opened 18:00. Two commits before opening and one from the review. `npm run check`: 190 passed, 35 pending. The new groups add about 20 s. Balance was dispatched by hand, since it doesn't run for `tools/` changes: green, and seed 1's `PLAY` and `STATE` match `main`.
- **What it found on `main`:**
  - rebuilding twice can stop the game (#78);
  - Star's and Round's walks are 1.75× and 1.9× Classic's;
  - Round leaves passengers at a boarding gate past departure for 90+ minutes;
  - rebuilding into Curved front, Satellite or Midfield leaves shoppers outside any room;
  - loading a save in a page that has already played another leaves runtime state behind.
- **Lessons:**
  - Step 1's plan missed that `Object.assign(SIMX,{get X(){…}})` in the parts already flattens a getter, before the hook runs. The `rules` check, written first, showed it at once. → The test page keeps each property as written (`tools/build.mjs`).
  - The first draft of the new groups took 33 s, mostly opening pages. → Checks whose play takes seconds wait until their code exists (`TP_ALL=1` plays them now), and the rest share pages. Budget it before writing, not after.
  - The fresh review caught a check that could never fail: toasts don't happen in the headless sim, so "the crowd is the only sign" counted nothing. It caught six more that would have misled a part, all fixed before opening. → A pre-written check that expects nothing (0 toasts, 0 stuck) needs the thing it watches to be able to happen in its setup. Say so in the check.
- **How [D] will be measured:** each part's PR records:
  - (a) game-code bugs a pre-written check caught before the PR opened;
  - (b) game-code bugs found after it opened;
  - (c) pre-written checks it had to fix, and how.

  The coordinator adds them up after the last part. The baseline is the terminal's 0.6 late bugs a part. [D] stays if (b) is at most 0.3 a part and this PR costs under 15% of the bundle.
