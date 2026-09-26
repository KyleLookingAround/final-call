# ADR-2026-09-26: The source is numbered files joined into one script

## Status

Approved

## Context

The game's code was one file, `src/game.js`: 3,600 dense lines (381 KB), one strict IIFE, with section banners for each system. A change meant searching one huge file, diffs were hard to read, and two pieces of work at once would collide in the same file.

## Options Considered

### Option 1: Numbered files joined in order into the same IIFE
**Description:** Cut `game.js` along its section banners into `src/game/NN-name.js`. The build joins them in name order inside one strict IIFE, so they keep sharing one scope.

**Pros:**
- No change to how the code works: the built page is byte-identical to before.
- Smaller files, clearer diffs, parallel work in different files.
- No bundler and no dependencies.

**Cons:**
- Files are not modules; any file can reach any other's top-level names, so boundaries are by convention.
- Order matters for code that runs at load time.

### Option 2: ES modules with imports and exports
**Description:** Turn each system into a module and bundle them into the page.

**Pros:**
- Explicit dependencies between systems.

**Cons:**
- A rewrite of every cross-reference in 3,600 lines, with real risk of breaking behaviour.
- Needs a bundler to make one page again.

## Decision

The source lives in numbered files in `src/game/`, joined in name order into one strict IIFE by `tools/build.mjs`. New systems get their own file, numbered before `99-start.js`.

## Rationale

It delivers most of the benefit (smaller files, parallel work, readable diffs) at no risk, because it is provably the same code. Explicit module boundaries can come later, a system at a time, if they earn their keep.

## Consequences and Trade-offs

**Positive:**
- Work on different systems no longer collides.
- The build names the file and line for syntax errors, names declared twice and duplicate functions.

**Negative / Risks:**
- Error lines in the built page don't match source files directly.
- Some functions sit where they were first written rather than where their name suggests.

**Mitigations:**
- `node tools/where.mjs <line>` maps a line in the built page to its source file.
- The project notes list what each file holds and say to search by name.

## Related

- [ADR-2026-09-26-one-page-no-dependencies](ADR-2026-09-26-one-page-no-dependencies.md)
