---
type: Lesson
theme: ci
---
# Day in a minute (#102) · 28 Sep 2026

- **Numbers:**
  - Estimate $16. The session's cost wasn't reported at the stopping points (it read 0).
  - One build round and one review round, then two full local check runs.
  - Two CI rounds on the first head, plus a merge of `main` by hand when Photo mode (#100) landed.
  - The account's five-hour limit stopped the session at about 22:20 and nothing woke it until the coordinator did at 04:00.
- **The Description check and links.** A link to the screenshots page failed the Description check, because its address matches the attribution pattern. → Put such links in a PR comment, never the description. The check only reads the title and description.
- **What the review caught:**
  - Tapping a tab mid-playback left it frozen on the Region view, and moved the wrong camera on stop.
  - In full screen on a phone, the panel covered the playback.
  - Every key was swallowed while it played.
  - Yesterday's heat was drawn out of place after a change of layout.
  - All were fixed before opening. → A mode that takes over the stage has to stop on any tap outside it, not just on its own overlay. It must also restore the camera object it saved, not whichever `R.cam` is current.
- **`news` in CI.**
  - The `news` group timed out clicking in the What's new card on both CI runs of the first head.
  - It passed alone and in two full local runs, and at the same frame rate as `main` with the CPU slowed 6×. Other PRs passed it in CI at the same time.
  - No cause found, and nothing in this PR touches the card. → Recorded as a fourth data point beside #89, #92 and #94: it's worth a session of its own to make that click wait on the page's state.
- **Went well:**
  - Recording through a clock hook kept `update()` untouched. The `clocks` check caught the new hook at once.
  - Re-recording `clocks.json` was safe, because the log without the new hook matched the old hash exactly.
  - Photo mode's `drawnHour()` merged cleanly with the playback override, which runs after it.
