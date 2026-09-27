# Start here

Setup takes about five minutes, and after that every push to `main` publishes the game.

## 1. Put these files in your repo

Unzip the pack and copy **the contents of the `final-call` folder**, hidden files included (`.github`, `.claude`, `.githooks`, `.gitignore`), into the root of your GitHub repo.

You can do this either way:

- **On your computer:** unzip, copy, then:
  ```
  git add -A
  git commit -m "Add Final Call"
  git push
  ```
- **In a Claude Code session on the repo:** attach the zip and send the first prompt below. The session unpacks it, commits and pushes.

Your default branch needs to be called `main`. If it's `master`, change `branches: [main]` in `.github/workflows/pages.yml`.

## 2. Check GitHub Pages is set to Actions

Go to Settings › Pages › Build and deployment, and set Source to **GitHub Actions**. You said this is already on.

After the first push, open the Actions tab. When "Publish to GitHub Pages" goes green, the game is live at `https://<your-username>.github.io/<repo>/`.

## 3. Keep commits clean

Three things stop commits and PRs mentioning Claude:

- `.claude/settings.json` turns off attribution.
- `CLAUDE.md` tells every session the rule.
- `.githooks/commit-msg` strips any attribution line that slips through, and blocks the commit if the message still mentions Claude. Sessions switch the hook on automatically.

On your own computer, run this once per clone:

```
git config core.hooksPath .githooks
```

If a session can only push to its own branch, it opens a PR instead of pushing to `main`. Merge those PRs with **Squash and merge**: an ordinary merge commit would include the branch name, which may start with `claude/`. You can make squash the only option in Settings › General › Pull Requests.

## First prompt for a Claude Code session

> I've attached final-call-pack.zip. Unzip it and copy everything inside its `final-call` folder, hidden files included, into the repo root. Run `git config core.hooksPath .githooks`, then read CLAUDE.md and follow it. Run `npm run build`, then `npm install` and `npm run check`, and tell me the results. Then commit with the message "Add Final Call" and push to main (or open a PR if you can't push to main). Watch the Pages workflow until it finishes and give me the site URL.

## Prompts for later sessions

- "Read CLAUDE.md. Add … to the game. Run the checks, look at it at phone and desktop sizes, then commit and push."
- "Players say … feels too slow early on. Read CLAUDE.md, run the bot to measure it, fix it and show me before and after."

## What's in the pack

| Path | What it is |
| --- | --- |
| `src/game/*.js`, `src/shell.html` | The game's source: logic and drawing in numbered files, then CSS and HTML |
| `tools/build.mjs` | Builds `dist/index.html` (published) and `build/test.html` (for tests) |
| `tools/check.mjs`, `tools/checks/` | Checks for crashes, old saves, every screen size, phone gestures and the guided start, one group per file in `tools/checks/` |
| `tools/run-bot.mjs`, `tools/bot.js` | A bot that plays for hundreds of game hours to check balance |
| `tools/saves/` | Saves from older versions and every stage of the game, used by the checks |
| `.github/workflows/pages.yml` | Publishes to GitHub Pages on every push to `main` |
| `.github/workflows/checks.yml` | Runs the checks on pull requests |
| `CLAUDE.md` | Context and rules for Claude Code sessions |
| `docs/` | The feature plan and version history |
