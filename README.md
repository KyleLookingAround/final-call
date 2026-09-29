# Final Call

An airport management game that runs in the browser, on phones, tablets and desktops. You start with one gate and one small plane and grow into the Airport of the Year.

**Play:** [Play Final Call](https://kylelookingaround.github.io/final-call/). It publishes from `main` through GitHub Actions.

## What's in it

- **The terminal.** Passengers walk through check-in, security, the shops and the gate, and back through immigration, reclaim and customs. In the Classic layout the terminal has two floors: departures upstairs, arrivals below, joined by escalators and a lift. There are nine airport layouts, and a roof view, weather and night lighting to look at.
- **Routes.** A world map of cities, fares and demand for each route, and partner airlines that fly to the routes you leave quiet.
- **The region.** Buses, trams, rail, metro and high-speed lines, development sites, events and weather.
- **Lowmere.** A rival airport that competes for travellers on the routes you both fly, and that you can buy in the end.
- **Managers and recommendations.** If you'd rather not tune everything, managers run lines, fares, crews and hotel prices, and recommendations say what to do next. Late in the game you can take control yourself.

## Develop

```
npm run build          # dist/index.html, the whole game in one page (no dependencies needed)
npm install            # Playwright, used for the checks
npm run check          # crash, save, layout, touch and guided-start checks (about 15–25 min in a cloud session)
npm run bot -- 1150    # bot plays 1,150 game hours and reports when each level was reached
npm run preview        # remakes the link-preview image and home-screen icon in src/public/
```

Open `dist/index.html` in a browser to play the local build. Progress saves in this browser on this device. To move an airport to another device, copy a save code from Office › Settings › Save and paste it there. The published site can send anonymous, cookie-free usage counts; turn them off in Office › Settings › Screen and sound.

The source is `src/game/*.js` (logic and drawing, in numbered files joined in order) and `src/shell.html` (CSS and HTML). See `CLAUDE.md` for how the code fits together and how changes are made, and `docs/` for the roadmap, specs, decision records and history.

Ideas and bugs go in GitHub issues; there are templates for features, bugs and balance.
