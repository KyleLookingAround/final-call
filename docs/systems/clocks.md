# Clocks and day stats

**Clocks and day stats** (`02-clocks.js`; steps 4 and 6 of `docs/specs/systems-review.md`).
- **Clocks.** `MINUTE`, `HOUR`, `NIGHT` and `DAY` are ordered lists of hooks `{id, every, at, fn}`. `runClock(T, n)` runs each hook whose `n % every === at`.
  - `update()` runs `MINUTE` once a game minute (n is the minute). Its `HOUR` entry runs `HOUR` on the hour and half hour, and `HOUR`'s `NIGHT` entry runs `NIGHT` at 03:00.
  - `dayTick` runs `DAY` when the day changes. n is the new day, and each hook gets the stats of the day just ended.
  - The order is listed once, in `CLOCK_ORDER`. A system registers its own hooks from its own file with `clock(T, id, every, at, fn)`, which slots each into its place and throws on an id the order doesn't list. A new hook is a line in `CLOCK_ORDER` and a `clock(…)` call next to its function, not an edit to `update()`.
- **Today's order.**
  - `MINUTE`: `autoStaff` (every 2), `updateBuilds`, `layoutTick`, `dayTick`, `checkLevel`, `fleetTick`, `managersTick` (every 360), `mgrStep`, `TERM_MINUTE`, `HOUR` (every 30), `dayRec` (every 5, the Day in a minute recorder).
  - `HOUR`: `mgrHour` (60), `crewTick` (30; with `turnChecks`, servicing worn planes at the gate), `recordsHour` (60), `NIGHT` (03:00), `ads` (60; also keeps `R.repH`, the rating each hour).
  - `NIGHT`: `nightChecks`.
  - `DAY`: `dayReport` and `recordsDay` (the day just ended), `newDay` (`G.day` and a fresh `G.dstat`), `regionDay`, `rivalDay`, `chalDay`, `TERM_DAY`, `season`.
- **The terminal's hooks.** `TERM_MINUTE` and `TERM_DAY` stay lists that the terminal's parts push onto (the hotel takes itself off). Each runs as one entry of `MINUTE` and `DAY`.
- **Day stats.** `G.dstat` (saved) counts the day so far, and `DAY_STATS` lists each of its fields as `{key, label}`.
  - Seven fields have a `reset` and start each day from `dayStats()`, in this order: passengers departed and arrived, departures, departures on time, money in and out, and the rating at the start of the day.
  - The other fields appear when first counted. Each system lists its own with `dayStat(key, label)` from its file: `full`, `night` and `snowOT` in `08-stands.js`, `crewDl` and `checks` in `34-airline-operations.js`, `bagMiss` in `45-baggage.js`.
  - Every system counts with `dayAdd(key, n)` and reads with `dayVal(stats, key)`. The day report (`G.lastDay`) is the day's stats with its day and profit.
- **Checks.**
  - `clocks` plays the level 9 save for 25 game hours. It compares each hook's cadence, each minute's order and a hash of the whole sequence with `tools/checks/lib/clocks.json`, recorded on `main` before the tables.
  - `daystats` compares the day report's fields over three day changes with `tools/checks/lib/daystats.json`. It also checks that every field counted is in `DAY_STATS`, with a label.
  - A change to the order or cadence on purpose re-records the file in the same PR (the check's `hookLog` and `summarise` make the recording).
- **Seeing them.** `node tools/graph.mjs MINUTE` (or `HOUR`, `NIGHT`, `DAY`, `DAY_STATS`) lists what each file registers, and a system's or file's entry lists its hooks.
