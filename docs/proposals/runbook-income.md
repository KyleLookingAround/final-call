# Something new that earns, built with the runbook

Brief: `docs/briefs/runbook-income.md` · Status: Proposed, waiting for the owner's choice · PR: #136

The runbook is the way this repo runs sessions: project notes, playbooks, checked briefs, check groups that fail on purpose, a coordinator, one file per lesson, cost budgets. The owner asked what else it could build that earns an income quickly with little input from them. The honest answer first: nothing below earns a real income quickly. What the runbook can do is get a small thing listed for sale within a week at a cost of a few dollars, with the owner's part kept to accounts, one post and a monthly look. The takings then depend on whether anyone finds it, which no runbook automates.

## What is ruled out, and why

- **Anything ad-funded** (Poki, CrazyGames, Kongregate, content sites with ads): the owner's rule, and the runbook has no way to bring traffic without posting, which is the owner's job.
- **Spam, scraping, fake reviews, sock-puppet posts, cold outreach at volume**: Anthropic's Usage Policy (15 Sep 2025) forbids facilitating spam, unauthorised scraping and presenting model output as a person's own to deceive. They also don't work.
- **Impersonation or implied endorsement**: no product named as if Anthropic made or approved it; the tool is named descriptively ("works with Claude Code"), no logos.
- **Reselling access**: the Consumer Terms (8 Oct 2025) forbid reselling the service or making the account available to anyone else, and Claude Code's legal page says nobody may pay for, resell or intermediate Claude usage on end users' behalf; a hosted service where customers' work runs through the owner's Max plan is out. A consultant using their own subscription to make a deliverable is ordinary use; running the runbook continuously on customers' repos as a service is not, unless it runs on the API under the Commercial Terms or on the customer's own subscription.
- **Bounty platforms** (Algora and the like): their terms forbid robotic access, and many projects ban or restrict generated contributions, so the "automated" form is out; the owner submitting under their own name with disclosure is allowed but isn't "little input".
- **Marketplaces for skills and connectors**: Anthropic's Claude Marketplace (23 Sep 2026) lists connectors, plugins and service partners, but no confirmed way for an individual to be paid for a skill or plugin exists yet. Watch it; don't build for it.

## The options

Costs in Claude usage come from this repo's own lessons (`docs/LESSONS.md`): most docs-only or small PRs run $2–5 (an audit that reads the whole game, $15–17), a feature PR $5–20 with a median near $5, a session that fought a busy `main` $20–40, and the coordinator of 27 Sep cost $176 over 25 hours. Fees and takings come from the sources in the game's income spec on its own branch (`feature/income-spec`, `docs/specs/income.md`) and the research for this proposal; where a figure is practitioners' consensus rather than measured, it says so.

### A. The runbook as a guide, sold on the Ko-fi shop (and Gumroad)

- **What.** A guide, "Running a software project with coding-agent sessions", built from the runbook pack (`npm run pack`, `docs/briefs/runbook-pack.md`): the method in about forty pages, the playbooks and templates as files, and what nobody else has: the measured account of over a hundred PRs in three days (26–28 Sep, numbered past #130) with what each cost, what went wrong (the overnight stall, the merge-chase, the phantom arrows) and what changed because of it. Sold as a zip and PDF at £15–19.
- **Who pays and why.** Solo developers and small teams adopting Claude Code who want a working setup with numbers, not a prompt list. Comparable Gumroad listings sit at $15–30 ("Claude Code Workflow Pack", "CLAUDE.md Starter Pack", a $19 migration playbook); none publishes sales, and the free competition is strong (awesome-claude-code, Anthropic's own docs). The measured lessons are the only part a free repo can't copy.
- **How the runbook builds and runs it.** A new repo (`runbook-guide`) with the project notes and first brief in the appendices. Session 1 builds the guide's source from the pack and a build script that makes the zip, the HTML and a PDF (Chromium is already in the sessions' containers). Session 2 writes a checks script (links resolve, every chapter has its numbers, the pack's files are all present, no attribution lines). Session 3 makes a one-page site on GitHub Pages with a Buy button that links to the shop. Upkeep: one session a month, from a brief, when the tools change.
- **By hand.** A shop item on Ko-fi (the account exists; 5% on shop sales, none on tips) and optionally Gumroad (10% + 50¢, handles VAT as merchant of record since Jan 2025; identity check and a W-8BEN for a UK seller). One post somewhere the owner already is. Tax: trading income under the £1,000 allowance until it isn't.
- **Time to first sale.** Listed in a week. A first sale depends entirely on the post; a week to never.
- **Realistic takings.** Unknown and unverified for any comparable product. A working assumption: £0–150 in the first month, then a few sales a month if the post lands and the guide is kept current; a guide about a fast-moving tool decays within months.
- **Running cost.** About $40–60 to build (three or four PRs), then $5–10 a month.
- **Risks.** Free competition; decay; naming (descriptive only, no implied endorsement); the guide leaks nothing private (the pack already excludes the game), but the lessons name session ids and costs, which is the point.

### B. Another small game or tool built the Final Call way, with a supporter pack

- **What.** A second one-page game (or a one-page tool) built with the same loop, listed on itch.io as pay-what-you-want and on its own Pages site, with a cosmetic supporter pack unlocked by a signed code checked in the page (the design in `docs/specs/income.md`).
- **Who pays and why.** One to three players in a hundred tip or buy a one-off unlock in a free game: practitioners' consensus on itch.io's forums and guides (for example https://generalistprogrammer.com/tutorials/how-to-make-money-on-itchio-indie-game-guide), not a measured figure. itch.io brings browsing players; a Pages site brings none.
- **How the runbook builds and runs it.** This is what the runbook is proven at: a new repo from the pack's "Adapting" section, a first spec, a coordinator running parts. itch.io's `butler` tool pushes builds from a workflow, so publishing is automatic once the owner has made the page.
- **By hand.** An itch.io account, its identity and tax form, the game page and its generated-content tags (itch.io's rule since Nov 2024 covers code, art, text and sound). Then nothing but reading the counter.
- **Time to first sale.** Weeks to build something worth paying for, then discovery: months.
- **Realistic takings.** Small creators who publish their itch.io figures report a few hundred to about $3,000 a year across several games (https://www.nathalielawhead.com/candybox/my-gross-revenue-on-itch-io-transparently-sharing-all-my-stats-earnings-and-speaking-on-how-supportive-of-a-base-itch-io-has); the 2025 Steam median is $249, with two thirds of releases under $1,000 (Gamalytic, https://gamedevreports.substack.com/p/gamalytic-67-of-games-on-steam-earned). A thousand players a month at £4 a pack is £35–110 a month. Final Call itself, launched today, is the better bet for this: it already exists.
- **Running cost.** $100–250 to build (Final Call's features cost $5–40 each and a small game is ten to twenty of them), $5–10 a month after.
- **Risks.** Discovery; a second game splits the owner's attention from the first; income lags by months.

### C. A fixed-price "runbook onboarding" for other people's repos

- **What.** For a fixed price (£150–300), a PR to the customer's repo that sets up the five things the pack's README names first: project notes, a brief template with its validator, a checks script, a commit-msg hook and a PR template, plus a first brief written for their next feature. Delivered in a day.
- **Who pays and why.** Small teams starting with Claude Code who'd rather buy a day than spend a week. Fiverr already lists "Claude Code setup" gigs from $15 (https://www.fiverr.com/gigs/claude-code) and Upwork lists specialists in project notes, skills and hooks (https://www.upwork.com/hire/claude-specialists/); nobody publishes what they earn from them. The low end is very low, so the price rests on the method's record, and the £150–300 is a guess at what a day's deliverable with a record is worth, not a sourced figure.
- **How the runbook builds and runs it.** The onboarding itself is a brief: the owner's session (their own subscription, one customer at a time) reads the customer's repo and opens the PR. A "customer kit" repo holds the template files and the brief that makes the PR.
- **By hand.** Finding customers: a listing (Fiverr or Upwork, both allow generated work with disclosure and refinement; both need identity checks) or posts; a call with each customer; access to their repo (the GitHub app installed by them); invoices; support after. This is the most owner input of any option.
- **Time to first sale.** Days after a listing if anyone bites; weeks in practice.
- **Realistic takings.** £150–300 per customer, one or two a month at best in the first months: the largest per-sale figure here, and the least automatic.
- **Running cost.** $20–40 per customer.
- **Risks.** The terms line above: fine as a consultant's deliverable, not as a running service on the owner's plan; a customer's repo may be unlike this one; liability for a PR in someone else's code; support eats the margin.

### D. The game itself (already in hand)

Not a new build: the supporter pack, tips and an itch.io listing for Final Call are specced on `feature/income-spec` (`docs/specs/income.md`). It costs three PRs, needs no new repo, and its takings scale with the players the launch brings. Whatever else the owner picks, this comes first in effort per pound.

## Recommendation

**Option A, the guide, this week; D alongside it; B only after A has sold anything; C only if guide buyers ask for it.**

Why A: it's the one thing here the owner can list in a week at a few dollars' cost with the pack already built, it needs nothing from them but a shop item and one post, and its unique part (measured lessons with costs) is what the free alternatives lack. Its takings will be small and may be nothing; it says so on the tin, and it's the cheapest way to find out whether anyone pays for the runbook before building a service on it.

### The first week

| Day | The owner | The sessions |
| --- | --- | --- |
| 1 | Creates the empty public repo `runbook-guide` and adds it to the sessions' environment; approves the appendices | Session 1 from Appendix B: the repo's notes, the pack copied in, the guide's outline and first two chapters, the build script |
| 2–3 | Nothing | Session 1 finishes the chapters; session 2 writes the checks and the PDF build; each merges its own PR |
| 4 | Reads the PDF once (an hour) and says what to cut | Session 3: the fixes, the one-page site on Pages with the Buy button, the release zip |
| 5 | Makes the Ko-fi shop item with the zip attached at £15; posts it once | Session 3 writes the look back and the upkeep brief |
| 6–7 | Nothing | Nothing; the upkeep Routine is monthly |

Cost of the week: about $50. The owner's time: about three hours, most of it reading.

## Choices

Each with the default this proposal takes, so one reply settles them.

1. **Which option.** Default: A now, D alongside, B and C later or never.
2. **Price of the guide.** Default: £15 on Ko-fi, the same on Gumroad. Alternatives: £9 (impulse), £19–29 (with the lessons sold as the premium part).
3. **Where it's sold.** Default: Ko-fi shop (exists, 5%), plus Gumroad for VAT handling and search. Alternative: Ko-fi only.
4. **Name of the guide.** Default: "Running a software project with coding-agent sessions: a runbook". Names the tool descriptively inside, never in the title.
5. **What's in it.** Default: the method, the pack's files, and the measured lessons with costs and session ids as they are. Alternative: lessons with the session ids removed.
6. **The new repo's name and visibility.** Default: `runbook-guide`, public (Pages needs it and the pack is public already).
7. **Upkeep.** Default: a monthly Routine that starts a fresh session from the upkeep brief on the cheaper model, and nothing between.

## Appendix A: project notes for `runbook-guide`

Save as the new repo's project notes file (`CLAUDE.md`).

```
# Runbook guide

This repo builds a guide to the runbook: the way the Final Call repo runs coding-agent sessions (project notes, playbooks, checked briefs, checks that fail on purpose, a coordinator, one file per lesson, cost budgets). It sells as a zip and a PDF on the owner's Ko-fi shop. Nothing here is a game.

- `pack/` is the runbook pack as `npm run pack` in the Final Call repo makes it; refresh it from there (`add_repo` KyleLookingAround/final-call for reading, run `npm run pack` in that clone, unzip over `pack/`), never edit it here.
- `.githooks/commit-msg` and `.github/workflows/description.yml` are the pack's copies, unchanged, and `.claude/settings.json` sets the hooks path: they keep attribution out of commits and PR text, as in the Final Call repo.
- `guide/` is the guide's source, one Markdown file per chapter, numbered. `tools/build.mjs` joins them into `build/guide.html`, prints `build/guide.pdf` with Chromium, and zips both with `pack/` into `build/runbook-guide.zip`. `build/` is git-ignored.
- `site/index.html` is the one-page site GitHub Pages serves: what the guide is, what's in it, and a Buy button that links to the shop. No scripts, no tracking.
- `npm run check` runs `tools/check.mjs`: every link in the guide and the site resolves; every chapter has a number in it (a cost, a count or a time) or says why not; the pack has every file its README lists; nothing mentions an assistant by way of attribution.

## Commits and PRs

- Every commit is authored KyleLookingAround <KyleMck10@hotmail.com>.
- Commit messages and PR text are a short imperative subject in plain words. No attribution lines, no session links; the hook and the Description check reject them.
- One change per branch (`feature/<short-name>` from `main`), a PR from the template, squash-merged by the session once checks are green. The session confirms the Pages publish.

## How we work

Every session starts from a brief in `docs/briefs/` (the template is the pack's, with `node tools/brief.mjs`; its "read first" names a file here, since there is no graph). A merged PR gets a look back in `docs/lessons/`, one file each. Decisions that set a rule go in `docs/decisions/`.

## Rules

- The guide names the tool descriptively ("Claude Code") and never suggests its maker made or approved the guide. No logos.
- Numbers in the guide come from the pack's lessons, quoted with the lesson's file name, never rounded up.
- UK English, concise, no hype. Say what didn't work as plainly as what did.
- Nothing from the game's source, and nothing private: the pack already leaves both out.
- Never sign up for anything, spend money, create a repository or publish a listing: those are the owner's.
```

## Appendix B: the first brief

Save as `docs/briefs/guide-first-draft.md` in the new repo and give it to the first session as its first message.

```
# Brief: The guide's first draft and build

## Goal and what it may touch

- Deliver the guide's source and its build: `guide/01-what-the-runbook-is.md` to `guide/08-adapting-it.md`, `tools/build.mjs`, `package.json`, `pack/` made from the Final Call repo's `npm run pack` (the project notes say how), the hook, the Description workflow and the editor settings copied from the pack, and `README.md` (two paragraphs and the file map). Branch `feature/first-draft` from `main`, one PR.
- Chapters, in order: what the runbook is (the loop from issue to lesson); the project notes; briefs and the validator; checks that fail on purpose; sessions that merge their own PRs and the steward; the coordinator, the cap on sessions and the watchdog; lessons, decisions and the tidy; adapting it to another repo (from the pack's README). Each chapter ends with "What it cost", quoting the pack's lessons by file name.
- It may touch nothing in `pack/` and nothing in `site/`.

## Read first

- The project notes, then `pack/README.md`, and the lessons in `pack/docs/lessons/` (all of them: they are the material), and the five playbooks in `pack/.claude/skills/`.

## Speed budget

None: no game code.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com>.

## Who merges and when

The session, with Squash and merge once checks are green (there is one check group until the second brief adds more). Open the PR as a draft, read its description back and strip any footer or session link, subscribe to its events, and end the turn. Nothing publishes yet: the site comes with the third brief.

## What's left for others

- The checks and the PDF (the second brief); the site, the release zip and the look back (the third brief); the shop item and the post (the owner). Don't touch the Final Call repo.

## When to stop and ask

- Only for something irreversible or outside this brief. Never sign up for anything, spend money, create a repository or publish anything.
- Otherwise put the question in the PR with the default you took; there is no needs-owner queue in this repo yet.
- Where it's merely unclear, take the safer option (less text, fewer claims) and say so in the PR.

## Cost budget

- Estimate: about $20 (eight short chapters from material that exists, one build script, one CI round). Cheaper model.
- At each stopping point read `get_session`: `usage.cost_usd` against the estimate and `rate_limit_info`; on "rejected" or overage, book a `send_later` for a minute after `resetsAt` and end the turn.
- Past twice the estimate: say why in the PR and stop at the chapters written.
```
