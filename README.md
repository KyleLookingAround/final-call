# Final Call

An airport management game that runs in the browser, on phones, tablets and desktops. You start with one gate and one small plane and grow into the Airport of the Year. Along the way you run queues, boarding and turnarounds, a network of routes, the region's transport and a rival airport at Lowmere.

**Play:** `https://<owner>.github.io/<repo>/`. It publishes from `main` through GitHub Actions.

## Develop

```
npm run build          # dist/index.html, the whole game in one page (no dependencies needed)
npm install            # Playwright, used for the checks
npm run check          # crash, save, layout, touch and guided-start checks (about 1–2 min)
npm run bot -- 1150    # bot plays 1,150 game hours and reports when each level was reached
```

Open `dist/index.html` in a browser to play the local build. Progress saves in the browser. On claude.ai the game also saves to your account, but the GitHub Pages copy saves on the device only.

The source is `src/game/*.js` (logic and drawing, in numbered files joined in order) and `src/shell.html` (CSS and HTML). See `CLAUDE.md` for how the code fits together and `docs/` for plans and history.
