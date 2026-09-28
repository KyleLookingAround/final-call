Theme: checks
# Polish: Reports and the region at night · 27 Sep 2026

- **Numbers:** session `session_01UoKaSoLbGh82GdZThynNpy`, estimate $7: $3.19 and 185k of 1M context at the CI check-in, under the estimate. Started 17:20 UTC, PR #80 opened 17:32; one push after opening (this merge of `main`, with this entry). Checks, Balance and Description green on the first head; the only red run was the Description check on the auto-appended footer, green again once it was stripped.
- **Went well:** row 9 was settled in one throwaway script before touching any code: the region summary's riders equal the sum of the lines' to rounding error, so it was a display question (the idle buses list first), not a simulation bug, and no `bug` issue was needed. The new `reports` check keeps that sum as an invariant and failed 5 of 6 on `main`'s game code, including the audit's exact `$0.03` Geneva row.
- **Lessons:**
  - Measuring night by "warm pixels" counted the yellow labels by day as windows; comparing the same pixels by day and by night (only lit windows get brighter) is what separates them. Useful for any future day/night check on a canvas with coloured labels.
  - The Balance workflow's tables compare against the baselines, not against `main`, so "`PLAY` identical on seeds 1–3" still meant running `main` locally. A throwaway `git worktree` of `origin/main` (with `node_modules` symlinked) let the three `main` runs and three branch runs go side by side in about four minutes.
  - The footer the PR tool adds failed the Description check again, as the two entries below found. No further change: the brief already asks for the read-back.
  - `main` moved twice while CI ran (#84, then #87 and #90), so it took the brief's full two merges. Only the docs conflicted (`docs/SYSTEMS.md`'s one-line list of check groups and the top of this file), as the brief predicted.
