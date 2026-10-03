---
type: Lesson
theme: ui
---
# What's new, easier to read and act on · 28 Sep 2026

- **Numbers:** estimate $10; about $4.40 by the time the build, reveal and review fixes were in. The spec and draft PR went up within about five minutes, and the owner approved it while the build ran.
- **A change mid-build:** half an hour in, the owner asked that locked points be revealable ("N more for later levels · Show"), not just hidden. Because hiding was one filter (`newsPts`) and each version drew through one function (`newsRow`), the reveal was a re-render of one version in place and cost one small commit; the spec, notes and check moved with it.
- **The review caught lost facts:** rewording twenty entries into a lead and one sentence dropped two facts (the one-row phone top bar in version 33, the advisor spotting a full café in version 28) and skewed one (Send feedback). The new check can hold the shape (lead length, one sentence, real targets and levels) but not the meaning: a rewrite of released text needs a side-by-side read against the old text, which the fresh review did.
- **The local full run crashed its browser** partway through (at `network`, before any group this PR touches), and every later group then failed with "browser has been closed". Running the rest one group at a time passed; the full run in CI is the judge.
- **Left for the release playbook** (→ done in the lessons tidy): the `release` playbook said to fold fragments as plain points; it now says to copy each `- **Lead.** Sentence. (go: … · level: …)` line into `{b, t, go, lv}`. `src/updates.d/README.md` holds the style and the `news-card` check fails a release that pastes plain strings.
- **Went well:** reusing the level-up card's `lvlGo` for most "Show me" targets kept the new code to one validator (`newsOk`) and one dispatcher, and the check taps every real button rather than calling the function.
- **It stopped the publish:** the Pages workflow's `npm run check` had been taking about 14 minutes against a 15-minute `timeout-minutes`, and the new `news-card` group (ten page loads, about 30 s locally) pushed the first publish after the merge over the limit, so it was cancelled and nothing deployed. The PR's own Checks run took 12 minutes on a faster runner, so it didn't show. → The group now opens one page per size (17 s), and the publish was re-run. The wider problem was the budget: both `checks.yml` and `pages.yml` sat at 15 minutes with under a minute of headroom. #134 raised both to 25 minutes; a new group still says its run time in its PR.
