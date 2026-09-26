# ADR-2026-09-26: The terminal is halls, and its parts plug in

## Status

Approved

## Context

Check-in, security, passport control and reclaim sat in one strip under the concourse, the same in every layout. Passengers moved in straight lines, so they walked through walls. The terminal spec (`docs/specs/terminal.md`) asks for:
- real halls in the order airports use them;
- then five parts built at the same time by different people: departures, arrivals, baggage, the market place and the hotel.

Five people changing the same passenger loop, check script and state line at once would conflict at every merge.

## Options Considered

### Option 1: Halls as rooms, parts in their own files that plug into shared tables
**Description:**
- The halls are rooms like the airside ones (`TERM_ROOMS`, `TERM_DOORS`), merged into every layout's rooms, so passengers walk through doorways with `route` and `walk`.
- Security lanes and passport desks stand in the walls between landside and airside halls, and are the only way through.
- Each part lives in its own file (`43-departures` to `47-hotel`) and plugs into tables in `42-terminal.js`:
  - `PAX_STEP` and `ARR_STEP` for passenger states;
  - `TERM_SUBS`, `TERM_SECS` and `TERM_PANEL` for the Terminal tab;
  - `TERM_CLICK`, `TERM_MINUTE`, `TERM_DAY` and `TERM_DRAW`;
  - `TERM_FIELDS` for saved fields;
  - `SIMX` for the checks.
- A part's checks are a file in `tools/checks/`.

**Pros:**
- Parts rarely touch the same lines, so they can be built side by side.
- The halls get the same walking, routing and fit checks as airside.
- Moving the code into the part files kept the game exactly the same: the same end state on seeds 1–3.

**Cons:**
- One more level of indirection: a passenger's step is found through a table, not an `if` chain.

### Option 2: Keep the landside strip and one passenger loop, and have each part edit it
**Description:** Each part changes `updateLandside`, `updateArrivals`, `DEFAULT()` and `tools/check.mjs` directly.

**Pros:**
- No new structure.

**Cons:**
- Five parts at once would conflict constantly.
- Straight-line walking through walls stays.

## Decision

The terminal is a set of halls shared by every layout, and its parts live in their own files and plug in through the tables in `42-terminal.js`. Shared loops and files only change to add a new kind of hook.

## Rationale

The parallel build needs parts that don't collide, and the rooms system already solves walking between spaces. The tables cost almost nothing at run time: one lookup per passenger per update, where there used to be an `if` chain.

## Consequences and Trade-offs

**Positive:**
- A new terminal feature is a new file, plus a line in the project notes.

**Negative / Risks:**
- The order of steps matters for exact repeatability. The dispatch loops keep the order the old loops had.

**Mitigations:**
- `terminalFaults` keeps every desk, lane, passport desk, carousel and queue inside its hall.
- The `terminal` check group follows passengers through the halls.

## Related

- `src/game/42-terminal.js`, `docs/specs/terminal.md`, `docs/decisions/ADR-2026-09-26-stand-frames-and-rooms.md`
