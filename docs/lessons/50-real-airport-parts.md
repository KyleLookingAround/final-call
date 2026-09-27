# Real airport parts: #50 planes, #55 vehicles, #52 roofs, #53 markings, #61 weather · 27 Sep 2026

Five parts built side by side from their briefs, merged between 12:39 and 14:08. Each part's own CI stayed green throughout; the Parts workflow's "together" run was red while #53, and later #61, carried a `docs/SYSTEMS.md` conflict.

| PR | Session | Estimate | Cost | Context | Opened → merged | Pushes after opening | `scene` share (budget) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| #50 planes | `014M9Ym9XzR8Tm3LszDH3Drv` | $10 | $6.21 | 292k | 11:58 → 12:39 | 1 (merge of `main`) | within noise (0.035×) |
| #55 vehicles | `01CziGnfH8SiWVGbctTgd4Wu` (cheaper model) | $6 | $6.38 | 308k | 12:12 → 12:58 | 1 | within noise (0.035×) |
| #52 roofs | `01TWd3JDj7LDJoedcSLECf2y` | $10 | $3.94 | 207k | 11:59 → 13:12 | 1 | about 0.004× on Classic, measured on and off (0.030×) |
| #53 markings | `01HBP9vSppzPL43yK2ASWFJr` | $14 | $5.92 | 278k | 12:02 → 13:27 | 1, with a `docs/SYSTEMS.md` conflict | about 0.01–0.015×, measured on and off (0.040×) |
| #61 weather | `016YxvgQJZDHp8Skjdasztez` (cheaper model) | $6 | $22.43 | 515k | 12:48 → 14:08 | 4 merges of `main`, two with conflicts | none measurable (0.035×) |

- **Lessons:**
  - Measuring a layer on and off in one page gave its real cost where three-and-three runs against `main` could not: one run varies by about ±0.05×, more than any part's share. Roofs and markings both settled their share this way. → Recorded here for the next split drawing feature; the spec's method stays as the budget's test.
  - Each part in its own file with its own check file (`markings`, `roofs`, `weather`, `vehicles`) kept code conflicts to none. The one file they all shared was `docs/SYSTEMS.md`, where each added a bullet to the same section: both #53 and #61 had to resolve it. For the next split feature, give each part's bullet a placeholder line in the groundwork so parts edit different lines.
  - A red "together" comment names the part that conflicts; #50, #52 and #55 each waited on #53's conflict, not their own. Read the named part before acting.
  - Weather cost nearly four times its estimate, and its PR doesn't say why, although its brief asks for that past twice the estimate. Being the last part open, it merged `main` four times, but that alone doesn't explain $22. A coordinator reading `get_session` at each sweep would have caught it at twice the estimate, and could have asked for the reason while the session still had it. Four other parts came in at or well under estimate, so estimates for default-model drawing parts can come down.
  - Found by #50's checks: `Object.assign(SIMX,{get AF_Y(){…}})` copies the getter's value at load, so `__sim.AF_Y` never followed the layout. #50 and #61 worked round it; version 31 moved the getter into the `__sim` list in `tools/build.mjs`, where it stays live. → Any live value for tests belongs in that list, not in `SIMX`.
  - Good practice seen twice: writing a scope judgement into the PR rather than guessing silently (#52 raised the starting-zoom fade as #51, settled by #63; #61 stated that there is no grass surface to snow on).
