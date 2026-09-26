# ADR-2026-09-26: The simulation uses a seeded random generator

## Status

Approved

## Context

The game used `Math.random()` in 68 places. Every bot run and every check played a different game, so a failure might not repeat, and the balance baselines had to be ranges: a 10% change in pacing couldn't be told apart from chance.

## Options Considered

### Option 1: One seeded generator for everything that touches game state
**Description:** `rnd()` in `src/game/00-random.js` (mulberry32). Tests and the bot set `window.__seed` before the page loads; players get a new seed each time. Sound, the board's flaps, weather drawing and the device id keep `Math.random()`.

**Pros:**
- The same seed and code always give the same run, so failures repeat and differences between versions are measurable.
- Players notice no difference.

**Cons:**
- Everyone must use `rnd()` for game state; a stray `Math.random()` quietly breaks repeatability.
- A code change that alters the order of random draws still changes the run, so one seed alone doesn't show a change's effect.

### Option 2: Keep `Math.random()` and run the bot many times
**Description:** Average many unseeded runs to judge balance.

**Pros:**
- No code change.

**Cons:**
- Slow, still noisy, and failures still don't repeat.

## Decision

Anything that can change the game state draws from `rnd()`. Only cosmetic code may use `Math.random()`, on a line ending with `// cosmetic`.

## Rationale

Repeatable runs turn flaky failures into fixable ones and make balance measurable. The rule is easy to enforce mechanically, so the cost is low.

## Consequences and Trade-offs

**Positive:**
- The checks seed every page; the bot takes `--seed`; the `rules` check proves the same seed plays the same game.

**Negative / Risks:**
- Any new randomness in a state path must use `rnd()`.

**Mitigations:**
- The build rejects `Math.random()` on any line that doesn't end with `// cosmetic`.
- Balance is judged on seeds 1, 2 and 3, before and after a change, by the Balance workflow.

## Related

- `tools/run-bot.mjs`, `tools/baseline.json`, `.github/workflows/balance.yml`
