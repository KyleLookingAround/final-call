# A smarter transport manager

Issue: #15 · Status: Proposed

## What the player gets

The transport manager changes from someone who only nudges timetables into someone who runs the network well and tells you what to build next:
- upgrade a busy bus route to a tram, train or metro;
- extend a line to the next town;
- close a line that other lines now do better.

Players who'd rather not tune everything get a network that pays its way. Players who like control see the reasons and decide.

## What they see

- **Region › Transport, the manager's card** (today's "Recommended" card, renamed "Transport manager"). Each suggestion shows:
  - a line badge and one line of text, for example "Upgrade B1 to a tram: Airport › Millbrook › Central";
  - what it's worth: "+$480/h · demand +1.2% · pays back in ~5 days";
  - **Preview** (draws the new route dashed on the map), a price button, and × to hide it for a day.
- **Suggestions it makes,** best payback first, up to four at a time:
  - **Upgrade a line** to a bigger kind of transport (below).
  - **Extend a line** by a station at either end.
  - **Close a line** that the network does better without: "B3 carries almost nobody now R2 runs: closing it saves $12/h."
  - **What it suggests today:** new lines, park and ride, interchange halls, network upgrades and longer vehicles.
- **What the manager did lately:** the card lists the manager's last three changes, for example "R2 every 30 min (was 60): +$500/h" or "Meet flights on C1".
- **Line cards:**
  - an **Upgrade** row (Tram $35k · Train $61k) opens the same preview;
  - a line being upgraded shows UPGRADING and keeps running until the new one is ready;
  - on an event day, lines to the venue show MATCH DAY (or CONCERT, and so on) while they run extra services.
- **On the map:**
  - upgrades lay their track like any new line: "UPGRADING B1 → T4 · 40%";
  - extra event services show as more vehicles on the line.
- **On phones:** suggestion rows wrap like today's recommendations. The card works at 320 px, and Preview flies the camera to the route.

## How it works

- **Upgrades.** A line can move up to:
  - Bus → tram, train or metro.
  - Coach → train or high-speed rail.
  - Tram → train or metro.
  - Train → metro or high-speed rail.
  - The water bus has no upgrade.

  How an upgrade works:
  - **Route.** It keeps the line's stations where the new kind can run. Otherwise it takes the new kind's shortest route between the same two ends.
  - **Cost and time.** It costs the new kind's vehicles plus any new track, and takes as long to build as a new line.
  - **While it's built.** The old line keeps running.
  - **When it opens:**
    - the line takes the new kind's next number and colour (B1 becomes T4);
    - it keeps its fares, night service and meet-flights;
    - it starts at the fewest services that still carry as many seats as before;
    - the manager then tunes it.
- **Extensions** use today's route editing:
  - on roads they are free and instant;
  - on track they cost the new track plus 10% for vehicles.
- **How suggestions are measured.** The same way today's new-line suggestions are:
  - the region model runs with the change and without it, at 09:00 and 17:30;
  - the value counts transport profit, extra flyers brought to the airport and staff who ride to work.
  - A suggestion must pay back within a week (today's limit is four days).
  - They're worked out a few at a time between frames, so a level 9 network (around 70 options, about 0.2 s in all on a desktop) never stalls the game.
- **The manager runs lines by value, not just by how full they are.** When it's on (Settings › Transport manager), for every line you haven't taken over:
  - **Every 6 hours** it weighs one step more or fewer services, and meet-flights for airport lines. It makes the change worth most, if that's worth at least $5/h and 3% of the line's running cost. It reviews one line per game minute, so the game never stalls.
  - **Every hour** it adds services straight away to a line over 105% full, which costs rating today, if the timetable and shared track allow.
  - **On event days,** lines serving the venue run two steps more often while the crowds travel: from 2½ hours before to 3½ hours after. Then they go back.
  - Night services work as today.
  - Changing a line yourself still takes it over, and "Hand it back to the manager" still returns it.
- **What the manager never does:** spend money on building. It suggests, and you decide.
- **Unlocks.**
  - Upgrades appear once the target kind is approved in the Masterplan, as the kinds do today.
  - Suggestions follow Settings › Recommendations.
  - The manager's settings are unchanged.

## Saved state

- **Upgrades** are stored as today's line builds, with a new `up` flag. Saves without it load as today.
- **Everything else is runtime only:** the manager's log, hidden suggestions and the review queue.
- **Nothing is renamed or removed.**

## Balance

- The manager is on by default, so the bot plays with it. Running lines by value adds service where it brings flyers.
  - Measured on saves: R2 at level 9 is worth +$500/h at two trains an hour instead of one.
  - Expect slightly quicker pacing. The target is to stay inside the baselines on seeds 1–3, both keeping Classic and rebuilding.
- **Bot option `{"recs":true}`:** the bot takes the manager's top suggestion when it has three times its price spare. It runs on seeds 1–3 to show that following the manager helps (reported only).

## Checks

- **`rules`:**
  - an upgrade keeps the old line running until it's built, then switches kind, number and colour, and the number isn't reused;
  - an extension suggestion extends the line;
  - every suggestion is buildable and worth more than it costs to run;
  - the manager never changes a line you've taken over;
  - it adds services within the hour to a line over 105% full;
  - event extras run only during the event window;
  - × hides a suggestion.
- **Screenshots** of the card with upgrade, extension and close suggestions at phone, tablet and desktop sizes, and of an upgrade being built on the map.
- **`perf`** keeps its budget with the manager's reviews included.

## Files

- **`32-managers.js`:** the manager, suggestions and the log.
- **`27-region-events-lines.js`:** upgrades as line builds.
- **`25-region-helpers.js`:** event extras in `lineFreq`.
- **`30-region-ui.js`:** the Upgrade row and pills.
- **`29-region-map.js`:** the upgrade label.
- **Also:** `tools/bot.js` and the checks.

## Left out

- **Fares.** The manager leaves line fares alone. The region model finds dearer fares pay on almost every line, because riders hardly notice them. That wants a balance look of its own before a manager leans on it (a roadmap idea).
- **Building on its own.** The manager never spends on building. A later "let the manager build within a budget" option is a roadmap idea.
- **Timetables by time of day** (more services at peaks than midday).
- **Merging two lines into one.**
