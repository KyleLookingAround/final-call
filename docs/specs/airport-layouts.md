# Airport layouts

Issue: #7 · Status: Proposed

Bundled with the performance work below, at the owner's request.

## What the player gets

As the airport grows, the player can unlock new airport layouts in the Masterplan and rebuild into them. Each layout trades something for something: more stands, more shops, shorter walks, buses instead of bridges. Choosing a layout becomes a strategic decision in the mid and late game. The end-game layouts are modelled on real airports.

Everyone still starts at the same airport, with today's layout, now called **Classic**. There is no layout choice at the start.

## What they see

- **Masterplan:** a new **Layouts** branch. Each layout is a plan, hidden until its level is reached, approved with plan points.
- **Airfield › Layout:** a sub-tab that appears once a layout plan is approved. It shows:
  - each approved layout as a small plan drawing with its stands, shop units, typical walk to the gate and upkeep, compared with the current layout;
  - the rebuild cost and time, and a Rebuild button (tap twice to confirm).
- **On the map:** hoardings and cranes on the apron while a rebuild is under way, then the new terminal, piers and stands. Buses drive between gates and remote stands; a people mover runs to a satellite. The departures board shows the new gate names.
- **Phones and screens:** every layout works from a 320 px phone to large screens, and leaves room for the phone camera.

## The layouts

The numbers are starting points; the bot tunes them.

| Layout | Inspired by | Unlocks | Stands | Shop units | Upside | Downside |
| --- | --- | --- | --- | --- | --- | --- |
| **Classic** | today's airport | start | 8 on bridges | 8 | balanced | long walk to the far end of Pier B |
| **Remote apron** | London Stansted and Luton remote stands | level 2 · 1 point · $8k · 3 h | 8 on bridges + 4 remote | 8 | the cheapest extra stands (remote ones cost 40%) | buses: slower boarding, worse in rain and snow, small rating hit |
| **Staggered apron** | your concept | level 3 · 1 point · $40k · 6 h | 10 on bridges, in two rows | 10 | more stands; arrivals visibly taxi in | back-row bridges are longer, so boarding starts later |
| **Curved front** | your concept, with a control tower | level 4 · 2 points · $120k · 8 h | 8 on bridges, on an arc | 12 | shortest walks: boarding starts sooner, fewer late passengers, rating bonus | no extra stands |
| **Hall and finger pier** | your concept; Amsterdam Schiphol | level 5 · 2 points · $300k · 10 h | 10 on bridges | 14 | shops cluster in the central hall, where passengers spend most | walks to the pier ends |
| **Satellite** | London Stansted and Munich Terminal 2 | level 7 · 3 points · $1.2M · 16 h | 12 on bridges | 16 | big duty-free and lounge space; fast transfers | a people-mover ride before boarding; high upkeep |
| **Starfish** | Beijing Daxing | level 9 · 3 points · $3M · 24 h | 12 on bridges, on five short piers | 20 | the shortest walks for its size and the most shops; rating bonus | the costliest rebuild and upkeep |

The upsides and downsides come from things the game already models, rather than flat bonuses:
- where stands and shops sit, which sets walking times;
- stand count and shop units;
- boarding by bus and stairs instead of a bridge;
- upkeep.

A small rating modifier applies only where a layout is plainly nicer or worse to use.

## How it works

- **Unlocking:** Masterplan plans in a new Layouts branch, with a level and a point cost. Locked layouts are hidden.
- **Rebuilding:** uses the existing construction system and one build crew. The airport keeps running while it's built. The new layout opens overnight at 03:00. Turnarounds in progress finish at their stand, then the stand moves.
- **What carries over:** gates, shops, fleet and upgrades carry over by position. If the new layout has fewer stands or shop units than you've built, the rebuild screen says so before you confirm, and the extras are sold at their normal resale value.
- **Rebuilding again:** you can rebuild into any approved layout later, including Classic.
- **Pier B:** becomes the second phase of every layout. The first four stands are available straight away, and the rest open with it, as now.
- **Remote stands:** passengers wait in a gate lounge, ride a bus, then board by stairs at both doors. That's slower to reach the plane but quicker to fill it. Weather slows the buses.
- **Upgrades:** the people mover, control tower, landmark terminal and mall upgrades still show and work in every layout.
- **Managers and recommendations:** a recommendation suggests a layout when one would clearly help, for example "Remote apron: 4 more stands for $8k". The layout choice is never made automatically.

## Saved state

- `G.layout`: the layout id, default `'classic'`. `resetAll` sets `'classic'` when it's missing, so every existing airport stays exactly as it is.
- **Rebuilds:** a construction job with id `layout:<id>` in `G.builds`.
- **Room for bigger layouts:** `G.stands` grows to 12 entries and `G.shops` to 20. Old saves are padded with unbuilt entries, and unused ones are hidden.
- **Nothing is renamed or removed.**

## Balance

- A player who never rebuilds keeps today's pacing, within 15% of the baselines.
- The bot learns to approve layout plans and rebuild into the best layout it can afford. Its results are compared on seeds 1–3 with and without rebuilding.
- **Target:** rebuilding well reaches Airport of the Year about 5–10% sooner, not more.
- If the baselines need to move, I'll show you the numbers first.

## Performance (in the same PR)

- **The problem:** late-game airports at 8× run at about 10 fps on a phone-speed CPU. Simulating passengers takes about 17.5 ms per frame on a desktop CPU.
- **Target:** at least 30 fps at 8× on a level 9 airport with the CPU slowed 4×.
- **Proof it changes nothing:** the speed-up comes first, before any layout work. It must leave the game identical: seeds 1–3 must reach every level at exactly the same hour as before.
- **Staying fast:** a new `perf` check measures a level 9 airport at 8× and reports the frame time on every PR. It fails only on a large regression, so CI machines don't make it flaky.

## Checks

- **`rules`:** in every layout, stands and shop units don't overlap and fit the map, every stand has a path from security, and gate names are unique. Rebuilding carries gates and shops over, and sells any extras.
- **`saves`:** old saves load as Classic, unchanged.
- **Proof the refactor changes nothing:** the step that turns the geometry into layout data also leaves the game identical on seeds 1–3.
- **`shots`:** phone, tablet and desktop screenshots of every layout.
- **`layout`:** every layout at every screen size.
- **Bot:** seeds 1–3, with and without rebuilding.
- **`perf`:** as above.

## Files

- **New:** `src/game/38-layouts.js` for layout data, rebuilding, and the Airfield › Layout tab.
- **New:** `src/game/39-layout-drawing.js` for each layout's terminal, piers and apron.
- **Changed:**
  - geometry (`01-constants`, `04-geometry`), where stand positions come from the current layout;
  - stands and passengers, for buses and remote stands;
  - drawing, the Masterplan data, saves, managers, the bot, the checks, and the project notes.

## Order of work

1. Performance, proven identical.
2. The layout system, with Classic as data, proven identical.
3. Remote apron, Curved front, and Hall and finger pier.
4. Staggered apron, Satellite, and Starfish.
5. Balance with the bot, then screenshots and review.

Each step is its own commit on one branch, in one PR, unless the PR gets too big to review; if so, steps 3 and 4 split into a second PR.

## Left out

- The starting airport's look stays as it is.
- The runway, airspace and region map don't change.
- A midfield-concourse layout with a train, like Atlanta or Heathrow Terminal 5, is a candidate for later.
