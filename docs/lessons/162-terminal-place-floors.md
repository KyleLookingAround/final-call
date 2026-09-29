Theme: terminal
# Two floors in Classic · 29 Sep 2026

- **Numbers:** estimate $25. PR #162, three commits before opening. `npm run check`: 357 of 358 pass. The one failure is `first-level` seed 1's on-time clause (#161, `needs-owner`). `floors` takes about 7 s locally. Ten pending checks switched on.
- **What it did:** every hall stayed where it was. Arrivals go down from a gallery over immigration by escalator or lift, so walks moved by at most 7% (arrivals 13.2 → 14.1 min). The places table was left for the floor plans part, since no hall moves.
- **[D]:** (a) two game-code bugs caught before opening: a passenger flapping between rooms while stepping off a link (floors checks), and a `switchLayout` gap for passengers on the platform, tram and bus queues (`rebuild`, once timings changed). (b) none yet. (c) two pre-written checks fixed: the runner check required a floor change the spec's plan can't give, and `scene: one floor at a time` matched dots to passengers by position at a doorway.
- **Lessons:**
  - Twice a trailing `// comment` went into the middle of a one-line statement and turned the rest of the line into a comment. The build passed both times. The fresh review caught one; the checks caught the other. → Put new code with a trailing comment on its own line, and grep the diff for code after a `//`.
  - A `git checkout <file>` to undo an experiment threw away that file's uncommitted work. → Commit before experimenting, and undo an experiment with `git stash` or a copy.
  - Any change to walks reshuffles the random order, so guards recorded from `main`'s play (`rules`' states, `weather-fx`) must be recorded again, and seed-fixed guards like `first-level` can flip by chance. → A change that alters play should expect this, measure across more seeds (1–12 here), and raise it rather than tune numbers until seed 1 passes.
  - Compare simulation cost per passenger, not per game minute, when the play changes: the late-game hour carried 40% more passengers on this branch.
