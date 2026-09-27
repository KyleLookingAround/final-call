# #43 Description check · 27 Sep 2026

- **Numbers:** session `session_01AoXGiU2yJ1jzRSxvJm7cpK`, estimate $4: `usage.cost_usd` and context still read 0 at merge, as in #28's entry below. No game code, so no bot run.
- **Went well:** `.githooks/commit-msg`'s own patterns carried straight over to `actions/github-script`, and `parts.yml` was a ready template for a checkout-free job. The very first proof run needed no staging: the PR opened with a real tool footer (the bug this brief was written for), and the new check caught it and named the line unprompted.
- **Lessons:**
  - Three PRs (#38, #39, #41) had opened with a tool footer before anyone checked for it on the PR itself, only on commits. → The Description check now catches it at `opened`, `edited`, `reopened` and `synchronize`, so editing the description re-runs it without a push.
  - Listing workflow runs by file name, filtered, kept showing only the first two runs for several minutes after later edits and a push — long enough to look like `edited` had stopped firing. The PR's own check runs (`pull_request_read` → `get_check_runs`) showed the true, current state throughout. → Read a PR's live checks from the PR itself, not a separate runs listing, when timing matters.
  - `main` moved three times (#40, #41, #42) while this branch was open, all but one touching this file. → Fetch and merge `main` again right before opening a PR that's been sitting on a branch a while, not only right after branching.
