Theme: ci
# #45 Weekly health check · 27 Sep 2026

- **Numbers:** session `session_012PGwZ7jVPui6Xc9weMjmjt`, estimate $6: $4.01 and 205k of 1M context when the PR opened. Created 11:37, PR opened 11:53 (16 minutes, most of it writing and testing `tools/health.mjs` locally against a short bot run before touching CI); Checks green first time in about 7 minutes. No Balance run: no game code. `main` moved three times while this PR was open, so the branch needed two merges (one, this one, with a `docs/LESSONS.md` conflict) before pushing.
- **Lessons:**
  - `workflow_dispatch` can't be triggered on a branch until the workflow file is on the default branch, so "prove it with a manual run on the branch before merging" isn't possible for a brand-new workflow, only for one already on `main`. → No change to a playbook (out of this brief's files to touch): a brief adding a new workflow should ask for proof right after merging instead, and this entry is the record for the next one that does.
  - Recomputing the bot's own `lvlAt` against a baseline read from an override, rather than trusting the bot's own precomputed `rows`, cost one extra small script but made the forced-drift test straightforward to prove without ever touching `tools/baseline.json`.
