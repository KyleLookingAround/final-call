Theme: parts

# The coordinator's look back: two floors to release 35 · 29 Sep 2026

- **Numbers:** one coordinator (03:15–10:00 UTC, $12.48 of a $12 estimate, 457k of context) ran ten sessions: F1 $12.87/$15, B1 $12.57/$15, the terminal pass $11.87/$18, the lessons tidy $5.69/$6, P3 $5.39/$12, loose ends $4.65/$6, docs $2.95/$8, P4 $2.70/$10, release 35 $2.21/$10. About $73 in all, from two floors merged (#162) to release 35 live (#175) in six and a half hours. The five-hour usage limit stopped one session once (B1, 05:14; woken at 05:23 after the reset).
- **Went well:**
  - **Batches that share no file ran side by side.** The release audit gave each batch its own files, so six sessions built at once and only one PR (#171) hit a merge conflict, from a playbook two PRs both touched.
  - **One check-in and an hourly heartbeat were enough.** The heartbeat ended its turn at once whenever a check-in was booked, so it cost almost nothing and was only there for a stall.
  - **Starting the release early with a "no merge before 09:30" line** let it fold, record fixtures and run the full check before the one-release-a-day window opened, and it merged two minutes after.
  - **Reading each PR's description before it merged** caught what the summaries didn't: F1's diagnosis of seed 1's stall (the bot's fare rule), and the terminal pass's camera fix handed to a batch that had already merged.
- **Lessons:**
  - **Work handed between batches falls through when the receiver has already merged.** P4 left three panel notes in other batches' files, and the terminal pass handed a camera fix to P3 twenty minutes after P3 merged. Plan a small "loose ends" batch (the cheaper model, about $5) at the end of every wave, and have each batch list what it hands on in its PR under one heading, so the coordinator can collect it.
  - **The cheaper model came in well under its estimates on well-scoped briefs** (release 35 at 22%, docs at 37%, P4 at 27%), and the default model came in near its estimates. The old "2–3× over for the cheaper model" didn't hold today. Estimate from the brief's size, not the model.
  - **Four default-model sessions plus three cheaper ones hit the five-hour limit in under two hours.** Keep at most three default-model sessions at once.
  - **A session that opens its PR before the PR it depends on merges leaves a follow-up.** The docs session opened #174 while B1 (#171) was still changing the same lines, and needed a second message. When a brief says "wait for #N", the coordinator should message the session the moment #N merges.
  - **A brief that doesn't settle a question gets asked it.** P3 stopped to ask whether to run the bot on a UI-only change. Say in each brief that a change meant to leave play alone proves it with the Balance workflow's tables, not local bot runs.
  - **Release sessions title the What's new card after the process** ("The public release"). The card is for players: a release brief should say its title names what's new in the game.
  - **A session's own summary can mislead.** P4's said "PLAY diff deferred". Its checks and Balance run were green, and nothing was deferred. Read the PR and its checks, not the summary line.
  - **The README's Play link was a placeholder (`https://<owner>.github.io/<repo>/`) until the owner spotted it on release day.** A `rules` check that the README has no `<owner>` or `<repo>` placeholders would have caught it.
  - **The newest save fixtures were three versions old** (v32 at release 35), because releases 33 and 34 added no saved fields. A release brief should name the newest fixtures' version, not assume the last release's.
