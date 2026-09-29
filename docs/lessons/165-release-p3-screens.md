Theme: review
# Release P3, small screens and landscape · 29 Sep 2026

- **Numbers:** estimate $12; the PR is the only stopping point so far, and the cost was not read from the session (usage not available in the tools here), so treat it as unknown rather than under. Small CSS-led rows: no game rule changed.
- **What it found:** the 568×320 top bar wrapped because the map is only 198 px wide there (a 250 px panel plus a 40 px camera band on each side), not because of anything in the bar; the fix is a fourth width step (29 px buttons under 240 px) rather than moving the readout, which already stacks below the bar. The sheet's panel was short because the board took its room, so fully open now hides the board.
- **Choices:** at panel widths under 300 px (a 320 px phone too) the stats drop "Last hour" and the rating's number, to keep cash whole; the wider hall history column takes "+28 min". Tab labels now depend on tab count (`:has()`), so six tabs or fewer keep them at 390.
- **Went well:** a small measuring script (`getBoundingClientRect` on the stage, hud and panel) found the cause of the wrap in one run, before any CSS was touched.
