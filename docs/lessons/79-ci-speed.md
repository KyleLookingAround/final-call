Theme: ci
# Runbook experiment [B]: faster CI. #46 cache Playwright's Chromium, #79 only the touched check groups on drafts · 27 Sep 2026

- **Numbers:** #46 estimate $5, about $2.70 by ready; one re-run from the Actions tab to get a cache hit. #79 estimate $5, about $19 by ready, most of it CI rounds and local runs repeated after each of seven merges from `main`. #79's two real full runs (touching a workflow file, then `src/shell.html`) took 7m18s and 7m8s: 31 s of fixed setup, then about 6m40 for all 186 checks. `tools/touched.mjs` mapped both to "every group" on the first try.
- **The measurement is the lesson:**
  - Caching `~/.cache/ms-playwright` saved a few seconds on `checks.yml` (32 s → 29 s setup) and nothing measurable on `balance.yml` (28 s → 32 s, noise). The browser download was already fast; `install-deps`'s `apt-get` of system libraries, which the cache doesn't touch, takes most of the 20–30 s either way. Kept (never slower, one less network dependency).
  - On a touched-only draft run, `sim`, `graph` and `brief` together take 4–5 s, so the fixed setup dominates (the opposite of a full run, where 31 s is a rounding error). A bigger win would cache the `apt` packages.
  - Measure "before" from `main`'s own recent PRs, not only this PR's runs: the difference in #46 was mostly run-to-run noise.
- **Lessons:**
  - Two of #79's pushes got no Checks run at all while a manual `workflow_dispatch` on the same commit started within seconds: GitHub runs no `pull_request` workflow while `mergeable_state` is `dirty`. → In the `steward` playbook, and the cause was fixed by #94 (one file per entry, Catch up).
  - A structural docs PR landing under an old-shaped PR (#94 under #79) costs one adaptation pass, not just a conflict to resolve.
  - With many sessions merging into `main` at once, a squash-merge can fail with a conflict moments after the branch looked mergeable (#46).
