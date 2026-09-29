Theme: coordinator
# One session for four PRs: #28 sound, #30 level-up card, #32 knowledge graph, #33 level-up redesign · 27 Sep 2026

- **Numbers:** one session built all four from 06:11 to about 07:20: $16.60, 417k of 1M context, and 45.8M tokens read back from the cache (the whole history, re-read turn after turn). #28 opened 06:33, merged 06:44; #30 merged about 06:58; #32 merged 07:07; #33 opened 07:07, merged 07:15. Every PR was green first time, except #33's stray-file push. Its cost and context read 0 until late in the session.
- **Went well:**
  - #28's level-up screen was built while its CI ran, on a branch from the unmerged one, then moved onto `main` with `git rebase --onto` once #28 was squash-merged. Nothing waited.
  - #30 took the unlocks from the data the game already gates on (`STAND[i].lvl`, `capAt`, `TECH` tiers, `itemName`), so the card and the game can't disagree and the check asserts against the same tables.
  - #32's first run found nine `docs/SYSTEMS.md` sections that named no files; a query answers in 200–800 bytes against 41 KB of notes.
  - #33's screenshots at five sizes, plus one scrolled to the chips, caught an overflowing footer button at 320 px and a cramped landscape header before opening.
- **Lessons:**
  - The knowledge graph shared no code with the game work but was built in the same conversation, which re-read Sound's and the level-up's history on every turn and CI wake. → One PR-sized item per session; the session that merges an item starts a fresh one for the next (`feature` playbook). Sound and the level-up card together were fine: they shared code, and the second was built while the first's CI ran.
  - The graph branch's build left `docs/graph.json` in the checkout; switching to a branch that didn't ignore it yet and staging `docs` whole committed it. Caught by reading the PR's file list. → `git status`, and stage paths by name, in a long-lived checkout (`feature` playbook).
  - `get_session`'s context and cost read 0 for most of the session, then filled in. → Read them at the end of a piece of work (`feature` playbook, "The cost budget").
  - #28: the bot's `STATE` changed for a change that doesn't touch play, because a release adds setting defaults and bumps `G.seen`. → The bot prints `PLAY`, the fingerprint without `G.set` and `G.seen`; a UI-only change must leave it identical (`docs/SYSTEMS.md`, `feature` playbook). #30 then proved play unchanged with one `PLAY` comparison instead of a hand diff.
  - #28: the spoken-call check first counted calls over a simulated day and passed or failed by luck, since final calls are rare. → Rate limits are checked with a scripted sequence of calls at chosen times (`tools/checks/sound.mjs`).
  - #30: titles built with `aL()` carry HTML, and one went in through `textContent`; the check caught the raw `<b>`. #33: screenshots taken with the frame loop stopped don't always show a scroll made just before them. → Wait a moment after scrolling, as the `build/` scripts do.
