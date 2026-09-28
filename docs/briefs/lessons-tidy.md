# Brief: Tidy the lessons

This brief is the coordinator's first message when it starts the tidy (`coordinator` playbook, §10): a Routine can't do this, since this organisation can't attach connectors to a Routine made from a session, so it can't reach GitHub or the repo. The coordinator starts a session with this brief when a look back leaves 8 or more lessons new since the last tidy (the `steward` playbook); nobody runs it on a schedule.

## Goal and what it may touch

- Read every lesson in `docs/lessons/` and open one PR that leaves fewer, clearer lessons, grouped by theme, with anything learnt three times turned into a change. The repo is `kylelookingaround/final-call`: if it isn't checked out, clone it. Branch `feature/lessons-tidy-<date>` from `main`, one PR. If a `feature/lessons-tidy-*` PR is already open, stop: the last tidy hasn't finished.
- In that PR:
  - **Merge** lessons that say the same thing into one file, keeping each source's PR number in its title or Numbers line; name the merged file after the newest source PR.
  - **Group** every remaining lesson under a theme: a first line `Theme: <theme>` in its file. Use short lower-case themes, reusing the ones already there before adding one (for example merge-chasing, checks, cost, tools, saves, specs, drawing, balance, parts). `docs/LESSONS.md` groups its index by them.
  - **Delete** lessons that are out of date (the tool, file or rule they describe is gone) or already written into a playbook, the project notes or a check. Name in the PR description, for each, where it now lives or why it's gone.
  - **Act** on a lesson seen three or more times without a →: propose the playbook or check change in this PR (and mark the lesson →), or, if it's a rule change the owner should decide, open an issue labelled `needs-owner` with the default you'd take, and link it.
  - **Record the tidy**: rewrite `docs/lessons/.last-tidy` to list every lesson file left, one per line, sorted; and add this tidy's own look back as `docs/lessons/<pr>-lessons-tidy.md` (Theme: tidy) with the lesson files before and after, how many were new, and how long since the last tidy. List it in `.last-tidy` too.
- Files it may touch: `docs/lessons/`, `.claude/skills/` (the playbook changes it proposes), `tools/checks/` (a check it proposes), and the roadmap item files in `docs/roadmap.d/` it affects. Nothing in `src/`, and no other file. `npm run build` rejoins `docs/LESSONS.md`; never edit between its markers by hand.

## Read first

- The project notes, then `node tools/graph.mjs graph` and `node tools/join.mjs` (it counts the new lessons), and only the files those list.
- `docs/LESSONS.md` for the shape of a lesson, every file in `docs/lessons/`, and the playbooks in `.claude/skills/` to see what's already written in.
- `docs/decisions/ADR-2026-09-27-fewer-clashes.md` for why lessons are one file each.

## Speed budget

None: no game code.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com> (the session-start hook sets it; check `git config user.email`).

## Who merges and when

The session, with Squash and merge once checks are green, then confirms the Pages publish. It changes nothing in the game, so the Balance workflow doesn't run and `PLAY` can't move.

## What's left for others

- Don't touch the game, the roadmap's order or the ideas, and don't start other sessions.
- A lesson that needs a bigger change than a playbook line or a check goes in a `needs-owner` issue, not this PR.

## When to stop and ask

- Only for something irreversible or outside this brief.
- Otherwise, if it truly needs the owner: open an issue labelled `needs-owner` with the question and the option it will take by default, carry on with other work, look at the issue at each stopping point, and take the default after 12 hours with no answer. Say so in the PR.
- Where it's merely unclear, take the safer option (easier to undo, or changing the game less) and say so in the PR: keep a lesson rather than delete it when unsure.

## Cost budget

- Estimate: about $6 (reading every lesson and the playbooks, one docs-only PR, one CI round).
- At each stopping point (a PR opened, CI back, a merge), read `get_session`: `usage.cost_usd` against the estimate (a 0 means not yet known, not free), and `rate_limit_info`. If status is "rejected" or `isUsingOverage` is true, schedule a `send_later` for a minute after `resetsAt` and end the turn.
- Past twice the estimate: say why in the PR and in its lesson, and trim or split what's left.
