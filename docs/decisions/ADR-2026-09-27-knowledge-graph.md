---
type: Decision
description: A map of the code and docs is built from the source on every query, and the docs keep only the why as short link lines.
status: stable
tags: [experiment]
---
# ADR-2026-09-27: A map of the code and docs, generated from the source

## Status

Accepted as an experiment (#31). Measured on "Looks like a real airport"; removed if it doesn't clearly cut sessions' context and cost.

## Context

Most of a session's cost is finding its way around. Each terminal part used 245–383k tokens of context and cost $8–22 (`docs/LESSONS.md`), much of it reading files and docs to learn what touches what. The docs also drift: a system's notes in `docs/SYSTEMS.md` can go stale when its file changes.

## Options Considered

### Option 1: Generated from the source, queried by name
**Description:** `tools/graph.mjs` reads `src/game/`, the checks and the docs' own link lines each time it runs, and prints what relates to a name.

**Pros:**
- Always true: nothing to keep by hand except the "why" links the docs already carry.
- Plain Node and JSON, no dependencies, and it runs in milliseconds.
- CI can check the docs' links against it.

**Cons:**
- Regex reading of the source finds top-level names, hooks and fields, not every call.

### Option 2: A hand-kept map or a graph database
**Description:** Write the relations down, or load them into a graph store.

**Pros:**
- Could hold any relation.

**Cons:**
- Drifts the moment someone forgets it, which is the problem it's meant to solve. A new dependency and store to keep.

### Option 3: Commit `docs/graph.json` and fail CI when it's stale
**Description:** Keep the generated file in git.

**Pros:**
- Readable on GitHub without running anything.

**Cons:**
- Every PR touching the source also changes a large generated file, and conflicts between parallel parts multiply.

## Decision

Option 1. The map is built from the source on every query and by `npm run build`, which writes `docs/graph.json` (git-ignored) for tools that want the whole thing. The docs keep only the "why" as short link lines:
- a spec's PRs on its first line;
- a system's files in its `docs/SYSTEMS.md` heading;
- a lesson's "→" targets;
- a decision's links outside its Context (which describes the past).

The `graph` check group fails on a broken link or a system section with no files. A system file changed on a branch without its section is a warning only, for now.

## Consequences

- Sessions start with `node tools/graph.mjs <name>` rather than reading the docs end to end (project notes, `feature` playbook).
- A new system section in `docs/SYSTEMS.md` must name its files, and a new spec lists its PRs as they open.
- If the measurement doesn't show a clear cut in context and cost, the tool, the check group and these rules come out together.
