---
type: System
description: Demand, fares and the dispatcher, with the world map.
verified: { by: process:notes-review, at: 2026-09-28T11:15:16Z }
---
# Routes

**Routes** (`31-routes.js`: demand, fares and the dispatcher, with the world map; the tables they read, such as `TIERBASE`, `RFARE` and `SEA_MUL`, stay in `03-state.js`).
- Each city has a market in seats per day (`cityMarket`, which includes Lowmere's cut through `rivKeep`).
- `routeLF` gives how full a flight will be.
- The dispatcher `pickRoute` sends each plane where it earns most per hour.
- Fares are −20%, standard or +25% per route.
- **A network you have to keep** (`docs/specs/network-to-keep.md`), from City Airport (`netOn`, the level Lowmere comes at):
  - Each open route wants `wantOf(c)` flights a day: its base market ÷ 400, from 1 to 4. `serviceOf(c)` is yours (`rs.n`) plus partners' (`rs.pn`), both decaying over a day like the rest of `G.rs`.
  - Once a day (`netDay`, called first thing in `rivalDay`), a route served under half its want loses 4% of its market, to a floor of 40%. A route served at its want wins 4% back. The share left is `G.rs[c].keep` (read as 1 when missing), and `cityMarket` multiplies by it. The world map thins and greys a route below 70%.
  - Business cities fill better when flown often: `cityWill` gains `1 + 0.15 × biz × (min(1, service ÷ want) − 0.5)`.
  - Partner flights go to the open route served least against its want, when one is short (`partnerDest`). Before, they flew to a random city.
  - Lowmere's growth weights open routes served under half their want by 1.5.
  - **Keep.** `G.routes[c].keep` is a minimum a day, set from the route card. `pickRoute` sends your own plane to the kept route furthest short, at most once every `720 ÷ keep` minutes per route (`G.routes[c].kAt`). The route manager's recommendations offer "Keep" for the biggest route going quiet.
  - The `network` check group covers each rule.
