# Roadmap

What's being worked on, what's next, and ideas not yet agreed. Anything here gets an issue before work starts; features also get a spec (`docs/specs/TEMPLATE.md`). The owner decides what moves up.

## Now

Nothing in progress. Sound is next, from the order below.

## The owner's order of bundles

From the idea board. Each bundle gets an issue and a spec before work starts.

1. **Sound.** Announcements for your real flights now and then: mostly a chime with the words on the board, plus an occasional spoken call. Sound that follows the camera.
2. **Looks like a real airport.** Apron markings, day and night lighting, roofs that cut away, better planes, weather you can see, apron vehicles. A richer top-down view, not isometric.
3. **The terminal as a place.** Two levels, a roof terrace with spotters, windows, local character, and decor that comes with the building (the owner doesn't want to place decor).
4. **Passengers with a voice.** Kinds of passenger, reviews on the map, a heat map of where it hurts, tap a complaint to go to its fix, follow a passenger.
5. **A 24-hour airport with stakes.** Ground crews and turnarounds, cargo and night flights, airlines that leave if treated badly: the owner wants to be able to fail.
6. **Hub and a second airport.** Waves, running Lowmere, rivals, alliances.

- **Parked:** winter, seasons and world events; music.
- **Rejected:** placing decor; a share price; eras; a sandbox.
- **Follow-up to the terminal:** each layout's own terminal floor plan (step 3 of `docs/specs/terminal.md`). Every layout shares Classic's halls today.

## Next

- **Weekly health check.** A scheduled run of the checks and the bot on `main`, opening an issue when something drifts.
- **Feedback from players.** A "Send feedback" link in Help that opens a prefilled issue. No tracking.

## Ideas (not agreed)

- **Let the transport manager build.** An opt-in chip that lets it buy its top suggestion within a budget. Left out of version 27, where it only suggests.
- **Fares that riders notice.** In the region model, dearer line fares pay on almost every line, so the manager picks premium nearly everywhere. Riders could weigh fares more, so cheap fares win flyers on airport lines.
- **Timetables by time of day.** More services at the peaks than at midday or late evening.
- **Speed on throttled phones.** Every passenger now has one object shape, which halved the simulation's time, but a fully built Midfield still reaches only about two thirds of 8× on a phone with its CPU slowed four times. One pass over passengers per step instead of three, or indexing them by state, would help.
- **More than one airport.** Run a second airport. The odd real sites would suit it: Gibraltar's road across the runway, Barra's beach runway that follows the tide, and Madeira's runway on pillars.
- **Speed on older phones.** A check that fails if a level 9 airport draws too slowly on a throttled phone profile.
- **Page size budget.** A check on the size of `dist/index.html`, which grows with every feature.
- **Accessibility.** Route and line colours that work for colour-blind players, and a larger-text option.

## Done

- **Version 28: a real terminal** (#17). Halls in the order real airports use them: check-in islands, bag drop and a security hall with search tables; immigration with e-gates, a domestic channel, customs and an arrivals hall with meeters; a baggage hall with a sorter, tug trains and shared carousels; a market place with shops people walk into, gate calls and gate lounges; and an airport hotel. Built in five parts side by side (#18, #19, #21, #22, #23, #24) and brought together in one.
- **Version 27: a smarter transport manager** (#15). Lines run by value (services, fares, meeting flights), quick action on overfull lines, extra services on event days, and suggestions to upgrade, extend or close lines.
- **Versions 23–26: real airport shapes** (#10). Classic made real with nose-in planes and a real Pier B; the Remote apron, Staggered apron, Curved front (Kansai), Hall and finger pier (Schiphol), Satellite (Heathrow T5) and Starfish (Daxing) rebuilt as real shapes; two new layouts, Midfield concourses (Atlanta, Denver) and the Round terminal (Paris CDG T1); trains, tunnels and mobile lounges (Dulles).
- **Version 22: airport layouts.** Six layouts to unlock and rebuild into, smoother fast speeds on phones, and a What's new page with the full history.
- **Link previews.** A preview card, title and description when the link is shared, a tab icon and a home-screen icon; `npm run preview` remakes them.
- **Ways of working.** Issue, PR and spec templates, decision records (`docs/decisions/`), and playbooks for features, balance, releases and PRs.
- **Repeatable tests.** Seeded randomness, rule checks, version 21 save fixtures, the bot against baselines on three seeds, screenshots on every PR.
- **Foundations.** The game source in numbered files, pinned tools, start-up installs for web sessions.
- **Version 21 and earlier.** The five features of version 20 and the mobile fixes of version 21: see `docs/PLAN.md` and `docs/HISTORY.md`.
