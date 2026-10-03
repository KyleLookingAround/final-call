---
type: Decision
description: Every docs file opens with frontmatter in the Open Knowledge Format, checked by the okf group, and level pacing is an attested computation.
status: stable
sources:
  - { id: okf, resource: "https://github.com/GoogleCloudPlatform/open-knowledge-format", title: Open Knowledge Format v0.2 }
---
# ADR-2026-10-03: The docs are a knowledge bundle in the Open Knowledge Format

## Status

Accepted by the owner (3 Oct 2026, asking for all four steps: this record, frontmatter on every docs file with a check, the tools reading it, and pacing as an attested computation).

## Context

`docs/` was already shaped like a knowledge bundle: one file per system, decision, spec, lesson, brief and roadmap item, lists joined from them (`ADR-2026-09-27-fewer-clashes.md`), and a map built from their link lines (`ADR-2026-09-27-knowledge-graph.md`). What it lacked was anything a tool could read about a file without parsing its prose. The type came from the folder, a decision's standing from a sentence in its Status section, a spec's approval from words on its first line, a roadmap item's section and a lesson's theme from special first lines, and nothing said what a file was in one line, so a session had to open files to learn which one it needed. The Open Knowledge Format (OKF) v0.2[^okf] is a vendor-neutral convention for exactly this: markdown with YAML frontmatter, a required `type`, optional description, status, provenance and trust fields, index files for reading one level at a time, and attested computations for numbers that must come from a sanctioned run.

## Options Considered

### Option 1: OKF frontmatter on every docs file, checked, with a small profile of our own
**Description:** Every markdown file in `docs/` opens with frontmatter: the type its folder implies, a one-line description for the files sessions look things up in, and the fields its type needs. `tools/okf.mjs` reads it with a dependency-free reader for a small YAML subset and checks it; the `okf` check group runs that. `tools/join.mjs` and `tools/graph.mjs` read the frontmatter instead of special lines.

**Pros:**
- A file says what it is before it's opened: `docs/index.md`, `node tools/okf.mjs list <type>` and `node tools/graph.mjs <name>` print the descriptions, which serves the knowledge graph's own measure, sessions' context and cost.
- Standing becomes data: a superseded decision is `deprecated`, an approved spec is `stable` and records the owner's approval, and the check keeps those in step with the prose.
- Any OKF reader (a viewer, a search index, another tool) can read the docs as they are.

**Cons:**
- Every docs file changed once, and every new file needs a few lines of frontmatter.
- A YAML subset of our own to keep. It refuses the plain values other YAML readers turn into something other than text (times and dates, yes and no, numbers written other ways), so those are quoted; when the files were first given frontmatter, PyYAML read every one exactly as `tools/okf.mjs` does.

### Option 2: Frontmatter only on the curated folders (systems, decisions, specs)
**Description:** Leave lessons, briefs and roadmap items as they were.

**Pros:**
- A smaller change.

**Cons:**
- Not a conforming bundle, so other readers can't take `docs/` as it is, and the roadmap's and lessons' special first lines stay.

### Option 3: The OKF reference tools and viewer
**Description:** Use OKF's Python reference tool to produce the bundle and its `viz.html` viewer to browse it.

**Pros:**
- Nothing to write.

**Cons:**
- Python and a hosted service's API in a repo whose tools are plain Node with no dependencies (`ADR-2026-09-26-one-page-no-dependencies.md` for the game, the same habit for the tools); a generated viewer committed beside the docs, which the knowledge graph's record turned down for the map's own generated file.

## Decision

Option 1, with this profile (`tools/okf.mjs` has it in full):

- **Types by folder:** `docs/systems/` System, `decisions/` Decision, `specs/` Spec, `metrics/` Metric, `computations/` Attested Computation, `ideas/` Ideas, `lessons/` Lesson, `briefs/` Brief, `roadmap.d/` Roadmap item. Files at the root of `docs/` and `README.md` files are guides of their own type. `TEMPLATE.md` files carry their folder's type and are left out of the index.
- **Descriptions** are required for systems, decisions, specs, ideas, metrics, computations and guides: one line.
- **Status:** a decision is `deprecated` when its Status section says it's superseded, and is tagged `superseded-in-part` or `experiment` when it says those; a spec is `draft` while Proposed and `stable` once Approved or Built, when it records the owner's approval as `verified: { by: human:KyleLookingAround, at: "…" }`. For the specs approved before this record, `at` is the commit that last changed the spec's Status line to Approved or Built.
- **Systems' notes** may carry `verified: { by: process:notes-review, at: "…" }`, added when a session has read the notes against the code and found them true. None does yet: nobody has done that review, and a date backfilled from history would claim one. `node tools/graph.mjs --check` warns when a system's files were committed after both its notes' text last changed and its last verification, and `--stale` lists them; 12 of 28 were behind when this record was written.
- **Actors** are `human:<login>` or `process:<name>`, with the process named by what it does. OKF also allows `<tool>/<version>`; we don't, since it would put a tool's name in the docs.
- **Times** are quoted (`at: "2026-10-03T09:00:00Z"`) so every YAML reader reads them as text.
- **Moved into frontmatter:** a roadmap item's `section` and a lesson's `theme` (this supersedes that part of `ADR-2026-09-27-fewer-clashes.md`).
- **The index:** `docs/index.md`, OKF's bundle-root index with `okf_version: "0.2"`, joined by `tools/join.mjs` from every file's title and description.
- **Level pacing is an attested computation.** `docs/metrics/level-pacing.md` defines it; `docs/computations/bot-pacing.md` names its one sanctioned run, `tools/run-bot.mjs` with only a seed and hours, whose receipt (`build/bot-<seed>.json`) now records the build, the baseline, the options and the commit; and `tools/attest-pacing.mjs` attests a receipt or refuses it. The Balance workflow attests each keep-Classic run, and PRs quote its `ATTESTED` lines instead of typed tables.

## Consequences

- A docs file without sound frontmatter fails the `okf` check group, which runs on every PR, drafts included.
- Sessions read `docs/index.md` or a type's list before opening files; `node tools/graph.mjs <name>` prints a system's or document's description and trust.
- The playbooks, the templates and the lessons-tidy brief say where `section`, `theme`, `status` and `verified` go.
- OKF fields not in this profile (`generated`, `resource`, `stale_after` and others) are allowed and checked for shape when present, but nothing requires them yet.
- If OKF moves on, the profile moves with it in a record that supersedes this one.

[^okf]: Open Knowledge Format v0.2
