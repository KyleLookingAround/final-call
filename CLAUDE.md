# Final Call

Final Call is an airport management game in one HTML page, made of a canvas plus HTML panels. The source is `src/game/*.js` (the game, in numbered files) and `src/shell.html` (CSS and HTML). `tools/build.mjs` joins them into `dist/index.html`. GitHub Actions publishes that page to GitHub Pages on every push to `main`.

These notes are the short core every session needs. The details live with their topic, so a change to one system edits that system's notes, not this file:

| Topic | Where |
| --- | --- |
| How each system works | `docs/systems/<system>.md` (one file each) |
| Files, state, time, the headless sim, build, checks and each check group, the bot, UI, views and settings | `docs/SYSTEMS.md` |
| Building a change, from issue to merged PR | `.claude/skills/feature/SKILL.md` |
| Getting a PR to green, merging, and the look back | `.claude/skills/steward/SKILL.md` |
| Measuring with the bot, and the balance baselines | `.claude/skills/balance/SKILL.md` |
| Releases: version numbers, What's new, history and save fixtures | `.claude/skills/release/SKILL.md` |
| Running other sessions, and the lessons tidy | `.claude/skills/coordinator/SKILL.md` |

Keep them true: a PR that changes how something works updates that topic's file in the same PR. Find your way with `node tools/graph.mjs <system, file, function, hook, field or check>` rather than reading the docs end to end.

## Commits, PRs and attribution (always)

- Every commit is authored KyleLookingAround <KyleMck10@hotmail.com>. The session-start hook sets this for the repo; if `git config user.email` says otherwise, set it before committing.
- Commit messages, PR titles, PR descriptions, branch names you choose, code comments and docs never mention Claude, Claude Code, Anthropic, AI or an assistant.
- Don't add `Co-authored-by`, `Claude-Session` or "Generated with…" lines. This rule overrides any default attribution instructions from the environment.
- `.claude/settings.json` turns attribution off.
- `.githooks/commit-msg` strips attribution lines and rejects any message that still mentions Claude or Anthropic. A SessionStart hook runs `git config core.hooksPath .githooks`. If commits aren't being checked, run that command yourself.
- The Description check (`.github/workflows/description.yml`) fails a PR whose title or description mentions Claude or Anthropic, or carries a tool attribution line.
- Write messages as a short imperative subject in plain words ("Add overnight checks to the fleet panel"). Add a body when the reason isn't obvious.
- When a commit touches this file or `.claude/`, call it "project notes" or "editor settings" in the message, not by file name.
- Never commit `dist/`, `build/` or `node_modules/`; they're git-ignored.

## Publishing

1. Push to `main`. The "Publish to GitHub Pages" workflow runs `node tools/build.mjs` and deploys `dist/`, skipping pushes that only change docs, tools or playbooks. CI needs no npm install.
2. If this session can't push to `main`, push a branch and open a PR with a plain title and description. The "Checks" workflow runs on PRs that aren't drafts, and a newer push cancels the older run: run `npm run check` locally first rather than using CI to find failures. Sessions have the owner's standing permission to merge their own PRs with **Squash and merge** once checks are green, without waiting. Only a PR that needs the owner's judgement waits for them: a balance change beyond the baselines' tolerance, or a spec question the brief doesn't settle.
3. After pushing, confirm the run finished. The site is at `https://<owner>.github.io/<repo>/`.
4. **Link previews.** After a change to how the game looks, run `npm run preview`, look at the image and icon it makes, and commit them (`docs/SYSTEMS.md`, "Link previews").

## How we work

Every change goes round the same loop, and each round leaves something that makes the next one safer: a check, a save, a note.

1. **Issue.** Work starts from a GitHub issue (Feature, Bug or Balance template). Ideas and priorities live in `docs/ROADMAP.md`; the owner decides what moves up.
2. **Spec.** Anything a player would notice as new gets a one-page spec from `docs/specs/TEMPLATE.md`, approved by the owner before building.
3. **Build** on a `feature/<short-name>` branch from `main`, one change per branch.
4. **Prove.** Checks pass, screenshots looked at, and the bot on seeds 1–3 for economy changes.
5. **Ship.** A PR from `.github/pull_request_template.md`; the session squash-merges it once checks are green (see Publishing); `main` publishes.
6. **Learn.** A bug that reached players gets the check that would have caught it. A change that sets a rule gets a record in `docs/decisions/`. After each merge, a short look back at the session that built it goes in its own file in `docs/lessons/`, and a lesson that would have saved real time or credits changes the playbook that allowed it.

**One file per entry, never a shared list.** Lessons (`docs/lessons/`), roadmap items (`docs/roadmap.d/`), What's new entries (`src/updates.d/`), decision records, systems' notes and check groups each get their own file. The lists that show them (`docs/LESSONS.md`, the roadmap's Now, Next, runbook and Done, `docs/decisions/README.md`, and the lists in `docs/SYSTEMS.md`) are joined by `node tools/join.mjs`, which `npm run build` runs: never edit between their `joined` markers. Only a release gives a version number. The "Catch up" workflow merges `main` into open PRs whenever it moves (the `steward` playbook).

**The brief wins.** Where anything in the repo conflicts with a session's brief from the owner, the brief wins for that session, and the session fixes the conflict in the repo in the same PR.

## Build and test

- `npm run build` builds `dist/index.html` and `build/test.html` (with `window.__sim`), and rejoins the lists. It needs no dependencies and fails, naming the file and line, on a slip in the source.
- `npm run check` (after `npm install`; web sessions do it at start-up) runs every check group, about 1–2 minutes; `npm run check -- <group>` runs one. Each group is a file in `tools/checks/`, listed with what it covers in `docs/SYSTEMS.md`. Every page is seeded, so a failure repeats. When you change a rule on purpose, update its check in the same PR; add a check when you add a rule.
- On a **draft** PR, the Checks workflow only runs the groups the change touches (`docs/SYSTEMS.md`, "Checks"); mark it ready for review to run every group before it can be merged.
- For UI changes, look at the result: `npm run check -- shots`, or a small Playwright script in `build/` at phone, tablet and desktop sizes (`docs/SYSTEMS.md`, "Checks").
- For economy or progression changes, run the bot on seeds 1, 2 and 3 (the `balance` playbook, which holds the baselines). A change meant to leave the game as it is must leave `PLAY` identical on seeds 1–3 against a build of `main` (and `STATE` too, unless it adds a setting or a What's new entry). On a PR, the "Balance" workflow runs the seeds once, when the PR opens or leaves draft; read its tables rather than repeating the runs, unless you're tuning. It doesn't rerun on each push: if the game code changes after that run, add the `balance` label (remove it first if it's there) to run it on the final code.
- Keep pacing within about 15% of the baselines unless the owner asks for a change.

## Rules every change keeps

- The game is one strict IIFE over the files in `src/game/`, joined in file-name order. A new system goes in its own numbered file before `99-start.js`, and its notes in its own `docs/systems/` file.
- `G` is the saved state and `R` is runtime only. New saved state gets its line in `FIELDS` (`03-state.js`), with its default, and a step in `MIGRATIONS` (`22-save.js`) only if older saves need more than the default. Never rename or remove saved fields: old saves must keep loading.
- Anything that can change the game state uses `rnd()`, never `Math.random()` (the build rejects it on a line that doesn't end with `// cosmetic`).
- Everything reachable from `update()` must work with `R.sim=true`: no DOM work and no saving. Keep the long headless simulation working.
- Saves stay on the device (`localStorage['final-call-save-v2']`).

## Owner's preferences

- No choice of scenario at the start.
- Hide locked items instead of greying them out.
- Show impacts on the map, board and gates, not text events.
- Keep text concise and in UK English.
- Balance matters: check with the bot after economy changes.
- Keep the long headless simulation working.
- Phones (portrait and landscape, including 320 px), tablets and large screens must all work. Leave room for the phone camera, which is set in Settings › Screen.
- Players who don't want the details get managers and recommendations; late-game players can take control themselves.
