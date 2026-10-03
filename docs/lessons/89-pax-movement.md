---
type: Lesson
theme: checks
---
# Passengers who suddenly sped down the piers (#82) · 27 Sep 2026

- **Numbers:** session `session_017MmM6KJ5fiP2s9m1RzVJZn`, estimate $10: $5.69 and 242k of 1M context at the pre-merge check-in. Started 17:23, issue and PR opened by 17:52, all CI green on the first push; one merge of `main` (a `docs/SYSTEMS.md` conflict with #90's pending-checks note).
- **What it found:** the brief's suspect was right: `walkMul` sped any walk through doorways, or any target 300 px away, 2.5× once the mover was bought, drawn as walking (700 px/min on the L9 save), and in layouts with no mover track it stacked on their trains and walkways (1,400 px/min on Round). Logging every passenger's speed per step also found the smaller jumps no one had reported: counters calling the next person forward, the duty-free path, passport desks moving their target, and the stall at every doorway where `moveTo` drops the rest of a step.
- **Went well:** splitting "what the game simulates" from "what is drawn" kept `PLAY` and `STATE` identical on seeds 1–3, both keeping Classic and rebuilding, while fixing every jump: riders are hidden and drawn as mover cars, and the drawn position eases after the simulated one inside `drawPax`'s existing loop. A frame-by-frame measuring script in `build/` came first, and it grew straight into the `movement` check.
- **Lessons:**
  - A check on drawn speed has to measure what's drawn: the first version flagged the easing's own catch-up and its starting floor (a floor of 40 against a check floor of 30 read as a 1.7× jump). Tie the check's thresholds to the easing's constants, not round numbers. → `tools/checks/movement.mjs` names them together.
  - Replacing `p.x` with a local `x` across a drawing function by text also hit `p.xfer` and `p.xferred`; the build passed, and only reading the diff caught it. When renaming a field, use word boundaries.
  - The first full `npm run check`, run while six bots ran alongside, timed out clicking in `news`; the group passed alone on both builds and the rerun passed. Don't run the full check beside bot runs.
  - The notes' rebuild figures (level 9 at 953–966) were stale: `main` today rebuilds to level 9 at 975–989. Measure `main` rather than trusting the notes when a change could move the rebuild runs.
