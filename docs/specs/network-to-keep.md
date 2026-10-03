---
type: Spec
description: A transport network the player has to keep up, rather than build once and forget.
status: stable
verified: { by: human:KyleLookingAround, at: "2026-09-28T11:15:16Z" }
---
# A network you have to keep

Issue: #96 · Status: Built · PRs: #101 (spec), #116 (build)

From `docs/specs/systems-review.md`, Part 2, proposal 1. Not built: the owner approves this first.

## What the player gets

Today the dispatcher sends every plane to the few routes that pay most per hour, so the board shows one or two cities all day and the other routes you paid for sit empty. At hour 1,150 the bot (`main`, keeping Classic, seeds 1–3) has 24–26 routes open but flies only 3–6 of them at least once a day, and the busiest one takes 24–42% of departures. With this change, a route you stop flying goes quiet and Lowmere or a partner moves in, and a route flown often wins travellers back. The choice becomes a few fat routes with widebodies, or a network kept alive with smaller planes and partners.

## What they see

- **World map.** A route's line thins and greys as it goes quiet. When Lowmere takes it, its dashed purple line appears over yours. No toast.
- **Board.** A partner's code on a route you dropped ("PT 412 Lisbon").
- **Routes tab.** Each route's card gets one line, "You 0×, Lowmere 3× a day", and a small bar for how much of its market is left. A route kept by the route manager shows "Keep: 2 a day".
- **Office › Plan, recommendations.** "Lisbon is slipping: fly it twice a day or let it go."
- All of this fits the existing cards, so a 320 px phone, a landscape phone, a tablet and a large screen need only the screenshots looked at.

## How it works

- **Service.** Each route's service is its departures a day, `rsOf(c).n`, which already decays over a day. The frequency it wants is `want(c) = cityMarket(c) ÷ 150` seats, at least 1 a day.
- **Going quiet.** Once a day, a route flown less than `want` loses 4% of its market (a new `G.rs[c].keep`, from 1 down to a floor of 0.4) for each day short, and gains it back at 4% a day while it's flown at or above `want`. `cityMarket` multiplies by `keep`. Nothing is closed, and the route fee isn't lost.
- **Lowmere moves in first.** Its daily pick (`33-lowmere.js`, `want`) adds routes you have open but fly under half of `want`, weighted by what's left of their market, so Lowmere takes the routes you neglect before the ones you dominate.
- **Partners.** A partner flight picks a route you fly less than `want` when there is one (`pickPartner`), so partners fill the network's gaps, and the board shows it.
- **Frequency pays.** `cityWill` gains a term for business cities: `1 + 0.15 × C.biz × min(1, n ÷ want)`, so three flights a day to a business city fill better than one. With it, the dispatcher (which follows money) spreads planes by itself.
- **Unlocks.** From City Airport (level 3), when Lowmere opens. Before that nothing decays.
- **Managers.** The route manager gets a second lever beside fares: mark a route **Keep** (a minimum frequency the dispatcher honours before it chases money) or **Let go**. With Auto on it keeps the routes whose market is worth more than the planes it takes. The recommendations list the slipping routes.

## Saved state

- `G.rs[c].keep` (default 1, read as `?? 1`, so no migration) and `G.routes[c].keep` (the manager's minimum a day, default none).
- Nothing renamed or removed. An old save starts with every route at full market.

## Balance

- Expected: fewer passengers per plane at first (the dispatcher's best routes lose some load to spreading), and more routes flown. Lowmere's share on shared routes rises where the player neglects routes, and falls where they fly often.
- Risk to the baselines is medium. The bot's fleet buying (`tools/bot.js`, the `bt` choice) buys only the best type, so it would leave routes to decay. It needs to keep a second, smaller type (for example one narrowbody per four routes open) before it can be measured fairly.
- **How it would be measured.** The bot on seeds 1–3, keeping Classic and rebuilding, before and after, reporting: level hours against `tools/baseline.json`; routes flown at least once a day, and the busiest route's share of departures, at hours 300, 700 and 1,150 (today 3–6 and 24–42% at 1,150); Lowmere's share; cash at the end; and `ERR`. The aim is at least half the open routes flown daily and no route above 25%, with pacing within 15%. A quick prototype isn't cheap (the rule, Lowmere's pick, partners and the bot's fleet all have to change together to give a fair number), so the estimate comes with the build.
- Pacing isn't meant to change. If it moves past 15%, the 4% decay and the 0.15 frequency term are the two constants to tune.

## Checks

- A new `network` check group: a level 5 save with one route left unflown for three seeded days loses market and gains Lowmere; flown at `want`, it recovers; a partner flight picks the unflown route; a route marked Keep is flown at its minimum.
- `saves`: every older save loads with `keep` read as 1.
- Screenshots: the world map with a grey route and Lowmere's dashed line, and a route card, on a phone and a large screen.

## Files

`31-routes.js` (the market term and `want`), `33-lowmere.js` (the pick), `05-flights.js` (`pickPartner`), `32-managers.js` (Keep and Let go, recommendations), `15-panel.js` (the route card line), the world map's drawing for the grey line, `tools/bot.js` (a second plane type). No new file.

## Left out

- Plane sizes, running costs and the "biggest plane wins" rule (#57 idea 5, parked): the frequency term is the only part taken.
- Closing routes, losing the route fee, slots (proposal 6) and Lowmere fighting back (#57 idea 8).
- The rating that reflects the last day (#96's other half), which this doesn't need but makes bite harder.

## As built

- **Want.** It's base market ÷ 400, from 1 to 4 a day, not ÷ 150. At ÷ 150 most routes wanted more flights than the whole fleet flies. Service counts partners' departures as well as yours.
- **Frequency term.** It's centred, `1 + 0.15 × biz × (min(1, service ÷ want) − 0.5)`, so a route flown at half its want is neutral and total demand hardly moves.
- **Route card.** The card has a service line ("Flown 0.4× a day (partners 0.3×); it wants 3. 88% of its market is left: it's going quiet.") and Keep chips (Off, 1, 2 or 4 a day). There's no separate bar.
- **Route manager.** It recommends "Keep" for the biggest route going quiet. It doesn't mark routes Keep or Let go by itself when Auto is on. That, and "Let go", are left for later.
- **Bot.** Unchanged: its fleet buying still ends on widebodies, and it never uses Keep. Partners keep the network alive for it.
- **Daily step.** It runs first thing in `rivalDay` rather than as a new `DAY` hook, so the recorded clock order is unchanged.
