# Levels and Masterplan

**Levels and Masterplan** (`02-masterplan.js`, `09-construction-levels-days.js`, `18-masterplan-ui.js`). Level-ups and some goals give plan points. Consultants sell points from level 4. `GOALS` is a sequential list, and `curGoal()` returns the first goal that is unfinished and available. `recommendedTech(branch)` marks the lowest-tier plan ready to approve in each category as the one to pick next; it's display only, worded like the level-up card's "what this unlocks" line (`planUnlockLine`), and changes no cost, effect or unlock.
