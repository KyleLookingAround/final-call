Theme: specs
# Income from the game, specced (#135) · 28 Sep 2026

- **Numbers:** one session for two briefs (this and #136), estimate $5 each; cost not yet reported by `get_session` when the PR opened. Two research helpers on the cheaper model did the web reading (about 100k tokens each), two review helpers the fresh review. Docs only; the `brief` and `graph` groups pass locally; no bot run.
- **Went well:** the two briefs shared their reading and their research, so one session did both for about the cost of one. The frame loop's own line (`23-boot.js`) settled the 16× question in a minute: a game hour does the same work at any speed, so the argument had to be about real minutes and phones, not the simulation.
- **Lessons:**
  - The sellers' own pages (Ko-fi, itch.io, Gumroad, Steamworks) were unreachable from the session's network, so every fee comes from secondary sources that agree with each other, and the spec says so. A brief that needs a platform's terms should say which hosts the environment allows, or accept second-hand figures.
  - The `graph` check reads any `docs/…​.md` or `…​.html` path in a spec as a repo file, including planned files and web links; planned files are named as `NN-name.js` or "`name.mjs` in `tools/`", and a web link that ends in `.html` under a `docs/` path is named in words instead. → No change: the check is right to be strict, and the workaround takes a minute.
