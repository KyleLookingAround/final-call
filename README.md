# Final Call

An airport management game that runs in the browser, on phones, tablets and desktops. You start with one gate and one small plane and grow into the Airport of the Year. Along the way you run queues, boarding and turnarounds, a network of routes, the region's transport and a rival airport at Lowmere.

**Play:** `https://<owner>.github.io/<repo>/`. It publishes from `main` through GitHub Actions.

## Develop

```
npm run build          # dist/index.html, the whole game in one page (no dependencies needed)
npm install            # Playwright, used for the checks
npm run check          # crash, save, layout, touch and guided-start checks (about 1–2 min)
npm run bot -- 1150    # bot plays 1,150 game hours and reports when each level was reached
npm run preview        # remakes the link-preview image and home-screen icon in src/public/
```

Open `dist/index.html` in a browser to play the local build. Progress saves in this browser on this device. To move an airport to another device, copy a save code from Office › Settings › Your save and paste it there.

The source is `src/game/*.js` (logic and drawing, in numbered files joined in order) and `src/shell.html` (CSS and HTML). See `CLAUDE.md` for how the code fits together and how changes are made, and `docs/` for the roadmap, specs, decision records and history.

Ideas and bugs go in GitHub issues; there are templates for features, bugs and balance.
