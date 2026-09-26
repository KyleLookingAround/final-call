# Roadmap

What's being worked on, what's next, and ideas not yet agreed. Anything here gets an issue before work starts; features also get a spec (`docs/specs/TEMPLATE.md`). The owner decides what moves up.

## Now

Nothing in progress. Pick from Next, or open an issue.

## Next

- **Weekly health check.** A scheduled run of the checks and the bot on `main`, opening an issue when something drifts.
- **Feedback from players.** A "Send feedback" link in Help that opens a prefilled issue. No tracking.

## Ideas (not agreed)

- **Speed on older phones.** A check that fails if a level 9 airport draws too slowly on a throttled phone profile.
- **Page size budget.** A check on the size of `dist/index.html`, which grows with every feature.
- **Accessibility.** Route and line colours that work for colour-blind players, and a larger-text option.

## Done

- **Ways of working.** Issue, PR and spec templates, decision records (`docs/decisions/`), and playbooks for features, balance, releases and PRs.
- **Repeatable tests.** Seeded randomness, rule checks, version 21 save fixtures, the bot against baselines on three seeds, screenshots on every PR.
- **Foundations.** The game source in numbered files, pinned tools, start-up installs for web sessions.
- **Version 21 and earlier.** The five features of version 20 and the mobile fixes of version 21: see `docs/PLAN.md` and `docs/HISTORY.md`.
