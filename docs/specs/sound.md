---
type: Spec
description: Announcements, ambience and tones for the airport.
status: stable
verified: { by: human:KyleLookingAround, at: "2026-09-27T07:07:47Z" }
---
# Sound

Issue: #27 · PRs: #28 · Status: Built. Approved (the owner approved the specs for the next bundles in advance on 26 Sep 2026, in the brief for the terminal's finishing session)

## What the player gets

The airport sounds like one. Now and then the terminal announces your real flights, mostly as a chime with the words shown on the board, sometimes as a spoken call. Underneath there's the hum of the terminal, jets taking off and landing, and rain when it rains. Each follows the camera, so zooming into the halls or out over the runway changes what you hear. Nights go quiet. Each part can be turned off.

## What they see and hear

- **Announcements** for your own flights (not partners' or freighters'):
  - boarding: "Flight SH7574 to Athens is now boarding at gate A1";
  - gate calls from the market place: "Passengers for SH7574 to Athens, please go to gate A1";
  - final calls, when the board first shows FINAL CALL: "Final call for SH7574 to Athens at gate A1";
  - gate changes: the game has none today apart from a layout switch moving a flight's stand. The announcer calls those, and any a later bundle adds.
- **The words on the board.** Each announcement chimes (two notes, like the boarding chime today) and shows its words on a line along the foot of the departures board for about 8 seconds. On a phone the line scrolls if it's too long for the board. Board flaps are unchanged.
- **Spoken calls, not often.** At most one every 5 real minutes, only for final calls and gate changes, only at 1× or 2× speed and while the page is visible. They use the browser's speech synthesis with a British English voice where there is one. Without speech synthesis the chime and the words still come.
- **Ambience that follows the camera:**
  - terminal hum: filtered noise, louder when the camera is over the halls and zoomed in;
  - jets: a roar on take-off and landing, panned left or right by where the runway is on screen, and quieter when zoomed out or scrolled away;
  - rain: filtered noise while it rains, louder in a storm, quieter when zoomed into the halls (you're indoors).
- **A quiet night.** From 23:00 to 05:00 game time the hum drops to a third, no boarding or gate-call announcements play (only final calls, as a chime without words spoken), and with a curfew there are no jets.
- **Settings › Sound** (Office › Settings): the master On/Off as today, then chips for each part: Announcements (On / Chime only / Off), Spoken calls (On / Off), Ambience (On / Off), Effects (the tills and ticks: On / Off).

## How it works

- A new file, `48-sound.js`, builds on the tone helpers in `06-sound.js`. It watches what the game already does (the plane's state, `F.called`, the board's `statusText`) from the frame loop, not from `update()`. It never changes game state.
- Nothing runs while `R.sim` is true or before the player has touched the page (browsers only start audio after a tap or key). The audio context starts on the first tap, as today.
- One announcement at a time: a queue with the newest of each kind per flight, dropping any that are more than 30 seconds old.
- Randomness (which voice line, jitter in the hum) uses `Math.random()` on lines marked `// cosmetic`. The bot's `STATE` must stay identical on seeds 1–3.
- At 4× and 8×, announcements are chime only and at most one every 20 real seconds.
- From the start: no plan or level unlocks it.

## Saved state

- New settings in `G.set`, defaults in `DEFAULT().set`, which `resetAll` merges into older saves: `sndAnn` ('on', 'chime' or 'off'; default 'on'), `sndVoice` (true), `sndAmb` (true), `sndFx` (true).
- `G.sound` stays the master switch. Nothing is renamed or removed.

## Balance

None. It's sound and a line of text on the board; `STATE` identical on seeds 1–3 proves it.

## Checks

A new group, `sound` (`tools/checks/sound.mjs`), with a stub audio context and speech synthesis so it can count what plays:
- a boarding, a gate call and a final call each announce once for your flight, and never for a partner's or freighter's;
- spoken calls: at most one every 5 minutes, only final calls and gate changes, none at 4×;
- each setting silences its own part and nothing else, and the master switch silences everything;
- nothing is created or queued in the headless sim;
- from 23:00 to 05:00 only final calls chime;
- the board's line shows the words and fits a 320 px phone.

`perf` must still pass: the watcher runs once a frame over the stands, not per passenger.

## Files

- New: `src/game/48-sound.js`, `tools/checks/sound.mjs`.
- `06-sound.js`: ticks and tills check `sndFx`. The ambience builds its own filtered-noise chains in `48-sound.js` (a panner per runway), so `tone` is unchanged. The boarding chime moves from `08-stands.js` into the announcer.
- `14-board.js`: the announcement line.
- `15-panel.js`: the Sound settings rows.
- `23-boot.js`: `soundTick()` in the frame loop.
- `03-state.js`: the new settings' defaults.

## Left out

- Music (parked by the owner).
- Recorded audio files: everything is made in the browser, so the page stays one file.
- Announcements in other languages, and security messages ("do not leave bags unattended").
- Passenger chatter and apron vehicles' sounds: those come with "Looks like a real airport" and "Passengers with a voice".
