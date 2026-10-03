---
type: Brief
---
# Brief: Launch-day triage

This brief is the coordinator's first message when it starts launch-day triage by hand (`coordinator` playbook, §12): a Routine can't do this, since this organisation can't attach connectors to a Routine made from a session, so it can't reach GitHub or the session tools. During launch week the coordinator starts a fresh session with this brief every two hours, on the cheaper model, until launch week is over.

## Goal and what it may touch

- Read every GitHub issue opened since this Routine's last firing (`list_triggers` for its own `last_run`, or the newest triage summary comment, gives the cut-off). The in-game "Send feedback" link (`feedbackUrl()`, `src/game/17-help-keys-speed.js`) opens a blank issue with the version, level, layout, game day and screen size already filled in the body, so most of what arrives has no title and no label yet.
- For each new issue:
  1. Read its body for the version, level, layout and day. Where a `tools/saves/` fixture matches that version and level (`v<version>-L<n>.json`), load it and try to reproduce what's described; note in a reply whether it reproduced, and how.
  2. Label it `bug`, `balance`, `idea` or `question` (create the label first if the repo doesn't have it yet).
  3. For a `bug` that is small and clear (a local fix, not a rule or baseline change): open one fix PR per issue, branch `feature/triage-<short-name>` from `main`, following the `feature` and `steward` playbooks; squash-merge it once Checks and Description are green.
  4. For anything else (balance, an idea, a question, or a bug that isn't small and clear) — label it and leave it; do not open a PR.
- Write one comment (updated in place, marker `<!-- launch-day-triage -->`) on a single "Launch-day triage" issue (create it, labelled `launch-day-triage`, if it doesn't exist): what came in since the last firing, what was fixed (with PR links), and what needs the owner's judgement.
- Files it may touch: only inside a fix PR's own small change, per the `feature` playbook's usual scope for a bug fix. This Routine itself opens no PR and touches no file when there's nothing to fix.

## Read first

- The project notes, then `node tools/graph.mjs brief`, and only the files it lists.
- `docs/briefs/lessons-tidy.md` and `docs/briefs/watchdog.md` for the shape of a Routine's own brief-as-prompt.
- `.claude/skills/feature/SKILL.md` and `.claude/skills/steward/SKILL.md` for building and merging a fix PR.
- The issue templates (`.github/ISSUE_TEMPLATE/bug.yml`, `balance.yml`, `feature.yml`) for the labels already in use.

## Speed budget

None: fix PRs are small, local bug fixes; nothing here is a speed-sensitive system.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

The session, with Squash and merge once Checks and Description are green on each fix PR it opens, per the `steward` playbook. It never merges anything that changes a rule or a balance baseline; those are labelled and summarised for the owner instead.

## What's left for others

- Don't touch the feature PRs, the release in progress, or another session's branch; this Routine's business is new issues only.
- A bug that isn't small and clear, a balance report, or an idea is left labelled for the owner or a later session, not built here.
- The coordinator creates this Routine (from this committed brief) and retires it after launch week.

## When to stop and ask

- Never ask, and never open a `needs-owner` issue: this Routine fires every two hours regardless, so a question just waits for the next firing or the owner's own reading of the triage issue.
- **Stop line:** never open a fix PR for anything that changes a game rule or a balance baseline. Label it (`balance` or `bug`) and describe it in the triage summary instead.
- Where it's merely unclear whether a bug fix is small enough to just fix, take the safer option (label it and leave it for a person to judge) rather than push a guess.

## Cost budget

- Estimate: about $3 a firing when new issues came in (reading them, reproducing against a save, one or two small fix PRs); under $0.50 when there are none.
- At each stopping point (a PR opened, CI back, the triage comment posted), read `get_session`: `usage.cost_usd` against the estimate (a 0 means not yet known, not free), and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, end the turn; the next firing tries again.
- Past twice the estimate in one firing, stop opening further fix PRs, finish the triage summary, and say why in it.
