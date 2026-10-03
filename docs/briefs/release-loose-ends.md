---
type: Brief
---
# Brief: Release loose ends

The release audit's batches (`docs/ideas/release-audit.md`, #155) have nearly all merged. This picks up three small things they handed on to files no running batch owns.

## Goal and what it may touch

- Branch `feature/release-loose-ends` from `main`, one PR, three fixes:
  1. **Phone camera margin** (#152's comment from the terminal pass): on phones the camera bar covers the CHECK-IN and ENTRANCE signs at the foot of the terminal, and `clampCam`/`camBounds` in `13-camera.js` stop at `Y1`. Let the view scroll past `Y1` by the bar's height in world units when the bar overlays the canvas, and let `focus('all')` use the same margin. Larger screens stay as they are. Prove it with screenshots at 320×568, 390×844 and 1440×900.
  2. **The Crews note** in `34-airline-operations.js`, and
  3. **the Routes › New note** in `31-routes.js`: shorten each in the style of P4's panel notes (#164): concise, plain UK English.
- `PLAY` stays identical on seeds 1–3.
- It may touch: `src/game/13-camera.js`, `31-routes.js` and `34-airline-operations.js`, the checks that prove the camera fix, those systems' notes in `docs/systems/`, a What's new fragment, a look back in `docs/lessons/`, and this brief. No other game file.

## Read first

- The project notes, then `node tools/graph.mjs camera`, and only what it lists.
- #152's last comment, #164's diff for the note style, and the `steward` playbook.

## Speed budget

No `perf` or `scene` ratio may rise beyond run-to-run noise (±0.02× simulation, ±0.05× drawing) against the release's baseline in the audit.

## Commit author

KyleLookingAround <KyleMck10@hotmail.com>.

## Who merges and when

The session: write the look back into the PR, mark it ready, and turn on auto-merge (squash) once Checks, Description and (if play moved) Balance are green. Then subscribe to its events, book one `send_later` to confirm the merge and the Pages publish, and stop.

## What's left for others

- B1 (#171) and the terminal polish pass (#170), each in its own session; the owner's rows in #154; and the release itself. Parked until after the release: the rest of the terminal-place parts, the Roadmap tab build, and income.

## When to stop and ask

- Only for something irreversible or outside this brief. Otherwise open a `needs-owner` issue with the default it will take after 12 hours, and carry on. Where it's merely unclear, take the safer option and say so in the PR.

## Cost budget

- Estimate: about $6. Past twice that, say why in the PR and in its lesson, and trim or split what's left.
