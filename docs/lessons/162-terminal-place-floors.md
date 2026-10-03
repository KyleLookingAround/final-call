---
type: Lesson
theme: drawing
---
# Two floors in Classic · 29 Sep 2026

- **Numbers:** estimate $25. PR #162, three commits before opening. `npm run check`: 357 of 358 pass before #161. The one failure was `first-level` seed 1's on-time clause (#161, `needs-owner`). The coordinator took the default; the full run then passed. `floors` takes about 7 s locally. Ten pending checks switched on.
- **What it did:** every hall stayed where it was. Arrivals go down from a gallery over immigration by escalator or lift, so walks moved by at most 7% (arrivals 13.2 → 14.1 min). The places table was left for the floor plans part, since no hall moves.
- **[D]:** (a) two game-code bugs caught before opening: a passenger flapping between rooms while stepping off a link (floors checks), and a `switchLayout` gap for passengers on the platform, tram and bus queues (`rebuild`, once timings changed). (b) none yet. (c) three checks changed: the runner check required a floor change the spec's plan can't give, and `scene: one floor at a time` matched dots to passengers by position at a doorway. `first-level`'s on-time clause now asks for two of seeds 1–3, the coordinator's call on #161. First-morning punctuality moves to #147.
- **Balance:** seed 1 left tolerance: level 3 at 149.7 against 95–117, then stuck at level 3. Seed 4 ran 15–27% slow; seeds 2, 3 and 5 were within tolerance or near it. With instant links seed 1 recovered, so its lag is the arrivals' ride early in the game. The owner chose to merge and rebalance in B1 (#147).
- **Lessons:**
  - Twice a trailing `// comment` went into the middle of a one-line statement and turned the rest of the line into a comment. The build passed both times. The fresh review caught one; the checks caught the other. → Put new code with a trailing comment on its own line, and grep the diff for code after a `//`.
  - A `git checkout <file>` to undo an experiment threw away that file's uncommitted work. → Commit before experimenting, and undo an experiment with `git stash` or a copy.
  - Any change to walks reshuffles the random order, so guards recorded from `main`'s play (`rules`' states, `weather-fx`) must be recorded again, and seed-fixed guards like `first-level` can flip by chance. → A change that alters play should expect this, measure across more seeds (1–12 here), and raise it rather than tune numbers until seed 1 passes.
  - Compare simulation cost per passenger, not per game minute, when the play changes: the late-game hour carried 40% more passengers on this branch.
  - The Balance workflow can pass as a run while a seed is far outside tolerance: read its tables, not its tick. Running more seeds (4 and 5 here), and an experiment that removes the change's cost (instant links), showed which lag the change caused and which came from chance.
