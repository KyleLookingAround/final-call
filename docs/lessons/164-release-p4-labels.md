Theme: releases
# Release P4: numbers, labels and the save panel · 29 Sep 2026

- **What it found:** the Crews, Routes › New and Layouts notes the audit lists for P4 live in `34-airline-operations.js`, `31-routes.js` and `39-layouts.js`, which the brief keeps for other batches. Only the Fleet note shipped here; the other three shortened texts are still owed. The audit's "files" column for a batch should list every file its rows touch.
- **Row 38:** the page has no `viewport-fit=cover`, so `env(safe-area-inset-top)` is 0 in a normal tab and the band now defaults to none there, which is the intended fix.
- **Went well:** `money()` and Load each got a check first-hand (`rules`, `saves`); the Load check drives the real button with a 3.5 s wait.
- **Slip:** I chained a `git stash` behind a long check, then committed while it ran, so the "without the fix" run of the Load check never happened. Do not chain a stash behind a slow run.
